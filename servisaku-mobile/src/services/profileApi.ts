import type { Address, PaymentMethod, User } from '@/types';
import { mockAddresses, mockPaymentMethods, mockUser } from '@/mocks';
import { mockResponse, mockId } from './mockUtils';

export const profileApi = {
  // API-INTEGRATION: GET /users/me
  async getProfile(): Promise<User> {
    return mockResponse(mockUser);
  },

  // API-INTEGRATION: PATCH /users/me
  async updateProfile(patch: Partial<User>): Promise<User> {
    return mockResponse({ ...mockUser, ...patch });
  },

  // API-INTEGRATION: GET /users/me/addresses
  async listAddresses(): Promise<Address[]> {
    return mockResponse(mockAddresses);
  },

  // API-INTEGRATION: POST /users/me/addresses
  async createAddress(input: Omit<Address, 'id'>): Promise<Address> {
    return mockResponse({ ...input, id: mockId('addr') });
  },

  // API-INTEGRATION: PATCH /users/me/addresses/:id
  async updateAddress(id: string, patch: Partial<Address>): Promise<Address> {
    const existing = mockAddresses.find((a) => a.id === id) ?? mockAddresses[0]!;
    return mockResponse({ ...existing, ...patch, id });
  },

  // API-INTEGRATION: DELETE /users/me/addresses/:id
  async deleteAddress(_id: string): Promise<void> {
    return mockResponse(undefined);
  },

  // API-INTEGRATION: GET /users/me/payment-methods
  async listPaymentMethods(): Promise<PaymentMethod[]> {
    return mockResponse(mockPaymentMethods);
  },

  // API-INTEGRATION: POST /users/me/payment-methods
  async addPaymentMethod(input: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    return mockResponse({ ...input, id: mockId('pm') });
  },

  // API-INTEGRATION: DELETE /users/me/payment-methods/:id
  async deletePaymentMethod(_id: string): Promise<void> {
    return mockResponse(undefined);
  },
};
