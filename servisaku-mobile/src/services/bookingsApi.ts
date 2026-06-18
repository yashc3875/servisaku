import type {
  Booking,
  BookingLineItem,
  PriceBreakdown,
  RecurrenceFrequency,
  TimeSlot,
} from '@/types';
import type { Address } from '@/types';
import { mockBookings } from '@/mocks';
import { computePricing } from '@/utils/pricing';
import { mockResponse, mockId } from './mockUtils';

export interface CreateBookingInput {
  items: BookingLineItem[];
  address: Address;
  scheduledDate: string;
  scheduledSlot: { start: string; end: string };
  recurrence: RecurrenceFrequency;
  paymentMethodId?: string;
  promoCode?: string;
  promoDiscountSen?: number;
  specialInstructions?: string;
}

/** Generate selectable slots for a given date (every 2h, some marked taken). */
function generateSlots(date: string): TimeSlot[] {
  const windows: [string, string][] = [
    ['08:00', '10:00'],
    ['10:00', '12:00'],
    ['12:00', '14:00'],
    ['14:00', '16:00'],
    ['16:00', '18:00'],
    ['18:00', '20:00'],
  ];
  // Deterministically mark a couple unavailable based on the date hash.
  const hash = [...date].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return windows.map(([start, end], i) => ({
    date,
    start,
    end,
    available: (hash + i) % 4 !== 0,
  }));
}

export const bookingsApi = {
  // API-INTEGRATION: GET /bookings
  async list(): Promise<Booking[]> {
    return mockResponse(
      [...mockBookings].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    );
  },

  // API-INTEGRATION: GET /bookings/:id
  async get(id: string): Promise<Booking | null> {
    return mockResponse(mockBookings.find((b) => b.id === id) ?? null);
  },

  // API-INTEGRATION: GET /services/:id/availability?date=
  async getSlots(_serviceId: string, date: string): Promise<TimeSlot[]> {
    return mockResponse(generateSlots(date));
  },

  // API-INTEGRATION: POST /bookings
  async create(input: CreateBookingInput): Promise<Booking> {
    const pricing: PriceBreakdown = computePricing(
      input.items,
      input.promoDiscountSen ?? 0,
    );
    const year = new Date().getFullYear();
    const booking: Booking = {
      id: mockId('bk'),
      reference: `SA-${year}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
      status: 'pending',
      items: input.items,
      address: input.address,
      scheduledDate: input.scheduledDate,
      scheduledSlot: input.scheduledSlot,
      recurrence: input.recurrence,
      pricing,
      paymentMethodId: input.paymentMethodId,
      promoCode: input.promoCode,
      specialInstructions: input.specialInstructions,
      createdAt: new Date().toISOString(),
      reviewed: false,
    };
    return mockResponse(booking);
  },

  // API-INTEGRATION: POST /bookings/:id/cancel { reason }
  async cancel(id: string, _reason?: string): Promise<Booking> {
    const existing = mockBookings.find((b) => b.id === id);
    if (!existing) throw new Error('Booking not found');
    return mockResponse({ ...existing, status: 'cancelled' as const });
  },

  // API-INTEGRATION: PATCH /bookings/:id/reschedule { date, slot }
  async reschedule(
    id: string,
    date: string,
    slot: { start: string; end: string },
  ): Promise<Booking> {
    const existing = mockBookings.find((b) => b.id === id);
    if (!existing) throw new Error('Booking not found');
    return mockResponse({
      ...existing,
      scheduledDate: date,
      scheduledSlot: slot,
    });
  },
};
