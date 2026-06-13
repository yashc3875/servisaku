# 03 — Target Architecture

Design principle: **evolve, don't replace.** Every component below is an extension of
something already in the repo. The stack stays React + Vite (web), Express (API),
Prisma (ORM), with PostgreSQL replacing SQLite and Socket.IO added to the existing
Express server.

## 1. System overview

```
┌────────────────────┐     ┌─────────────────────┐
│  Web app (Vite/    │     │  Mobile (React      │
│  React) — exists   │     │  Native, Phase 5)   │
└─────────┬──────────┘     └──────────┬──────────┘
          │      HTTPS /api/v1 + Socket.IO        
┌─────────▼─────────────────────────────▼─────────┐
│            Express API (server/)                │
│  auth · catalog · bookings · pricing · dispatch │
│  payments+webhooks · partners · qa · disputes   │
│  promotions · subscriptions · admin · analytics │
│  ── middleware: auth, roles, zod validation,    │
│     rate-limit, helmet ──                       │
│  ── Socket.IO (rooms per booking/user) ──       │
│  ── jobs: offer-expiry, recurrence, payouts,    │
│     reminders (node-cron → BullMQ when scaled)  │
└───────┬───────────────┬───────────────┬─────────┘
        │               │               │
   PostgreSQL      S3-compatible   3rd parties:
   (Prisma)        storage         Billplz/iPay88,
                   (KYC/QA/chat)   email, SMS/OTP,
                                   FCM (later)
```

## 2. Backend evolution (server/)

Target structure — grows from the current one, nothing moves unnecessarily:

```
server/
  index.js                 # + helmet, rate-limit, /api/v1 mount, socket bootstrap
  db.js
  middleware/
    auth.js                # exists; add requireOwnership(), refresh tokens
    validate.js            # NEW: zod request validation middleware
  routes/ (v1)
    auth.js                # + refresh, OTP
    catalog.js             # NEW: categories/services/packages/addons (public read)
    bookings.js            # rewrite around BookingItem + workflow state machine
    pricing.js             # NEW: POST /quote — server-side price calculation
    partners.js            # NEW: profiles, documents, availability, areas
    dispatch.js            # NEW: job offers, accept/decline
    payments.js            # NEW: create-bill, webhook (HMAC), refund execution
    subscriptions.js       # NEW
    qa.js                  # NEW: photo submissions, review queue
    disputes.js            # NEW
    promotions.js          # evolves from coupons.js
    admin/                 # NEW: catalog CRUD, verification queue, analytics aggregates
    ... (reviews, escrow, refunds, payouts, chat, notifications — now authed)
  services/                # NEW: business logic out of route handlers
    pricingEngine.js       # moves from src/lib/bookingEngine.js, becomes authoritative
    dispatchService.js
    workflowEngine.js      # interprets ServiceWorkflowConfig (doc 04)
    notificationDispatcher.js  # fan-out: in-app + email + SMS + (later) push
    payoutService.js
  jobs/                    # NEW: cron-driven (offer expiry, recurrence, payouts)
  sockets/                 # NEW: Socket.IO event handlers
```

Rules:
- **Every** route behind `authenticate` except: catalog reads, auth endpoints, payment
  webhook (HMAC-verified instead), health.
- `entityRouter` survives only for admin-scoped internal CRUD, always with
  `auth + requireRole('admin','super_admin')`.
- Pricing is computed **only** server-side; booking creation takes catalog IDs +
  parameters, never a price.

## 3. Data model evolution (Prisma)

New models (≈18) grouped by domain. Existing 9 models are kept and extended.

### Catalog (replaces src/lib/catalog/*.js + packageData.js as source of truth)

```prisma
model ServiceCategory {
  id            String  @id @default(cuid())
  slug          String  @unique
  name          String
  nameMy        String
  tagline       String?
  taglineMy     String?
  iconKey       String
  accent        String
  heroImage     String?
  sortOrder     Int      @default(0)
  isActive      Boolean  @default(true)
  emergencySupported Boolean @default(false)
  recurringSupported Boolean @default(false)
  workflowConfig Json?   // doc 04 — booking step + lifecycle definition
  subcategories Subcategory[]
  services      Service[]
}

model Service {
  id            String  @id @default(cuid())
  slug          String  @unique
  categoryId    String
  subcategoryId String?
  name          String
  nameMy        String
  description   String
  descriptionMy String
  basePrice     Float
  pricingModel  String   // flat | per_unit | area_based | hourly | quote
  pricingConfig Json?    // model-specific params (unit label, BHK table, hourly rate…)
  durationMin   Int
  durationMax   Int
  image         String?
  isActive      Boolean  @default(true)
  category      ServiceCategory @relation(...)
  packages      ServicePackage[]
  addons        ServiceAddon[]
  // propertyTypes, bookingModes, cities, partnerSkills, safetyChecks → Json columns
  attributes    Json?
}

model ServicePackage { id, serviceId, tier, name, nameMy, multiplier, inclusions Json, exclusions Json?, warrantyDays Int? }
model ServiceAddon   { id, serviceId, name, nameMy, price, durationMin }
model PriceRule      { id, scope, scopeId, type /* surge|city_adjust|promo_window */, config Json, isActive, validFrom, validUntil }
```

