import type { Address, PaymentMethod, User } from '@/types';
import { avatar } from './images';

export const mockUser: User = {
  id: 'usr_demo',
  phone: '+60 12-345 6789',
  name: 'Amir Hakim',
  email: 'amir.hakim@example.my',
  avatar: avatar('amir'),
  createdAt: '2025-11-02T08:00:00+08:00',
  loyaltyTier: 'gold',
  loyaltyPoints: 2480,
  isPlusMember: true,
  walletBalanceSen: 4500,
};

export const mockAddresses: Address[] = [
  {
    id: 'addr_home',
    label: 'Home',
    unit: 'Unit 12-3A, Block B',
    line1: 'Residensi Suasana, Jalan Damai',
    area: 'Taman Tun Dr Ismail',
    postcode: '60000',
    city: 'Kuala Lumpur',
    state: 'Kuala Lumpur',
    geo: { latitude: 3.1496, longitude: 101.6304 },
    notes: 'Guardhouse will call upon arrival.',
    isDefault: true,
  },
  {
    id: 'addr_office',
    label: 'Office',
    unit: 'Level 8, Tower A',
    line1: 'Plaza Sentral, Jalan Stesen Sentral 5',
    area: 'KL Sentral',
    postcode: '50470',
    city: 'Kuala Lumpur',
    state: 'Kuala Lumpur',
    geo: { latitude: 3.1336, longitude: 101.686 },
    isDefault: false,
  },
  {
    id: 'addr_parents',
    label: "Parents'",
    line1: 'No. 24, Jalan SS2/24',
    area: 'SS2',
    postcode: '47300',
    city: 'Petaling Jaya',
    state: 'Selangor',
    geo: { latitude: 3.1177, longitude: 101.6213 },
    isDefault: false,
  },
];

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_card',
    type: 'card',
    label: 'Visa',
    detail: '•••• 4291',
    isDefault: true,
  },
  {
    id: 'pm_tng',
    type: 'tng',
    label: "Touch 'n Go eWallet",
    detail: '+60 12-345 6789',
    isDefault: false,
  },
  {
    id: 'pm_fpx',
    type: 'fpx',
    label: 'Maybank2u',
    detail: 'FPX Online Banking',
    bankId: 'maybank',
    isDefault: false,
  },
];
