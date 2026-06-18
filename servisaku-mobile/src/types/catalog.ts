import type { ID, LocalizedText, MoneySen } from './common';

/**
 * Catalog domain. The data model is intentionally generic so new categories and
 * services can be added purely as data — no code changes required (per spec).
 */

/** Stable identifiers for the Lucide icon used by a category. */
export type IconName =
  | 'sparkles'
  | 'spray-can'
  | 'wind'
  | 'wrench'
  | 'zap'
  | 'hammer'
  | 'bug'
  | 'flower-2'
  | 'truck'
  | 'washing-machine'
  | 'paint-roller'
  | 'car'
  | 'grid-3x3';

export interface ServiceCategory {
  id: ID;
  slug: string;
  name: LocalizedText;
  tagline: LocalizedText;
  icon: IconName;
  /** Hex accent used for the category tile / hero. */
  accentColor: string;
  heroImage: string;
  /** Sort order on the home grid. */
  order: number;
  popular: boolean;
}

/** A selectable tier within a service (e.g. "Standard Clean", "Deep Clean"). */
export interface ServicePackage {
  id: ID;
  name: LocalizedText;
  description: LocalizedText;
  /** Base price in sen. */
  price: MoneySen;
  /** Optional strike-through original price for promos. */
  compareAtPrice?: MoneySen;
  /** Estimated duration in minutes. */
  durationMinutes: number;
  /** Bullet list of what's included. */
  includes: LocalizedText[];
  /** Unit label for quantity-based services, e.g. "per AC unit". */
  unitLabel?: LocalizedText;
  recommended?: boolean;
}

export interface ServiceAddOn {
  id: ID;
  name: LocalizedText;
  price: MoneySen;
  durationMinutes: number;
}

export interface ServiceFAQ {
  question: LocalizedText;
  answer: LocalizedText;
}

export interface Service {
  id: ID;
  categoryId: ID;
  slug: string;
  name: LocalizedText;
  shortDescription: LocalizedText;
  description: LocalizedText;
  image: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  bookingCount: number;
  /** Lowest package price, denormalized for listing cards. */
  fromPrice: MoneySen;
  tags: LocalizedText[];
  packages: ServicePackage[];
  addOns: ServiceAddOn[];
  faqs: ServiceFAQ[];
  /** Whether this service supports recurring (weekly/biweekly) booking. */
  supportsRecurring: boolean;
}

export interface ServiceListItem
  extends Pick<
    Service,
    | 'id'
    | 'categoryId'
    | 'slug'
    | 'name'
    | 'shortDescription'
    | 'image'
    | 'rating'
    | 'reviewCount'
    | 'fromPrice'
    | 'tags'
  > {}
