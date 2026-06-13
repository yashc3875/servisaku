import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler, ApiError, isAdmin, getBookingOr404, emailsByIds } from '../lib/access.js';

const router = Router();
router.use(authenticate);

async function mapManyOut(items) {
  const emails = await emailsByIds(items.map((r) => r.consumerId));
  return items.map((r) => ({
    id: r.id,
    booking_id: r.bookingId,
    consumer_email: emails[r.consumerId],
    original_amount: r.originalAmount,
    refund_amount: r.refundAmount,
    refund_type: r.refundType,
    reason: r.reason,
    status: r.status,
    admin_note: r.adminNote,
    created_date: r.createdAt,
  }));
}

// GET /api/refunds — admin: all; consumer: own requests
router.get('/', asyncHandler(async (req, res) => {
  const where = isAdmin(req.user) ? {} : { consumerId: req.user.id };
  if (req.query.status) where.status = String(req.query.status);
  const items = await prisma.refundRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(await mapManyOut(items));
}));

const createSchema = z.object({
  booking_id: z.string().min(1),
  refund_type: z.enum(['full', 'partial']),
  refund_amount: z.coerce.number().positive().optional(),
  reason: z.string().min(5).max(2000),
});

// POST /api/refunds — consumer requests a refund on their own booking.
// Amounts are derived from the booking record, never trusted from the client.
router.post('/', validate(createSchema), asyncHandler(async (req, res) => {
  const booking = await getBookingOr404(req.body.booking_id);
  if (booking.consumerId !== req.user.id && !isAdmin(req.user)) {
    throw new ApiError(403, 'You can only request refunds for your own bookings');
  }
  const existing = await prisma.refundRequest.findFirst({
    where: { bookingId: booking.id, status: { in: ['pending', 'under_review', 'approved'] } },
  });
  if (existing) throw new ApiError(409, 'A refund request already exists for this booking');

  const originalAmount = booking.price;
  const refundAmount = req.body.refund_type === 'full'
    ? originalAmount
    : Math.min(req.body.refund_amount ?? originalAmount, originalAmount);

  const item = await prisma.refundRequest.create({
    data: {
      bookingId: booking.id,
      consumerId: booking.consumerId,
      originalAmount,
      refundAmount,
      refundType: req.body.refund_type,
      reason: req.body.reason,
      status: 'pending',
    },
  });
  res.status(201).json((await mapManyOut([item]))[0]);
}));

const patchSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'under_review']),
  admin_note: z.string().max(2000).nullish(),
});

// PATCH /api/refunds/:id — approval workflow is admin-only
router.patch('/:id', requireRole('admin', 'super_admin'), validate(patchSchema), asyncHandler(async (req, res) => {
  const data = { status: req.body.status };
  if (req.body.admin_note !== undefined) data.adminNote = req.body.admin_note;
  const item = await prisma.refundRequest.update({ where: { id: req.params.id }, data });
  res.json((await mapManyOut([item]))[0]);
}));

export default router;
