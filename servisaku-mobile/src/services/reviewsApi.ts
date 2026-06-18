import type { Partner, Review } from '@/types';
import {
  mockPartners,
  mockReviews,
  reviewsForService,
  partnersForCategory,
} from '@/mocks';
import { mockResponse, mockId } from './mockUtils';

export interface SubmitReviewInput {
  bookingId: string;
  serviceId: string;
  partnerId: string;
  rating: number;
  comment: string;
  tags: string[];
  photos: string[];
}

export const reviewsApi = {
  // API-INTEGRATION: GET /services/:id/reviews
  async listForService(serviceId: string): Promise<Review[]> {
    return mockResponse(reviewsForService(serviceId));
  },

  // API-INTEGRATION: GET /partners/:id
  async getPartner(id: string): Promise<Partner | null> {
    return mockResponse(mockPartners.find((p) => p.id === id) ?? null);
  },

  // API-INTEGRATION: GET /partners?categoryId=
  async getPartnersForCategory(categoryId: string): Promise<Partner[]> {
    return mockResponse(partnersForCategory(categoryId));
  },

  // API-INTEGRATION: GET /partners/:id/reviews
  async listForPartner(partnerId: string): Promise<Review[]> {
    return mockResponse(mockReviews.filter((r) => r.partnerId === partnerId));
  },

  // API-INTEGRATION: POST /bookings/:id/review
  async submit(input: SubmitReviewInput): Promise<Review> {
    return mockResponse({
      id: mockId('rev'),
      serviceId: input.serviceId,
      partnerId: input.partnerId,
      authorName: 'You',
      rating: input.rating,
      comment: input.comment,
      tags: input.tags,
      photos: input.photos,
      createdAt: new Date().toISOString(),
    });
  },
};
