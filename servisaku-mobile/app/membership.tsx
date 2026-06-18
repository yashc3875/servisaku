import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Crown } from 'lucide-react-native';
import { useTheme, palette } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { useMembershipPlans } from '@/hooks/queries';
import { formatRM } from '@/utils';
import { AppHeader, Button, SegmentedControl, Skeleton, Surface, Text } from '@/components/ui';

/** ServisAku Plus membership — benefits + monthly/yearly subscribe (UI only). */
export default function MembershipScreen() {
  const theme = useTheme();
  const { tl } = useLocale();
  const { data, isPending } = useMembershipPlans();
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plan = data?.[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <AppHeader title="ServisAku Plus" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Surface elevation="lg" radius="2xl" style={[styles.hero, { backgroundColor: palette.emerald600 }]}>
          <Crown size={40} color={theme.colors.accent} />
          <Text variant="h1" weight="700" style={{ color: '#fff', marginTop: 12 }}>
            ServisAku Plus
          </Text>
          <Text variant="body" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4 }} center>
            Save more on every booking, all year round.
          </Text>
        </Surface>

        {isPending || !plan ? (
          <Skeleton height={240} radius={16} style={{ marginTop: 20 }} />
        ) : (
          <>
            <View style={styles.cycle}>
              <SegmentedControl
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly · save 16%' },
                ]}
                value={cycle}
                onChange={(v) => setCycle(v as 'monthly' | 'yearly')}
              />
            </View>

            <Surface elevation="sm" radius="lg" padded style={styles.benefits}>
              {plan.benefits.map((b, i) => (
                <View key={i} style={styles.benefitRow}>
                  <View style={[styles.tick, { backgroundColor: theme.colors.primarySoft }]}>
                    <Check size={14} color={theme.colors.primary} strokeWidth={3} />
                  </View>
                  <Text variant="body" style={{ flex: 1 }}>
                    {tl(b)}
                  </Text>
                </View>
              ))}
            </Surface>

            <View style={styles.priceRow}>
              <Text variant="h2" weight="700">
                {formatRM(cycle === 'monthly' ? plan.pricePerMonth : plan.pricePerYear)}
              </Text>
              <Text variant="body" color="textMuted">
                /{cycle === 'monthly' ? 'month' : 'year'}
              </Text>
            </View>

            <Button label="Subscribe now" fullWidth style={{ marginTop: 16 }} />
            <Text variant="micro" color="textMuted" center style={{ marginTop: 12 }}>
              Cancel anytime. Renews automatically. UI demo — no charge.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  hero: { alignItems: 'center', padding: 28 },
  cycle: { marginTop: 24 },
  benefits: { marginTop: 16, gap: 14 },
  benefitRow: { flexDirection: 'row', alignItems: 'center' },
  tick: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginTop: 24 },
});
