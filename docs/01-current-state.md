# 01 — Current State Analysis

An honest inventory of the codebase as of 2026-06-11 (commit `4119d97`). This is the
baseline every other document builds on.

## 1. Stack

| Layer | Today | Assessment |
|-------|-------|------------|
| Frontend | Vite + React 18 (JSX), react-router v6, TanStack Query, react-hook-form + zod, Tailwind + Radix/shadcn, lucide icons | **Keep.** Modern, productive, well-organized |
| Design system | Token runtime (`src/lib/design/tokens.js`, `motion.js`, `elevation.js`), token-bound shadcn components, dark mode | **Keep.** Above-average for this stage |
| i18n | EN/BM via `LanguageContext` + `useTranslation.js` (~438-line dictionary), `nameMy`/`descMy` fields throughout catalog data | **Keep**, but dictionary will outgrow a single JS file |
| Backend | Express 5-style app (`server/index.js`), 10 route modules, JWT auth middleware (`server/middleware/auth.js`) | **Keep**, needs hardening (see gap analysis) |
| ORM/DB | Prisma + **SQLite** (`prisma/dev.db`), 9 models | **Migrate to PostgreSQL** (see 03) |
| API client | `servisakuClient.js` proxy: health-check detection → real `apiClient` or localStorage `mockClient` fallback ("demo mode" on Netlify) | Keep short-term; retire mock once API is deployed |
| Deploy | Netlify (static frontend only — backend not deployed, so production runs in demo mode) | Backend deployment is a Phase-0/1 item |
| Tests / CI | `npm run lint`, `npm run typecheck`; no test suite, no CI pipeline | Gap |

## 2. Surfaces (33 routed pages, all lazy-loaded — `src/App.jsx`)

**Consumer:** Home, Explore, ServiceDetail, BookingFlow (575 lines, multi-step),
BookingPage, BookingHistory, BookingDetail, BookingInvoice, PaymentCheckout,
LiveTracking, ChatScreen, ReviewFlow, NotificationCenter, Profile/ConsumerProfile,
OTPLogin, ProfileSetup, Promotions, Help, HowItWorks, ForBusiness.

**Partner:** PartnerDashboard, PartnerJobScreen, PartnerEarnings, PartnerCalendar,
PartnerOnboarding.

**Admin (role-guarded):** AdminDashboard, AdminUsers, AdminBookings, AdminFinance,
AdminOperations, AdminCommunications, AdminQualityCenter, AdminAnalytics.

Role-based guarding works via `ProtectedRoute` with `roles={['admin','super_admin']}`.

## 3. Data model (prisma/schema.prisma — 9 models)

- **User** — single table for consumer/partner/admin via `role` string. Partner fields
  (`partnerVerified`, `partnerRating`, `partnerCategory`, `bankAccount`) live inline.
- **Booking** — flat record: `serviceType` (string), `price` (float), `date`, `timeSlot`,
  address, coupon/discount, consumer/partner FKs. **No line items, no package/addon
  persistence, no service-specific details field, no recurrence.**
- **Coupon** — percentage/fixed, caps, usage limits. Solid basis for promotions.
- **Review** — 1:1 with booking, photos as JSON-in-string.
- **EscrowLedger** — held/released/frozen/refunded with platform fee split. Good design.
- **RefundRequest** — full/partial with admin workflow states.
- **PayoutRecord** — partner payouts (denormalized `partnerName`, no FK).
- **ChatMessage**, **Notification** — straightforward.

> **Key constraint:** Prisma does **not** support the `Json` column type on SQLite.
> Several fields already smuggle JSON in strings (`Review.photos`,
> `Coupon.applicableServices` as CSV). The service-abstraction design (doc 04) needs real
> `Json` columns → another reason PostgreSQL comes first.

## 4. Backend API

`server/index.js` mounts: `/api/auth`, `/api/bookings`, `/api/coupons`, `/api/users`,
`/api/reviews`, `/api/escrow`, `/api/refunds`, `/api/payouts`, `/api/chat`,
`/api/notifications`. Health check at `/api/health`.

