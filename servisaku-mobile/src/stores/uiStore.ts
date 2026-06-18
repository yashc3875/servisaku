import { create } from 'zustand';
import { secureStorage, STORAGE_KEYS } from '@/utils/secureStorage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  themeMode: ThemeMode;
  /** Whether the user has finished the first-launch onboarding. */
  hasOnboarded: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setOnboarded: (value: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useUIStore = create<UIState>((set) => ({
  themeMode: 'system',
  hasOnboarded: false,

  setThemeMode: (themeMode) => {
    set({ themeMode });
    void secureStorage.setItem(STORAGE_KEYS.theme, themeMode);
  },

  setOnboarded: (value) => {
    set({ hasOnboarded: value });
    void secureStorage.setItem(STORAGE_KEYS.onboarded, value ? '1' : '0');
  },

  hydrate: async () => {
    const [theme, onboarded] = await Promise.all([
      secureStorage.getItem(STORAGE_KEYS.theme),
      secureStorage.getItem(STORAGE_KEYS.onboarded),
    ]);
    set({
      themeMode: (theme as ThemeMode | null) ?? 'system',
      hasOnboarded: onboarded === '1',
    });
  },
}));
