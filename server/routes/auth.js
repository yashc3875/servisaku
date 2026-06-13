import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email().max(254).transform((s) => s.toLowerCase()),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(120),
  // Self-registration may never create privileged accounts.
  role: z.enum(['consumer', 'partner']).default('consumer'),
});

const loginSchema = z.object({
  email: z.string().email().max(254).transform((s) => s.toLowerCase()),
  password: z.string().min(1).max(128),
});

// Fields a user may change on their own profile. Privileged flags
// (role, partnerVerified, partnerRating) are admin-only via PATCH /api/users/:id.
const meSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  phone: z.string().max(30).nullish(),
  city: z.string().max(100).nullish(),
  bio: z.string().max(2000).nullish(),
  avatarUrl: z.string().max(2000).nullish(),
  partnerCategory: z.string().max(100).nullish(),
  bankAccount: z.string().max(100).nullish(),
});

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, fullName, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, fullName, role },
    });

    const token = signToken(user);
    res.json({ access_token: token, user: sanitize(user) });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ access_token: token, user: sanitize(user) });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(sanitize(user));
  } catch (err) { next(err); }
});

// PATCH /api/auth/me — whitelisted profile fields only
router.patch('/me', authenticate, validate(meSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.user.id }, data: req.body });
    res.json(sanitize(user));
  } catch (err) { next(err); }
});

// POST /api/auth/logout  (client-side token removal, server just acks)
router.post('/logout', (req, res) => res.json({ ok: true }));

function sanitize(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export default router;
