/**
 * Raw color primitives. These are never used directly by components — they are
 * mapped into semantic tokens by `lightTheme` / `darkTheme` in `theme.ts`.
 *
 * Brand identity: a confident Malaysian emerald ("ServisAku green") paired with
 * a warm gold accent, evoking trust + premium local craftsmanship.
 */
export const palette = {
  // Brand — emerald
  emerald50: '#E6F4EF',
  emerald100: '#C2E4D7',
  emerald200: '#8FCDB5',
  emerald300: '#57B393',
  emerald400: '#2C9573',
  emerald500: '#0B6E4F', // primary
  emerald600: '#095B41',
  emerald700: '#074733',
  emerald800: '#053425',
  emerald900: '#032018',

  // Accent — gold
  gold300: '#F6D58A',
  gold400: '#F0C25A',
  gold500: '#E5A800',
  gold600: '#C28F00',

  // Neutrals (warm-tinted gray)
  white: '#FFFFFF',
  gray50: '#F7F8F8',
  gray100: '#EEF0F0',
  gray200: '#E0E3E3',
  gray300: '#C8CDCD',
  gray400: '#A0A7A7',
  gray500: '#727A7A',
  gray600: '#4F5757',
  gray700: '#363D3D',
  gray800: '#222828',
  gray900: '#141818',
  black: '#000000',

  // Status
  success500: '#15924A',
  success100: '#DCF3E4',
  warning500: '#D98A00',
  warning100: '#FBEFD2',
  danger500: '#D23B3B',
  danger100: '#FBE0E0',
  info500: '#2D6FD2',
  info100: '#DCE8FB',
} as const;

export type Palette = typeof palette;
