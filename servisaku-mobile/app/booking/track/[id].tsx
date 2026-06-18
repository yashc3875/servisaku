import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Check, MessageCircle, Phone, Navigation } from 'lucide-react-native';
import type { BookingStatus, TrackingUpdate } from '@/types';
import { useTheme, palette } from '@/theme';
import { useBooking, usePartner } from '@/hooks/queries';
import { trackingApi } from '@/services';
import {
  AppHeader,
  Avatar,
  IconButton,
  Skeleton,
  Surface,
  Text,
} from '@/components/ui';

const TIMELINE: { status: BookingStatus; label: string }[] = [
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'en_route', label: 'On the way' },
  { status: 'arrived', label: 'Arrived' },
  { status: 'in_progress', label: 'In progress' },
  { status: 'completed', label: 'Completed' },
];

const statusIndex = (s: BookingStatus): number => {
  const i = TIMELINE.findIndex((x) => x.status === s);
  return i < 0 ? 0 : i;
};

/**
 * Live tracking. Subscribes to the mocked real-time stream (`trackingApi`,
 * which mirrors a Socket.IO room) and animates the partner along the route.
 *
 * // API-INTEGRATION: render react-native-maps <MapView> here and feed
 * // update.partnerLocation into an animated <Marker>; coordinates already flow
 * // through TrackingUpdate.partnerLocation.
 */
export default function TrackScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: booking } = useBooking(String(id));
  const partner = usePartner(booking?.partnerId);

  const [update, setUpdate] = useState<TrackingUpdate | null>(null);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!booking) return;
    const handle = trackingApi.subscribe(
      booking.id,
      booking.address.geo,
      (u) => {
        setUpdate(u);
        // Map status + eta to a 0..1 path fraction for the marker animation.
        const idx = statusIndex(u.status);
        const frac =
          u.status === 'en_route'
            ? 0.15 + (1 - Math.min(1, (u.etaMinutes ?? 0) / 18)) * 0.7
            : idx >= statusIndex('arrived')
              ? 1
              : 0.12;
        progress.value = withTiming(frac, { duration: 1200, easing: Easing.inOut(Easing.ease) });
      },
      { startStatus: booking.status === 'confirmed' ? 'confirmed' : 'en_route' },
    );
    return () => handle.stop();
  }, [booking, progress]);

  const markerStyle = useAnimatedStyle(() => ({
    left: `${10 + progress.value * 76}%`,
    top: `${72 - progress.value * 52}%`,
  }));

  if (!booking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <AppHeader title="Live tracking" />
        <View style={{ padding: 16 }}>
          <Skeleton height={260} radius={16} />
        </View>
      </SafeAreaView>
    );
  }

  const current = update?.status ?? booking.status;
  const currentIdx = statusIndex(current);
  const eta = update?.etaMinutes ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <AppHeader title="Live tracking" />

      {/* Faux map panel with animated partner marker */}
      <View style={[styles.map, { backgroundColor: theme.scheme === 'dark' ? palette.gray800 : palette.emerald50 }]}>
        <View style={[styles.route, { backgroundColor: theme.colors.primaryMuted }]} />
        <View style={[styles.destPin, { backgroundColor: theme.colors.danger }]}>
          <Navigation size={14} color="#fff" />
        </View>
        <Animated.View style={[styles.marker, markerStyle]}>
          <View style={[styles.markerDot, { backgroundColor: theme.colors.primary, borderColor: theme.colors.onPrimary }]} />
        </Animated.View>

        {current === 'en_route' ? (
          <Surface elevation="md" radius="pill" style={styles.etaPill}>
            <Text variant="caption" weight="700">
              ETA {eta} min
            </Text>
          </Surface>
        ) : null}
      </View>

      {/* Partner card */}
      {partner.data ? (
        <Surface elevation="md" radius="xl" padded style={styles.partnerCard}>
          <Avatar uri={partner.data.avatar} name={partner.data.name} size={48} ring />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text variant="bodyStrong" weight="700">
              {partner.data.name}
            </Text>
            <Text variant="caption" color="textSecondary">
              {booking.items[0]?.serviceName}
            </Text>
          </View>
          <IconButton accessibilityLabel="Message" variant="soft">
            <MessageCircle size={20} color={theme.colors.primary} />
          </IconButton>
          <IconButton accessibilityLabel="Call" variant="soft" style={{ marginLeft: 8 }}>
            <Phone size={20} color={theme.colors.primary} />
          </IconButton>
        </Surface>
      ) : null}

      {/* Status timeline */}
      <View style={styles.timeline}>
        {TIMELINE.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <View key={step.status} style={styles.tlRow}>
              <View style={styles.tlMarker}>
                <View
                  style={[
                    styles.tlDot,
                    {
                      backgroundColor: done ? theme.colors.primary : theme.colors.surfaceAlt,
                      borderColor: done ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  {done ? <Check size={12} color={theme.colors.onPrimary} strokeWidth={3} /> : null}
                </View>
                {i < TIMELINE.length - 1 ? (
                  <View
                    style={[
                      styles.tlLine,
                      { backgroundColor: i < currentIdx ? theme.colors.primary : theme.colors.border },
                    ]}
                  />
                ) : null}
              </View>
              <Text
                variant="body"
                weight={active ? '700' : '500'}
                color={done ? 'text' : 'textMuted'}
                style={styles.tlLabel}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: { height: 260, margin: 16, borderRadius: 20, overflow: 'hidden' },
  route: {
    position: 'absolute',
    height: 3,
    width: '80%',
    left: '10%',
    top: '48%',
    transform: [{ rotate: '-28deg' }],
    opacity: 0.5,
  },
  destPin: { position: 'absolute', right: '10%', top: '14%', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  marker: { position: 'absolute' },
  markerDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 3 },
  etaPill: { position: 'absolute', bottom: 14, alignSelf: 'center', left: '50%', marginLeft: -44, width: 88, alignItems: 'center', paddingVertical: 8 },
  partnerCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: -8 },
  timeline: { padding: 24 },
  tlRow: { flexDirection: 'row', alignItems: 'flex-start' },
  tlMarker: { alignItems: 'center', width: 24 },
  tlDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tlLine: { width: 2, height: 28 },
  tlLabel: { marginLeft: 14, marginTop: 2, paddingBottom: 16 },
});
