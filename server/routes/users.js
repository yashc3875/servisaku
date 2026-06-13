import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler, ApiError, isAdmin } from '../lib/access.js';

const router = Router();
router.use(authenticate);

function mapUserOut(u, { admin = false, self = false } = {}) {
  const base = {
    id: u.id,
    email: u.email,
    full_name: u.fullName,
    role: u.role,
    phone_number: u.phone,
    city: u.city,
    bio: u.bio,
    avatar_url: u.avatarUrl,
    partner_verified: u.partnerVerified,
    partner_rating: u.partnerRating,
    partner_category: u.partnerCategory,
    created_date: u.createdAt,
  };
  // Bank details are visible only to admins and the account owner.
  if (admin || self) base.bank_account = u.bankAccount;
  return base;
}

// GET /api/users — admin: full directory; everyone else: verified partners only
router.get('/', asyncHandler(async (req, res) => {
  const admin = isAdmin(req.user);
  const where = admin
    ? {}
    : { role: 'partner', partnerVerified: true };
  if (admin) {
    if (req.query.role) where.role = String(req.query.role);
    if (req.query.partner_verified === 'true') where.partnerVerified = true;
    if (req.query.email) where.email = String(req.query.email);
  } else if (req.query.city) {
    where.city = String(req.query.city);
  }
  const take = req.query._limit ? Math.min(Number(req.query._limit) || 50, 200) : undefined;
  const items = await prisma.user.findMany({ where, take, orderBy: { createdAt: 'desc' } });
  res.json(items.map((u) => mapUserOut(u, { admin })));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new ApiError(404, 'Not found');
  const admin = isAdmin(req.user);
  const self = user.id === req.user.id;
  if (!admin && !self && !(user.role === 'partner' && user.partnerVerified)) {
    throw new ApiError(403, 'Forbidden');
  }
  res.json(mapUserOut(user, { admin, self }));
}));

const adminPatchSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  role: z.enum(['consumer', 'partner', 'admin']).optional(), // super_admin only via DB
  phone_number: z.string().max(30).nullish(),
  city: z.string().max(100).nullish(),
  bio: z.string().max(2000).nullish(),
  avatar_url: z.string().max(2000).nullish(),
  partner_verified: z.boolean().optional(),
  partner_rating: z.coerce.number().min(0).max(5).nullish(),
  partner_category: z.string().max(100).nullish(),
  bank_account: z.string().max(100).nullish(),
});

// PATCH /api/users/:id — admin only (self-service updates go through PATCH /auth/me)
router.patch('/:id', requireRole('admin', 'super_admin'), validate(adminPatchSchema), asyncHandler(async (req, res) => {
  const b = req.body;
  const data = {};
  if (b.full_name !== undefined) data.fullName = b.full_name;
  if (b.role !== undefined) data.role = b.role;
  if (b.phone_number !== undefined) data.phone = b.phone_number;
  if (b.city !== undefined) data.city = b.city;
  if (b.bio !== undefined) data.bio = b.bio;
  if (b.avatar_url !== undefined) data.avatarUrl = b.avatar_url;
  if (b.partner_verified !== undefined) data.partnerVerified = b.partner_verified;
  if (b.partner_rating !== undefined) data.partnerRating = b.partner_rating;
  if (b.partner_category !== undefined) data.partnerCategory = b.partner_category;
  if (b.bank_account !== undefined) data.bankAccount = b.bank_account;
  const user = await prisma.user.update({ where: { id: req.params.id }, data });
  res.json(mapUserOut(user, { admin: true }));
}));

export default router;
