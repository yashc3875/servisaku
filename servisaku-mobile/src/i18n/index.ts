import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { ms } from './locales/ms';
import { config } from '@/config/env';

/**
 * i18next instance. The active language is owned by `useLocaleStore`; call
 * `syncI18nLocale()` whenever that store changes (done in the root layout) so the
 * whole tree re-renders in the chosen language.
 */
void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ms: { translation: ms },
  },
  lng: config.DEFAULT_LOCALE,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
  compatibilityJSON: 'v4',
});

export function syncI18nLocale(locale: 'en' | 'ms'): void {
  if (i18n.language !== locale) {
    void i18n.changeLanguage(locale);
  }
}

export default i18n;
