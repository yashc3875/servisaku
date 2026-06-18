import type { Service, ServiceListItem } from '@/types';

/** Project a full Service down to the lightweight list-card shape. */
export const toListItem = (s: Service): ServiceListItem => ({
  id: s.id,
  categoryId: s.categoryId,
  slug: s.slug,
  name: s.name,
  shortDescription: s.shortDescription,
  image: s.image,
  rating: s.rating,
  reviewCount: s.reviewCount,
  fromPrice: s.fromPrice,
  tags: s.tags,
});
