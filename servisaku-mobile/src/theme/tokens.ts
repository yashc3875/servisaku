/**
 * Non-color design tokens: spacing, radii, typography scale, shadows, motion.
 * Shared across both light and dark themes.
 */

/** 4pt spacing scale. Use `spacing.md`, not magic numbers. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const radii = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 28,
  pill: 999,
  full: 9999,
} as const;

/** Type scale — size + line height + weight, mapped to a semantic role. */
export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  title: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  callout: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '500' },
} as const;

export type TypographyVariant = keyof typeof typography;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Animation durations (ms) + easing-friendly spring configs. */
export const motion = {
  duration: { instant: 90, fast: 160, base: 240, slow: 360, slower: 520 },
  spring: { damping: 18, stiffness: 180, mass: 0.9 },
  springBouncy: { damping: 12, stiffness: 200, mass: 0.8 },
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;

/** Minimum accessible touch target. */
export const MIN_TOUCH = 44;
