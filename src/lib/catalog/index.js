// src/lib/catalog/index.js
import { cleaningCategory, cleaningServices, cleaningPackages, cleaningAddons } from './cleaning';
import { acCategory,       acServices,       acPackages,       acAddons       } from './ac';
import { plumbingCategory, plumbingServices, plumbingPackages, plumbingAddons } from './plumbing';
import { validateCatalog } from './schema';

export const CATEGORIES = [cleaningCategory, acCategory, plumbingCategory];

export const SERVICES_V2 = [
  ...cleaningServices,
  ...acServices,
  ...plumbingServices,
];

export const PACKAGES_BY_CATEGORY = {
  cleaning: cleaningPackages,
  ac:       acPackages,
  plumbing: plumbingPackages,
};

export const ADDONS_BY_CATEGORY = {
  cleaning: cleaningAddons,
  ac:       acAddons,
  plumbing: plumbingAddons,
};

/* Dev-time validation — Vite tree-shakes this out in production. */
if (import.meta.env.DEV) {
  try {
    validateCatalog({
      categories: CATEGORIES,
      services: SERVICES_V2,
      packages: PACKAGES_BY_CATEGORY,
      addons: ADDONS_BY_CATEGORY,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[catalog] validation failed', err);
  }
}

/* ── Helpers ───────────────────────────────────────────── */

export const getCategoryById   = (id)   => CATEGORIES.find((c) => c.id === id);
export const getCategoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);
export const getServiceById    = (id)   => SERVICES_V2.find((s) => s.id === id);
export const getServicesByCategory = (catId) => SERVICES_V2.filter((s) => s.categoryId === catId);
