import type { ID, ISODateString, LocalizedText, MoneySen } from './common';

export type PromoType = 'percentage' | 'fixed' | 'cashback';

export interface Promo {
  id: ID;
  code: string;
  title: LocalizedText;
  description: LocalizedText;
  type: PromoType;
  /** Percentage (0–100) or fixed amount in sen, by `type`. */
  value: number;
  minSpend: MoneySen;
  maxDiscount?: MoneySen;
  bannerImage?: string;
  expiresAt: ISODateString;
  /** Whether already saved to the user's voucher wallet. */
  saved: boolean;
}

export type NotificationType =
  | 'booking'
  | 'promo'
  | 'payment'
  | 'loyalty'
  | 'system';

export interface AppNotification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: ISODateString;
  read: boolean;
  /** Optional deep-link route, e.g. "/bookings/SA-2026-00123". */
  route?: string;
}

export interface LoyaltyReward {
  id: ID;
  title: LocalizedText;
  pointsCost: number;
  image?: string;
}

export interface MembershipPlan {
  id: ID;
  name: string;
  pricePerMonth: MoneySen;
  pricePerYear: MoneySen;
  benefits: LocalizedText[];
  highlighted: boolean;
}
