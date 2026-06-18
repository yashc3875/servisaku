# ServisAku — Consumer Mobile App

Premium Malaysian on-demand **home-services** marketplace — frontend-only React Native (Expo) app, fully mock-driven and **API-ready**.

> Scope: consumer mobile frontend only. No backend, DB, infra, admin, or partner app. Anything that would run on a server is mocked behind a typed service layer.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | React Native + **Expo (SDK 54)** |
| Language | TypeScript (strict) |
| Navigation | **Expo Router** (file-based) |
| Client state | **Zustand** |
| Server state | **TanStack Query** (against the mock service layer) |
| Forms | React Hook Form + **Zod** |
| Secure storage | expo-secure-store |
| i18n | i18next + react-i18next (**EN + Bahasa Malaysia**) |
| Maps/Location | expo-location, react-native-maps (wired for real integration) |
| Real-time | Mocked Socket.IO-style stream for live tracking |
| Icons | lucide-react-native |
| Animations | react-native-reanimated |

## Getting started

```bash
cd servisaku-mobile
npx expo install      # installs SDK-aligned native deps (preferred over `npm install`)
npx expo start        # press i / a / w for iOS / Android / web
```

> **Install note:** if `npm install` hits an `ERESOLVE` peer conflict (some Expo
> SDK 54 packages cap React at 18 while the app uses React 19), use
> `npm install --legacy-peer-deps` — this is expected for SDK 54.
>
> Reanimated v4 ships its Babel plugin via **`react-native-worklets`** (already a
> dependency); `babel.config.js` is configured with `react-native-worklets/plugin`.

**Verified:** `npx tsc --noEmit` passes clean under strict mode, and
`npx expo export --platform web` bundles all 2,800+ modules successfully.

Demo OTP is **`123456`** (shown on the verification screen). Use a phone number
ending in something other than `12-345 6789` to trigger the new-user profile step.

## Architecture — API-ready by design

Swapping mock data for a real backend changes **one layer only**:

```
src/
  config/env.ts            # USE_MOCKS flag + endpoints (flip to go live)
  types/                   # shared DTOs the mock AND real API both satisfy
  mocks/                   # all mock data (never inline in components)
  services/                # typed service modules — the single swap seam
    apiClient.ts           # inert fetch wrapper used when USE_MOCKS=false
    *.ts                   # catalogApi, authApi, bookingsApi, … (mock today)
  hooks/queries/           # TanStack Query hooks — components consume these
  stores/                  # Zustand: auth, cart, bookingDraft, location, ui, locale
  theme/                   # design tokens + light/dark themes + ThemeProvider
  i18n/                    # EN + BM string tables
  components/ui/           # reusable primitive library
  components/domain/       # ServiceCard, CategoryTile, PromoBanner, …
app/                       # Expo Router routes (see below)
```

- Components never call services directly — they use `hooks/queries/*`.
- Every endpoint seam is tagged with a `// API-INTEGRATION: <METHOD> <path>` comment.
- Flip `config.USE_MOCKS = false` and point `services/*` at `apiClient` — no screen changes.

## Routes implemented

```
/(onboarding)/language        Language picker (EN / BM)
/(onboarding)/walkthrough     3-slide intro carousel
/(auth)/login                 Phone (+60) entry + Zod validation
/(auth)/otp                   6-digit OTP, resend timer, paste support
/(auth)/profile-setup         New-user profile completion
/(tabs)/index                 HOME — location, search, categories, promos, popular, recommended
/(tabs)/bookings              Bookings list (upcoming/active/history/cancelled)
/(tabs)/offers                Promotions & vouchers
/(tabs)/account               Profile, wallet, language + dark-mode toggles, sign out
/category/[slug]              Category service listing
/service/[id]                 Service detail (packages, add-ons, FAQs, reviews) + sticky CTA
/search                       Search with suggestions + live results
/notifications                Notification centre
/booking/new                  Review & confirm checkout (schedule, promo, payment UI)
/booking/[id]                 Booking detail + price breakdown
/booking/track/[id]           Live tracking — animated marker + status timeline (mock stream)
/address/select               Saved-address picker
/membership                   ServisAku Plus subscription (UI only)
```

## Malaysia localization

- **EN + Bahasa Malaysia** with an in-app switcher (Account tab). All UI copy externalized.
- **RM / MYR** everywhere; money stored in sen, formatted via `utils/format.ts`.
- Malaysian addresses (unit/taman/postcode/state), `+60` phone mask, Klang Valley defaults.
- Payment UI for **FPX, DuitNow, Touch 'n Go, GrabPay, Boost, cards** (selection + mock confirm — no real processing).

## Theming & a11y

- Token-based design system (`theme/`) with full **dark mode**.
- Accessible touch targets, screen-reader labels, scalable type.
- Skeleton loaders, empty states, and error states throughout (TanStack Query states).
