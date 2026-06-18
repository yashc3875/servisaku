import { create } from 'zustand';
import type {
  Address,
  PaymentMethod,
  Promo,
  RecurrenceFrequency,
} from '@/types';

/** Steps of the booking wizard, in order. */
export const BOOKING_STEPS = [
  'address',
  'schedule',
  'partner',
  'review',
  'payment',
] as const;
export type BookingStep = (typeof BOOKING_STEPS)[number];

interface BookingDraftState {
  address: Address | null;
  scheduledDate: string | null;
  scheduledSlot: { start: string; end: string } | null;
  recurrence: RecurrenceFrequency;
  /** Optional partner the user pinned; null = auto-assign. */
  partnerId: string | null;
  specialInstructions: string;
  promo: Promo | null;
  promoDiscountSen: number;
  paymentMethod: PaymentMethod | null;

  setAddress: (address: Address) => void;
  setSchedule: (date: string, slot: { start: string; end: string }) => void;
  setRecurrence: (r: RecurrenceFrequency) => void;
  setPartner: (partnerId: string | null) => void;
  setInstructions: (text: string) => void;
  applyPromo: (promo: Promo | null, discountSen: number) => void;
  setPaymentMethod: (pm: PaymentMethod) => void;
  reset: () => void;
}

const initial = {
  address: null,
  scheduledDate: null,
  scheduledSlot: null,
  recurrence: 'once' as RecurrenceFrequency,
  partnerId: null,
  specialInstructions: '',
  promo: null,
  promoDiscountSen: 0,
  paymentMethod: null,
};

/**
 * Drives the multi-step booking flow on the client today; the same shape maps
 * cleanly onto the eventual `POST /bookings` payload.
 */
export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  ...initial,

  setAddress: (address) => set({ address }),
  setSchedule: (scheduledDate, scheduledSlot) =>
    set({ scheduledDate, scheduledSlot }),
  setRecurrence: (recurrence) => set({ recurrence }),
  setPartner: (partnerId) => set({ partnerId }),
  setInstructions: (specialInstructions) => set({ specialInstructions }),
  applyPromo: (promo, promoDiscountSen) => set({ promo, promoDiscountSen }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  reset: () => set(initial),
}));
