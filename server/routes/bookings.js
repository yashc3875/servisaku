import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError, asyncHandler, findUserByEmail, getBookingOr404, isAdmin, assertBookingParticipant } from '../lib/access.js';
import { priceBooking } from '../lib/pricing.js';
import { canTransition } from '../../src/lib/bookingEngine.js';

const router = Router();
router.use(authenticate);

const PAYMENT_METHODS = ['fpx', 'tng', 'grabpay', 'boost', 'card', 'cash'];

function mapBookingOut(b) {
  return {
    id: b.id,
    service_type: b.serviceType,
    package_name: b.serviceId,
    price: b.price,
    date: b.date,
    time_slot: b.timeSlot,
    address: b.address,
    city: b.city,
    notes: b.notes,
    coupon_code: b.couponCode,
    discount_amount: b.discountAmount,
    consumer_id: b.consumerId,
    partner_id: b.partnerId,
    payment_method: b.paymentMethod,
    payment_status: b.paymentStatus,
    status: b.status,
    created_date: b.createdAt,
    consumer_email: b.consumer?.email,
    consumer_name: b.consumer?.fullName,
    partner_email: b.partner?.email,
    partner_name: b.partner?.fullName,
  };
}

// GET /api/bookings — scoped to the caller's role
router.get('/', asyncHandler(async (req, res) => {
  const where = {};
  if (isAdmin(req.user)) {
    if (req.query.partner_email) {
      const p = await findUserByEmail(req.query.partner_email);
      where.partnerId = p ? p.id : '__none__';
    }
    if (req.query.consumer_email) {
      const c = await findUserByEmail(req.query.consumer_email);
      where.consumerId = c ? c.id : '__none__';
    }
  } else if (req.user.role === 'partner') {
    // A partner may also be a consumer; an explicit consumer_email=self query
    // returns their own consumer-side bookings, otherwise assigned jobs.
    if (req.query.consumer_email && req.query.consumer_email === req.user.email) {
      where.consumerId = req.user.id;
    } else {
      where.partnerId = req.user.id;
    }
  } else {
    where.consumerId = req.user.id;
  }
  if (req.query.status) where.status = String(req.query.status);

  const take = req.query._limit ? Math.min(Number(req.query._limit) || 50, 200) : undefined;
  const items = await prisma.booking.findMany({
    where, take,
    orderBy: { createdAt: 'desc' },
    include: { consumer: true, partner: true },
  });
  res.json(items.map(mapBookingOut));
}));

// GET /api/bookings/:id — participants and admins only
router.get('/:id', asyncHandler(async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: { consumer: true, partner: true },
  });
  if (!booking) throw new ApiError(404, 'Booking not found');
  assertBookingParticipant(req.user, booking);
  res.json(mapBookingOut(booking));
}));

const createSchema = z.object({
  service_id: z.string().min(1).max(50),
  package_id: z.string().min(1).max(50),
  addon_ids: z.array(z.string().max(50)).max(20).default([]),
  bedrooms: z.string().max(20).optional(),
  date: z.coerce.date().refine(
    (d) => d.getTime() > Date.now() - 24 * 3600 * 1000,
    'Booking date must not be in the past',
  ),
  time_slot: z.string().max(20).nullish(),
  address: z.string().max(500).nullish(),
  city: z.string().max(100).nullish(),
  notes: z.string().max(2000).nullish(),
  coupon_code: z.string().max(50).nullish(),
  partner_email: z.string().email().nullish(),
  payment_method: z.enum(PAYMENT_METHODS).default('fpx'),
  service_type: z.string().max(100).optional(), // display label only — never priced
});

