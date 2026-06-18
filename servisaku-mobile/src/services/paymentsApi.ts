import type { PaymentIntent, PaymentMethodType } from '@/types';
import { mockResponse, mockId, latency } from './mockUtils';

export interface CreateIntentInput {
  bookingId: string;
  amount: number;
  method: PaymentMethodType;
}

/**
 * Payment is UI-only — no real processing. The "intent" + confirm dance models
 * how a real PSP (FPX redirect / 3DS / e-wallet) would behave so the screens are
 * already wired for it.
 */
export const paymentsApi = {
  // API-INTEGRATION: POST /payments/intents
  async createIntent(input: CreateIntentInput): Promise<PaymentIntent> {
    return mockResponse({
      id: mockId('pi'),
      bookingId: input.bookingId,
      amount: input.amount,
      currency: 'MYR' as const,
      method: input.method,
      status: 'requires_action' as const,
      createdAt: new Date().toISOString(),
    });
  },

  // API-INTEGRATION: POST /payments/intents/:id/confirm
  async confirmIntent(
    intentId: string,
    opts: { simulateFailure?: boolean } = {},
  ): Promise<PaymentIntent> {
    // Simulate bank/3DS round-trip.
    await latency();
    await latency();
    if (opts.simulateFailure) {
      throw new Error('Payment was declined by your bank. Please try again.');
    }
    return mockResponse({
      id: intentId,
      bookingId: '',
      amount: 0,
      currency: 'MYR' as const,
      method: 'card' as const,
      status: 'success' as const,
      createdAt: new Date().toISOString(),
    });
  },
};
