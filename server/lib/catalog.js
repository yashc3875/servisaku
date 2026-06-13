// Catalog data-access + output mapping for the DB-driven service abstraction.
// The catalog API, the pricing engine, and booking validation all go through here
// so there is one definition of how catalog rows map to the snake_case API contract.
import { prisma } from '../db.js';
import { ApiError } from './access.js';

// Resolve a service by slug ("cleaning") or cuid id, with its category + packages +
// active add-ons. Returns null if not found / inactive.
export async function resolveService(idOrSlug) {
  if (!idOrSlug) return null;
  return prisma.service.findFirst({
    where: { isActive: true, OR: [{ slug: String(idOrSlug) }, { id: String(idOrSlug) }] },
    include: {
      category: true,
      packages: { orderBy: { sortOrder: 'asc' } },
      addons: { where: { isActive: true } },
    },
  });
}

export async function resolveServiceOr404(idOrSlug) {
  const service = await resolveService(idOrSlug);
  if (!service) throw new ApiError(404, `Service not found: ${idOrSlug}`);
  return service;
}

export async function listServices() {
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      category: true,
      packages: { orderBy: { sortOrder: 'asc' } },
      addons: { where: { isActive: true } },
    },
  });
}

// Derive a service-level agreement summary from the category workflow config.
export function buildSla(category) {
  const wf = category?.workflowConfig || {};
  const scheduleStep = Array.isArray(wf.bookingSteps)
    ? wf.bookingSteps.find((s) => s.type === 'schedule')
    : null;
  return {
    arrival_window_min: wf.arrivalWindowMin ?? null,
    warranty_days: wf.warrantyDays ?? null,
    lead_time_hours: scheduleStep?.leadTimeHours ?? null,
    slot_granularity_min: scheduleStep?.slotGranularityMin ?? 60,
    emergency_available: !!category?.emergencySupported,
    recurring_available: !!category?.recurringSupported,
    cancellation_policy: wf.cancellationPolicy ?? null,
    quote_flow: !!wf.quoteFlow,
  };
}

export function mapServiceSummary(s) {
  return {
    id: s.id,
    slug: s.slug,
    category_id: s.categoryId,
    category_slug: s.category?.slug ?? null,
    name: s.name,
    name_my: s.nameMy,
    description: s.description,
    description_my: s.descriptionMy,
    icon_key: s.category?.iconKey ?? null,
    accent: s.category?.accent ?? null,
    base_price: s.basePrice,
    price_from: s.category?.priceFrom ?? s.basePrice,
    pricing_model: s.pricingModel,
    duration_min: s.durationMin,
    duration_max: s.durationMax,
    emergency_supported: !!s.category?.emergencySupported,
    recurring_supported: !!s.category?.recurringSupported,
    package_count: Array.isArray(s.packages) ? s.packages.length : undefined,
    is_active: s.isActive,
  };
}

export function mapPackage(p) {
  return {
    id: p.id,
    tier: p.tier,
    name: p.name,
    name_my: p.nameMy,
    description: p.description,
    description_my: p.descriptionMy,
    price: p.price,
    multiplier: p.multiplier,
    inclusions: Array.isArray(p.inclusions) ? p.inclusions : [],
    inclusions_my: Array.isArray(p.inclusionsMy) ? p.inclusionsMy : [],
    is_popular: p.isPopular,
    sort_order: p.sortOrder,
  };
}

export function mapAddon(a) {
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    name_my: a.nameMy,
    price: a.price,
    duration_min: a.durationMin,
  };
}

export function mapServiceDetail(s) {
  return {
    ...mapServiceSummary(s),
    pricing_config: s.pricingConfig ?? null,
    workflow_config: s.category?.workflowConfig ?? null,
    sla: buildSla(s.category),
    packages: (s.packages || []).map(mapPackage),
    addons: (s.addons || []).map(mapAddon),
  };
}

// Validate service-specific answers against the category workflowConfig.
// Enforces required params and (for select widgets) option membership.
// Throws ApiError(400) listing every problem found. Returns the cleaned params.
export function validateServiceParams(workflowConfig, params = {}) {
  const wf = workflowConfig || {};
  const required = Array.isArray(wf.requiredParams) ? wf.requiredParams : [];
  const fields = collectParamFields(wf);
  const errors = [];

  for (const id of required) {
    const v = params[id];
    if (v === undefined || v === null || v === '') errors.push(`${id} is required`);
  }

  for (const f of fields) {
    const v = params[f.id];
    if (v === undefined || v === null || v === '') continue; // presence handled above
    if (f.widget === 'select' && Array.isArray(f.options) && !f.options.includes(v)) {
      errors.push(`${f.id} must be one of: ${f.options.join(', ')}`);
    }
    if (f.widget === 'textarea' && f.maxLength && String(v).length > f.maxLength) {
      errors.push(`${f.id} exceeds ${f.maxLength} characters`);
    }
  }

  if (errors.length) throw new ApiError(400, `Invalid service details: ${errors.join('; ')}`);
  return params;
}

function collectParamFields(workflowConfig) {
  const steps = Array.isArray(workflowConfig?.bookingSteps) ? workflowConfig.bookingSteps : [];
  return steps
    .filter((s) => s.type === 'params' && Array.isArray(s.fields))
    .flatMap((s) => s.fields);
}
