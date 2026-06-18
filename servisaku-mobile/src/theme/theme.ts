import { palette } from './palette';
import { radii, spacing, typography, motion, fontWeight } from './tokens';

/**
 * Semantic color tokens. Components reference these (`colors.surface`,
 * `colors.textSecondary`) so that dark mode is a pure token swap.
 */
export interface ThemeColors {
  // Brand
  primary: string;
  primaryMuted: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  onAccent: string;

  // Backgrounds & surfaces
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;
  overlay: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Lines / inputs
  border: string;
  borderStrong: string;
  inputBackground: string;
  inputBorder: string;
  placeholder: string;

  // Status
  success: string;
  successSurface: string;
  warning: string;
  warningSurface: string;
  danger: string;
  dangerSurface: string;
  info: string;
  infoSurface: string;

  // Misc
  star: string;
  skeleton: string;
  skeletonHighlight: string;
}

export interface Shadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

const makeShadows = (color: string) => ({
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } satisfies Shadow,
  sm: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  } satisfies Shadow,
  md: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  } satisfies Shadow,
  lg: {
    shadowColor: color,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  } satisfies Shadow,
});

const lightColors: ThemeColors = {
  primary: palette.emerald500,
  primaryMuted: palette.emerald400,
  primarySoft: palette.emerald50,
  onPrimary: palette.white,
  accent: palette.gold500,
  onAccent: palette.gray900,

  background: palette.gray50,
  surface: palette.white,
  surfaceAlt: palette.gray100,
  surfaceElevated: palette.white,
  overlay: 'rgba(20, 24, 24, 0.45)',

  text: palette.gray900,
  textSecondary: palette.gray600,
  textMuted: palette.gray500,
  textInverse: palette.white,

  border: palette.gray200,
  borderStrong: palette.gray300,
  inputBackground: palette.white,
  inputBorder: palette.gray300,
  placeholder: palette.gray400,

  success: palette.success500,
  successSurface: palette.success100,
  warning: palette.warning500,
  warningSurface: palette.warning100,
  danger: palette.danger500,
  dangerSurface: palette.danger100,
  info: palette.info500,
  infoSurface: palette.info100,

  star: palette.gold500,
  skeleton: palette.gray200,
  skeletonHighlight: palette.gray100,
};

const darkColors: ThemeColors = {
  primary: palette.emerald300,
  primaryMuted: palette.emerald400,
  primarySoft: 'rgba(11, 110, 79, 0.18)',
  onPrimary: palette.gray900,
  accent: palette.gold400,
  onAccent: palette.gray900,

  background: palette.gray900,
  surface: palette.gray800,
  surfaceAlt: palette.gray700,
  surfaceElevated: '#2A3130',
  overlay: 'rgba(0, 0, 0, 0.6)',

  text: palette.gray50,
  textSecondary: palette.gray300,
  textMuted: palette.gray400,
  textInverse: palette.gray900,

  border: palette.gray700,
  borderStrong: palette.gray600,
  inputBackground: palette.gray800,
  inputBorder: palette.gray600,
  placeholder: palette.gray500,

  success: '#3FBF74',
  successSurface: 'rgba(21, 146, 74, 0.2)',
  warning: '#F0B33C',
  warningSurface: 'rgba(217, 138, 0, 0.2)',
  danger: '#E96A6A',
  dangerSurface: 'rgba(210, 59, 59, 0.2)',
  info: '#6FA0E8',
  infoSurface: 'rgba(45, 111, 210, 0.2)',

  star: palette.gold400,
  skeleton: palette.gray700,
  skeletonHighlight: palette.gray600,
};

export interface Theme {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  fontWeight: typeof fontWeight;
  motion: typeof motion;
  shadows: ReturnType<typeof makeShadows>;
}

export const lightTheme: Theme = {
  scheme: 'light',
  colors: lightColors,
  spacing,
  radii,
  typography,
  fontWeight,
  motion,
  shadows: makeShadows(palette.gray900),
};

export const darkTheme: Theme = {
  scheme: 'dark',
  colors: darkColors,
  spacing,
  radii,
  typography,
  fontWeight,
  motion,
  shadows: makeShadows(palette.black),
};
