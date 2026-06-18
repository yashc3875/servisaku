import type { FpxBank, PaymentMethodType } from '@/types';

/** FPX participating banks shown in the bank-selection sheet. */
export const fpxBanks: FpxBank[] = [
  { id: 'maybank', name: 'Maybank2u', logo: 'maybank' },
  { id: 'cimb', name: 'CIMB Clicks', logo: 'cimb' },
  { id: 'pbb', name: 'Public Bank', logo: 'pbb' },
  { id: 'rhb', name: 'RHB Now', logo: 'rhb' },
  { id: 'hlb', name: 'Hong Leong Connect', logo: 'hlb' },
  { id: 'ambank', name: 'AmBank', logo: 'ambank' },
  { id: 'bankislam', name: 'Bank Islam', logo: 'bankislam' },
  { id: 'bsn', name: 'BSN', logo: 'bsn' },
  { id: 'ocbc', name: 'OCBC', logo: 'ocbc' },
  { id: 'uob', name: 'UOB', logo: 'uob' },
];

interface PaymentMethodMeta {
  type: PaymentMethodType;
  label: string;
  subtitle: string;
  /** Emoji stand-in for a brand logo (kept dependency-free for mock UI). */
  glyph: string;
}

/** The full set of Malaysian payment options presented at checkout. */
export const paymentMethodCatalog: PaymentMethodMeta[] = [
  { type: 'fpx', label: 'FPX Online Banking', subtitle: 'Pay from your bank account', glyph: '🏦' },
  { type: 'duitnow', label: 'DuitNow', subtitle: 'Pay via DuitNow QR / transfer', glyph: '🇲🇾' },
  { type: 'tng', label: "Touch 'n Go eWallet", subtitle: 'Instant e-wallet payment', glyph: '💙' },
  { type: 'grabpay', label: 'GrabPay', subtitle: 'Pay with your GrabPay balance', glyph: '🟢' },
  { type: 'boost', label: 'Boost', subtitle: 'Pay with Boost wallet', glyph: '🧡' },
  { type: 'card', label: 'Credit / Debit Card', subtitle: 'Visa, Mastercard', glyph: '💳' },
];
