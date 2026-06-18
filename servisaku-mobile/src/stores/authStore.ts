import { create } from 'zustand';
import type { AuthSession, User } from '@/types';
import { secureStorage, STORAGE_KEYS } from '@/utils/secureStorage';

interface AuthState {
  session: AuthSession | null;
  user: User | null;
  status: 'idle' | 'hydrating' | 'authenticated' | 'unauthenticated';
  /** Verified-but-not-finalized auth, held while a new user completes profile. */
  pending: { session: AuthSession; user: User } | null;
  setAuth: (session: AuthSession, user: User) => Promise<void>;
  setPending: (session: AuthSession, user: User) => void;
  updateUser: (patch: Partial<User>) => void;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  status: 'idle',
  pending: null,

  setAuth: async (session, user) => {
    set({ session, user, status: 'authenticated', pending: null });
    await Promise.all([
      secureStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session)),
      secureStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user)),
    ]);
  },

  setPending: (session, user) => set({ pending: { session, user } }),

  updateUser: (patch) => {
    const current = get().user;
    if (!current) return;
    const next = { ...current, ...patch };
    set({ user: next });
    void secureStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
  },

  signOut: async () => {
    set({ session: null, user: null, status: 'unauthenticated' });
    await Promise.all([
      secureStorage.removeItem(STORAGE_KEYS.session),
      secureStorage.removeItem(STORAGE_KEYS.user),
    ]);
  },

  hydrate: async () => {
    set({ status: 'hydrating' });
    const [rawSession, rawUser] = await Promise.all([
      secureStorage.getItem(STORAGE_KEYS.session),
      secureStorage.getItem(STORAGE_KEYS.user),
    ]);
    if (rawSession && rawUser) {
      try {
        const session = JSON.parse(rawSession) as AuthSession;
        const user = JSON.parse(rawUser) as User;
        const valid = new Date(session.expiresAt).getTime() > Date.now();
        if (valid) {
          set({ session, user, status: 'authenticated' });
          return;
        }
      } catch {
        // fall through to unauthenticated
      }
    }
    set({ status: 'unauthenticated' });
  },
}));

export const useIsAuthenticated = () =>
  useAuthStore((s) => s.status === 'authenticated');
