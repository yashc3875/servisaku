import type { AuthSession, User } from '@/types';
import { mockUser } from '@/mocks';
import { mockResponse, mockId } from './mockUtils';

/** The OTP every mock login accepts. Surfaced in the UI as a dev hint. */
export const MOCK_OTP = '123456';

export interface RequestOtpResult {
  /** Seconds until the user can resend. */
  resendIn: number;
  /** Echoed back so the UI can pre-fill in dev. Never sent in production. */
  devOtp: string;
}

export const authApi = {
  // API-INTEGRATION: POST /auth/otp/request { phone }
  async requestOtp(phone: string): Promise<RequestOtpResult> {
    if (!/^\+60/.test(phone.replace(/\s/g, ''))) {
      throw new Error('Invalid Malaysian phone number');
    }
    return mockResponse({ resendIn: 30, devOtp: MOCK_OTP });
  },

  // API-INTEGRATION: POST /auth/otp/verify { phone, code }
  async verifyOtp(
    phone: string,
    code: string,
  ): Promise<{ session: AuthSession; user: User; isNewUser: boolean }> {
    if (code !== MOCK_OTP) {
      throw new Error('Incorrect verification code');
    }
    const user: User = { ...mockUser, phone };
    const session: AuthSession = {
      token: mockId('tok'),
      refreshToken: mockId('rtok'),
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    };
    // Treat a never-seen phone as a new user needing profile completion.
    const isNewUser = !phone.includes('12-345');
    return mockResponse({ session, user, isNewUser });
  },

  // API-INTEGRATION: PATCH /users/me { name, email }
  async completeProfile(input: {
    name: string;
    email?: string;
  }): Promise<User> {
    return mockResponse({ ...mockUser, ...input });
  },

  // API-INTEGRATION: POST /auth/logout
  async logout(): Promise<void> {
    return mockResponse(undefined);
  },
};
