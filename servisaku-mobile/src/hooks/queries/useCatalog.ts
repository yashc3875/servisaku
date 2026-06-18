import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/services';
import { queryKeys } from './keys';

export const useCategories = () =>
  useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => catalogApi.getCategories(),
  });

export const useCategory = (slug: string) =>
  useQuery({
    queryKey: queryKeys.category(slug),
    queryFn: () => catalogApi.getCategoryBySlug(slug),
    enabled: !!slug,
  });

export const useServicesByCategory = (categoryId: string) =>
  useQuery({
    queryKey: queryKeys.servicesByCategory(categoryId),
    queryFn: () => catalogApi.getServicesByCategory(categoryId),
    enabled: !!categoryId,
  });

export const useService = (id: string) =>
  useQuery({
    queryKey: queryKeys.service(id),
    queryFn: () => catalogApi.getService(id),
    enabled: !!id,
  });

export const usePopularServices = () =>
  useQuery({
    queryKey: queryKeys.popularServices,
    queryFn: () => catalogApi.getPopularServices(),
  });

export const useRecommendedServices = () =>
  useQuery({
    queryKey: queryKeys.recommendedServices,
    queryFn: () => catalogApi.getRecommendedServices(),
  });

export const useSearch = (query: string) =>
  useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => catalogApi.search(query),
    enabled: query.trim().length > 0,
  });
