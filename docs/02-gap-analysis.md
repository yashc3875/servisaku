# 02 — Gap Analysis: ServisAku vs. Urban Company

Severity scale: **P0** = blocks production launch · **P1** = blocks marketplace
viability · **P2** = blocks parity with Urban Company · **P3** = growth/scale optimizer.

## A. Security & platform integrity

| # | Gap | Today | Required | Severity |
|---|-----|-------|----------|----------|
| A1 | **Unauthenticated entity CRUD** | `entityRouter` mounted without `auth` for reviews, escrow, refunds, payouts, chat, notifications — anyone can `PATCH /api/escrow/:id` or `DELETE /api/reviews/:id` | Every route authenticated; ownership + role checks per model (consumer sees own bookings, partner sees assigned, admin sees all) | **P0** |
| A2 | No server-side input validation | `entityRouter` writes `req.body` minus `readonlyFields` straight to Prisma | zod schemas per endpoint (reuse catalog zod patterns server-side) | **P0** |
| A3 | Client-side pricing | `bookingEngine.js` computes price in browser; booking POST accepts a `price` | Server computes price from catalog + rules; client price is display-only | **P0** |
| A4 | JWT only, in localStorage, no expiry strategy visible | Single token | Short-lived access + refresh token rotation (also a mobile prerequisite) | **P1** |
| A5 | No rate limiting, no helmet, CORS pinned to localhost | Dev-grade Express config | helmet, rate limits on auth/booking endpoints, env-driven CORS | **P1** |
| A6 | No tests, no CI | lint + typecheck scripts only | CI running lint/typecheck/unit/API integration tests | **P1** |

## B. Data & infrastructure

| # | Gap | Today | Required | Severity |
|---|-----|-------|----------|----------|
| B1 | SQLite | Single-file DB; no `Json` type support in Prisma; single-writer | PostgreSQL (managed: Neon/Supabase/RDS) | **P1** (cheap now, expensive later) |
| B2 | Backend not deployed | Netlify serves frontend only → production runs on localStorage mock | API deployed (Railway/Render/Fly/EC2) with managed Postgres | **P1** |
| B3 | No file storage | Review photos are URLs in strings; no upload path | S3-compatible storage + signed uploads (KYC docs, QA photos, chat images) | **P1** |
| B4 | No queue/cron | `automationWorkflows.js` runs client-side | Server-side jobs (offer expiry, payout scheduling, reminders) — node-cron/BullMQ + Redis when needed | **P2** |
| B5 | No observability | console.log | Sentry + structured logs + uptime monitoring | **P2** |

## C. Service catalog & booking engine

| # | Gap | Today | Required | Severity |
|---|-----|-------|----------|----------|
| C1 | **Catalog hardcoded in JS, duplicated across two systems** | `src/lib/catalog/` (3 cats) + `packageData.js` (5 cats) + `services.js` shim | Single DB-driven catalog served by API, admin-editable (doc 04) | **P1** |
| C2 | 6 categories vs UC's ~20 | cleaning, AC, plumbing, electrical, painting, pest(partial) | ~16 categories incl. beauty/wellness verticals (target list below) | **P2** |
| C3 | One booking flow for all services | `BookingFlow.jsx` hardcodes steps | Config-driven workflow steps per category (quote-first for repair, slot-first for beauty, area-first for cleaning) | **P1** |
| C4 | Flat Booking record | No persisted package/addons/line items; `serviceType` is a free string | `BookingItem` line items + `details Json` + FKs into catalog tables | **P1** |
| C5 | One pricing model | Base price × package multiplier (+BHK variant in packageData) | Pricing engine: flat / per-unit (AC count) / area-based / hourly / quote-after-diagnosis; surge multipliers | **P2** |
| C6 | No slot/capacity model | `TIME_SLOTS` constant; no availability check | Real slot inventory from partner availability + service duration | **P1** |

## D. Partner marketplace mechanics

| # | Gap | Today | Required | Severity |
|---|-----|-------|----------|----------|
| D1 | Partner = flags on User | `partnerCategory` single string, `partnerVerified` boolean | `PartnerProfile` + specializations (many services), service areas, working hours | **P1** |
| D2 | No KYC/verification workflow | Admin toggles a boolean | Document upload (IC, certs, insurance) → admin review queue → approval states; UC-style background-check gate | **P1** |
| D3 | No dispatch/matching | Bookings created unassigned; admin assigns manually (AdminOperations) | Auto-dispatch: rank eligible partners (skill, area, rating, proximity, acceptance rate) → expiring `JobOffer` (e.g. 10-min) → cascade to next | **P1** |
| D4 | No partner job lifecycle | Status string on Booking | Offer → accept → en-route → arrived → in-progress (checklist) → completed (QA photos) with timestamps | **P1** |
| D5 | Payout records exist, no automation | Manual rows | Auto-payout job post escrow-release, with statement generation | **P2** |
| D6 | No partner quality score | `partnerRating` float | Composite score (rating, completion, acceptance, rebooking) feeding dispatch rank + tier badges | **P2** |

## E. Payments & money

