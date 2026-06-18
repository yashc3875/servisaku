import type {
  AppNotification,
  LoyaltyReward,
  MembershipPlan,
  Promo,
} from '@/types';
import { img } from './images';

export const mockPromos: Promo[] = [
  {
    id: 'promo_welcome',
    code: 'WELCOME15',
    title: { en: '15% off your first booking', ms: '15% diskaun tempahan pertama' },
    description: {
      en: 'New to ServisAku? Enjoy 15% off, up to RM 30.',
      ms: 'Baru di ServisAku? Nikmati 15% diskaun, sehingga RM 30.',
    },
    type: 'percentage',
    value: 15,
    minSpend: 8000,
    maxDiscount: 3000,
    bannerImage: img('promo-welcome', 900, 420),
    expiresAt: '2026-07-31T23:59:00+08:00',
    saved: true,
  },
  {
    id: 'promo_cool',
    code: 'COOL10',
    title: { en: 'RM 10 off air-cond service', ms: 'RM 10 diskaun servis penghawa' },
    description: {
      en: 'Beat the heat — RM 10 off any air-cond servicing.',
      ms: 'Lawan kepanasan — RM 10 diskaun servis penghawa dingin.',
    },
    type: 'fixed',
    value: 1000,
    minSpend: 6000,
    bannerImage: img('promo-cool', 900, 420),
    expiresAt: '2026-06-30T23:59:00+08:00',
    saved: false,
  },
  {
    id: 'promo_cashback',
    code: 'RAYA5',
    title: { en: '5% cashback this Raya', ms: '5% pulangan tunai Raya' },
    description: {
      en: 'Get 5% back to your wallet on cleaning services.',
      ms: 'Dapat 5% pulang ke dompet untuk servis pembersihan.',
    },
    type: 'cashback',
    value: 5,
    minSpend: 10000,
    maxDiscount: 2000,
    bannerImage: img('promo-raya', 900, 420),
    expiresAt: '2026-07-15T23:59:00+08:00',
    saved: false,
  },
];

export const mockNotifications: AppNotification[] = [
  {
    id: 'ntf_1',
    type: 'booking',
    title: 'Your cleaner is on the way',
    body: 'Aisyah is en route and will arrive in about 15 minutes.',
    createdAt: '2026-06-18T13:30:00+08:00',
    read: false,
    route: '/bookings/bk_active',
  },
  {
    id: 'ntf_2',
    type: 'promo',
    title: 'RM 10 off air-cond service 🧊',
    body: 'Use code COOL10 before 30 June. Beat the heat!',
    createdAt: '2026-06-17T09:00:00+08:00',
    read: false,
    route: '/promotions',
  },
  {
    id: 'ntf_3',
    type: 'loyalty',
    title: "You're now Gold tier 🏅",
    body: 'Enjoy priority booking and 2x points on every service.',
    createdAt: '2026-06-12T18:20:00+08:00',
    read: true,
  },
  {
    id: 'ntf_4',
    type: 'payment',
    title: 'Payment successful',
    body: 'RM 132.50 paid for booking SA-2026-00188.',
    createdAt: '2026-06-02T20:06:00+08:00',
    read: true,
    route: '/bookings/bk_completed_1',
  },
];

export const mockLoyaltyRewards: LoyaltyReward[] = [
  { id: 'rwd_5', title: { en: 'RM 5 service voucher', ms: 'Baucar servis RM 5' }, pointsCost: 500 },
  { id: 'rwd_15', title: { en: 'RM 15 service voucher', ms: 'Baucar servis RM 15' }, pointsCost: 1400 },
  { id: 'rwd_clean', title: { en: 'Free 2-hour cleaning', ms: 'Pembersihan 2 jam percuma' }, pointsCost: 3000 },
  { id: 'rwd_plus', title: { en: '1 month ServisAku Plus', ms: '1 bulan ServisAku Plus' }, pointsCost: 2500 },
];

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'plan_plus',
    name: 'ServisAku Plus',
    pricePerMonth: 1990,
    pricePerYear: 19900,
    highlighted: true,
    benefits: [
      { en: 'Up to 10% off every booking', ms: 'Sehingga 10% diskaun setiap tempahan' },
      { en: 'Free rescheduling', ms: 'Penjadualan semula percuma' },
      { en: 'Priority partner matching', ms: 'Pemadanan rakan keutamaan' },
      { en: '2x loyalty points', ms: '2x mata kesetiaan' },
      { en: 'Dedicated support line', ms: 'Talian sokongan khas' },
    ],
  },
];
