import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/theme';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore, useLocaleStore, useUIStore } from '@/stores';
import { syncI18nLocale } from '@/i18n';
import '@/i18n';

/**
 * Hydrates persisted state (auth session, language, theme, onboarding) before
 * the app renders, and keeps i18next in sync with the locale store.
 */
function useBootstrap(): boolean {
  const [ready, setReady] = useState(false);
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      await Promise.all([
        useUIStore.getState().hydrate(),
        useLocaleStore.getState().hydrate(),
        useAuthStore.getState().hydrate(),
      ]);
      if (mounted) setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Re-sync i18next whenever the chosen locale changes.
  useEffect(() => {
    syncI18nLocale(locale);
  }, [locale]);

  return ready;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const ready = useBootstrap();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>{ready ? children : null}</ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
