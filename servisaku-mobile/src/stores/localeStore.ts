import { create } from 'zustand';
import type { Locale } from '@/types';
import { config } from '@/config/env';
import { secureStorage, STORAGE_KEYS } from '@/utils/secureStorage';

interface LocaleState {
  locale: Locale;
  /** Whether the user has explicitly chosen a language (first-launch gate). */
  hasChosen: boolean;
  setLocale: (locale: Locale) => void;
  hydrate: () => Promise<void>;
}

/**
 * Holds the active UI language. `i18n.ts` subscribes to this store so changing
 * the locale here re-renders the whole tree in the new language.
 */
export const useLocaleStore = create<LocaleState>((set) => ({
  locale: config.DEFAULT_LOCALE,
  hasChosen: false,

  setLocale: (locale) => {
    set({ locale, hasChosen: true });
    void secureStorage.setItem(STORAGE_KEYS.locale, locale);
  },

  hydrate: async () => {
    const saved = await secureStorage.getItem(STORAGE_KEYS.locale);
    if (saved === 'en' || saved === 'ms') {
      set({ locale: saved, hasChosen: true });
    }
  },
}));
