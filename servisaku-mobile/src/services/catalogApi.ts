import type { Service, ServiceCategory, ServiceListItem } from '@/types';
import {
  mockCategories,
  mockServices,
  findServiceById,
  servicesByCategory,
} from '@/mocks';
import { mockResponse } from './mockUtils';
import { toListItem } from './transformers';

/**
 * Catalog service. Every function carries the exact signature the real REST API
 * will expose, marked with `// API-INTEGRATION:` so backend wiring is mechanical.
 */
export const catalogApi = {
  // API-INTEGRATION: GET /categories
  async getCategories(): Promise<ServiceCategory[]> {
    return mockResponse([...mockCategories].sort((a, b) => a.order - b.order));
  },

  // API-INTEGRATION: GET /categories/:slug
  async getCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
    return mockResponse(mockCategories.find((c) => c.slug === slug) ?? null);
  },

  // API-INTEGRATION: GET /services?categoryId=
  async getServicesByCategory(categoryId: string): Promise<ServiceListItem[]> {
    return mockResponse(servicesByCategory(categoryId).map(toListItem));
  },

  // API-INTEGRATION: GET /services/:id
  async getService(id: string): Promise<Service | null> {
    return mockResponse(findServiceById(id) ?? null);
  },

  // API-INTEGRATION: GET /services/popular
  async getPopularServices(): Promise<ServiceListItem[]> {
    const popular = [...mockServices]
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 6);
    return mockResponse(popular.map(toListItem));
  },

  // API-INTEGRATION: GET /services/recommended
  async getRecommendedServices(): Promise<ServiceListItem[]> {
    const recommended = [...mockServices]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
    return mockResponse(recommended.map(toListItem));
  },

  // API-INTEGRATION: GET /search?q=
  async search(query: string): Promise<ServiceListItem[]> {
    const q = query.trim().toLowerCase();
    if (!q) return mockResponse([]);
    const matches = mockServices.filter(
      (s) =>
        s.name.en.toLowerCase().includes(q) ||
        s.name.ms.toLowerCase().includes(q) ||
        s.shortDescription.en.toLowerCase().includes(q),
    );
    return mockResponse(matches.map(toListItem));
  },
};