- `auth.js` (77 lines): JWT login/register/me.
- `bookings.js` (135 lines) and `coupons.js`, `users.js`: hand-written logic.
- **reviews, escrow, refunds, payouts, chat, notifications are 3-line wrappers around
  `entityRouter.js`** — a generic CRUD factory. It *supports* an `auth` option, but none
  of these six pass it, so all CRUD on these models is **unauthenticated** (P0 — see gap
  analysis). It also does no field validation and no ownership checks.

## 5. The dual-catalog problem (most important structural finding)

Two parallel service-catalog systems exist:

1. **`src/lib/catalog/`** (the "v2" catalog, zod-validated via `schema.js`):
   categories → subcategories → services with `basePrice`, durations, packages
   (`essential`/`signature`/`premium` multipliers), addons, `propertyTypes`,
   `bookingModes` (oneoff/recurring/emergency), `cities`, `partnerSkills`,
   `safetyChecks`. **Covers 3 categories:** cleaning, AC, plumbing. This is the right
   shape — it just lives in hardcoded JS instead of the database.
2. **`src/lib/packageData.js`** (766 lines, legacy): `CATEGORY_PACKAGES` with 36 packages
   + 15 addons across **5 categories** (cleaning, AC, plumbing, electrical, painting),
   fully bilingual, consumed by ServiceDetail/BookingFlow. Includes BHK/area-based
   pricing (commit `2620e33`).
3. **`src/lib/services.js`** — a self-documenting back-compat shim that derives the
   legacy `SERVICES` array from the v2 catalog for migrated categories and hardcodes
   electrical, painting, pest-control. Its own comments say: *"Sprint 2 migrates
   BookingFlow.jsx, ServiceDetail.jsx, Explore.jsx, Home.jsx to import from
   '@/lib/catalog' directly; this shim is removed in Sprint 4."* That migration was
   never finished.

**Net catalog coverage today: 6 categories** (cleaning, AC, plumbing, electrical,
painting, pest control), with pest control existing only as a card (no packages).

## 6. Business-logic engines (src/lib/*.js) — real vs. simulated

| Module | Status |
|--------|--------|
| `bookingEngine.js` (102) | Client-side booking helpers — pricing math runs **in the browser** (trust issue: server must own pricing) |
| `paymentEngine.js` (121) | Simulated — no gateway integration |
| `qualityEngine.js` (122) | Client-side heuristics, no server QA workflow |
| `realtimeService.js` (130) | **Polling**, not push — presence via `PartnerLocation` entity filter on an interval; geolocation capture exists |
| `notificationEngine.js` / `automationWorkflows.js` / `emailTemplates.js` | Templates and in-app records; no SMS/email provider wired |
| `analyticsEngine.js` (196) | Client-computed aggregates over fetched entities |
| `security.js`, `auth.js`, `AuthContext.jsx` | JWT in localStorage; no refresh tokens |

## 7. What's genuinely strong (preserve these)

1. **Page coverage** — consumer/partner/admin surfaces all exist; most roadmap work is
   wiring them to real server logic, not building UI from scratch.
2. **The v2 catalog schema** — `src/lib/catalog/schema.js` is already 80% of the
   service-abstraction data model; it needs to move into Prisma, not be redesigned.
3. **Escrow/refund/payout ledger design** — the money model (gross/fee/payout,
   held/released/frozen) is correct for a marketplace.
4. **i18n discipline** — bilingual fields are pervasive; new catalog tables must carry
   `nameMy` etc. from day one.
5. **Design tokens + shadcn** — visual consistency is cheap to maintain.
6. **`servisakuClient` interface discipline** — mock and real clients share one
   interface, so swapping backends never touches UI code.

## 8. Housekeeping notes

- `scratch/` contains debug scripts (`inspectAuth.js`, `testRegister.js`) — gitignore or remove.
- `dist/` and `index` (file) at repo root look like build artifacts.
- `prisma.config.ts` exists alongside `jsconfig.json` (JS project) — verify it's needed.
- Working tree has uncommitted changes to 8 files + a new hero image; commit before starting Phase 0.
