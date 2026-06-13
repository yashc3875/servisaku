# 05 — Phased Roadmap (impact × effort prioritized)

Six phases, each independently shippable, each leaving the platform better than the
last. Durations assume a small team (1–3 devs); treat them as relative sizing.
Gap IDs reference [02-gap-analysis.md](02-gap-analysis.md).

```
Impact ▲
  high │ P0 Harden+PG   P1 Catalog/Workflow   P2 Marketplace core
       │                                      (dispatch+payments+realtime)
  med  │                P3 Category expansion P4 Growth features
  low  │                                      P5 Mobile & scale
       └──────────────────────────────────────────────────────► Effort
         low                 medium                high
```

---

## Phase 0 — Harden & re-platform (≈2 weeks) — *do before anything else*

Closes: A1, A2, A5, B1, B2 (partial), A6 (partial)

1. **Lock down the API (P0 security).** Add `authenticate` to all `entityRouter` mounts
   (reviews, escrow, refunds, payouts, chat, notifications); add ownership/role scoping
   per model (consumer → own records; partner → assigned; admin → all). Restrict
   escrow/payout mutations to admin.
2. **Server-side validation.** `validate.js` middleware with zod schemas per endpoint.
3. **Express hardening.** helmet, rate limiting (auth + booking endpoints), env-driven CORS.
4. **PostgreSQL migration** per doc 03 §4: Neon/Supabase, provider switch, reset
   migrations, reseed. Convert string-JSON fields to `Json`.
5. **Deploy the backend** (Railway/Render/Fly) + Netlify `/api/*` proxy → production
   stops running on the localStorage mock.
6. **CI**: GitHub Actions running lint + typecheck + an initial API integration test
   suite (vitest + supertest) covering auth and the locked-down routes.
7. Housekeeping: gitignore `scratch/`, remove stray build artifacts, commit pending
   working-tree changes first.

**Exit criteria:** no unauthenticated mutation possible; app runs on Postgres in
production with real API; CI green.

---

## Phase 1 — Catalog & booking engine (≈4 weeks)

Closes: C1, C3, C4, A3, C5 (first models), H1

1. **Catalog tables + seed.** New Prisma models (doc 03 §3); seed from
   `src/lib/catalog/` + `packageData.js`. Public read API `GET /api/v1/catalog/*`
   (mounted under `/api/v1`; alias `/api` retained).
