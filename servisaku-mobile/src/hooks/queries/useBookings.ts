import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { bookingsApi, type CreateBookingInput } from '@/services';
import { queryKeys } from './keys';

export const useBookings = () =>
  useQuery({
    queryKey: queryKeys.bookings,
    queryFn: () => bookingsApi.list(),
  });

export const useBooking = (id: string) =>
  useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => bookingsApi.get(id),
    enabled: !!id,
  });

export const useSlots = (serviceId: string, date: string) =>
  useQuery({
    queryKey: queryKeys.slots(serviceId, date),
    queryFn: () => bookingsApi.getSlots(serviceId, date),
    enabled: !!serviceId && !!date,
  });

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.bookings }),
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingsApi.cancel(id, reason),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings });
      qc.invalidateQueries({ queryKey: queryKeys.booking(booking.id) });
    },
  });
};

export const useRescheduleBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      date,
      slot,
    }: {
      id: string;
      date: string;
      slot: { start: string; end: string };
    }) => bookingsApi.reschedule(id, date, slot),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings });
      qc.invalidateQueries({ queryKey: queryKeys.booking(booking.id) });
    },
  });
};
