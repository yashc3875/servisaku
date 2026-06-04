import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

function mapUserOut(u) {
  return {
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
    bank_account: u.bankAccount,
    created_date: u.createdAt,
  };
}

function mapUserIn(u) {
  const data = {};
  if (u.email !== undefined) data.email = u.email;
  if (u.full_name !== undefined) data.fullName = u.full_name;
  if (u.role !== undefined) data.role = u.role;
  if (u.phone_number !== undefined) data.phone = u.phone_number;
  if (u.city !== undefined) data.city = u.city;
  if (u.bio !== undefined) data.bio = u.bio;
  if (u.avatar_url !== undefined) data.avatarUrl = u.avatar_url;
  if (u.partner_verified !== undefined) data.partnerVerified = Boolean(u.partner_verified);
  if (u.partner_rating !== undefined) data.partnerRating = Number(u.partner_rating);
  if (u.partner_category !== undefined) data.partnerCategory = u.partner_category;
  if (u.bank_account !== undefined) data.bankAccount = u.bank_account;
  return data;
}

router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.role) where.role = req.query.role;
    if (req.query.partner_verified === 'true') where.partnerVerified = true;
    if (req.query.email) where.email = req.query.email;
    
    const limit = req.query._limit ? Number(req.query._limit) : undefined;
    const items = await prisma.user.findMany({ 
      where,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    res.json(items.map(mapUserOut));
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(mapUserOut(user));
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const data = mapUserIn(req.body);
    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    res.json(mapUserOut(user));
  } catch (err) { next(err); }
});

export default router;
