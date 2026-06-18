import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Thin wrapper over expo-secure-store with a web fallback (SecureStore is native
 * only). Used for the auth session today (a mock token) and real tokens later.
 */
const memoryStore = new Map<string, string>();

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return globalThis.localStorage?.getItem(key) ?? null;
      } catch {
        return memoryStore.get(key) ?? null;
      }
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        globalThis.localStorage?.setItem(key, value);
      } catch {
        memoryStore.set(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        globalThis.localStorage?.removeItem(key);
      } catch {
        memoryStore.delete(key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const STORAGE_KEYS = {
  session: 'servisaku.session',
  user: 'servisaku.user',
  locale: 'servisaku.locale',
  theme: 'servisaku.theme',
  onboarded: 'servisaku.onboarded',
} as const;
