import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useUIStore } from '@/stores/uiStore';
import { darkTheme, lightTheme, type Theme } from './theme';

const ThemeContext = createContext<Theme>(lightTheme);

/**
 * Resolves the active theme from the user's preference (`ui.themeMode`) layered
 * over the OS color scheme, and exposes it via `useTheme()`.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const themeMode = useUIStore((s) => s.themeMode);

  const theme = useMemo(() => {
    const resolved =
      themeMode === 'system' ? (systemScheme ?? 'light') : themeMode;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [themeMode, systemScheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

/** Access the active theme. The primary styling hook across the app. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