| # | Gap | Today | Required | Severity |
|---|-----|-------|----------|----------|
| E1 | **No real payment gateway** | `paymentEngine.js` simulates | Billplz or iPay88 (Malaysia FPX + cards + e-wallets): create bill → redirect → **HMAC-verified webhook** → escrow hold | **P1** |
| E2 | No payment records | Escrow created directly | `Payment` model + `WebhookEvent` log (idempotent processing) | **P1** |
| E3 | No wallet/credits | — | Wallet for refunds-as-credit, promo credits, referral rewards | **P3** |
| E4 | Refund workflow not wired to gateway | Status changes only | Gateway refund API call on approval; partial refund math vs escrow | **P2** |

## F. Real-time & communications

| # | Gap | Today | Required | Severity |
|---|-----|-------|----------|----------|
| F1 | Polling everywhere | `realtimeService.js` heartbeat-polls entities; chat polls | Socket.IO on the Express server (rooms per booking) — or SSE as a cheaper first step | **P1** |
| F2 | Live tracking simulated | `LiveTracking.jsx` exists; partner geolocation captured but not streamed | Partner app emits GPS → booking room; throttled persistence | **P2** |
| F3 | No SMS/email/push delivery | Templates exist (`emailTemplates.js`, `notificationTemplates.js`); in-app only | Provider wiring (e.g. SendGrid/Resend email; SMS for OTP; web push, FCM later) behind a notification dispatcher | **P2** |
| F4 | OTP login is mock | `OTPLogin.jsx` UI exists | Real OTP via SMS/WhatsApp provider | **P2** |

## G. Growth & enterprise features (Urban Company parity)

| # | Gap | Today | Required | Severity |
|---|-----|-------|----------|----------|
| G1 | No subscriptions/recurring | `bookingModes` enum includes `recurring` but nothing implements it | Recurring plans (weekly/biweekly/monthly cleaning) with discount, auto-create bookings | **P2** |
| G2 | No membership program | — | UC-Plus-style membership: fee → % off all bookings + priority slots | **P3** |
| G3 | Coupons only | Decent `Coupon` model | Promotions engine: campaigns, first-booking offers, category promos, auto-apply best offer | **P2** |
| G4 | No loyalty/referral | — | Points ledger + referral codes with double-sided rewards | **P3** |
| G5 | No QA workflow server-side | `qualityEngine.js` client heuristics; AdminQualityCenter UI exists | Partner uploads before/after photos → flag anomalies → admin review queue → affects partner score | **P2** |
| G6 | Dispute status exists, no workflow | `disputed` booking status; RefundRequest | Dispute entity: evidence, messages, resolution actions (refund/redo/reject), SLA timers | **P2** |
| G7 | Analytics client-side | `analyticsEngine.js` aggregates in browser | Server aggregation endpoints (GMV, completion rate, partner leaderboards, cohort retention); admin dashboards already exist to display them | **P2** |
| G8 | No service guarantees/warranty tracking | `warrantyDays` field exists in catalog schema, unused | Warranty claims: free revisit within N days, tracked per booking | **P3** |

## H. Mobile readiness

| # | Gap | Today | Required | Severity |
|---|-----|-------|----------|----------|
| H1 | API unversioned, undocumented | `/api/*` | `/api/v1/*` + OpenAPI spec (generate client SDKs for web + RN) | **P2** |
| H2 | Auth not mobile-ready | localStorage JWT | Refresh tokens, device sessions | **P2** |
| H3 | No push notifications | — | FCM/APNs via notification dispatcher (F3) | **P3** |
| H4 | Web-only UI | Responsive web with BottomNav (already mobile-first!) | React Native app later, reusing the same v1 API; PWA as interim (manifest.json already exists) | **P3** |

## Target category list (~16, Malaysia-adapted Urban Company set)

Existing (6): **Home Cleaning** (basic/deep/move-in-out — exists), **AC Services**,
**Plumbing**, **Electrical**, **Painting & Waterproofing**, **Pest Control**.

New (10):
7. **Appliance Repair** — washing machine, fridge, water heater, oven, TV (quote-after-diagnosis flow)
8. **Carpentry & Furniture** — repairs, assembly, custom shelving
9. **Handyman & Home Maintenance** — odd jobs, mounting, door/lock repairs (hourly)
10. **Smart Home & Device Installation** — smart locks, CCTV, doorbells, Wi-Fi mesh
11. **Water Purifier / Filter Services** — install, service, cartridge replacement (big in MY)
12. **Sofa, Carpet & Mattress Cleaning** — split from cleaning for discoverability (per-unit pricing)
13. **Disinfection & Sanitization**
14. **Salon for Women (at home)** — hair, facial, waxing, mani-pedi (time-critical flow, female-partner preference)
15. **Salon for Men / Grooming** — haircut, beard grooming, facial
16. **Spa & Massage at Home** — Swedish/deep-tissue/foot reflexology, *urut tradisional*, post-natal massage (strong MY demand; gender-matched partners)

Each lands as **configuration** (DB rows + workflow config), not code — see doc 04.

## Top 10 by leverage (what to do first)

1. A1+A2 — lock down and validate the API (days, not weeks)
2. B1 — PostgreSQL migration while schema is small
3. C1 — DB-driven catalog, kill the dual-catalog split
4. A3 — server-side pricing engine
5. C3+C4 — workflow-config booking flow + booking line items
6. D1+D2 — partner profiles and verification
7. E1+E2 — real payment gateway with HMAC webhooks
8. D3+D4 — dispatch and job lifecycle
9. F1 — Socket.IO real-time
10. C2 — category expansion (pure config by this point)
