import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Address, PaymentMethod } from '@/types';
import { profileApi } from '@/services';
import { queryKeys } from './keys';

export const useAddresses = () =>
  useQuery({
    queryKey: queryKeys.addresses,
    queryFn: () => profileApi.listAddresses(),
  });

export const usePaymentMethods = () =>
  useQuery({
    queryKey: queryKeys.paymentMethods,
    queryFn: () => profileApi.listPaymentMethods(),
  });

export const useCreateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Address, 'id'>) => profileApi.createAddress(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
};

export const useUpdateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Address> }) =>
      profileApi.updateAddress(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
};

export const useDeleteAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profileApi.deleteAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
};

export const useAddPaymentMethod = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<PaymentMethod, 'id'>) =>
      profileApi.addPaymentMethod(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.paymentMethods }),
  });
};

export const useDeletePaymentMethod = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profileApi.deletePaymentMethod(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.paymentMethods }),
  });
};
