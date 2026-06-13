# 06 — Phase 0 Security Report

Date: 2026-06-11. Scope: full audit + hardening of the Express API (`server/`).
Verification: `node scripts/phase0-smoke.mjs` — 39 assertions against a live server,
all passing. Run it after any backend change.

## A. Vulnerabilities found and FIXED in this pass

| # | Severity | Vulnerability | Fix |
|---|----------|---------------|-----|
| V1 | **Critical** | `reviews`, `escrow`, `refunds`, `payouts`, `chat`, `notifications` mounted via generic `entityRouter` with **no authentication** — anyone could `PATCH /api/escrow/:id` to release funds, delete reviews, read all chats | `entityRouter.js` deleted; each model got a bespoke router with `authenticate` + per-role ownership scoping (consumer → own records, partner → assigned bookings, admin → all) |
| V2 | **Critical** | `bookings` routes had no auth: any visitor could list **all** bookings (with customer emails + addresses), create bookings as any user, PATCH price/status, or DELETE bookings | Full rewrite: auth required, list scoped by role, `GET /:id` participant-only, DELETE admin-only |
| V3 | **Critical** | Privilege escalation via `POST /auth/register` — `role` taken from request body, so anyone could self-register as `admin` | zod whitelist: `role ∈ {consumer, partner}` |
| V4 | **Critical** | Mass assignment via `PATCH /auth/me` — body spread directly into the user update; a user could set `role: 'admin'`, `partnerVerified: true`, `partnerRating: 5` | zod whitelist of profile fields only; privileged flags now changeable only by admins via `PATCH /api/users/:id` |
| V5 | **Critical** | Client-side pricing trusted: booking POST accepted `price`, `platform_fee`, `partner_payout`, `discount_amount`, and `payment_status: 'paid'` from the browser | `server/lib/pricing.js` recomputes everything from shared catalog data (`src/lib/packageData.js` + `bookingEngine.js`); client amounts are stripped by the schema; `payment_status` is forced to `pending` until a real gateway webhook (Phase 2) |
| V6 | **High** | Coupon abuse: no server-side validation of expiry/usage-cap/min-order; usage count never incremented; coupon writes (create/delete) open to anyone | Server validates all coupon rules at booking time, increments `usageCount` transactionally; coupon CRUD is admin-only |
| V7 | **High** | Refund amounts client-controlled (`refundAmount`, `originalAmount` in body) | Derived from the booking record; partial refunds clamped to booking price; approval admin-only |
| V8 | **High** | `users` routes unauthenticated: full user directory (emails, phone, **bank account numbers**) readable; any user PATCHable (incl. `partner_verified`, `role`) | Auth required; non-admins see only verified partners with bank details masked; PATCH admin-only with zod whitelist |
| V9 | **High** | Chat sender identity from request body (`senderId`, `senderName` spoofable); any user could read any conversation | Sender always derived from JWT; read/post restricted to booking participants |
| V10 | Medium | No input validation anywhere — request bodies written into Prisma as-is | `server/middleware/validate.js` (zod) on every write endpoint |
| V11 | Medium | No rate limiting (credential stuffing), no security headers, CORS hardcoded | `helmet`, global + auth-specific `express-rate-limit`, env-driven `CORS_ORIGIN`, 1 MB JSON body limit |
| V12 | Medium | Server boots with missing `JWT_SECRET` (tokens signed with `undefined`) | Startup check: refuses to boot if secret missing or < 16 chars |
| V13 | Medium | 5xx error messages leaked to clients | Error handler hides internals when `NODE_ENV=production` |
| V14 | Low | Booking state machine not enforced server-side (any status string accepted) | `canTransition()` from `bookingEngine.js` enforced; partners limited to job-progress statuses, consumers to cancel/dispute |

## B. Functional defects found and fixed (real-backend mode was partly broken)

| # | Defect | Fix |
|---|--------|-----|
| F1 | Booking creation 500'd: client sends `payment_method`/`payment_status` but the columns didn't exist | Migration `phase0_payment_fields_partner_location` adds `paymentMethod`/`paymentStatus` |
| F2 | `GET /api/bookings/:id` didn't exist → BookingDetail page broken | Added with participant check |
| F3 | `ApiEntity` path bug: `ChatMessage` → `/api/chatmessages`, `EscrowLedger` → `/api/escrowledgers` etc. — chat/escrow/refunds/payouts all 404'd | Explicit `ENTITY_PATHS` map in `src/api/apiClient.js`; `get()` now uses the shared request helper (was: raw fetch, no error handling, double `/api` prefix) |
| F4 | `PartnerLocation` entity used by `realtimeService.js` had no model, no route, and no apiClient entity | New Prisma model + `/api/partner-locations` router (partner-scoped upsert) + apiClient entity |
| F5 | `ChatMessage` model missing `senderRole`/`fileUrl`/`isRead`/`readAt` that `useChat.js` sends | Migration `phase0_chat_message_fields` |
| F6 | Entity routes returned camelCase while the UI reads snake_case (`platform_fee`, `is_read`, …) | All routers now map to the snake_case contract (mock client parity) |

## C. Known gaps deferred (by design) — tracked in the roadmap

1. **PaymentCheckout is simulated** and references a `Payment` entity with no backend; in
   real mode it fails before charging anything. Real gateway + webhook is Phase 2 (E1).
   Consequence of V5 fix: bookings stay `payment_status: pending` until then.
2. **Client-created notifications** (`POST /api/notifications` can target any user):
   kept because 10 UI call sites notify booking counterparties. It now requires auth and
   validated payloads, but it remains a spam vector between users. Phase 2 moves
   notification creation behind a server-side dispatcher and closes the endpoint.
3. **PartnerOnboarding is broken in both modes** (calls `PartnerAvailability.bulkCreate`
   which exists on neither client; sends profile fields `updateMe` drops). Partner
   domain rebuild is Phase 2 (D1/D2). Partner verification is now admin-only, as intended.
4. **No refresh tokens** — single 7-day JWT in localStorage (A4, Phase 2).
5. **Escrow release is manual (admin)** — auto-release on completion + QA comes with
   the Phase 2 job lifecycle.
6. **Rate limits are in-memory** — fine single-node; move to a shared store when scaled.
7. `scratch/` debug scripts should not ship; add to `.gitignore` (housekeeping).

## D. Behavior changes the team should know about

- Booking creation now **requires** `service_id` + `package_id` (BookingFlow sends them;
  the dead `BookingPage.jsx` flow would 400 — it is unrouted and should be deleted).
- A booking is never created as `paid`; "paid" arrives only via gateway (Phase 2).
- Demo-fallback partners (`ali@demo.com` …) shown when logged out can't be booked
  against the real backend (verified-partner check) — real partner list loads for
  authenticated users.
- Partners can no longer self-verify; an admin flips `partner_verified` in AdminUsers.
- Reviews: one per booking, only by its consumer, only after `completed` — and the
  partner's aggregate `partnerRating` is recomputed on each review.
