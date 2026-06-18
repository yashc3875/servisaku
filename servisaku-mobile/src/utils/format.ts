import type { Locale, MoneySen } from '@/types';

/** Format sen as Malaysian Ringgit, e.g. 12000 → "RM 120.00". */
export function formatRM(sen: MoneySen): string {
  return `RM ${(sen / 100).toFixed(2)}`;
}

/** Compact RM without cents when whole, e.g. 12000 → "RM 120". */
export function formatRMShort(sen: MoneySen): string {
  const ringgit = sen / 100;
  return Number.isInteger(ringgit)
    ? `RM ${ringgit}`
    : `RM ${ringgit.toFixed(2)}`;
}

/** Human duration, e.g. 75 → "1h 15m", 60 → "1h", 45 → "45m". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const DAY_NAMES: Record<Locale, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ms: ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'],
};

const MONTH_NAMES: Record<Locale, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ms: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'],
};

/** Format an ISO date as "Sat, 20 Jun" localized to EN/BM. */
export function formatDate(iso: string, locale: Locale = 'en'): string {
  const d = new Date(iso);
  const day = DAY_NAMES[locale][d.getDay()];
  const month = MONTH_NAMES[locale][d.getMonth()];
  return `${day}, ${d.getDate()} ${month}`;
}

/** Relative time like "2h ago" / "Just now". */
export function formatRelative(iso: string, locale: Locale = 'en'): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  const labels =
    locale === 'ms'
      ? { now: 'Baru sahaja', m: 'min lalu', h: 'jam lalu', d: 'hari lalu' }
      : { now: 'Just now', m: 'min ago', h: 'h ago', d: 'd ago' };
  if (mins < 1) return labels.now;
  if (mins < 60) return `${mins} ${labels.m}`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ${labels.h}`;
  return `${Math.round(hours / 24)} ${labels.d}`;
}

/** Mask a Malaysian phone for display, e.g. "+60 12-345 6789". */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^60/, '');
  if (digits.length < 9) return raw;
  const prefix = digits.slice(0, 2);
  const mid = digits.slice(2, 5);
  const last = digits.slice(5);
  return `+60 ${prefix}-${mid} ${last}`;
}
