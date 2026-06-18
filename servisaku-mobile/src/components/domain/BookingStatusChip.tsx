import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BookingStatus } from '@/types';
import { Badge } from '@/components/ui';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const STATUS_TONE: Record<BookingStatus, Tone> = {
  pending: 'warning',
  confirmed: 'info',
  en_route: 'primary',
  arrived: 'primary',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'danger',
};

const STATUS_KEY: Record<BookingStatus, string> = {
  pending: 'booking.statusPending',
  confirmed: 'booking.statusConfirmed',
  en_route: 'booking.statusEnRoute',
  arrived: 'booking.statusArrived',
  in_progress: 'booking.statusInProgress',
  completed: 'booking.statusCompleted',
  cancelled: 'booking.statusCancelled',
};

/** Localized colored chip for a booking's status. */
export function BookingStatusChip({ status }: { status: BookingStatus }) {
  const { t } = useTranslation();
  const isLive = status === 'en_route' || status === 'arrived' || status === 'in_progress';
  return <Badge label={t(STATUS_KEY[status])} tone={STATUS_TONE[status]} dot={isLive} />;
}
