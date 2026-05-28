// src/lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Class merge — canonical helper (existing imports rely on this name). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Alias used by some new components for readability. */
export const cx = cn;

/** Existing flag — preserved for back-compat (base44 SDK iframe detection). */
export const isIframe = typeof window !== 'undefined' && window.self !== window.top;

/* ── Malaysian formatting helpers ──────────────────────────── */

const myrFormatter = new Intl.NumberFormat('en-MY', {
  style: 'currency',
  currency: 'MYR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const myrFormatterDecimal = new Intl.NumberFormat('en-MY', {
  style: 'currency',
  currency: 'MYR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number as Malaysian Ringgit. */
export function formatMYR(amount, { decimals = false, prefix = '' } = {}) {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  const fmt = decimals ? myrFormatterDecimal : myrFormatter;
  return `${prefix}${fmt.format(Number(amount))}`;
}

/** Format a duration range in minutes → "1.5h–2h" / "45m". */
export function formatDuration(min, max) {
  if (min == null) return '—';
  const fmt = (m) => (m >= 60 ? (m % 60 === 0 ? `${m / 60}h` : `${(m / 60).toFixed(1)}h`) : `${m}m`);
  if (max && max !== min) return `${fmt(min)}–${fmt(max)}`;
  return fmt(min);
}

/** Pick first-name from a full name; safe on null. */
export function firstName(fullName) {
  if (!fullName) return '';
  return fullName.trim().split(/\s+/)[0];
}

/** Greeting for current time (24h). */
export function timeGreeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
