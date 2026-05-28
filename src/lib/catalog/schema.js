// src/lib/catalog/schema.js
import { z } from 'zod';

export const PackageId = z.enum(['essential', 'signature', 'premium']);

export const PackageSchema = z.object({
  id: PackageId,
  name: z.string(),
  nameMy: z.string(),
  tagline: z.string(),
  multiplier: z.number().positive(),
  inclusions: z.array(z.string()).min(1),
  exclusions: z.array(z.string()).optional(),
  warrantyDays: z.number().int().nonnegative().optional(),
});

export const AddonSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameMy: z.string(),
  price: z.number().nonnegative(),
  duration_min: z.number().int().nonnegative().default(0),
});

export const PropertyType = z.enum(['condo', 'apartment', 'landed', 'studio', 'office']);
export const BookingMode  = z.enum(['oneoff', 'recurring', 'emergency']);
export const AccentTone   = z.enum(['emerald', 'sky', 'amber', 'violet', 'rose', 'slate']);

export const ServiceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  categoryId: z.string(),
  subcategoryId: z.string(),
  name: z.string(),
  nameMy: z.string(),
  description: z.string(),
  descriptionMy: z.string(),
  basePrice: z.number().nonnegative(),
  duration_min: z.number().int().nonnegative(),
  duration_max: z.number().int().nonnegative(),
  packages: z.array(PackageId),
  addons: z.array(z.string()),
  propertyTypes: z.array(PropertyType),
  bookingModes: z.array(BookingMode),
  cities: z.array(z.string()),
  partnerSkills: z.array(z.string()),
  tools: z.array(z.string()),
  safetyChecks: z.array(z.string()),
  image: z.string().optional(),
});

export const SubcategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  nameMy: z.string(),
  iconKey: z.string(),
});

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  nameMy: z.string(),
  tagline: z.string(),
  taglineMy: z.string(),
  iconKey: z.string(),
  accent: AccentTone,
  heroImage: z.string(),
  subcategories: z.array(SubcategorySchema),
  emergencySupported: z.boolean(),
  recurringSupported: z.boolean(),
  priceFrom: z.number().nonnegative(),
});

export function validateCatalog({ categories, services, packages, addons }) {
  z.array(CategorySchema).parse(categories);
  z.array(ServiceSchema).parse(services);
  Object.values(packages).forEach((arr) => z.array(PackageSchema).parse(arr));
  Object.values(addons).forEach((arr) => z.array(AddonSchema).parse(arr));
}
