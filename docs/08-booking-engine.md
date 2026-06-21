# 08 — Dynamic Booking Engine (Phase 1: backend foundation)

Implements the Urban-Company-style, configuration-driven booking engine from
`servisaku-booking-flows.md` + `servisaku-services-config.json`, **layered onto**
the existing catalog (decision: *extend, don't greenfield*). One engine, 71
booking journeys; adding service #72 is a JSON + seed change with zero new code.

> **Scope of this phase:** schema + migration, seed (12 categories / 71 services),
> pricing engine, REST APIs, unit tests. The web booking wizard (Step A–F) and the
> admin panel are later phases.

---

## What was added

| Area | File |
|------|------|
| Pricing engine (pure, isomorphic) | [`server/lib/dynamicPricing.js`](../server/lib/dynamicPricing.js) |
| Global config / version source | [`server/lib/bookingEngineConfig.js`](../server/lib/bookingEngineConfig.js) |
| Catalog data-access + mappers | [`server/lib/catalog.js`](../server/lib/catalog.js) |
| Public catalog + quote routes | [`server/routes/catalog.js`](../server/routes/catalog.js) |
| Dynamic booking create | [`server/routes/bookings.js`](../server/routes/bookings.js) (`POST /bookings/dynamic`) |
| Schema models | [`prisma/schema.prisma`](../prisma/schema.prisma) — `BookingQuestion`, `QuestionOption`, `Service`/`Booking` fields |
| Migration | [`prisma/migrations/20260620120000_dynamic_booking_engine/migration.sql`](../prisma/migrations/20260620120000_dynamic_booking_engine/migration.sql) |
| Seed | [`prisma/bookingEngineSeed.js`](../prisma/bookingEngineSeed.js) |
| Master config (vendored) | [`prisma/data/servisaku-services-config.json`](../prisma/data/servisaku-services-config.json) |
| Unit tests | [`server/lib/__tests__/dynamicPricing.test.js`](../server/lib/__tests__/dynamicPricing.test.js) |

The legacy package/add-on engine (`server/lib/pricing.js`, 20% platform fee) is
**untouched** and still serves `POST /pricing/calculate` + `POST /bookings`.

---

## Data model (additive)

```
Service                                  BookingQuestion          QuestionOption
 ├─ pricingType  (8 enums)                 ├─ key (answer key)      ├─ key (option key)
 ├─ unitPrice / rate / visitFee            ├─ type (8 widgets)      ├─ priceModifier
 ├─ minQty / sstEnabled / convertsToQuote  ├─ required / sortOrder  ├─ unitPrice            (TIER_QUANTITY)
 └─ questions ─────────────────────────────┘ config (JSON) ─────────┤ priceModifierPerSqft  (PER_SQFT)
                                              options ───────────────┘ isDefault

Booking
 ├─ details         answer snapshot
 ├─ priceBreakdown  computePrice() snapshot  ← invoices never recalc from current config
 └─ configVersion   config version in force at booking time
```

## Pricing types → how Step A becomes a price

| `pricingType` | Base from | Notable answer handling |
|---------------|-----------|--------------------------|
| `FIXED` | a SINGLE_SELECT | flat modifiers |
| `TIERED` | a TIER_SELECT | + SINGLE/MULTI modifiers |
| `PER_UNIT` | QUANTITY × `config.pricePerUnit` | per-unit SELECTs × unit count |
| `TIER_QUANTITY` | Σ(option.unitPrice × qty) | `config.perUnit` SELECTs × total units |
| `PER_SQFT` | AREA × `config.ratePerSqft` | `config.perSqft` SELECTs use `priceModifierPerSqft × area` |
| `PER_HOUR` | HOURS × `config.ratePerHour` | min 1 hr enforced |
| `DIAGNOSTIC` | RM 0 base; call-out billed as `visitFee` | on-site quote appended later |
| `BASE_PLUS_ADDONS` | `basePrice` / a TIER_SELECT | + MULTI_SELECT add-ons + QUANTITY |

**Formula** (from `booking-flows.md` §1.5):
```
serviceTotal = base(pricingType) + Σ question contributions
subtotal     = serviceTotal + visitFee + afterHours + urgent
platformFee  = globalConfig.platformFee   (flat RM 5)
tax          = sstEnabled ? (subtotal + platformFee) × sstRate : 0
total        = subtotal + platformFee + tax − promoDiscount
```

---

## REST API

| Method & path | Auth | Purpose |
|---------------|------|---------|
| `GET /api/categories` | public | 12 categories for the Home grid |
| `GET /api/categories/:slug/services` | public | services in a category |
| `GET /api/services/:slug` | public | detail incl. `questions`, `pricing_type`, `visit_fee` (+ legacy packages/addons) |
| `POST /api/bookings/calculate` | public | dynamic price quote, no side effects |
| `POST /api/bookings/dynamic` | consumer | create booking; snapshots answers + breakdown |
| `GET /api/bookings/:id` | participants | booking incl. `answers` + `price_breakdown` |

`POST /api/bookings/calculate` body / response:
```jsonc
// → { "service_slug": "ac-servicing", "answers": { "units": { "1_5hp": 2, "1hp": 1 }, "mount": "wall" } }
// ← { "subtotal": 307, "visit_fee": 0, "platform_fee": 5, "tax": 0,
//     "surcharges": { "afterHours": 0, "urgent": 0, "total": 0 },
//     "total": 312, "breakdown": [ … line items … ], "config_version": "1.0" }
```

---

## Example calculations (worked examples → engine output)

All are encoded as assertions in the test suite (`npm test`).

| Service | Answers | serviceTotal | total |
|---------|---------|-------------:|------:|
| Women's haircut (`TIERED`) | Long + Cut+Blow-dry | 110 | **115** |
| Switch/outlet (`PER_UNIT`) | 4 switches, +visit 20 | 60 | **85** |
| Deep sanitisation (`PER_UNIT` per-unit) | 2 bathrooms, heavy `(55+20)×2` | 150 | **155** |
| AC servicing (`TIER_QUANTITY`) | 2×1.5HP + 1×1.0HP | 307 | **312** |
| AC chemical (`TIER_QUANTITY` per-unit) | 1×1.5HP overhaul `180+60` | 240 | **245** |
| Interior painting (`PER_SQFT`) | 800sqft, 2-coat, premium `+0.80/sqft` | 2640 | **2645** |
| Wiring (`PER_HOUR`) | 2 hrs ×60, +visit 20 | 120 | **145** |
| AC cooling repair (`DIAGNOSTIC`) | call-out only | 0 | **25** |

> **Known config nuance:** Bridal makeup has `visitFee: 20` (a deposit) in the
> config, so the engine — config being the single source of truth — yields **1365**,
> not the 1345 in the prose example (which excluded the deposit). The test documents
> this explicitly.

---

## How to apply (DB changes — run when ready)

The migration is **additive** (new columns + 2 tables; nothing dropped). Against
the live Railway DB:

```bash
# 1. regenerate the client (stop the dev server first — Windows locks the engine DLL)
npx prisma generate

# 2. apply the migration
npx prisma migrate deploy        # or: npx prisma db push

# 3. seed 12 categories / 71 services / questions / options (idempotent)
npm run db:seed:booking-engine

# 4. run the pricing unit tests (no DB needed)
npm test
```

---

## Folder structure (booking-engine slice)

```
servisaku/
├─ prisma/
│  ├─ schema.prisma                        # + BookingQuestion, QuestionOption, Service/Booking fields
│  ├─ data/servisaku-services-config.json  # vendored master config (seed + engine read this)
│  ├─ bookingEngineSeed.js                 # idempotent upsert seed
│  └─ migrations/20260620120000_dynamic_booking_engine/migration.sql
├─ server/
│  ├─ lib/
│  │  ├─ dynamicPricing.js                 # computePrice() + validateAnswers() — pure
│  │  ├─ bookingEngineConfig.js            # version + globalConfig
│  │  ├─ catalog.js                        # loaders + snake_case mappers + toEngineService()
│  │  └─ __tests__/dynamicPricing.test.js  # node:test fixtures = worked examples
│  └─ routes/
│     ├─ catalog.js                        # GET /categories[...], POST /bookings/calculate
│     └─ bookings.js                       # POST /bookings/dynamic
```

## Phase 2 — Web booking wizard (done)

Fully API-driven, separate from the legacy package `BookingFlow` (nothing existing
changed). Route: **`/book-service/:slug`** ([src/pages/ServiceBooking.jsx](../src/pages/ServiceBooking.jsx)).

| Piece | File |
|-------|------|
| Wizard container (state, live debounced quote, submit) | `src/pages/ServiceBooking.jsx` |
| `QuestionRenderer` (switches UI on `question.type`) | `src/components/booking/QuestionRenderer.jsx` |
| Widgets | `src/components/booking/widgets/{TierSelect,SingleSelect,MultiSelect,QuantitySelector,TierQuantitySelector,AreaInput,HoursInput,Stepper}.jsx` |
| Steps A–F | `src/components/booking/steps/Step{A,B,C,D,E,F}.jsx` |
| Shared (fields, price labels, schedule rules) | `src/components/booking/{fields.jsx,optionPrice.js,scheduleRules.js}` |
| API client methods | `src/api/apiClient.js` → `catalog.{getCategories,getCategoryServices,getService,calculate,createBooking}` |

- **Step A** renders entirely from `service.questions` — adding a service needs no UI code.
- **Live price** = debounced `POST /bookings/calculate` (authoritative; no client/server drift).
- **State**: React Query for fetch + React state for the wizard (the app has no Zustand; the spec's Zustand requirement was for the RN target, which we deferred).

## Phase 3 — Discovery wiring (done)

Full click-path into the engine, live from the API, without disturbing the curated
static Home/Explore surfaces:

```
Home “View All Services” / Explore “Browse full catalogue”
   → /catalog            (GET /categories — 12 cards)        src/pages/Catalog.jsx
   → /catalog/:slug      (GET /categories/:slug/services)     src/pages/CatalogCategory.jsx
   → /book-service/:slug (the Step A–F wizard)
```

Demo mode (no backend) shows a friendly "seed the catalogue" empty state.

The **Home `CategoryGrid`** is also wired to `GET /categories` (12 live cards → `/catalog/:slug`),
reusing the curated hero images where slugs match and icon tiles otherwise; it falls
back to the original 6 static cards if the backend is unavailable.

The **Explore page** (`/explore`) is wired to `GET /services` — it lists all **71 services**
with live category filter chips (from `GET /categories`), search, and list/grid views;
each card links straight to `/book-service/:slug`. Falls back to the static list offline.

## Next phases
- **Admin panel:** CRUD over categories/services/questions/options/pricing (no redeploys).
- **Ops-tunable fees:** move `globalConfig` + surcharges into DB (`PriceRule`) so they're editable without a config bump.
