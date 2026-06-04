# ServisAku — Malaysia Home & Lifestyle Services Platform

A modern home services aggregator for Malaysia, built with React + Vite (frontend) and Express + Prisma (backend).

## 🚀 Getting Started

### Development (frontend only)
```bash
npm install
npm run dev
```

### Development (frontend + backend)
```bash
npm install
npm run dev:all
```

### Database setup
```bash
npm run db:migrate   # run migrations
npm run db:seed      # seed demo data
```

## 🔐 Demo Credentials

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| User    | user@servisaku.my        | user123     |
| Admin   | admin@servisaku.my       | admin123    |
| Partner | ali@servisaku.my         | partner123  |
| Partner | raj@servisaku.my         | partner123  |
| Partner | chong@servisaku.my       | partner123  |
| Partner | siti@servisaku.my        | partner123  |

## 🌐 Netlify Deployment

The app deploys seamlessly to Netlify as a static frontend. When the backend is offline, it automatically switches to a local demo mode using the credentials above.

The `public/_redirects` file ensures React Router works correctly on Netlify.
