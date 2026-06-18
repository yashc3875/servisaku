import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CalendarX2, ChevronRight, MapPin } from 'lucide-react-native';
import type { Booking, BookingStatus } from '@/types';
import { useTheme } from '@/theme';
import { useBookings } from '@/hooks/queries';
import { formatDate, formatRM } from '@/utils';
import { BookingStatusChip } from '@/components/domain';
import {
  EmptyState,
  SegmentedControl,
  Skeleton,
  Surface,
  Text,
  type SegmentOption,
} from '@/components/ui';

type Filter = 'upcoming' | 'active' | 'history' | 'cancelled';

const ACTIVE: BookingStatus[] = ['en_route', 'arrived', 'in_progress'];

export default function BookingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { data, isPending } = useBookings();
  const [filter, setFilter] = useState<Filter>('upcoming');

  const grouped = useMemo(() => {
    const all = data ?? [];
    return {
      upcoming: all.filter((b) => b.status === 'pending' || b.status === 'confirmed'),
      active: all.filter((b) => ACTIVE.includes(b.status)),
      history: all.filter((b) => b.status === 'completed'),
      cancelled: all.filter((b) => b.status === 'cancelled'),
    };
  }, [data]);

  const options: SegmentOption[] = [
    { value: 'upcoming', label: t('booking.upcoming'), count: grouped.upcoming.length },
    { value: 'active', label: t('booking.active'), count: grouped.active.length },
    { value: 'history', label: t('booking.history') },
    { value: 'cancelled', label: t('booking.cancelled') },
  ];

  const list = grouped[filter];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h1" weight="700">
          {t('tabs.bookings')}
        </Text>
      </View>
      <View style={styles.segment}>
        <SegmentedControl options={options} value={filter} onChange={(v) => setFilter(v as Filter)} />
      </View>

      {isPending ? (
        <View style={styles.padded}>
          <Skeleton height={120} radius={14} style={{ marginBottom: 12 }} />
          <Skeleton height={120} radius={14} />
        </View>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 size={40} color={theme.colors.primary} />}
          title={t('booking.empty')}
          body={t('booking.emptyBody')}
          actionLabel={t('service.bookNow')}
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => <BookingCard booking={item} onPress={() => router.push({ pathname: '/booking/[id]', params: { id: item.id } })} />}
        />
      )}
    </SafeAreaView>
  );
}

function BookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable onPress={onPress}>
      <Surface elevation="sm" radius="lg" padded>
        <View style={styles.cardTop}>
          <Text variant="caption" color="textMuted">
            {booking.reference}
          </Text>
          <BookingStatusChip status={booking.status} />
        </View>
        <Text variant="title" weight="700" style={{ marginTop: 8 }} numberOfLines={1}>
          {booking.items[0]?.serviceName}
        </Text>
        <Text variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
          {formatDate(booking.scheduledDate)} · {booking.scheduledSlot.start}–{booking.scheduledSlot.end}
        </Text>
        <View style={styles.locRow}>
          <MapPin size={14} color={theme.colors.textMuted} />
          <Text variant="caption" color="textMuted" numberOfLines={1} style={{ marginLeft: 4, flex: 1 }}>
            {booking.address.label} · {booking.address.area}
          </Text>
        </View>
        <View style={[styles.cardFoot, { borderTopColor: theme.colors.border }]}>
          <Text variant="bodyStrong" weight="700">
            {formatRM(booking.pricing.total)}
          </Text>
          <View style={styles.viewRow}>
            <Text variant="caption" weight="600" style={{ color: theme.colors.primary }}>
              {t('home.viewBooking')}
            </Text>
            <ChevronRight size={16} color={theme.colors.primary} />
          </View>
        </View>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  segment: { paddingHorizontal: 16, marginBottom: 8 },
  padded: { paddingHorizontal: 16, paddingTop: 8 },
  list: { padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  viewRow: { flexDirection: 'row', alignItems: 'center' },
});
