import type { ID, ISODateString, MoneySen } from './common';

export type PaymentMethodType =
  | 'fpx'
  | 'duitnow'
  | 'tng' // Touch 'n Go eWallet
  | 'grabpay'
  | 'boost'
  | 'card';

export interface FpxBank {
  id: string;
  name: string;
  /** Short code for the bank logo asset. */
  logo: string;
}

export interface PaymentMethod {
  id: ID;
  type: PaymentMethodType;
  label: string;
  /** For cards: last 4 digits. For e-wallets: linked phone/account hint. */
  detail?: string;
  /** Saved FPX bank, if type === 'fpx'. */
  bankId?: string;
  isDefault: boolean;
}

export type PaymentStatus =
  | 'idle'
  | 'processing'
  | 'requires_action' // e.g. 3DS / bank redirect
  | 'success'
  | 'failed';

export interface PaymentIntent {
  id: ID;
  bookingId: ID;
  amount: MoneySen;
  currency: 'MYR';
  method: PaymentMethodType;
  status: PaymentStatus;
  createdAt: ISODateString;
}
