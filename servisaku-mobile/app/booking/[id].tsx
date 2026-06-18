import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Navigation } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { useBooking } from '@/hooks/queries';
import { usePartner } from '@/hooks/queries';
import { formatDate, formatRM } from '@/utils';
import { BookingStatusChip } from '@/components/domain';
import {
  AppHeader,
  Avatar,
  Button,
  Divider,
  RatingStars,
  Skeleton,
  Surface,
  Text,
} from '@/components/ui';

export default function BookingDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { tl } = useLocale();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: booking, isPending } = useBooking(String(id));
  const partner = usePartner(booking?.partnerId);

  if (isPending || !booking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <AppHeader title="" />
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={100} radius={14} />
          <Skeleton height={160} radius={14} />
        </View>
      </SafeAreaView>
    );
  }

  const isLive =
    booking.status === 'en_route' ||
    booking.status === 'arrived' ||
    booking.status === 'in_progress' ||
    booking.status === 'confirmed';

  const { pricing } = booking;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <AppHeader title={booking.reference} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Surface elevation="sm" radius="lg" padded style={styles.statusCard}>
          <BookingStatusChip status={booking.status} />
          <Text variant="h3" weight="700" style={{ marginTop: 10 }}>
            {booking.items[0]?.serviceName}
          </Text>
        </Surface>

        {/* Partner */}
        {partner.data ? (
          <Surface elevation="sm" radius="lg" padded style={styles.partner}>
            <Avatar uri={partner.data.avatar} name={partner.data.name} size={52} ring />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text variant="bodyStrong" weight="600">
                {partner.data.name}
              </Text>
              <RatingStars value={partner.data.rating} size={13} showValue reviewCount={partner.data.reviewCount} />
            </View>
          </Surface>
        ) : null}

        {/* Schedule + address */}
        <Surface elevation="sm" radius="lg" padded style={{ marginTop: 12, gap: 14 }}>
          <View style={styles.infoRow}>
            <Calendar size={18} color={theme.colors.textMuted} />
            <Text variant="body" style={{ marginLeft: 12 }}>
              {formatDate(booking.scheduledDate)} · {booking.scheduledSlot.start}–{booking.scheduledSlot.end}
            </Text>
          </View>
          <Divider />
          <View style={styles.infoRow}>
            <MapPin size={18} color={theme.colors.textMuted} />
            <Text variant="body" style={{ marginLeft: 12, flex: 1 }}>
              {booking.address.label} · {booking.address.line1}, {booking.address.area}
            </Text>
          </View>
        </Surface>

        {/* Price breakdown */}
        <Surface elevation="sm" radius="lg" padded style={{ marginTop: 12, gap: 10 }}>
          <PriceLine label="Subtotal" value={pricing.subtotal} />
          <PriceLine label="Service fee" value={pricing.serviceFee} />
          {pricing.discount > 0 ? <PriceLine label="Discount" value={-pricing.discount} accent /> : null}
          <PriceLine label="SST (6%)" value={pricing.tax} />
          <Divider />
          <View style={styles.totalRow}>
            <Text variant="title" weight="700">
              Total
            </Text>
            <Text variant="title" weight="700">
              {formatRM(pricing.total)}
            </Text>
          </View>
        </Surface>

        {/* Actions */}
        <View style={styles.actions}>
          {isLive ? (
            <Button
              label={t('booking.track')}
              fullWidth
              icon={<Navigation size={18} color={theme.colors.onPrimary} />}
              onPress={() => router.push({ pathname: '/booking/track/[id]', params: { id: booking.id } })}
            />
          ) : null}
          {booking.status === 'completed' && !booking.reviewed ? (
            <Button label={t('booking.rate')} variant="outline" fullWidth />
          ) : null}
          {booking.status === 'completed' ? (
            <Button label={t('booking.rebook')} variant="secondary" fullWidth onPress={() => router.push('/(tabs)')} />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PriceLine({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <View style={styles.priceLine}>
      <Text variant="callout" color="textSecondary">
        {label}
      </Text>
      <Text variant="callout" weight="600" color={accent ? 'primary' : 'text'}>
        {value < 0 ? `– ${formatRM(Math.abs(value))}` : formatRM(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  statusCard: {},
  partner: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  priceLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { marginTop: 20, gap: 12 },
});
