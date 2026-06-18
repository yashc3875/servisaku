/**
 * Service-layer barrel. Components never import from here directly — they go
 * through the TanStack Query hooks in `src/hooks/queries`. This is the single
 * seam where mock data is swapped for the real API (`config.USE_MOCKS`).
 */
export { catalogApi } from './catalogApi';
export { authApi, MOCK_OTP } from './authApi';
export { bookingsApi } from './bookingsApi';
export { profileApi } from './profileApi';
export { paymentsApi } from './paymentsApi';
export { reviewsApi } from './reviewsApi';
export { engagementApi } from './engagementApi';
export { trackingApi } from './trackingApi';
export { apiClient, ApiError } from './apiClient';

export type { CreateBookingInput } from './bookingsApi';
export type { CreateIntentInput } from './paymentsApi';
export type { SubmitReviewInput } from './reviewsApi';
export type { ApplyPromoResult } from './engagementApi';
export type { RequestOtpResult } from './authApi';
export type { TrackingHandle } from './trackingApi';
