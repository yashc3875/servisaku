import type { ID, ISODateString } from './common';

export interface Partner {
  id: ID;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  /** Years of experience. */
  experienceYears: number;
  /** Service category ids this partner is verified for. */
  specializations: ID[];
  /** Short skill tags shown on the card. */
  skills: string[];
  verified: boolean;
  /** Languages spoken, e.g. ["en", "ms", "zh"]. */
  languages: string[];
  bio: string;
  /** Recommended/auto-assigned suggestion weight. */
  recommended: boolean;
}

export interface Review {
  id: ID;
  serviceId: ID;
  partnerId: ID;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  tags: string[];
  photos: string[];
  createdAt: ISODateString;
  /** Partner reply, if any. */
  reply?: { text: string; createdAt: ISODateString };
}
