# ServisAku — Deployment

Two deployables from the repo root: the **static frontend** and the **API server**.

## 1. Database (PostgreSQL)
Use a managed Postgres (Railway / Neon / Supabase / RDS). Then:
```bash
DATABASE_URL="postgresql://…"  npx prisma migrate deploy
DATABASE_URL="postgresql://…"  npm run db:seed:booking-engine
```

## 2. API server (Express)
Host on Railway / Render / Fly. Set env vars (see `.env.example`):
`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CORS_ORIGIN`.
```bash
npm ci
npx prisma generate
npm run dev:server      # or a process manager / the platform's start command
```
- `CORS_ORIGIN` must list the website origin **and**, for the app, the Capacitor
  origins: `capacitor://localhost, https://localhost, http://localhost`.

## 3. Frontend (static)
Host on Netlify / Vercel / Cloudflare Pages.
```bash
npm ci
npm run build           # → dist/
```
- Build output: `dist/`.
- Proxy `/api/*` to the API server (Netlify `_redirects`/`netlify.toml` already in repo),
  **or** build with `VITE_API_BASE="https://api.servisaku.com"` to call the API directly.

## 4. Mobile app
After the frontend build, package with Capacitor — see `../servisaku-app/README.md`.
Build the web with the **absolute** `VITE_API_BASE` so the native app reaches the API.

## Pre-launch checklist (still open)
- [ ] Payment gateway (Billplz/Stripe) + webhook + escrow on paid
- [ ] Real OTP delivery + refresh-token rotation + password reset
- [ ] Object storage (S3 signed URLs) for photo uploads
- [ ] Partner dispatch (auto JobOffer) + real-time (Socket.IO/push)
- [ ] Admin panel for catalog/pricing
- [ ] CI (lint + typecheck + API tests), error monitoring (Sentry), backups
- [ ] Legal: T&C, privacy, SST/tax config