The existing zod schemas in `src/lib/catalog/schema.js` become the **validation layer for
admin catalog writes** — same shapes, now enforced server-side. The existing JS catalog
files become the **seed script** content (`prisma/seed.js`).

### Partner domain

```prisma
model PartnerProfile {
  id        String @id @default(cuid())
  userId    String @unique          // 1:1 with existing User
  status    String @default("pending") // pending|docs_submitted|under_review|approved|suspended|rejected
  bio, experienceYears, languages Json?
  qualityScore Float?               // composite (D6)
  acceptanceRate, completionRate, avgRating Float?
  serviceAreas Json                 // city/zone list
  workingHours Json                 // weekly template
  user      User @relation(...)
  skills    PartnerSkill[]
  documents PartnerDocument[]
}
model PartnerSkill    { partnerId, categoryId, serviceId?, verifiedAt? }
model PartnerDocument { partnerId, type /* ic|cert|insurance|photo */, fileUrl, status, reviewedBy?, reviewNote? }
model AvailabilityBlock { partnerId, date, startTime, endTime, type /* available|blocked|booked */ }
```

### Booking evolution

`Booking` keeps its shape (so existing pages keep working) and gains:

```prisma
// added to Booking:
categoryId String?
details        Json?    // service-specific answers from the workflow (BHK, unit count, pet info…)
scheduledStart DateTime?
scheduledEnd   DateTime?
subscriptionId String?
lifecycle      Json?    // timestamped state transitions
items          BookingItem[]
offers         JobOffer[]

model BookingItem { id, bookingId, kind /* package|addon|fee|discount */, refId?, label, qty, unitPrice, total }
model JobOffer    { id, bookingId, partnerId, status /* offered|accepted|declined|expired */, rank, expiresAt, respondedAt? }
```

### Money

```prisma
model Payment { id, bookingId, gateway /* billplz|ipay88 */, gatewayRef, amount, currency, status /* initiated|paid|failed|refunded|partial */, method?, paidAt? }
model WebhookEvent { id, gateway, eventId @unique /* idempotency */, payload Json, processedAt?, error? }
model Wallet { id, userId @unique, balance } + WalletEntry { walletId, amount, reason, refType, refId }
```

`EscrowLedger`, `RefundRequest`, `PayoutRecord` stay; `Payment.status=paid` becomes the
trigger that creates the escrow hold; refund approval calls the gateway.

### Growth

```prisma
model SubscriptionPlan { id, serviceId, frequency /* weekly|biweekly|monthly */, discountPct, isActive }
model Subscription     { id, consumerId, planId, addressJson, nextRunAt, status, pausedUntil? }
model Membership       { id, userId, tier, startsAt, endsAt, autoRenew }
model PromoCampaign    { id, name, type, rules Json, budget?, startsAt, endsAt }   // coupons become one campaign type
model ReferralCode     { id, userId, code @unique } + Referral { codeId, refereeId, rewardStatus }
model PointsEntry      { id, userId, points, reason, refId?, expiresAt? }
model QASubmission     { id, bookingId, partnerId, photos Json, checklist Json?, status /* pending|approved|flagged|rejected */, reviewerId?, note? }
model Dispute          { id, bookingId, raisedById, category, description, evidence Json?, status, resolution?, resolvedById?, slaDueAt }
```

## 4. SQLite → PostgreSQL migration path (do it in Phase 0)

**Why now:** schema is 9 small models; production data doesn't exist yet (Netlify runs
demo mode); and the whole catalog/workflow design above requires `Json` columns, which
Prisma doesn't support on SQLite. Waiting makes this strictly harder.

Recommended path — **reset migrations, reseed** (no data migration needed):

