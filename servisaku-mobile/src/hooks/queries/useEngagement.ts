import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { engagementApi } from '@/services';
import { queryKeys } from './keys';

export const usePromos = () =>
  useQuery({
    queryKey: queryKeys.promos,
    queryFn: () => engagementApi.listPromos(),
  });

export const useNotifications = () =>
  useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => engagementApi.listNotifications(),
  });

export const useRewards = () =>
  useQuery({
    queryKey: queryKeys.rewards,
    queryFn: () => engagementApi.listRewards(),
  });

export const useMembershipPlans = () =>
  useQuery({
    queryKey: queryKeys.membershipPlans,
    queryFn: () => engagementApi.listMembershipPlans(),
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => engagementApi.markNotificationRead(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
};

export const useApplyPromo = () =>
  useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      engagementApi.applyPromo(code, subtotal),
  });
