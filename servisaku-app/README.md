# ServisAku — Mobile App (Android / iOS)

A **[Capacitor](https://capacitorjs.com/)** shell that wraps the ServisAku **web UI**,
so the app and the website are the **same codebase and look identical**. No separate
screens to build or maintain — the app loads the website's production build and runs it
natively, with native status bar, splash screen, and (optionally) push notifications.

```
servisaku-website (React + Vite)  ──build──▶  ../dist  ──copy──▶  www/  ──Capacitor──▶  Android / iOS
```

## Prerequisites
- Node 18+ (already used by the website)
- **Android:** Android Studio + JDK 17
- **iOS:** macOS + Xcode (iOS builds only work on macOS)

## One-time setup
```bash
cd servisaku-app
npm install                 # Capacitor CLI + plugins
npm run build:web           # builds the website (../) and copies dist → www/
npx cap add android         # creates the native android/ project
npx cap add ios             # (macOS only) creates ios/
npm run assets              # generates app icons + splash from assets/icon.png & splash.png
npm run sync
```

## Everyday workflow
```bash
npm run build:web           # rebuild website + copy into www/
npm run sync                # push web + plugins into the native projects
npm run open:android        # open Android Studio  →  Run ▶
npm run open:ios            # open Xcode (macOS)     →  Run ▶
```

## ⚠️ Important: point the app at the live API
The website calls the backend at a **relative** `/api` path, which works in the browser
(Vite/Netlify proxy) but **not** inside the native webview. Build the website with an
absolute API URL so the packaged app can reach your deployed backend:

```bash
# build the website for the app with your production API:
VITE_API_BASE="https://api.servisaku.com" npm --prefix ../ run build
npm run copy:web && npm run sync
```
The web client reads `import.meta.env.VITE_API_BASE` (falls back to `/api` for the website).
Also add the app origins to the backend `CORS_ORIGIN` (`capacitor://localhost`,
`https://localhost`, `http://localhost`).

## App identity
- **App ID:** `com.servisaku.app`  •  **Name:** ServisAku
- Brand color `#f97316`; splash/status bar configured in `capacitor.config.json`
- Icon/splash source art in `assets/` (replace with final artwork, then `npm run assets`)

## What's generated vs committed
`www/`, `android/`, `ios/`, and `node_modules/` are **gitignored** (regenerated from the
website build + `cap add`). Committed: this config, scripts, and `assets/` source art.

## Alternative: PWA
`public/manifest.json` already ships in the website, so it's also installable as a PWA
("Add to Home Screen") with zero extra build — handy for quick testing before app-store
submission.
