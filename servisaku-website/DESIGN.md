# ServisAku — Design Reference (shared web + app)

The app reuses the website's UI, so **one design system serves both**. Tokens are
defined once and consumed via Tailwind utility classes.

## Where the tokens live
- **Color/spacing tokens (CSS variables):** `../src/styles/tokens.css`
- **Tailwind mapping:** `../tailwind.config.js` (maps `--*` vars → `bg-brand`, `text-ink`, …)
- **Global styles:** `../src/index.css`, `../src/App.css`

## Brand
| Token | Value | Usage |
|-------|-------|-------|
| `--brand` | `#f97316` (orange) | primary actions, accents (`bg-brand`, `text-brand`) |
| `--brand-tint` | `#fff7ed` | soft brand backgrounds (`bg-brand-tint`) |
| `--brand-ink` | dark orange | text on brand surfaces |
| `--ink-primary` | deep navy | primary text (`text-ink`) |
| `--ink-secondary/tertiary` | navy grays | secondary text |
| surfaces | `bg-surface`, `bg-raised`, `border-hairline` | cards, dividers |

Dark mode tokens are defined in the same file and switch via the theme provider.

## Component conventions
- Buttons: `../src/components/ui/button.jsx` (variants `primary`, `accent`, `tonal`, `outline`, `ghost`)
- Money: `formatMYR()` in `../src/lib/utils.js`
- Booking widgets / wizard: `../src/components/booking/*`
- Category tiles (Urban-Company style): `../src/components/CategoryTiles.jsx` + `../src/lib/categoryAvatars.js`

## App-specific chrome (native only)
Set in `../servisaku-app/capacitor.config.json`: splash + status-bar use the white
background `#ffffff` with dark status-bar icons; app icon/splash art in
`../servisaku-app/assets/` (regenerate with `npm run assets`). Keep these in sync with
the brand color above.
