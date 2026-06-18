import { useCallback } from 'react';
import type { LocalizedText, Locale } from '@/types';
import { useLocaleStore } from '@/stores';

/**
 * Access the active locale plus a `tl()` helper that resolves a `LocalizedText`
 * ({ en, ms }) — used for catalog/content data that lives in mock files rather
 * than the i18next string tables.
 */
export function useLocale() {
  const locale = useLocaleStore((s) => s.locale);

  const tl = useCallback(
    (text: LocalizedText): string => text[locale] ?? text.en,
    [locale],
  );

  return { locale: locale as Locale, tl };
}
