import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

const writeSchema = z.object({
  code: z.string().min(2).max(40).transform((s) => s.toUpperCase()),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().positive(),
  max_discount_cap: z.coerce.number().positive().nullish(),
  min_order_amount: z.coerce.number().nonnegative().nullish(),
  applicable_services: z.union([z.array(z.string()), z.string()]).nullish(),
  is_active: z.boolean().optional(),
  valid_until: z.coerce.date().nullish(),
  max_usage: z.coerce.number().int().positive().nullish(),
});

// GET /api/coupons — authenticated read (used to validate codes at checkout)
router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.code) where.code = req.query.code;
    if (req.query.is_active !== undefined) where.isActive = req.query.is_active === 'true';
    const coupons = await prisma.coupon.findMany({ where });
    // Map to camelCase matching frontend expectations
    res.json(coupons.map(mapCoupon));
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const c = await prisma.coupon.findUnique({ where: { id: req.params.id } });
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json(mapCoupon(c));
  } catch (err) { next(err); }
});

// Coupon management is admin-only.
router.post('/', requireRole('admin', 'super_admin'), validate(writeSchema), async (req, res, next) => {
  try {
    const c = await prisma.coupon.create({ data: mapIn(req.body) });
    res.status(201).json(mapCoupon(c));
  } catch (err) { next(err); }
});

router.patch('/:id', requireRole('admin', 'super_admin'), validate(writeSchema.partial()), async (req, res, next) => {
  try {
    const c = await prisma.coupon.update({ where: { id: req.params.id }, data: mapIn(req.body) });
    res.json(mapCoupon(c));
  } catch (err) { next(err); }
});

router.delete('/:id', requireRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Map DB record → frontend shape (snake_case keys the UI expects)
function mapCoupon(c) {
  return {
    id: c.id,
    code: c.code,
    discount_type: c.discountType,
    discount_value: c.discountValue,
    max_discount_cap: c.maxDiscountCap,
    min_order_amount: c.minOrderAmount,
    applicable_services: Array.isArray(c.applicableServices) ? c.applicableServices : [],
    is_active: c.isActive,
    valid_until: c.validUntil,
    usage_count: c.usageCount,
    max_usage: c.maxUsage,
    created_date: c.createdAt,
  };
}

// Body is already validated/coerced by zod; copy only fields that were sent so
// partial PATCHes don't clobber existing values.
function mapIn(body) {
  const data = {};
  if (body.code !== undefined) data.code = body.code;
  if (body.discount_type !== undefined) data.discountType = body.discount_type;
  if (body.discount_value !== undefined) data.discountValue = body.discount_value;
  if (body.max_discount_cap !== undefined) data.maxDiscountCap = body.max_discount_cap;
  if (body.min_order_amount !== undefined) data.minOrderAmount = body.min_order_amount;
  if (body.applicable_services !== undefined) {
    // Json column: store the array directly (null if empty/unset).
    data.applicableServices = Array.isArray(body.applicable_services)
      ? body.applicable_services
      : body.applicable_services
        ? [body.applicable_services]
        : null;
  }
  if (body.is_active !== undefined) data.isActive = body.is_active;
  if (body.valid_until !== undefined) data.validUntil = body.valid_until;
  if (body.max_usage !== undefined) data.maxUsage = body.max_usage;
  return data;
}

export default router;
