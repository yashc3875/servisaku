// tailwind.config.js
import animate from 'tailwindcss-animate';

// Note: @tailwindcss/container-queries can be added as a static import once
// installed as a hard dependency. Tailwind's jiti loader does not support
// top-level await, so we cannot do a dynamic optional import here.

const px = (v) => `${v / 16}rem`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', md: '1.5rem', lg: '2rem' },
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1200px', '2xl': '1320px' },
    },
    extend: {
      /* ── Colors (token-bound, dark-mode swappable) ───────────────────── */
      colors: {
        bg:       'hsl(var(--bg) / <alpha-value>)',
        surface:  'hsl(var(--surface) / <alpha-value>)',
        raised:   'hsl(var(--surface-raised) / <alpha-value>)',
        hairline: 'hsl(var(--hairline-rgb) / <alpha-value>)',

        ink: {
          DEFAULT:   'hsl(var(--ink-primary) / <alpha-value>)',
          secondary: 'hsl(var(--ink-secondary) / <alpha-value>)',
          tertiary:  'hsl(var(--ink-tertiary) / <alpha-value>)',
          inverse:   'hsl(var(--ink-inverse) / <alpha-value>)',
        },

        brand: {
          DEFAULT: 'hsl(var(--brand) / <alpha-value>)',
          tint:    'hsl(var(--brand-tint) / <alpha-value>)',
          ink:     'hsl(var(--brand-ink) / <alpha-value>)',
        },

        success: { DEFAULT: 'hsl(var(--success) / <alpha-value>)', tint: 'hsl(var(--success-tint) / <alpha-value>)' },
        warning: { DEFAULT: 'hsl(var(--warning) / <alpha-value>)', tint: 'hsl(var(--warning-tint) / <alpha-value>)' },
        danger:  { DEFAULT: 'hsl(var(--danger)  / <alpha-value>)', tint: 'hsl(var(--danger-tint)  / <alpha-value>)' },
        info:    { DEFAULT: 'hsl(var(--info)    / <alpha-value>)', tint: 'hsl(var(--info-tint)    / <alpha-value>)' },

        /* ── shadcn back-compat (KEEP — old pages depend on these) ───── */
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card:        { DEFAULT: 'hsl(var(--card))',        foreground: 'hsl(var(--card-foreground))' },
        popover:     { DEFAULT: 'hsl(var(--popover))',     foreground: 'hsl(var(--popover-foreground))' },
        primary:     { DEFAULT: 'hsl(var(--primary))',     foreground: 'hsl(var(--primary-foreground))' },
        secondary:   { DEFAULT: 'hsl(var(--secondary))',   foreground: 'hsl(var(--secondary-foreground))' },
        muted:       { DEFAULT: 'hsl(var(--muted))',       foreground: 'hsl(var(--muted-foreground))' },
        /* shadcn 'accent' is dual-purpose: keep DEFAULT/foreground shape AND tint subkey for new code */
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          tint:       'hsl(var(--accent-tint) / <alpha-value>)',
        },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',

        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },

        sidebar: {
          DEFAULT:             'hsl(var(--sidebar-background))',
          foreground:          'hsl(var(--sidebar-foreground))',
          primary:             'hsl(var(--sidebar-primary))',
          'primary-foreground':'hsl(var(--sidebar-primary-foreground))',
          accent:              'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border:              'hsl(var(--sidebar-border))',
          ring:                'hsl(var(--sidebar-ring))',
        },
      },

      borderRadius: {
        none: '0',
        xs:   px(6),
        sm:   'var(--radius-sm)',
        md:   px(14),
        DEFAULT: 'var(--radius)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        '2xl': px(28),
        '3xl': px(32),
        full: 'var(--radius-full)',
      },

      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
      },

      fontFamily: {
        display: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        inter:   ['var(--font-inter)'],
      },

      fontSize: {
        /* legacy scale (preserved) */
        '2xs': ['0.625rem',  { lineHeight: '1rem' }],
        xs:    ['0.75rem',   { lineHeight: '1.125rem' }],
        sm:    ['0.875rem',  { lineHeight: '1.375rem' }],
        base:  ['0.9375rem', { lineHeight: '1.6rem'   }],
        lg:    ['1.0625rem', { lineHeight: '1.625rem' }],
        xl:    ['1.1875rem', { lineHeight: '1.75rem'  }],
        '2xl': ['1.375rem',  { lineHeight: '1.875rem' }],
        '3xl': ['1.625rem',  { lineHeight: '2.125rem' }],
        '4xl': ['2rem',      { lineHeight: '2.5rem'   }],
        /* new semantic scale */
        micro:   ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.06em',  fontWeight: '600' }],
        caption: ['0.8125rem', { lineHeight: '1.125rem' }],
        body:    ['0.9375rem', { lineHeight: '1.45' }],
        lead:    ['1.0625rem', { lineHeight: '1.55' }],
        h3:      ['clamp(1.0625rem, 0.95rem + 0.5vw, 1.25rem)',  { lineHeight: '1.3',  letterSpacing: '-0.005em', fontWeight: '600' }],
        h2:      ['clamp(1.25rem, 1.05rem + 0.9vw, 1.625rem)',   { lineHeight: '1.25', letterSpacing: '-0.01em',  fontWeight: '600' }],
        h1:      ['clamp(1.625rem, 1.35rem + 1.2vw, 2.125rem)',  { lineHeight: '1.2',  letterSpacing: '-0.015em', fontWeight: '600' }],
        display: ['clamp(1.875rem, 1.4rem + 2vw, 2.75rem)',      { lineHeight: '1.1',  letterSpacing: '-0.02em',  fontWeight: '600' }],
      },

      boxShadow: {
        /* legacy aliases */
        xs:    'var(--shadow-xs)',
        sm:    'var(--shadow-sm)',
        md:    'var(--shadow-md)',
        lg:    'var(--shadow-lg)',
        xl:    'var(--shadow-xl)',
        card:  'var(--shadow-card)',
        modal: 'var(--shadow-xl)',
        /* new elevation scale */
        e1:    '0 1px 2px rgba(16,24,40,0.04)',
        e2:    '0 4px 12px -2px rgba(16,24,40,0.06)',
        e3:    '0 12px 28px -8px rgba(16,24,40,0.08)',
        float: '0 24px 48px -16px rgba(16,24,40,0.12)',
        ring:  '0 0 0 4px hsl(var(--brand) / 0.12)',
      },

      transitionTimingFunction: {
        spring:       'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-in':  'cubic-bezier(0.7, 0, 0.84, 0)',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-up':  { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'sheet-in': { from: { transform: 'translateY(100%)' },              to: { transform: 'translateY(0)' } },
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-up':        'fade-up 220ms cubic-bezier(0.16,1,0.3,1) both',
        'sheet-in':       'sheet-in 280ms cubic-bezier(0.16,1,0.3,1) both',
        shimmer:          'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
};
