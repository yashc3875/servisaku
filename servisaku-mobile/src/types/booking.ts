import type { Address } from './user';
import type { ID, ISODateString, MoneySen } from './common';

/** Booking lifecycle — also the live-tracking state machine. */
export type BookingStatus =
  | 'pending' // created, awaiting confirmation
  | 'confirmed' // partner assigned
  | 'en_route' // partner travelling
  | 'arrived' // partner at location
  | 'in_progress' // service ongoing
  | 'completed'
  | 'cancelled';

export type RecurrenceFrequency = 'once' | 'weekly' | 'biweekly' | 'monthly';

export interface BookingLineItem {
  serviceId: ID;
  serviceName: string;
  packageId: ID;
  packageName: string;
  quantity: number;
  unitPrice: MoneySen;
  addOns: { id: ID; name: string; price: MoneySen; quantity: number }[];
}

export interface PriceBreakdown {
  subtotal: MoneySen;
  serviceFee: MoneySen;
  discount: MoneySen;
  /** SST (Malaysian Sales & Service Tax). */
  tax: MoneySen;
  total: MoneySen;
  currency: 'MYR';
}

export interface TimeSlot {
  /** ISO date, e.g. "2026-06-20". */
  date: string;
  /** "09:00"–"11:00". */
  start: string;
  end: string;
  available: boolean;
}

export interface Booking {
  id: ID;
  reference: string; // e.g. "SA-2026-00123"
  status: BookingStatus;
  items: BookingLineItem[];
  address: Address;
  scheduledDate: string;
  scheduledSlot: { start: string; end: string };
  recurrence: RecurrenceFrequency;
  partnerId?: ID;
  pricing: PriceBreakdown;
  paymentMethodId?: ID;
  promoCode?: string;
  specialInstructions?: string;
  createdAt: ISODateString;
  /** Populated only after completion. */
  completedAt?: ISODateString;
  /** Whether the user has already reviewed this booking. */
  reviewed: boolean;
}

/** Real-time tracking payload (delivered today via the mocked Socket.IO stream). */
export interface TrackingUpdate {
  bookingId: ID;
  status: BookingStatus;
  partnerLocation?: { latitude: number; longitude: number };
  etaMinutes?: number;
  message?: string;
  timestamp: ISODateString;
}
