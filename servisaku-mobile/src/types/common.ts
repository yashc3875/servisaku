/** Shared primitives used across DTOs. */

export type ID = string;

/** ISO-8601 timestamp string, e.g. "2026-06-18T09:30:00+08:00". */
export type ISODateString = string;

export type Locale = 'en' | 'ms';

/** Money is always stored in sen (cents) to avoid float errors. RM 120.00 = 12000. */
export type MoneySen = number;

export interface LocalizedText {
  en: string;
  ms: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export const MALAYSIAN_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'Kuala Lumpur',
  'Labuan',
  'Putrajaya',
] as const;

export type MalaysianState = (typeof MALAYSIAN_STATES)[number];
