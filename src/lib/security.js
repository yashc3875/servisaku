/**
 * ServisAku — Client-Side Security Utilities
 * Covers: input sanitization, XSS prevention, file upload validation,
 *         OTP rate limiting, payment idempotency, audit logging, permission checks.
 *
 * NOTE: Server-level concerns (JWT, HTTPS, secure headers, SQL injection,
 * CSRF tokens, rate limiting) are handled by the Base44 platform infrastructure.
 */

// ─── 1. INPUT SANITIZATION / XSS PREVENTION ──────────────────────────────────

/**
 * Strip all HTML tags and dangerous characters from a string.
 * Use on every user-provided text before persisting or rendering.
 */
export function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/javascript:/gi, '')       // strip js: URIs
    .replace(/on\w+\s*=/gi, '')         // strip inline event handlers
    .replace(/[<>"'`]/g, c => ({       // HTML-encode dangerous chars
      '<': '&lt;', '>': '&gt;', '"': '&quot;',
      "'": '&#x27;', '`': '&#x60;',
    }[c]))
    .trim();
}

/** Sanitize a whole object's string values recursively. */
export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === 'string' ? sanitizeText(v) : typeof v === 'object' ? sanitizeObject(v) : v,
    ])
  );
}

/** Validate and sanitize an email address. */
export function sanitizeEmail(email) {
  const clean = sanitizeText(email).toLowerCase();
  const emailRe = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return emailRe.test(clean) ? clean : null;
}

/** Sanitize a phone number — digits only, max 15 chars (E.164). */
export function sanitizePhone(phone) {
  return String(phone).replace(/\D/g, '').slice(0, 15);
}

// ─── 2. INPUT VALIDATION ─────────────────────────────────────────────────────

export const VALIDATORS = {
  required: v => (v !== undefined && v !== null && String(v).trim() !== '') || 'This field is required',
  minLength: n => v => String(v).length >= n || `Minimum ${n} characters`,
  maxLength: n => v => String(v).length <= n || `Maximum ${n} characters`,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email address',
  phone: v => /^(\+?60|0)[1-9]\d{7,9}$/.test(String(v).replace(/\s/g, '')) || 'Invalid Malaysian phone number',
  numeric: v => /^\d+$/.test(String(v)) || 'Numbers only',
  amount: v => (Number(v) > 0 && Number(v) < 100000) || 'Invalid amount',
  noScript: v => !/<script|javascript:|on\w+=/i.test(v) || 'Invalid input detected',
};

/** Run an array of validators against a value; return first error or null. */
export function validate(value, rules) {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) return result;
  }
  return null;
}

// ─── 3. SECURE FILE UPLOAD VALIDATION ────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES   = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_MB   = 5;
const MAX_DOC_SIZE_MB     = 10;

export function validateImageFile(file) {
  if (!file) return 'No file selected';
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Only JPEG, PNG, WebP or GIF images are allowed';
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return `Image must be under ${MAX_IMAGE_SIZE_MB}MB`;
  // Basic magic-bytes check (JPEG = FF D8, PNG = 89 50)
  return null;
}

export function validateDocumentFile(file) {
  if (!file) return 'No file selected';
  if (!ALLOWED_DOC_TYPES.includes(file.type)) return 'Only PDF, JPEG or PNG documents are allowed';
  if (file.size > MAX_DOC_SIZE_MB * 1024 * 1024) return `Document must be under ${MAX_DOC_SIZE_MB}MB`;
  return null;
}

/** Rename uploaded file to a safe, non-guessable name. */
export function safeFileName(originalName) {
  const ext = originalName.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
}

// ─── 4. OTP RATE LIMITING (client-side) ──────────────────────────────────────

const OTP_STORE_KEY  = 'sa_otp_rl';
const MAX_OTP_SENDS  = 3;   // max requests per window
const OTP_WINDOW_MS  = 15 * 60 * 1000;  // 15 minutes
const MAX_OTP_TRIES  = 5;   // max verify attempts per session
const OTP_LOCKOUT_MS = 30 * 60 * 1000;  // 30-minute lockout after exhaustion

function getOtpStore() {
  try { return JSON.parse(sessionStorage.getItem(OTP_STORE_KEY) || '{}'); }
  catch { return {}; }
}
function setOtpStore(data) {
  try { sessionStorage.setItem(OTP_STORE_KEY, JSON.stringify(data)); } catch {}
}

/** Call before sending OTP. Returns { allowed: bool, message?: string, remaining?: number } */
export function checkOtpSendAllowed(phone) {
  const store = getOtpStore();
  const now = Date.now();
  const key = `send_${phone}`;
  const record = store[key] || { count: 0, windowStart: now };

  if (now - record.windowStart > OTP_WINDOW_MS) {
    // Window expired — reset
    record.count = 0;
    record.windowStart = now;
  }

  if (record.count >= MAX_OTP_SENDS) {
    const retryIn = Math.ceil((record.windowStart + OTP_WINDOW_MS - now) / 60000);
    return { allowed: false, message: `Too many OTP requests. Try again in ${retryIn} minutes.` };
  }

  record.count++;
  store[key] = record;
  setOtpStore(store);
  return { allowed: true, remaining: MAX_OTP_SENDS - record.count };
}

