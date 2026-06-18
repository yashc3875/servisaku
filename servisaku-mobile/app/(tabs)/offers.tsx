import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TicketPercent } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { usePromos } from '@/hooks/queries';
import { formatDate } from '@/utils';
import { PromoBanner } from '@/components/domain';
import { EmptyState, Skeleton, Text } from '@/components/ui';

export default function OffersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { data, isPending } = usePromos();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h1" weight="700">
          {t('tabs.offers')}
        </Text>
        <Text variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
          {t('home.promosTitle')}
        </Text>
      </View>

      {isPending ? (
        <View style={styles.list}>
          <Skeleton height={150} radius={20} style={{ marginBottom: 16 }} />
          <Skeleton height={150} radius={20} />
        </View>
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={<TicketPercent size={40} color={theme.colors.primary} />}
          title={t('common.noResults')}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View>
              <PromoBanner promo={item} onPress={() => router.push('/(tabs)')} />
              <Text variant="micro" color="textMuted" style={styles.expiry}>
                Valid until {formatDate(item.expiresAt, locale)}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  list: { padding: 16 },
  expiry: { marginTop: 6, marginLeft: 4 },
});
