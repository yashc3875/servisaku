import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler, ApiError, findUserByEmail, emailsByIds } from '../lib/access.js';

const router = Router();
router.use(authenticate);

async function mapManyOut(items) {
  const emails = await emailsByIds(items.map((n) => n.userId));
  return items.map((n) => ({
    id: n.id,
    user_id: n.userId,
    user_email: emails[n.userId],
    title: n.title,
    body: n.body,
    message: n.body, // legacy alias some components read
    type: n.type,
    is_read: n.isRead,
    link: n.link,
    created_date: n.createdAt,
  }));
}

// GET /api/notifications — always scoped to the caller, regardless of query params
router.get('/', asyncHandler(async (req, res) => {
  const where = { userId: req.user.id };
  if (req.query.is_read !== undefined) where.isRead = req.query.is_read === 'true';
  const take = req.query._limit ? Math.min(Number(req.query._limit) || 100, 200) : 100;
  const items = await prisma.notification.findMany({ where, take, orderBy: { createdAt: 'desc' } });
  res.json(await mapManyOut(items));
}));

const createSchema = z.object({
  user_email: z.string().email().optional(), // defaults to self
  title: z.string().min(1).max(200),
  body: z.string().max(1000).default(''),
  message: z.string().max(1000).optional(), // legacy alias for body
  type: z.string().max(30).default('info'),
  link: z.string().max(500).nullish(),
});

// POST /api/notifications — authenticated clients may notify booking counterparties.
// NOTE (Phase 2): notification creation moves fully server-side behind a dispatcher;
// this client-create path exists only to keep current UI flows working.
router.post('/', validate(createSchema), asyncHandler(async (req, res) => {
  let targetId = req.user.id;
  if (req.body.user_email && req.body.user_email !== req.user.email) {
    const target = await findUserByEmail(req.body.user_email);
    if (!target) throw new ApiError(400, 'Target user not found');
    targetId = target.id;
  }
  const item = await prisma.notification.create({
    data: {
      userId: targetId,
      title: req.body.title,
      body: req.body.body || req.body.message || '',
      type: req.body.type,
      link: req.body.link ?? null,
    },
  });
  res.status(201).json((await mapManyOut([item]))[0]);
}));

const patchSchema = z.object({ is_read: z.boolean() });

// PATCH /api/notifications/:id — owner only, read-state only
router.patch('/:id', validate(patchSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Not found');
  if (existing.userId !== req.user.id) throw new ApiError(403, 'Forbidden');
  const item = await prisma.notification.update({
    where: { id: existing.id },
    data: { isRead: req.body.is_read },
  });
  res.json((await mapManyOut([item]))[0]);
}));

// DELETE /api/notifications/:id — owner only
router.delete('/:id', asyncHandler(async (req, res) => {
  const existing = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Not found');
  if (existing.userId !== req.user.id) throw new ApiError(403, 'Forbidden');
  await prisma.notification.delete({ where: { id: existing.id } });
  res.json({ ok: true });
}));

export default router;
