// src/lib/design/tokens.js
// JS mirror of design tokens. Use only where CSS variables cannot reach
// (Framer Motion boxShadow animations, canvas, charts, JS-driven SVG).
// Do NOT use these in JSX style props if a Tailwind utility exists.

export const color = {
  bg:       'hsl(42 20% 97%)',
  surface:  'hsl(0 0% 100%)',
  raised:   'hsl(40 14% 98%)',
  hairline: 'hsl(220 13% 11% / 0.06)',
  ink: {
    primary:   'hsl(220 13% 11%)',
    secondary: 'hsl(220 9% 46%)',
    tertiary:  'hsl(220 9% 64%)',
    inverse:   'hsl(0 0% 100%)',
  },
  brand:  { DEFAULT: 'hsl(158 53% 20%)', tint: 'hsl(155 24% 93%)', ink: 'hsl(158 53% 14%)' },
  accent: { DEFAULT: 'hsl(29 100% 50%)', tint: 'hsl(32 100% 94%)' },
  success:{ DEFAULT: 'hsl(152 60% 30%)', tint: 'hsl(152 50% 94%)' },
  warning:{ DEFAULT: 'hsl(32 85% 38%)',  tint: 'hsl(38 95% 94%)' },
  danger: { DEFAULT: 'hsl(0 72% 41%)',   tint: 'hsl(0 80% 96%)' },
  info:   { DEFAULT: 'hsl(215 65% 33%)', tint: 'hsl(215 70% 95%)' },
};

export const radius = {
  xs: 6, sm: 10, md: 14, DEFAULT: 20, lg: 24, xl: 28, '2xl': 32, full: 9999,
};

export const shadow = {
  e1:    '0 1px 2px rgba(16,24,40,0.04)',
  e2:    '0 4px 12px -2px rgba(16,24,40,0.06)',
  e3:    '0 12px 28px -8px rgba(16,24,40,0.08)',
  float: '0 24px 48px -16px rgba(16,24,40,0.12)',
};

export const z = {
  base: 0, raised: 10, sticky: 20, dropdown: 30, nav: 40, modal: 50, toast: 60, max: 9999,
};
