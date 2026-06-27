import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler, ApiError } from '../lib/access.js';
import { COURSE_CATALOG, publicCourse, gradeQuiz } from '../lib/trainingCatalog.js';

const router = Router();
router.use(authenticate);

// Sensible defaults — returned (merged) so the UI always has a full object.
const DEFAULTS = {
  working_days: [1, 2, 3, 4, 5],          // 0=Sun … 6=Sat
  start_time: '09:00',
  end_time: '18:00',
  lunch: { enabled: false, start: '13:00', end: '14:00' },
  vacation_mode: false,
  instant_booking: true,
  max_daily_jobs: 6,
  coverage_radius_km: 10,
  preferred_areas: [],
  preferred_categories: [],
  unavailable_dates: [],
};

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const availabilitySchema = z.object({
  working_days: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  start_time: z.string().regex(TIME).optional(),
  end_time: z.string().regex(TIME).optional(),
  lunch: z.object({
    enabled: z.boolean(),
    start: z.string().regex(TIME),
    end: z.string().regex(TIME),
  }).optional(),
  vacation_mode: z.boolean().optional(),
  instant_booking: z.boolean().optional(),
  max_daily_jobs: z.number().int().min(1).max(50).optional(),
  coverage_radius_km: z.number().int().min(1).max(200).optional(),
  preferred_areas: z.array(z.string().max(80)).max(50).optional(),
  preferred_categories: z.array(z.string().max(80)).max(50).optional(),
  unavailable_dates: z.array(z.string().regex(DATE)).max(365).optional(),
});

function assertPartner(req) {
  if (req.user.role !== 'partner') throw new ApiError(403, 'Partners only');
}

// GET /api/partners/me/availability
router.get('/me/availability', asyncHandler(async (req, res) => {
  assertPartner(req);
  const u = await prisma.user.findUnique({ where: { id: req.user.id }, select: { availability: true } });
  res.json({ ...DEFAULTS, ...(u?.availability || {}) });
}));

// PATCH /api/partners/me/availability — partial update, merged onto current config.
router.patch('/me/availability', validate(availabilitySchema), asyncHandler(async (req, res) => {
  assertPartner(req);
  const u = await prisma.user.findUnique({ where: { id: req.user.id }, select: { availability: true } });
  const next = { ...DEFAULTS, ...(u?.availability || {}), ...req.body };
  const saved = await prisma.user.update({
    where: { id: req.user.id },
    data: { availability: next },
    select: { availability: true },
  });
  res.json(saved.availability);
}));

// ─── Verification documents (Malaysia) ──────────────────────────────────────
// Catalogue of accepted documents. `required` ones drive the activation %.
const DOC_CATALOG = [
  { type: 'mykad', label: 'MyKad (NRIC)', group: 'Identity', required: true, hasNumber: true, numberLabel: 'IC number', hasExpiry: false, help: 'Upload front & back of your MyKad.' },
  { type: 'selfie', label: 'Selfie verification', group: 'Identity', required: true, hasNumber: false, hasExpiry: false, help: 'A clear selfie to match against your MyKad.' },
  { type: 'skill_cert', label: 'Skills certificate', group: 'Professional', required: true, hasNumber: true, numberLabel: 'Certificate / licence no.', hasExpiry: true, help: 'CIDB Green Card, Suruhanjaya Tenaga competency (Chargeman/Wireman), SPAN plumber licence, etc.' },
  { type: 'insurance', label: 'Public liability insurance', group: 'Professional', required: true, hasNumber: true, numberLabel: 'Policy number', hasExpiry: true, help: 'Covers accidental damage during jobs.' },
  { type: 'bank', label: 'Bank account', group: 'Financial', required: true, hasNumber: true, numberLabel: 'Account number', hasExpiry: false, help: 'Malaysian bank account for payouts.' },
  { type: 'ssm', label: 'SSM business registration', group: 'Business', required: false, hasNumber: true, numberLabel: 'SSM no.', hasExpiry: false, help: 'If you operate as a registered business (Sdn Bhd / Enterprise).' },
  { type: 'driving_licence', label: 'Driving licence (JPJ)', group: 'Business', required: false, hasNumber: true, numberLabel: 'Licence no.', hasExpiry: true, help: 'If your service requires driving.' },
  { type: 'lhdn', label: 'Income tax (LHDN)', group: 'Financial', required: false, hasNumber: true, numberLabel: 'Tax no.', hasExpiry: false, help: 'For tax reporting.' },
];
const DOC_TYPES = DOC_CATALOG.map((d) => d.type);

