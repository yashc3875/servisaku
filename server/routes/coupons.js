import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// GET /api/coupons — list / filter (same as generic but also validates)
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

router.post('/', async (req, res, next) => {
  try {
    const c = await prisma.coupon.create({ data: mapIn(req.body) });
    res.status(201).json(mapCoupon(c));
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const c = await prisma.coupon.update({ where: { id: req.params.id }, data: mapIn(req.body) });
    res.json(mapCoupon(c));
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
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
    applicable_services: c.applicableServices ? c.applicableServices.split(',') : [],
    is_active: c.isActive,
    valid_until: c.validUntil,
    usage_count: c.usageCount,
    max_usage: c.maxUsage,
    created_date: c.createdAt,
  };
}

function mapIn(body) {
  return {
    code: body.code,
    discountType: body.discount_type,
    discountValue: Number(body.discount_value),
    maxDiscountCap: body.max_discount_cap ? Number(body.max_discount_cap) : null,
    minOrderAmount: body.min_order_amount ? Number(body.min_order_amount) : null,
    applicableServices: Array.isArray(body.applicable_services)
      ? body.applicable_services.join(',') : body.applicable_services || null,
    isActive: body.is_active !== undefined ? Boolean(body.is_active) : true,
    validUntil: body.valid_until ? new Date(body.valid_until) : null,
    maxUsage: body.max_usage ? Number(body.max_usage) : null,
  };
}

export default router;
