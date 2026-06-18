import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { reviewsApi, type SubmitReviewInput } from '@/services';
import { queryKeys } from './keys';

export const useServiceReviews = (serviceId: string) =>
  useQuery({
    queryKey: queryKeys.serviceReviews(serviceId),
    queryFn: () => reviewsApi.listForService(serviceId),
    enabled: !!serviceId,
  });

export const usePartner = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.partner(id ?? ''),
    queryFn: () => reviewsApi.getPartner(id!),
    enabled: !!id,
  });

export const usePartnersByCategory = (categoryId: string) =>
  useQuery({
    queryKey: queryKeys.partnersByCategory(categoryId),
    queryFn: () => reviewsApi.getPartnersForCategory(categoryId),
    enabled: !!categoryId,
  });

export const useSubmitReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitReviewInput) => reviewsApi.submit(input),
    onSuccess: (review) => {
      qc.invalidateQueries({
        queryKey: queryKeys.serviceReviews(review.serviceId),
      });
      qc.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
};
