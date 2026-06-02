// tailwind.config.js
import animate from 'tailwindcss-animate';

const r = (v) => `${v / 16}rem`; // px → rem

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', md: '1.5rem', lg: '2rem' },
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1200px', '2xl': '1320px' },
    },
    extend: {
      colors: {
        // Surface system (token-bound, dark-mode swappable)
        bg:       'hsl(var(--bg) / <alpha-value>)',
        surface:  'hsl(var(--surface) / <alpha-value>)',
        raised:   'hsl(var(--surface-raised) / <alpha-value>)',
        hairline: 'hsl(var(--hairline) / <alpha-value>)',

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
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          tint:    'hsl(var(--accent-tint) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'hsl(var(--success) / <alpha-value>)',
          tint:    'hsl(var(--success-tint) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning) / <alpha-value>)',
          tint:    'hsl(var(--warning-tint) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger) / <alpha-value>)',
          tint:    'hsl(var(--danger-tint) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'hsl(var(--info) / <alpha-value>)',
          tint:    'hsl(var(--info-tint) / <alpha-value>)',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        display: ['"Inter Tight"', 'sans-serif'],
      },
      boxShadow: {
        e1: '0 1px 2px rgba(16,24,40,0.04)',
        e2: '0 4px 12px -2px rgba(16,24,40,0.06)',
        e3: '0 12px 28px -8px rgba(16,24,40,0.08)',
        float: '0 24px 48px -16px rgba(16,24,40,0.12)',
      },
      height: {
        13: '3.25rem', // 52px
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [animate],
};
