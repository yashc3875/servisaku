import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Check, ChevronRight, MapPin, Tag } from 'lucide-react-native';
import type { Promo, TimeSlot } from '@/types';
import { useTheme } from '@/theme';
import { useCartStore, useLocationStore, useBookingDraftStore } from '@/stores';
import { useApplyPromo, useCreateBooking, useSlots } from '@/hooks/queries';
import { paymentMethodCatalog } from '@/mocks';
import { computePricing } from '@/utils/pricing';
import { formatDate, formatRM } from '@/utils';
import {
  AppHeader,
  Badge,
  Button,
  Chip,
  Divider,
  Input,
  Surface,
  Text,
} from '@/components/ui';

/** Upcoming N dates as ISO yyyy-mm-dd. */
function nextDates(count: number): string[] {
  const out: string[] = [];
  const base = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Checkout / review-and-confirm. Captures schedule, promo, and payment selection
 * for the cart, computes the price breakdown and creates the booking. (The full
 * multi-step wizard expands this single screen step-by-step.)
 */
export default function NewBookingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const address = useLocationStore((s) => s.selectedAddress);
  const draftReset = useBookingDraftStore((s) => s.reset);

  const dates = useMemo(() => nextDates(6), []);
  const [date, setDate] = useState(dates[0]!);
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [methodType, setMethodType] = useState(paymentMethodCatalog[5]!.type);

  const slots = useSlots(items[0]?.serviceId ?? '', date);
  const applyPromo = useApplyPromo();
  const createBooking = useCreateBooking();

  const pricing = useMemo(() => computePricing(items, discount), [items, discount]);

  const onApplyPromo = async () => {
    setPromoError(null);
    const res = await applyPromo.mutateAsync({ code: promoCode, subtotal: pricing.subtotal });
    if (res.valid && res.promo) {
      setAppliedPromo(res.promo);
      setDiscount(res.discountSen);
    } else {
      setPromoError(res.message ?? 'Invalid code');
      setAppliedPromo(null);
      setDiscount(0);
    }
  };

  const canConfirm = !!address && !!slot && items.length > 0;

  const onConfirm = async () => {
    if (!canConfirm || !address || !slot) return;
    const booking = await createBooking.mutateAsync({
      items,
      address,
      scheduledDate: date,
      scheduledSlot: { start: slot.start, end: slot.end },
      recurrence: 'once',
      promoCode: appliedPromo?.code,
      promoDiscountSen: discount,
    });
    clearCart();
    draftReset();
    router.replace({ pathname: '/booking/[id]', params: { id: booking.id } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <AppHeader title="Review & confirm" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Items */}
        <Surface elevation="sm" radius="lg" padded style={{ gap: 12 }}>
          {items.map((it, i) => (
            <View key={i}>
              {i > 0 ? <Divider style={{ marginBottom: 12 }} /> : null}
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong" weight="600">
                    {it.serviceName}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {it.packageName} · x{it.quantity}
                  </Text>
                </View>
                <Text variant="bodyStrong" weight="600">
                  {formatRM(it.unitPrice * it.quantity)}
                </Text>
              </View>
            </View>
          ))}
          {items.length === 0 ? (
            <Text variant="body" color="textMuted">
              Your cart is empty.
            </Text>
          ) : null}
        </Surface>

        {/* Address */}
        <Pressable onPress={() => router.push('/address/select')}>
          <Surface elevation="sm" radius="lg" padded style={[styles.row, styles.section]}>
            <MapPin size={20} color={theme.colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="bodyStrong" weight="600">
                {address ? `${address.label} · ${address.area}` : 'Select address'}
              </Text>
              {address ? (
                <Text variant="caption" color="textSecondary" numberOfLines={1}>
                  {address.line1}
                </Text>
              ) : null}
            </View>
            <ChevronRight size={18} color={theme.colors.textMuted} />
          </Surface>
        </Pressable>

        {/* Date */}
        <Text variant="title" weight="700" style={styles.label}>
          Choose date
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dates}>
          {dates.map((d) => (
            <Chip
              key={d}
              label={formatDate(d)}
              selected={d === date}
              onPress={() => {
                setDate(d);
                setSlot(null);
              }}
            />
          ))}
        </ScrollView>

        {/* Slots */}
        <Text variant="title" weight="700" style={styles.label}>
          Choose time slot
        </Text>
        <View style={styles.slots}>
          {(slots.data ?? []).map((s) => {
            const active = slot?.start === s.start;
            return (
              <Pressable
                key={s.start}
                disabled={!s.available}
                onPress={() => setSlot(s)}
                style={[
                  styles.slot,
                  {
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                    opacity: s.available ? 1 : 0.4,
                  },
                ]}
              >
                <Text variant="callout" weight="600" color={active ? 'primary' : 'text'}>
                  {s.start}–{s.end}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Promo */}
        <Text variant="title" weight="700" style={styles.label}>
          Promo code
        </Text>
        {appliedPromo ? (
          <Surface elevation="sm" radius="lg" padded style={styles.row}>
            <Tag size={18} color={theme.colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="bodyStrong" weight="600">
                {appliedPromo.code}
              </Text>
              <Text variant="caption" color="primary">
                – {formatRM(discount)} applied
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setAppliedPromo(null);
                setDiscount(0);
                setPromoCode('');
              }}
            >
              <Text variant="callout" weight="600" style={{ color: theme.colors.danger }}>
                {t('common.remove')}
              </Text>
            </Pressable>
          </Surface>
        ) : (
          <View style={styles.promoRow}>
            <Input
              placeholder="e.g. WELCOME15"
              autoCapitalize="characters"
              value={promoCode}
              onChangeText={setPromoCode}
              error={promoError ?? undefined}
              containerStyle={{ flex: 1 }}
            />
            <Button
              label={t('common.apply')}
              variant="secondary"
              loading={applyPromo.isPending}
              onPress={onApplyPromo}
              style={{ marginLeft: 10, height: 52 }}
            />
          </View>
        )}

        {/* Payment method */}
        <Text variant="title" weight="700" style={styles.label}>
          Payment method
        </Text>
        <Surface elevation="sm" radius="lg" style={{ overflow: 'hidden' }}>
          {paymentMethodCatalog.map((pm, i) => {
            const active = pm.type === methodType;
            return (
              <View key={pm.type}>
                {i > 0 ? <Divider inset={16} /> : null}
                <Pressable style={styles.pmRow} onPress={() => setMethodType(pm.type)}>
                  <Text variant="h3">{pm.glyph}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text variant="body" weight="600">
                      {pm.label}
                    </Text>
                    <Text variant="caption" color="textMuted">
                      {pm.subtitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                        backgroundColor: active ? theme.colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {active ? <Check size={13} color={theme.colors.onPrimary} strokeWidth={3} /> : null}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </Surface>

        {/* Price breakdown */}
        <Surface elevation="sm" radius="lg" padded style={[styles.section, { gap: 10 }]}>
          <Line label="Subtotal" value={formatRM(pricing.subtotal)} />
          <Line label="Service fee" value={formatRM(pricing.serviceFee)} />
          {pricing.discount > 0 ? <Line label="Discount" value={`– ${formatRM(pricing.discount)}`} accent /> : null}
          <Line label="SST (6%)" value={formatRM(pricing.tax)} />
          <Divider />
          <View style={styles.itemRow}>
            <Text variant="title" weight="700">
              Total
            </Text>
            <Text variant="title" weight="700">
              {formatRM(pricing.total)}
            </Text>
          </View>
        </Surface>

        {!slot ? (
          <Badge label="Select a time slot to continue" tone="warning" style={{ marginTop: 16, alignSelf: 'center' }} />
        ) : null}

        <Button
          label="Confirm booking"
          fullWidth
          disabled={!canConfirm}
          loading={createBooking.isPending}
          onPress={onConfirm}
          style={{ marginTop: 16 }}
        />
        <Text variant="micro" color="textMuted" center style={{ marginTop: 10 }}>
          Payment is simulated — no real charge is made.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Line({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.itemRow}>
      <Text variant="callout" color="textSecondary">
        {label}
      </Text>
      <Text variant="callout" weight="600" color={accent ? 'primary' : 'text'}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 48 },
  section: { marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { marginTop: 24, marginBottom: 12 },
  dates: { gap: 8, paddingRight: 8 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, minWidth: '30%', alignItems: 'center' },
  promoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  pmRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