// POST /api/bookings — price, discount, and escrow split are computed server-side;
// any client-sent amounts are discarded by the schema.
router.post('/', validate(createSchema), asyncHandler(async (req, res) => {
  const body = req.body;

  let partner = null;
  if (body.partner_email) {
    partner = await findUserByEmail(body.partner_email);
    if (!partner || partner.role !== 'partner' || !partner.partnerVerified) {
      throw new ApiError(400, 'Selected partner is not available');
    }
  }

  const pricing = await priceBooking(prisma, {
    serviceId: body.service_id,
    packageId: body.package_id,
    addonIds: body.addon_ids,
    bedrooms: body.bedrooms,
    couponCode: body.coupon_code || undefined,
  });

  const booking = await prisma.$transaction(async (tx) => {
    if (pricing.couponId) {
      await tx.coupon.update({
        where: { id: pricing.couponId },
        data: { usageCount: { increment: 1 } },
      });
    }
    const created = await tx.booking.create({
      data: {
        serviceType: body.service_type || pricing.serviceKey,
        serviceId: pricing.packageName, // legacy: this column carries the package display name
        status: 'pending',
        price: pricing.total,
        discountAmount: pricing.discount,
        couponCode: pricing.couponCode,
        date: body.date,
        timeSlot: body.time_slot ?? null,
        address: body.address ?? null,
        city: body.city ?? null,
        notes: body.notes ?? null,
        paymentMethod: body.payment_method,
        paymentStatus: 'pending', // becomes "paid"/"escrowed" only via gateway webhook (Phase 2)
        consumerId: req.user.id,
        partnerId: partner?.id ?? null,
      },
      include: { consumer: true, partner: true },
    });
    await tx.escrowLedger.create({
      data: {
        bookingId: created.id,
        grossAmount: pricing.total,
        platformFee: pricing.platformFee,
        partnerPayout: pricing.partnerPayout,
        status: 'held',
      },
    });
    return created;
  });

  res.status(201).json(mapBookingOut(booking));
}));

const patchSchema = z.object({
  status: z.string().max(20).optional(),
  notes: z.string().max(2000).optional(),
  time_slot: z.string().max(20).optional(),
  date: z.coerce.date().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  payment_method: z.enum(PAYMENT_METHODS).optional(),
  payment_status: z.enum(['pending', 'paid', 'escrowed', 'refunded', 'failed']).optional(),
  partner_email: z.string().email().nullable().optional(),
});

const PARTNER_STATUSES = ['accepted', 'en_route', 'arrived', 'started', 'completed'];
const CONSUMER_STATUSES = ['cancelled', 'disputed'];

// PATCH /api/bookings/:id — field whitelist depends on the caller's role.
router.patch('/:id', validate(patchSchema), asyncHandler(async (req, res) => {
  const booking = await getBookingOr404(req.params.id);
  assertBookingParticipant(req.user, booking);
  const body = req.body;
  const data = {};

  if (isAdmin(req.user)) {
    if (body.status !== undefined) data.status = body.status;
    if (body.payment_status !== undefined) data.paymentStatus = body.payment_status;
    if (body.payment_method !== undefined) data.paymentMethod = body.payment_method;
    if (body.partner_email !== undefined) {
      if (body.partner_email === null) {
        data.partnerId = null;
      } else {
        const p = await findUserByEmail(body.partner_email);
        if (!p || p.role !== 'partner') throw new ApiError(400, 'Partner not found');
        data.partnerId = p.id;
      }
    }
    for (const [from, to] of [['notes', 'notes'], ['address', 'address'], ['city', 'city'], ['time_slot', 'timeSlot'], ['date', 'date']]) {
      if (body[from] !== undefined) data[to] = body[from];
    }
  } else {
    const isAssignedPartner = booking.partnerId === req.user.id;
    const isOwner = booking.consumerId === req.user.id;

    if (body.status !== undefined) {
      const allowed = isAssignedPartner ? PARTNER_STATUSES : CONSUMER_STATUSES;
      if (!allowed.includes(body.status)) {
        throw new ApiError(403, `You are not allowed to set status "${body.status}"`);
      }
      if (!canTransition(booking.status, body.status)) {
        throw new ApiError(400, `Cannot change status from "${booking.status}" to "${body.status}"`);
      }
      data.status = body.status;
    }

    if (isOwner) {
      // Consumers may adjust logistics only before work starts.
      if (['pending', 'assigned', 'accepted'].includes(booking.status)) {
        for (const [from, to] of [['notes', 'notes'], ['address', 'address'], ['city', 'city'], ['time_slot', 'timeSlot'], ['date', 'date']]) {
          if (body[from] !== undefined) data[to] = body[from];
        }
      }
    }
    // payment_status / payment_method / partner_email changes are admin-only.
  }

  if (Object.keys(data).length === 0) throw new ApiError(400, 'No permitted fields to update');

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data,
    include: { consumer: true, partner: true },
  });
  res.json(mapBookingOut(updated));
}));

// DELETE /api/bookings/:id — admin only (consumers cancel via status)
router.delete('/:id', requireRole('admin', 'super_admin'), asyncHandler(async (req, res) => {
  await prisma.booking.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}));

export default router;
