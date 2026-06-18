import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore, useLocaleStore, useUIStore } from '@/stores';

/**
 * Central routing gate. Redirects the user to the correct entry point based on
 * three flags, in order:
 *   1. language not chosen  → /(onboarding)/language
 *   2. walkthrough not seen → /(onboarding)/walkthrough
 *   3. not authenticated    → /(auth)/login
 *   4. otherwise            → /(tabs)
 */
export function useAuthGate() {
  const segments = useSegments();
  const router = useRouter();

  const authStatus = useAuthStore((s) => s.status);
  const hasChosenLanguage = useLocaleStore((s) => s.hasChosen);
  const hasOnboarded = useUIStore((s) => s.hasOnboarded);

  useEffect(() => {
    if (authStatus === 'idle' || authStatus === 'hydrating') return;

    const seg = segments as readonly string[];
    const root = seg[0];
    const inOnboarding = root === '(onboarding)';
    const inAuth = root === '(auth)';
    const isAuthed = authStatus === 'authenticated';

    if (!hasChosenLanguage) {
      if (seg[1] !== 'language') router.replace('/(onboarding)/language');
      return;
    }

    if (!hasOnboarded) {
      // Allow staying within onboarding (language → walkthrough).
      if (!inOnboarding) router.replace('/(onboarding)/walkthrough');
      return;
    }

    if (!isAuthed) {
      if (!inAuth) router.replace('/(auth)/login');
      return;
    }

    // Authenticated & onboarded — push into the app if still on a gate screen.
    if (inAuth || inOnboarding || root === undefined) {
      router.replace('/(tabs)');
    }
  }, [authStatus, hasChosenLanguage, hasOnboarded, segments, router]);
}