// Malaysia-specific number validation/normalisation.
function validateDocNumber(type, number) {
  if (type === 'mykad') {
    const digits = String(number || '').replace(/\D/g, '');
    if (digits.length !== 12) throw new ApiError(400, 'IC number must be 12 digits (e.g. 900101-14-5567)');
    return `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
  }
  if (type === 'ssm') {
    const v = String(number || '').trim();
    if (!/^[A-Za-z0-9-]{6,20}$/.test(v)) throw new ApiError(400, 'Invalid SSM registration number');
    return v;
  }
  return number ? String(number).trim() : null;
}

async function buildDocSummary(partnerId) {
  const rows = await prisma.partnerDocument.findMany({ where: { partnerId } });
  const byType = Object.fromEntries(rows.map((r) => [r.type, r]));
  const now = new Date();
  const documents = DOC_CATALOG.map((cat) => {
    const r = byType[cat.type];
    let status = r ? r.status : 'missing';
    if (r && r.expiryDate && new Date(r.expiryDate) < now && status !== 'rejected') status = 'expired';
    return {
      ...cat,
      status,
      file_url: r?.fileUrl ?? null,
      number: r?.number ?? null,
      expiry_date: r?.expiryDate ?? null,
      rejection_reason: r?.rejectionReason ?? null,
      verified_at: r?.verifiedAt ?? null,
      updated_at: r?.updatedAt ?? null,
    };
  });
  const required = documents.filter((d) => d.required);
  const requiredVerified = required.filter((d) => d.status === 'verified').length;
  return {
    documents,
    required_total: required.length,
    required_verified: requiredVerified,
    progress: required.length ? Math.round((requiredVerified / required.length) * 100) : 100,
    activated: requiredVerified === required.length,
  };
}

// GET /api/partners/me/documents — catalogue merged with the partner's submissions + summary.
router.get('/me/documents', asyncHandler(async (req, res) => {
  assertPartner(req);
  res.json(await buildDocSummary(req.user.id));
}));

// POST /api/partners/me/documents — submit/replace a document (→ pending review).
const docSchema = z.object({
  type: z.enum(DOC_TYPES),
  file_url: z.string().max(2000).optional(),
  number: z.string().max(60).optional(),
  expiry_date: z.string().regex(DATE).optional(),
});
router.post('/me/documents', validate(docSchema), asyncHandler(async (req, res) => {
  assertPartner(req);
  const cat = DOC_CATALOG.find((d) => d.type === req.body.type);
  const number = cat.hasNumber ? validateDocNumber(req.body.type, req.body.number) : null;
  if (!req.body.file_url && !number) throw new ApiError(400, 'Attach a file or enter the required number');
  const data = {
    status: 'pending',
    fileUrl: req.body.file_url ?? null,
    number,
    expiryDate: req.body.expiry_date ? new Date(req.body.expiry_date) : null,
    rejectionReason: null,
    verifiedAt: null,
  };
  await prisma.partnerDocument.upsert({
    where: { partnerId_type: { partnerId: req.user.id, type: req.body.type } },
    create: { partnerId: req.user.id, type: req.body.type, ...data },
    update: data,
  });
  res.json(await buildDocSummary(req.user.id));
}));

// ─── Training Center ─────────────────────────────────────────────────────────
async function buildTraining(partnerId) {
  const rows = await prisma.trainingProgress.findMany({ where: { partnerId } });
  const byId = Object.fromEntries(rows.map((r) => [r.courseId, r]));
  const courses = COURSE_CATALOG.map((c) => publicCourse(c, byId[c.id]));
  const mandatory = courses.filter((c) => c.mandatory);
  const mandatoryDone = mandatory.filter((c) => c.status === 'completed').length;
  const completed = courses.filter((c) => c.status === 'completed').length;
  return {
    courses,
    total: courses.length,
    completed,
    mandatory_total: mandatory.length,
    mandatory_completed: mandatoryDone,
    certified: mandatoryDone === mandatory.length,
    progress: courses.length ? Math.round((completed / courses.length) * 100) : 0,
  };
}

// GET /api/partners/me/training — catalogue + the partner's progress + summary.
router.get('/me/training', asyncHandler(async (req, res) => {
  assertPartner(req);
  res.json(await buildTraining(req.user.id));
}));

// POST /api/partners/me/training/:courseId/complete — grade quiz (server-side) & record.
const completeSchema = z.object({ answers: z.array(z.number().int().min(0).max(10)).max(20).optional() });
router.post('/me/training/:courseId/complete', validate(completeSchema), asyncHandler(async (req, res) => {
  assertPartner(req);
  const course = COURSE_CATALOG.find((c) => c.id === req.params.courseId);
  if (!course) throw new ApiError(404, 'Course not found');
  const { passed, score } = gradeQuiz(course, req.body.answers || []);
  if (!passed) {
    return res.json({ passed: false, score, ...(await buildTraining(req.user.id)) });
  }
  await prisma.trainingProgress.upsert({
    where: { partnerId_courseId: { partnerId: req.user.id, courseId: course.id } },
    create: { partnerId: req.user.id, courseId: course.id, status: 'completed', score, completedAt: new Date() },
    update: { status: 'completed', score, completedAt: new Date() },
  });
  res.json({ passed: true, score, ...(await buildTraining(req.user.id)) });
}));

export default router;
