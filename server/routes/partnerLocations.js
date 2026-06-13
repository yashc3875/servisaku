import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler, ApiError, isAdmin, findUserByEmail, emailsByIds } from '../lib/access.js';

const router = Router();
router.use(authenticate);

async function mapManyOut(items) {
  const emails = await emailsByIds(items.map((l) => l.partnerId));
  return items.map((l) => ({
    id: l.id,
    partner_id: l.partnerId,
    partner_email: emails[l.partnerId],
    partner_name: l.partnerName,
    lat: l.lat,
    lng: l.lng,
    is_online: l.isOnline,
    is_on_job: l.isOnJob,
    last_seen: l.lastSeen,
  }));
}

// GET /api/partner-locations — presence directory (authenticated)
router.get('/', asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.partner_email) {
    const p = await findUserByEmail(req.query.partner_email);
    where.partnerId = p ? p.id : '__none__';
  }
  if (req.query.is_online !== undefined) where.isOnline = req.query.is_online === 'true';
  const items = await prisma.partnerLocation.findMany({ where });
  res.json(await mapManyOut(items));
}));

const upsertSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).nullish(),
  lng: z.coerce.number().min(-180).max(180).nullish(),
  is_online: z.boolean().optional(),
  is_on_job: z.boolean().optional(),
});

function toData(body, partner) {
  const data = { lastSeen: new Date() };
  if (partner) data.partnerName = partner.fullName;
  if (body.lat !== undefined) data.lat = body.lat;
  if (body.lng !== undefined) data.lng = body.lng;
  if (body.is_online !== undefined) data.isOnline = body.is_online;
  if (body.is_on_job !== undefined) data.isOnJob = body.is_on_job;
  return data;
}

// POST /api/partner-locations — partners upsert their own presence row
router.post('/', validate(upsertSchema), asyncHandler(async (req, res) => {
  if (req.user.role !== 'partner' && !isAdmin(req.user)) {
    throw new ApiError(403, 'Only partners can publish presence');
  }
  const partner = await prisma.user.findUnique({ where: { id: req.user.id } });
  const data = toData(req.body, partner);
  const item = await prisma.partnerLocation.upsert({
    where: { partnerId: req.user.id },
    create: { partnerId: req.user.id, ...data },
    update: data,
  });
  res.status(201).json((await mapManyOut([item]))[0]);
}));

// PATCH /api/partner-locations/:id — owner partner or admin
router.patch('/:id', validate(upsertSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.partnerLocation.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Not found');
  if (existing.partnerId !== req.user.id && !isAdmin(req.user)) throw new ApiError(403, 'Forbidden');
  const item = await prisma.partnerLocation.update({
    where: { id: existing.id },
    data: toData(req.body, null),
  });
  res.json((await mapManyOut([item]))[0]);
}));

export default router;
