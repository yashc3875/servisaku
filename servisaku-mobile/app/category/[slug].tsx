import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PackageSearch } from 'lucide-react-native';
import type { ServiceListItem } from '@/types';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { useCategory, useServicesByCategory } from '@/hooks/queries';
import { ServiceCard } from '@/components/domain';
import { AppHeader, EmptyState, Skeleton, Text } from '@/components/ui';

export default function CategoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { tl } = useLocale();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const category = useCategory(String(slug));
  const services = useServicesByCategory(category.data?.id ?? '');

  const openService = (s: ServiceListItem) =>
    router.push({ pathname: '/service/[id]', params: { id: s.id } });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <AppHeader title={category.data ? tl(category.data.name) : ''} />

      {category.data ? (
        <View style={styles.intro}>
          <Text variant="body" color="textSecondary">
            {tl(category.data.tagline)}
          </Text>
        </View>
      ) : null}

      {services.isPending ? (
        <View style={styles.list}>
          <Skeleton height={116} radius={14} style={{ marginBottom: 12 }} />
          <Skeleton height={116} radius={14} style={{ marginBottom: 12 }} />
          <Skeleton height={116} radius={14} />
        </View>
      ) : (services.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={<PackageSearch size={40} color={theme.colors.primary} />}
          title={t('common.noResults')}
        />
      ) : (
        <FlatList
          data={services.data}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => <ServiceCard service={item} layout="wide" onPress={openService} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  intro: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { padding: 16 },
});
