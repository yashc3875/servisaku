# ServisAku — Website (Web App + API)

This is the **source of truth** for the whole product. The website's UI is reused
verbatim by the mobile app (`../servisaku-app`, a Capacitor shell), so building and
styling happens **here once** and both platforms stay identical.

> The actual application code lives at the **repository root** (not duplicated here).
> This folder holds the website's docs, environment template, and design reference.
> See [DEPLOYMENT.md](DEPLOYMENT.md) and [DESIGN.md](DESIGN.md).

## Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite, React Router, React Query, Tailwind (design tokens) |
| Backend | Node + Express, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (bcrypt) |
| Booking engine | Config-driven (12 categories / 71 services) — see `../docs/08-booking-engine.md` |

## Run locally (from the repo root)
```bash
# 1. Postgres must be running; set DATABASE_URL in .env (see .env.example)
npx prisma migrate deploy
npm run db:seed:booking-engine        # 12 categories / 71 services
npm run dev:all                       # web (5173) + API (3001) together
```
- Web: http://localhost:5173  •  API: http://localhost:3001  •  Vite proxies `/api` → 3001
- Tests: `npm test`  •  Lint: `npm run lint`  •  Build: `npm run build` → `dist/`

## Key routes
- `/` Home · `/explore` · `/catalog` → `/catalog/:slug` · `/book-service/:slug` (booking wizard)
- API: `GET /api/categories`, `/api/categories/:slug/services`, `/api/services(/:slug)`,
  `POST /api/bookings/calculate`, `POST /api/bookings/dynamic`

## Relationship to the mobile app
```
servisaku-website (this, at repo root)  ──build──▶ dist/ ──▶ servisaku-app/www ──▶ Android/iOS
```
Because the app wraps this exact build, **any UI change here ships to the app** on the
next `npm run build:web && cap sync` in `../servisaku-app`.

## Production readiness — what's left
See `../docs/08-booking-engine.md` (engine status) and the roadmap in `../docs/05-roadmap.md`.
Top remaining blockers: **payments gateway, real OTP/refresh-token auth, object storage for
uploads, partner dispatch, real-time, deployment + monitoring, admin panel.**