1. Provision Postgres: **Neon or Supabase free tier** for dev/staging (zero-ops,
   branching), managed Postgres (same provider or RDS) for production later.
2. `prisma/schema.prisma`: `provider = "postgresql"`; set `DATABASE_URL` per env
   (`.env`, Netlify/host env vars).
3. Delete `prisma/migrations/` (they're SQLite-dialect) and `dev.db`; run
   `npx prisma migrate dev --name init_postgres`.
4. Port `prisma/seed.js` to also seed the new catalog tables from the existing
   `src/lib/catalog/` + `packageData.js` content (this *is* the catalog unification step).
5. Convert the JSON-in-string fields to real `Json` while you're at it
   (`Review.photos`, `Coupon.applicableServices` → `Json`).
6. Keep a `docker-compose.yml` with Postgres 16 for offline local dev (optional —
   Neon branch DBs may be enough).

If real user data existed, the alternative is `pgloader`/script-based copy — note it in
case the demo DB ever matters, but **plan A is reseed**.

## 5. Real-time architecture

Add **Socket.IO to the existing Express server** (same process, same port — no new
service). Single-node is fine until horizontal scaling, at which point add the Redis
adapter (this is the only point Redis becomes necessary).

- Auth: JWT handshake middleware reusing `server/middleware/auth.js` logic.
- Rooms: `booking:{id}` (consumer + partner + admins), `user:{id}` (notifications),
  `dispatch:{partnerId}` (job offers).
- Events: `booking.status`, `offer.new`/`offer.expired`, `chat.message`,
  `partner.location` (throttled, persisted at low frequency), `notification.new`.
- Client: replace polling internals of `realtimeService.js` / `useRealtimeBooking.js` /
  `useChat.js` with a socket singleton — **hook interfaces stay the same**, pages don't change.
- Fallback: keep polling as a degraded mode (the codebase already has the
  detection pattern via `servisakuClient`).

## 6. Payments (Malaysia)

**Recommendation: Billplz first** (simpler API, FPX + cards + e-wallets, fast
onboarding), iPay88 later if enterprise features demand it. Flow:

1. `POST /api/v1/payments/checkout` → server computes authoritative amount → creates
   Billplz bill → returns redirect URL.
2. User pays → Billplz redirects back + fires webhook.
3. `POST /api/v1/payments/webhook`: verify **X-Signature HMAC**, dedupe via
   `WebhookEvent.eventId`, mark `Payment=paid`, create `EscrowLedger` hold, emit socket
   event, send notifications. Redirect handler only *reads* status (never trusts query params).
4. Refund approval (existing `RefundRequest` flow) calls gateway refund API and updates
   escrow.

`PaymentCheckout.jsx` already exists — it swaps its simulated confirm step for the
redirect flow.

## 7. Notifications

One server-side `notificationDispatcher(userId, template, data, channels)`:
in-app (existing `Notification` model) + email (Resend/SendGrid — templates already in
`src/lib/emailTemplates.js`, move server-side) + SMS/WhatsApp for OTP and day-of
reminders + FCM push when mobile ships. User channel preferences on profile.

## 8. Mobile readiness (prepare now, build later)

1. Mount routes at `/api/v1` (keep `/api` aliased during transition).
2. OpenAPI spec (zod-to-openapi from the validation schemas) → typed clients for web
   and future RN app.
3. Refresh-token auth (A4) — mobile sessions are long-lived.
4. Keep **all** business rules server-side (pricing, slots, dispatch) so RN app is a
   thin client like the web app.
5. Interim: the web app is already mobile-first (BottomNav, manifest.json) — harden it
   as an installable PWA for early mobile presence at near-zero cost.
6. When RN starts: Expo + the same TanStack Query patterns; share the API client layer
   conceptually (the `servisakuClient` interface discipline pays off here).

## 9. Deployment topology

| Stage | Frontend | API | DB |
|-------|----------|-----|----|
| Today | Netlify (demo mode) | localhost only | SQLite file |
| Phase 0–1 | Netlify (unchanged) | Railway/Render/Fly (one Node service: Express + Socket.IO + cron) | Neon/Supabase Postgres |
| Scale trigger | CDN unchanged | Split jobs into worker + Redis/BullMQ; Socket.IO Redis adapter; then containers if needed | Managed PG with replicas |

Netlify proxy: add `/api/*` redirect to the API host in `netlify.toml` so the existing
same-origin `fetch('/api/…')` code and backend-detection logic keep working unchanged.
