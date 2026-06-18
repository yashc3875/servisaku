/** Centralized, type-safe TanStack Query keys for consistent caching/invalidation. */
export const queryKeys = {
  categories: ['categories'] as const,
  category: (slug: string) => ['categories', slug] as const,
  servicesByCategory: (categoryId: string) =>
    ['services', 'category', categoryId] as const,
  service: (id: string) => ['services', id] as const,
  popularServices: ['services', 'popular'] as const,
  recommendedServices: ['services', 'recommended'] as const,
  search: (q: string) => ['search', q] as const,

  bookings: ['bookings'] as const,
  booking: (id: string) => ['bookings', id] as const,
  slots: (serviceId: string, date: string) =>
    ['slots', serviceId, date] as const,

  profile: ['profile'] as const,
  addresses: ['addresses'] as const,
  paymentMethods: ['paymentMethods'] as const,

  serviceReviews: (serviceId: string) => ['reviews', 'service', serviceId] as const,
  partner: (id: string) => ['partners', id] as const,
  partnersByCategory: (categoryId: string) =>
    ['partners', 'category', categoryId] as const,

  promos: ['promos'] as const,
  notifications: ['notifications'] as const,
  rewards: ['rewards'] as const,
  membershipPlans: ['membershipPlans'] as const,
} as const;
