/**
 * Deterministic placeholder image URLs. Centralized so swapping to a real CDN
 * (or local assets) later is a one-file change.
 */
const SEED_BASE = 'https://picsum.photos/seed';

export const img = (seed: string, w = 800, h = 600): string =>
  `${SEED_BASE}/servisaku-${seed}/${w}/${h}`;

export const avatar = (seed: string, size = 160): string =>
  `https://i.pravatar.cc/${size}?u=servisaku-${seed}`;
