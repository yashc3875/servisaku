import type {
  AppNotification,
  LoyaltyReward,
  MembershipPlan,
  Promo,
} from '@/types';
import {
  mockPromos,
  mockNotifications,
  mockLoyaltyRewards,
  membershipPlans,
} from '@/mocks';
import { mockResponse } from './mockUtils';

export interface ApplyPromoResult {
  valid: boolean;
  promo?: Promo;
  /** Computed discount in sen for the supplied subtotal. */
  discountSen: number;
  message?: string;
}

export const engagementApi = {
  // API-INTEGRATION: GET /promos
  async listPromos(): Promise<Promo[]> {
    return mockResponse(mockPromos);
  },

  // API-INTEGRATION: POST /promos/validate { code, subtotal }
  async applyPromo(code: string, subtotalSen: number): Promise<ApplyPromoResult> {
    const promo = mockPromos.find(
      (p) => p.code.toLowerCase() === code.trim().toLowerCase(),
    );
    if (!promo) {
      return mockResponse({
        valid: false,
        discountSen: 0,
        message: 'Invalid promo code',
      });
    }
    if (subtotalSen < promo.minSpend) {
      return mockResponse({
        valid: false,
        discountSen: 0,
        message: `Minimum spend RM ${(promo.minSpend / 100).toFixed(0)} required`,
      });
    }
    let discount =
      promo.type === 'fixed'
        ? promo.value
        : Math.round((subtotalSen * promo.value) / 100);
    if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    return mockResponse({ valid: true, promo, discountSen: discount });
  },

  // API-INTEGRATION: GET /notifications
  async listNotifications(): Promise<AppNotification[]> {
    return mockResponse(
      [...mockNotifications].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    );
  },

  // API-INTEGRATION: POST /notifications/:id/read
  async markNotificationRead(id: string): Promise<void> {
    const n = mockNotifications.find((x) => x.id === id);
    if (n) n.read = true;
    return mockResponse(undefined);
  },

  // API-INTEGRATION: GET /loyalty/rewards
  async listRewards(): Promise<LoyaltyReward[]> {
    return mockResponse(mockLoyaltyRewards);
  },

  // API-INTEGRATION: GET /membership/plans
  async listMembershipPlans(): Promise<MembershipPlan[]> {
    return mockResponse(membershipPlans);
  },
};
