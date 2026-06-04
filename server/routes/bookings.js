import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

function mapBookingIn(b) {
  const data = {};
  if (b.service_type !== undefined) data.serviceType = b.service_type;
  if (b.package_name !== undefined) data.serviceId = b.package_name; // Reuse field for package name
  if (b.price !== undefined) data.price = Number(b.price);
  if (b.date !== undefined) data.date = new Date(b.date);
  if (b.time_slot !== undefined) data.timeSlot = b.time_slot;
  if (b.address !== undefined) data.address = b.address;
  if (b.city !== undefined) data.city = b.city;
  if (b.notes !== undefined) data.notes = b.notes;
  if (b.coupon_code !== undefined) data.couponCode = b.coupon_code;
  if (b.discount_amount !== undefined) data.discountAmount = Number(b.discount_amount);
  if (b.payment_method !== undefined) data.paymentMethod = b.payment_method;
  if (b.payment_status !== undefined) data.paymentStatus = b.payment_status;
  if (b.status !== undefined) data.status = b.status;
  return data;
}

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
    // Add relations if included
    consumer_email: b.consumer?.email,
    consumer_name: b.consumer?.fullName,
    partner_email: b.partner?.email,
    partner_name: b.partner?.fullName,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.partner_email) {
       const p = await prisma.user.findUnique({ where: { email: req.query.partner_email } });
       if (p) where.partnerId = p.id;
    }
    if (req.query.consumer_email) {
       const c = await prisma.user.findUnique({ where: { email: req.query.consumer_email } });
       if (c) where.consumerId = c.id;
    }
    
    const limit = req.query._limit ? Number(req.query._limit) : undefined;
    const items = await prisma.booking.findMany({ 
      where, 
      take: limit, 
      orderBy: { createdAt: 'desc' },
      include: { consumer: true, partner: true }
    });
    res.json(items.map(mapBookingOut));
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    let consumerId = null;
    let partnerId = null;

    if (req.body.consumer_email) {
      const c = await prisma.user.findUnique({ where: { email: req.body.consumer_email } });
      if (c) consumerId = c.id;
    }
    if (req.body.partner_email) {
      const p = await prisma.user.findUnique({ where: { email: req.body.partner_email } });
      if (p) partnerId = p.id;
    }

    if (!consumerId) return res.status(400).json({ error: 'Consumer not found' });

    const data = mapBookingIn(req.body);
    data.consumerId = consumerId;
    if (partnerId) data.partnerId = partnerId;

    const booking = await prisma.booking.create({ 
      data,
      include: { consumer: true, partner: true }
    });

    // Handle Escrow creation automatically
    if (req.body.platform_fee !== undefined || req.body.partner_payout !== undefined) {
      await prisma.escrowLedger.create({
        data: {
          bookingId: booking.id,
          grossAmount: data.price || 0,
          platformFee: Number(req.body.platform_fee) || 0,
          partnerPayout: Number(req.body.partner_payout) || 0,
          status: 'held'
        }
      });
    }

    res.status(201).json(mapBookingOut(booking));
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const data = mapBookingIn(req.body);
    const booking = await prisma.booking.update({ 
      where: { id: req.params.id }, 
      data,
      include: { consumer: true, partner: true }
    });
    res.json(mapBookingOut(booking));
  } catch(err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
