# 04 — Service Abstraction: Add a Category with Zero Code Changes

The core requirement: onboarding category #7 through #16 (and beyond) must be
**configuration, not engineering**. This doc specifies the config format, how the
existing UI consumes it, and the exact "add a service" procedure.

The design is an evolution of what already exists: `src/lib/catalog/schema.js` already
models categories/services/packages/addons with zod, and `BookingFlow.jsx` is already a
step-based wizard. We are (a) moving the data into Postgres, (b) making the wizard read
its step list from config, and (c) parametrizing pricing.

## 1. Three config layers per category

### Layer 1 — Catalog data (rows in catalog tables)
`ServiceCategory` → `Service`(s) → `ServicePackage`(s) + `ServiceAddon`(s).
Bilingual fields (`name`/`nameMy`, …) mandatory — enforced by the same zod schemas,
now validating admin API writes.

### Layer 2 — Pricing config (`Service.pricingModel` + `pricingConfig Json`)

| pricingModel | pricingConfig example | Used by |
|--------------|----------------------|---------|
| `flat` | `{}` — basePrice × package multiplier | pest control treatments |
| `per_unit` | `{ "unitLabel": "AC unit", "unitLabelMy": "Unit penghawa", "min": 1, "max": 10, "unitPrice": 60, "bulkTiers": [{"from":3,"price":50}] }` | AC servicing, sofa seats, mattress sizes |
| `area_based` | `{ "tiers": [{"id":"studio","label":"Studio","price":89}, {"id":"3br","label":"3 Bedroom","price":189}] }` | cleaning (the BHK pricing from commit `2620e33` generalizes into this) |
| `hourly` | `{ "ratePerHour": 70, "minHours": 2, "halfHourSteps": true }` | handyman, carpentry labor |
| `quote` | `{ "inspectionFee": 49, "waivedIfProceed": true }` | appliance repair, major plumbing/electrical |

The server-side `pricingEngine` is the only component that interprets these.
`POST /api/v1/pricing/quote` takes `{serviceId, packageId, addonIds, params}` and
returns a line-item breakdown — the same shape stored later as `BookingItem`s.

### Layer 3 — Workflow config (`ServiceCategory.workflowConfig Json`)

Defines the booking wizard steps, the service-specific questions, and the job lifecycle:

```jsonc
{
  "bookingSteps": [
    { "type": "service_select" },                       // built-in step components
    { "type": "params", "fields": [                     // dynamic form (rendered from config)
        { "id": "propertySize", "widget": "tier_select", "bindsTo": "pricing" },
        { "id": "hasPets", "widget": "toggle", "label": "Pets at home?", "labelMy": "Ada haiwan peliharaan?" }
    ]},
    { "type": "addons" },
    { "type": "schedule", "slotGranularityMin": 60, "leadTimeHours": 3,
      "emergencyAvailable": true },
    { "type": "address" },
    { "type": "review_pay" }
  ],
  "partnerPreferences": { "genderMatch": "optional" },   // "required" for spa/salon-women
  "jobLifecycle": ["accepted", "en_route", "arrived", "in_progress", "completed"],
  "completionRequirements": { "qaPhotos": { "min": 2, "stages": ["before", "after"] },
                              "checklist": ["areas_done", "customer_walkthrough"] },
  "quoteFlow": false,            // true → inserts diagnose→quote→approve before execution
  "warrantyDays": 7
}
```

A zod schema (`WorkflowConfigSchema`) validates this on admin save — invalid configs
can't reach consumers.

## 2. How existing code consumes it

- **`BookingFlow.jsx`** (575 lines, already a wizard): its hardcoded step array becomes
  `category.workflowConfig.bookingSteps.map(stepRegistry)`. The step components it
  already has (package select, addons, schedule, address, review) become the **step
  registry**; one new generic `params` step renders field configs via react-hook-form +
  zod (both already dependencies). New step *types* are code; new *combinations* are config.
- **`ServiceDetail.jsx` / `Explore.jsx` / `Home.jsx`**: swap imports from
  `@/lib/services` + `@/lib/packageData` to a `useCatalog()` TanStack Query hook hitting
  `/api/v1/catalog`. This finishes the Sprint-2/4 migration that `services.js` comments
  already describe, and retires both legacy files.
- **`PartnerJobScreen.jsx`**: renders `jobLifecycle` stages and
  `completionRequirements` checklist from config instead of hardcoded statuses.
- **Dispatch**: eligibility = `PartnerSkill` rows matching the category/service +
  service-area + availability; `partnerPreferences.genderMatch` adds a filter — config,
  not code.

## 3. The "add a new category" runbook (target state)

1. Admin → Catalog → "New Category": names (EN/BM), icon, accent, hero image.
2. Add services with pricing model + config; add packages and addons.
3. Pick a workflow template (cleaning-like, repair-quote-like, beauty-like) and adjust
   fields — templates seed the JSON so admins rarely write it by hand.
4. Define partner skill requirement; existing partners apply for the skill, new
   partners onboard with it; verification queue gates activation.
5. Toggle `isActive` per city.

No deploy. The category appears on Home/Explore (which render from the catalog API),
its booking flow assembles from step registry, pricing quotes flow through the engine,
and dispatch matches on the new skill.

**Validation of the abstraction:** categories 7–16 in the gap analysis intentionally
span every pricing model and workflow variant (quote-flow appliance repair, hourly
handyman, per-unit sofa cleaning, gender-matched time-critical spa). If each of those
onboards without code, the abstraction is proven. Where one genuinely can't (e.g. a new
widget type), add it to the step registry — that's the designed extension point.

## 4. What stays in code (deliberately)

- Step/widget component registry (UI quality demands real components).
- Pricing model interpreters (money logic must be reviewed code).
- Lifecycle side-effects (escrow release on completion, QA gating).
- The zod config schemas themselves.

This is the same boundary the Urban Company blueprint draws with its JSONB
`service_workflows_config` — config describes *which* steps and *what* parameters;
code owns *how* steps behave.