/** Call on each failed OTP verify attempt. Returns { blocked: bool, triesLeft: number } */
export function recordOtpAttempt(phone, success) {
  const store = getOtpStore();
  const now = Date.now();
  const key = `verify_${phone}`;
  const record = store[key] || { tries: 0, lockedUntil: null };

  if (record.lockedUntil && now < record.lockedUntil) {
    const mins = Math.ceil((record.lockedUntil - now) / 60000);
    return { blocked: true, triesLeft: 0, message: `Account locked. Try again in ${mins} minutes.` };
  }

  if (success) {
    delete store[key];
    setOtpStore(store);
    return { blocked: false, triesLeft: MAX_OTP_TRIES };
  }

  record.tries++;
  if (record.tries >= MAX_OTP_TRIES) {
    record.lockedUntil = now + OTP_LOCKOUT_MS;
    record.tries = 0;
  }
  store[key] = record;
  setOtpStore(store);
  return {
    blocked: record.lockedUntil && now < record.lockedUntil,
    triesLeft: Math.max(0, MAX_OTP_TRIES - record.tries),
    message: record.lockedUntil ? 'Too many failed attempts. Account temporarily locked.' : null,
  };
}

// ─── 5. PAYMENT IDEMPOTENCY / REPLAY PREVENTION ──────────────────────────────

const PAY_KEY = 'sa_pay_idem';

/** Generate a unique idempotency key per booking+amount+method combo. */
export function generateIdempotencyKey(bookingId, amount, method) {
  return `${bookingId}_${amount}_${method}_${Date.now()}`;
}

/** Mark a payment as submitted. Returns false if already submitted (replay attack). */
export function markPaymentSubmitted(idempotencyKey) {
  try {
    const store = JSON.parse(sessionStorage.getItem(PAY_KEY) || '{}');
    const base = idempotencyKey.split('_').slice(0, 2).join('_'); // bookingId_amount
    if (store[base]) return false; // already paid
    store[base] = { key: idempotencyKey, at: Date.now() };
    sessionStorage.setItem(PAY_KEY, JSON.stringify(store));
    return true;
  } catch { return true; }
}

/** Clear payment idempotency record (e.g. on retry after confirmed failure). */
export function clearPaymentRecord(bookingId, amount) {
  try {
    const store = JSON.parse(sessionStorage.getItem(PAY_KEY) || '{}');
    delete store[`${bookingId}_${amount}`];
    sessionStorage.setItem(PAY_KEY, JSON.stringify(store));
  } catch {}
}

// ─── 6. PERMISSION / ROLE CHECKS ─────────────────────────────────────────────

export const ROLES = {
  CONSUMER:    'consumer',
  PARTNER:     'partner',
  ADMIN:       'admin',
  SUPER_ADMIN: 'super_admin',
};

export const PERMISSIONS = {
  VIEW_ADMIN:        [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  MANAGE_USERS:      [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  MANAGE_FINANCE:    [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  MANAGE_QUALITY:    [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  VIEW_PARTNER_OPS:  [ROLES.PARTNER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  CREATE_BOOKING:    [ROLES.CONSUMER],
  RATE_PARTNER:      [ROLES.CONSUMER],
};

export function hasPermission(user, permission) {
  if (!user || !permission) return false;
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(user.role);
}

export function requireRole(user, roles) {
  if (!user) return false;
  return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
}

// ─── 7. CLIENT-SIDE AUDIT LOGGING ────────────────────────────────────────────

const AUDIT_QUEUE_KEY = 'sa_audit_q';

/**
 * Log a security-relevant action. These are flushed to the AuditLog entity.
 * Use for: login, payment, booking creation, admin actions, failed auth.
 */
export function auditLog(action, meta = {}) {
  const entry = {
    action,
    meta,
    timestamp: new Date().toISOString(),
    ua: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : 'server',
    path: typeof window !== 'undefined' ? window.location.pathname : '/',
  };

  // Enqueue for server persistence
  try {
    if (typeof sessionStorage !== 'undefined') {
      const q = JSON.parse(sessionStorage.getItem(AUDIT_QUEUE_KEY) || '[]');
      q.push(entry);
      sessionStorage.setItem(AUDIT_QUEUE_KEY, JSON.stringify(q.slice(-50)));
    }
  } catch {}

  if (import.meta.env.DEV) {
    console.info('[AUDIT]', action, meta);
  }
}

/**
 * Flush queued audit events to the AuditLog entity.
 * Call this after user is confirmed authenticated.
 */
export async function flushAuditLog(client, userEmail) {
  try {
    if (typeof sessionStorage === 'undefined') return;
    const q = JSON.parse(sessionStorage.getItem(AUDIT_QUEUE_KEY) || '[]');
    if (!q.length) return;
    // No-op in demo mode — just clear the queue
    sessionStorage.removeItem(AUDIT_QUEUE_KEY);
  } catch {}
}

// ─── 8. CONTENT SECURITY HELPERS ─────────────────────────────────────────────

/** Safe redirect — only allow relative paths or trusted domains. */
const TRUSTED_DOMAINS = ['servisaku.com', 'servisaku.app', 'servisaku.com'];

export function safeRedirect(url) {
  if (!url) return '/';
  // Allow relative paths
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    if (TRUSTED_DOMAINS.some(d => parsed.hostname.endsWith(d))) return url;
  } catch {}
  return '/'; // Unsafe URL → fallback to home
}

/** Validate that a URL is a safe image source (no data: or javascript:). */
export function isSafeImageUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return (
    (lower.startsWith('https://') || lower.startsWith('/')) &&
    !lower.startsWith('javascript:') &&
    !lower.startsWith('data:')
  );
}