2. **Frontend catalog migration.** `useCatalog()` hooks; migrate Home, Explore,
   ServiceDetail, BookingFlow off `services.js`/`packageData.js`; delete both legacy
   files (finishes the migration the shim's comments promised).
3. **Server-side pricing engine.** `POST /api/v1/pricing/quote`; implement `flat`,
   `area_based` (generalize BHK pricing), `per_unit`. Booking creation accepts catalog
   IDs + params only — server prices and writes `BookingItem`s.
4. **Workflow-config wizard.** Step registry extracted from `BookingFlow.jsx`; generic
   `params` step; `workflowConfig` for the 6 existing categories.
5. **Admin catalog CRUD.** New admin section (pages pattern exists): category/service/
   package/addon editors, zod-validated, with workflow template picker.
6. **Slot model v1.** Replace the `TIME_SLOTS` constant with capacity-aware slots
   (city-level capacity until partner availability lands in Phase 2).

**Exit criteria:** the 6 existing categories run end-to-end from DB config; an admin
can edit a price without a deploy; client-sent prices are ignored.

---

## Phase 2 — Marketplace mechanics (≈6 weeks)

Closes: D1–D4, E1, E2, F1, B3, A4

1. **Partner domain.** `PartnerProfile`, skills, service areas, working hours,
   `AvailabilityBlock`; rebuild PartnerOnboarding against it; document upload (S3
   signed URLs) → admin **verification queue** in AdminOperations/AdminQualityCenter.
2. **Dispatch v1.** On payment: rank eligible partners (skill ∩ area ∩ availability,
   ordered by rating/acceptance) → create `JobOffer` with 10-min expiry → notify →
   cascade on decline/expiry (cron job). Partner accept/decline in PartnerDashboard /
   PartnerJobScreen. Manual admin assignment stays as fallback.
3. **Job lifecycle.** Config-driven stages with timestamps; partner advances stages;
   consumer sees them in BookingDetail/LiveTracking.
4. **Payments.** Billplz integration per doc 03 §6: checkout redirect, HMAC-verified
   idempotent webhook, `Payment` + `WebhookEvent` models, escrow hold on `paid`,
   gateway refund call on refund approval.
5. **Real-time.** Socket.IO on the Express server; booking/user/dispatch rooms; rewire
   `useRealtimeBooking`/`useChat`/`realtimeService` internals (interfaces unchanged);
   GPS streaming for LiveTracking.
6. **Auth upgrade.** Refresh-token rotation; real OTP delivery for `OTPLogin.jsx`.

**Exit criteria:** a real ringgit payment books a job that auto-dispatches to a
verified partner who accepts on their phone, with live status to the consumer —
end-to-end without an admin touching it.

---

## Phase 3 — Category expansion (≈4 weeks, mostly config + content)

Closes: C2, C5 (remaining), C6

1. Implement remaining pricing models: `hourly`, `quote` (diagnose → quote → consumer
   approval → execution; appliance-repair flow).
2. Onboard categories 7–16 (gap-analysis list) as **pure configuration**: appliance
   repair, carpentry, handyman, smart home, water purifier, sofa/carpet/mattress,
   disinfection, salon-women, salon-men/grooming, spa & massage. Includes
   `genderMatch` partner preference for beauty/spa verticals.
3. Content: bilingual copy, package definitions, photography, FAQs per category
   (the i18n field discipline already exists — keep it).
4. Slot model v2: per-partner availability drives slots; lead times and emergency
   booking per category config.
5. Partner recruitment tooling: skill application + verification for new categories.

**Exit criteria:** ≥14 active categories; at least one category added entirely through
the admin UI by a non-developer (proves doc 04's abstraction).

---

## Phase 4 — Growth & enterprise features (≈6 weeks)

Closes: G1–G8, E4, F3

Ordered by business impact:

1. **Subscriptions/recurring** (G1): plans on cleaning/AC, discount %, cron-generated
   bookings, pause/skip/cancel; surfaces in Profile + BookingHistory.
2. **Promotions engine** (G3): evolve Coupon → `PromoCampaign` (first-booking,
   category, time-window, auto-apply best); Promotions page already exists.
3. **QA workflow** (G5): before/after photo requirements from `completionRequirements`
   config → `QASubmission` → anomaly flags → AdminQualityCenter review queue → feeds
   partner quality score (D6) → feeds dispatch ranking.
4. **Disputes** (G6): `Dispute` entity with evidence, SLA timers, resolution actions
   wired to refunds/escrow/redo-booking.
5. **Referrals + loyalty** (G4, E3): referral codes with double-sided wallet credits;
   points ledger earning on completed bookings.
6. **Membership** (G2): paid tier → % off + priority slots (UC-Plus analog).
7. **Notification dispatcher** (F3): email + SMS channels live, preferences, day-of
   reminders, win-back automations (replaces client-side `automationWorkflows.js`).
8. **Server-side analytics** (G7): aggregate endpoints (GMV, completion, partner
   leaderboard, cohorts) feeding the existing AdminAnalytics UI; retire client-side
   `analyticsEngine.js` aggregation.
9. **Dynamic pricing v1**: `PriceRule` surge windows (weekends, festive — Raya/CNY) and
   city adjustments, applied by the pricing engine and itemized in quotes.

**Exit criteria:** repeat-purchase loops (subscriptions, promos, loyalty) measurable in
admin analytics; QA gate live on 100% of completed jobs.

---

## Phase 5 — Mobile & scale (ongoing)

Closes: H2–H4, B4, B5, G8

1. OpenAPI spec from zod schemas; generated typed clients.
2. PWA hardening first (installable, offline shell, web push) — cheapest mobile presence.
3. **React Native (Expo) consumer app**, then partner app — thin clients on `/api/v1`;
   FCM push via the notification dispatcher.
4. Scale work when metrics demand: BullMQ + Redis for jobs, Socket.IO Redis adapter,
   read replicas.
5. Observability: Sentry (web + API), structured logs, uptime + p95 dashboards.
6. Warranty claims (G8) and remaining parity polish.

---

## Sequencing rationale

- **Phase 0 before all**: every later phase writes new tables (needs Postgres `Json`)
  and new endpoints (needs the auth/validation pattern). Security holes compound with
  every feature shipped on top.
- **Catalog before marketplace**: dispatch matches on catalog-defined skills; pricing
  engine needs catalog tables; doing partner-domain first would build on the dual-catalog quicksand.
- **Marketplace before expansion**: 16 categories with manual assignment and fake
  payments is a demo; 6 categories with real dispatch and payments is a business.
- **Growth after mechanics**: subscriptions/loyalty amplify a working transaction loop;
  they have nothing to amplify before Phase 2.
- **Mobile last**: the web app is already mobile-first; native apps multiply value only
  once the API is stable, versioned, and feature-complete.

## Standing success metrics (track from Phase 2 onward)

| Metric | Target |
|--------|--------|
| Booking completion rate | >85% |
| Offer acceptance within window | >60% |
| Average rating | >4.3 |
| API p95 | <300ms |
| Payment webhook processing | idempotent, <5s |
| Payout cycle | <24h after escrow release |
