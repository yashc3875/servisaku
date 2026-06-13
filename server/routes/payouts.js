import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler, ApiError, isAdmin, findUserByEmail, emailsByIds } from '../lib/access.js';

const router = Router();
router.use(authenticate);

async function mapManyOut(items) {
  const emails = await emailsByIds(items.map((p) => p.partnerId));
  return items.map((p) => ({
    id: p.id,
    partner_id: p.partnerId,
    partner_email: emails[p.partnerId],
    partner_name: p.partnerName,
    gross_earning: p.grossEarning,
    commission_amount: p.commissionAmount,
    net_payout: p.netPayout,
    payout_method: p.payoutMethod,
    status: p.status,
    failure_reason: p.failureReason,
    scheduled_date: p.scheduledDate,
    created_date: p.createdAt,
  }));
}

// GET /api/payouts — admin: all (filterable); partner: own records only
router.get('/', asyncHandler(async (req, res) => {
  const where = {};
  if (isAdmin(req.user)) {
    if (req.query.partner_email) {
      const p = await findUserByEmail(req.query.partner_email);
      where.partnerId = p ? p.id : '__none__';
    }
  } else {
    where.partnerId = req.user.id;
  }
  if (req.query.status) where.status = String(req.query.status);
  const items = await prisma.payoutRecord.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(await mapManyOut(items));
}));

const createSchema = z.object({
  partner_email: z.string().email(),
  gross_earning: z.coerce.number().nonnegative(),
  commission_amount: z.coerce.number().nonnegative(),
  net_payout: z.coerce.number().nonnegative(),
  payout_method: z.string().max(50).default('Bank Transfer'),
  status: z.enum(['pending', 'scheduled', 'completed', 'failed']).default('pending'),
  scheduled_date: z.coerce.date().optional(),
});

// Payout creation/transitions are an admin/finance operation.
router.post('/', requireRole('admin', 'super_admin'), validate(createSchema), asyncHandler(async (req, res) => {
  const partner = await findUserByEmail(req.body.partner_email);
  if (!partner || partner.role !== 'partner') throw new ApiError(400, 'Partner not found');
  const item = await prisma.payoutRecord.create({
    data: {
      partnerId: partner.id,
      partnerName: partner.fullName,
      grossEarning: req.body.gross_earning,
      commissionAmount: req.body.commission_amount,
      netPayout: req.body.net_payout,
      payoutMethod: req.body.payout_method,
      status: req.body.status,
      scheduledDate: req.body.scheduled_date ?? null,
    },
  });
  res.status(201).json((await mapManyOut([item]))[0]);
}));

const patchSchema = z.object({
  status: z.enum(['pending', 'scheduled', 'completed', 'failed']),
  failure_reason: z.string().max(500).nullish(),
  scheduled_date: z.coerce.date().nullish(),
});

router.patch('/:id', requireRole('admin', 'super_admin'), validate(patchSchema), asyncHandler(async (req, res) => {
  const data = { status: req.body.status };
  if (req.body.failure_reason !== undefined) data.failureReason = req.body.failure_reason;
  if (req.body.scheduled_date !== undefined) data.scheduledDate = req.body.scheduled_date;
  const item = await prisma.payoutRecord.update({ where: { id: req.params.id }, data });
  res.json((await mapManyOut([item]))[0]);
}));

export default router;
