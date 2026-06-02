import { useAuth } from '@/lib/AuthContext';

const DICTIONARY = {
  en: {
    'Popular Services': 'Popular Services',
    'Recent Bookings': 'Recent Bookings',
    'Explore All': 'Explore All',
    'Search': 'Search',
    "Malaysia's Trusted Platform": "Malaysia's Trusted Platform",
    'Professional Home Services, Simplified.': 'Professional Home Services, Simplified.',
    'Verified Pros': 'Verified Pros',
    'Upfront Pricing': 'Upfront Pricing',
    'Guaranteed Quality': 'Guaranteed Quality',
    'Book Now': 'Book Now',
    'Packages': 'Packages',
    'Starting from': 'Starting from',
    'Duration': 'Duration',
  },
  ms: {
    'Popular Services': 'Perkhidmatan Popular',
    'Recent Bookings': 'Tempahan Terkini',
    'Explore All': 'Teroka Semua',
    'Search': 'Cari',
    "Malaysia's Trusted Platform": 'Platform Dipercayai Malaysia',
    'Professional Home Services, Simplified.': 'Perkhidmatan Rumah Profesional, Mudah.',
    'Verified Pros': 'Pakar Bertauliah',
    'Upfront Pricing': 'Harga Telus',
    'Guaranteed Quality': 'Kualiti Terjamin',
    'Book Now': 'Tempah Sekarang',
    'Packages': 'Pakej',
    'Starting from': 'Bermula dari',
    'Duration': 'Tempoh',
  }
};

export function useTranslation() {
  const { user } = useAuth();
  const lang = user?.language === 'ms' ? 'ms' : 'en';

  const t = (key) => {
    return DICTIONARY[lang]?.[key] || key;
  };

  // Helper to extract translated fields from Catalog objects
  // e.g., tField(category, 'name') -> returns category.nameMy if lang is 'ms'
  const tField = (obj, field) => {
    if (!obj) return '';
    if (lang === 'ms' && obj[`${field}My`]) {
      return obj[`${field}My`];
    }
    return obj[field] || '';
  };

  return { t, tField, lang };
}
