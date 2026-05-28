// src/lib/services.js
// Back-compat layer. The legacy SERVICES array is now derived from the new
// catalog for the three migrated categories. Unmigrated categories keep their
// original hardcoded entries so existing routes (/service/electrical etc.)
// still resolve and BookingFlow.jsx can read service.priceRange / icon / color.
//
// Sprint 2 migrates BookingFlow.jsx, ServiceDetail.jsx, Explore.jsx, Home.jsx
// to import from '@/lib/catalog' directly; this shim is removed in Sprint 4.

import { Home, Droplets, Zap, Wind, Paintbrush, Bug, Sparkles } from 'lucide-react';
import { CATEGORIES, SERVICES_V2 } from './catalog';

/* Map catalog iconKey strings → lucide components for legacy shape */
const ICON_MAP = { Sparkles, Wind, Droplets, Zap, Paintbrush, Bug, Home };

/* Per-category Tailwind class strings consumed by the old ServiceCard icon tile.
   Use brand-tint / info-tint / etc. so they pick up the new token system. */
const LEGACY_COLOR = {
  cleaning:       'bg-brand-tint text-brand-ink',
  ac:             'bg-info-tint text-info',
  plumbing:       'bg-info-tint text-info',
  electrical:     'bg-warning-tint text-warning',
  painting:       'bg-accent-tint text-accent',
  'pest-control': 'bg-danger-tint text-danger',
};

/* Legacy hero images for the three already-migrated categories.
   Catalog heroImage points to /img/category/*.webp which is not yet shipped;
   keep the existing Unsplash URLs so the old Home/ServiceDetail surfaces
   continue to render an actual image until Sprint 3 ships the new assets. */
const LEGACY_IMAGE = {
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
  ac:       'https://media.base44.com/images/public/6a1572582a8e67fb23e0b043/fbc9e7de4_ac.jpg',
  plumbing: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80',
};

const LEGACY_DURATION = {
  cleaning: '2-4 hours',
  ac:       '1-2 hours',
  plumbing: '1-3 hours',
};

/* Build legacy entry from a catalog category. */
function toLegacy(category) {
  const services = SERVICES_V2.filter((s) => s.categoryId === category.id);
  const maxPrice = services.reduce((m, s) => Math.max(m, s.basePrice), category.priceFrom);
  return {
    id: category.slug,                         // 'cleaning' | 'ac' | 'plumbing'
    name: category.name,
    nameMy: category.nameMy,
    icon: ICON_MAP[category.iconKey] || Home,
    color: LEGACY_COLOR[category.slug] || 'bg-raised text-ink',
    price: `From RM${category.priceFrom}`,
    description: category.tagline,
    descriptionMy: category.taglineMy,
    image: LEGACY_IMAGE[category.slug] || category.heroImage,
    priceRange: [category.priceFrom, maxPrice],
    duration: LEGACY_DURATION[category.slug] || '1-3 hours',
  };
}

/* Catalog-backed entries for the 3 migrated categories. */
const MIGRATED = CATEGORIES.map(toLegacy);

/* Re-route AC slug 'ac' -> legacy id 'ac-servicing' so existing /service/ac-servicing
   routes keep working. We expose both ids that point at the same entry. */
const AC = MIGRATED.find((s) => s.id === 'ac');
const acAlias = AC ? [{ ...AC, id: 'ac-servicing' }] : [];

/* Unmigrated categories preserved verbatim from the original Base44 export so
   that routes like /service/electrical, /service/painting, /service/pest-control
   continue to resolve. These three are scheduled to migrate to catalog/ in
   later sprints. */
const UNMIGRATED = [
  {
    id: 'electrical',
    name: 'Electrical',
    nameMy: 'Elektrikal',
    icon: Zap,
    color: LEGACY_COLOR.electrical,
    price: 'From RM79',
    description: 'Wiring, repairs, and electrical installations',
    descriptionMy: 'Pendawaian, pembaikan dan pemasangan elektrik',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80',
    priceRange: [79, 599],
    duration: '1-4 hours',
  },
  {
    id: 'painting',
    name: 'Painting',
    nameMy: 'Cat Rumah',
    icon: Paintbrush,
    color: LEGACY_COLOR.painting,
    price: 'From RM199',
    description: 'Interior and exterior painting services',
    descriptionMy: 'Perkhidmatan mengecat dalaman dan luaran',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80',
    priceRange: [199, 1999],
    duration: '1-3 days',
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    nameMy: 'Kawalan Serangga',
    icon: Bug,
    color: LEGACY_COLOR['pest-control'],
    price: 'From RM99',
    description: 'Termite, cockroach, and mosquito control',
    descriptionMy: 'Kawalan anai-anai, lipas dan nyamuk',
    image: 'https://media.base44.com/images/public/6a1572582a8e67fb23e0b043/e20b6023f_pest.jpg',
    priceRange: [99, 699],
    duration: '1-2 hours',
  },
];

/* The legacy 'cleaning' slug was 'home-cleaning' in the original Base44 export.
   Expose both ids so existing routes and bookings continue to resolve. */
const CLEANING = MIGRATED.find((s) => s.id === 'cleaning');
const cleaningAlias = CLEANING ? [{ ...CLEANING, id: 'home-cleaning' }] : [];

export const SERVICES = [
  ...cleaningAlias,   // 'home-cleaning' (legacy id)
  ...MIGRATED,        // 'cleaning', 'ac', 'plumbing' (new ids)
  ...acAlias,         // 'ac-servicing' (legacy id)
  ...UNMIGRATED,      // 'electrical', 'painting', 'pest-control'
];

export const CITIES = [
  'Kuala Lumpur', 'Petaling Jaya', 'Shah Alam', 'Subang Jaya',
  'Ampang', 'Cheras', 'Bangsar', 'Mont Kiara',
];

export const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];
