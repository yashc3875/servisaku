import { base44 } from '@/api/base44Client';

// OTP simulation (in production: Vonage/Twilio SMS to +60 numbers)
const OTP_STORE = new Map(); // In production: Redis

export function formatMalaysianPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('60')) return '+' + digits;
  if (digits.startsWith('0')) return '+6' + digits;
  return '+60' + digits;
}

export function isValidMalaysianPhone(phone) {
  return /^\+60[1-9]\d{7,9}$/.test(phone);
}

export function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function sendOTP(phone) {
  const otp = generateOTP();
  const expires = Date.now() + 5 * 60 * 1000; // 5 min TTL
  OTP_STORE.set(phone, { otp, expires, attempts: 0 });
  console.info(`[FixMate OTP] ${phone} → ${otp}`); // In prod: SMS via Vonage
  return otp; // Returned for demo; in prod don't expose
}

export function verifyOTP(phone, input) {
  const record = OTP_STORE.get(phone);
  if (!record) return { success: false, error: 'OTP not found. Request a new code.' };
  if (Date.now() > record.expires) {
    OTP_STORE.delete(phone);
    return { success: false, error: 'OTP expired. Request a new code.' };
  }
  record.attempts += 1;
  if (record.attempts > 3) {
    OTP_STORE.delete(phone);
    return { success: false, error: 'Too many attempts. Request a new code.' };
  }
  if (record.otp !== input) {
    return { success: false, error: `Incorrect OTP. ${3 - record.attempts} attempts remaining.` };
  }
  OTP_STORE.delete(phone);
  return { success: true };
}

export async function getMe() {
  return base44.auth.me();
}

export function hasRole(user, ...roles) {
  return user && roles.includes(user.role);
}

export function isPartnerReady(user) {
  return user?.partner_verified === true;
}

export function isNewUser(user) {
  return user && !user.phone;
}

export const ROLE_HOME = {
  consumer: '/',
  partner: '/partner',
  admin: '/admin',
  super_admin: '/admin',
};