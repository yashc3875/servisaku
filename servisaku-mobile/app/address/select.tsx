import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Home, MapPin, Plus } from 'lucide-react-native';
import type { Address } from '@/types';
import { useTheme } from '@/theme';
import { useAddresses } from '@/hooks/queries';
import { useLocationStore } from '@/stores';
import { AppHeader, Skeleton, Surface, Text } from '@/components/ui';

/** Saved-address picker. Selecting one updates the active location store. */
export default function AddressSelectScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isPending } = useAddresses();
  const selected = useLocationStore((s) => s.selectedAddress);
  const setSelected = useLocationStore((s) => s.setSelectedAddress);

  const choose = (a: Address) => {
    setSelected(a);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <AppHeader title="Select address" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {isPending ? (
          [0, 1, 2].map((i) => <Skeleton key={i} height={88} radius={14} style={{ marginBottom: 12 }} />)
        ) : (
          <View style={{ gap: 12 }}>
            {data?.map((a) => {
              const active = selected?.id === a.id;
              return (
                <Pressable key={a.id} onPress={() => choose(a)}>
                  <Surface
                    elevation={active ? 'md' : 'sm'}
                    radius="lg"
                    padded
                    style={[styles.row, { borderColor: active ? theme.colors.primary : 'transparent', borderWidth: active ? 2 : 0 }]}
                  >
                    <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
                      <Home size={18} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.labelRow}>
                        <Text variant="bodyStrong" weight="600">
                          {a.label}
                        </Text>
                        {a.isDefault ? (
                          <Text variant="micro" weight="600" style={{ color: theme.colors.primary }}>
                            DEFAULT
                          </Text>
                        ) : null}
                      </View>
                      <Text variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
                        {[a.unit, a.line1, a.area, `${a.postcode} ${a.city}`, a.state].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                    {active ? <Check size={20} color={theme.colors.primary} strokeWidth={2.5} /> : null}
                  </Surface>
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable style={[styles.add, { borderColor: theme.colors.border }]} onPress={() => router.back()}>
          <Plus size={18} color={theme.colors.primary} />
          <Text variant="bodyStrong" weight="600" style={{ color: theme.colors.primary, marginLeft: 8 }}>
            Add new address
          </Text>
        </Pressable>

        <View style={styles.mapNote}>
          <MapPin size={14} color={theme.colors.textMuted} />
          <Text variant="micro" color="textMuted" style={{ marginLeft: 6 }}>
            Map pin selection available at checkout
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
  },
  mapNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
});
