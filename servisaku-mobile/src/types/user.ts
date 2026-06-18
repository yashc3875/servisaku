import type { GeoPoint, ID, ISODateString, MalaysianState } from './common';

export interface Address {
  id: ID;
  /** User-facing label: "Home", "Office", or custom. */
  label: string;
  /** Unit / floor / building, e.g. "Unit 12-3A, Block B". */
  unit?: string;
  line1: string;
  /** Taman / area / neighbourhood. */
  area: string;
  postcode: string;
  city: string;
  state: MalaysianState;
  geo: GeoPoint;
  notes?: string;
  isDefault: boolean;
}

export type LoyaltyTier = 'silver' | 'gold' | 'platinum';

export interface User {
  id: ID;
  phone: string; // +60 format
  name: string;
  email?: string;
  avatar?: string;
  createdAt: ISODateString;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  /** Whether the user has an active ServisAku Plus membership. */
  isPlusMember: boolean;
  walletBalanceSen: number;
}

/** Minimal session token bundle persisted in secure storage. */
export interface AuthSession {
  token: string;
  refreshToken: string;
  userId: ID;
  expiresAt: ISODateString;
}
