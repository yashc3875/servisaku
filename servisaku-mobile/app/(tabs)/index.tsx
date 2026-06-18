import React from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Crown } from 'lucide-react-native';
import type { ServiceCategory, ServiceListItem, Promo } from '@/types';
import { useTheme } from '@/theme';
import { useAuthStore } from '@/stores';
import {
  useCategories,
  usePopularServices,
  usePromos,
  useRecommendedServices,
  useNotifications,
  useBookings,
} from '@/hooks/queries';
import {
  CategoryTile,
  HomeHeader,
  PromoBanner,
  SearchBar,
  ServiceCard,
  BookingStatusChip,
} from '@/components/domain';
import { SectionHeader, Skeleton, Surface, Text } from '@/components/ui';

const CATEGORY_COLUMNS = 4;

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const user = useAuthStore((s) => s.user);

  const categories = useCategories();
  const popular = usePopularServices();
  const recommended = useRecommendedServices();
  const promos = usePromos();
  const notifications = useNotifications();
  const bookings = useBookings();

  const unread = notifications.data?.filter((n) => !n.read).length ?? 0;
  const activeBooking = bookings.data?.find(
    (b) => b.status !== 'completed' && b.status !== 'cancelled',
  );

  const gridGap = 12;
  const contentWidth = width - theme.spacing.lg * 2;
  const tileWidth = (contentWidth - gridGap * (CATEGORY_COLUMNS - 1)) / CATEGORY_COLUMNS;
  const promoWidth = contentWidth;
  const serviceTileWidth = contentWidth * 0.74;

  const openCategory = (c: ServiceCategory) =>
    router.push({ pathname: '/category/[slug]', params: { slug: c.slug } });
  const openService = (s: ServiceListItem) =>
    router.push({ pathname: '/service/[id]', params: { id: s.id } });
  const openPromo = (_p: Promo) => router.push('/(tabs)/offers');

  const refreshing =
    categories.isRefetching || popular.isRefetching || recommended.isRefetching;
  const onRefresh = () => {
    categories.refetch();
    popular.refetch();
    recommended.refetch();
    promos.refetch();
    bookings.refetch();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.padded}>
          <HomeHeader unreadCount={unread} />
          <View style={styles.searchSpace}>
            <SearchBar onPress={() => router.push('/search')} />
          </View>
        </View>

        {/* Active booking strip */}
        {activeBooking ? (
          <Pressable
            style={styles.padded}
            onPress={() =>
              router.push({ pathname: '/booking/[id]', params: { id: activeBooking.id } })
            }
          >
            <Surface elevation="sm" radius="lg" style={styles.activeCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.activeTop}>
                  <Text variant="caption" color="textMuted">
                    {activeBooking.reference}
                  </Text>
                  <BookingStatusChip status={activeBooking.status} />
                </View>
                <Text variant="title" weight="600" numberOfLines={1} style={styles.activeName}>
                  {activeBooking.items[0]?.serviceName}
                </Text>
                <Text variant="caption" color="primary" weight="600">
                  {t('home.viewBooking')}
                </Text>
              </View>
              <ChevronRight size={22} color={theme.colors.textMuted} />
            </Surface>
          </Pressable>
        ) : null}

        {/* Categories */}
        <View style={[styles.padded, styles.section]}>
          <SectionHeader title={t('home.categoriesTitle')} />
          {categories.isPending ? (
            <CategoryGridSkeleton tileWidth={tileWidth} gap={gridGap} />
          ) : (
            <View style={[styles.grid, { gap: gridGap }]}>
              {categories.data?.map((c) => (
                <CategoryTile key={c.id} category={c} width={tileWidth} onPress={openCategory} />
              ))}
            </View>
          )}
        </View>

        {/* Promos */}
        <View style={styles.section}>
          <View style={styles.padded}>
            <SectionHeader
              title={t('home.promosTitle')}
              actionLabel={t('common.seeAll')}
              onAction={() => router.push('/(tabs)/offers')}
            />
          </View>
          {promos.isPending ? (
            <View style={styles.padded}>
              <Skeleton height={150} radius={20} />
            </View>
          ) : (
            <FlatList
              data={promos.data}
              keyExtractor={(p) => p.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              renderItem={({ item }) => (
                <PromoBanner promo={item} width={promoWidth} onPress={openPromo} />
              )}
            />
          )}
        </View>

        {/* Popular near you */}
        <View style={styles.section}>
          <View style={styles.padded}>
            <SectionHeader title={t('home.popularTitle')} />
          </View>
          {popular.isPending ? (
            <View style={styles.padded}>
              <Skeleton height={240} radius={14} />
            </View>
          ) : (
            <FlatList
              data={popular.data}
              keyExtractor={(s) => s.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              renderItem={({ item }) => (
                <ServiceCard
                  service={item}
                  layout="tile"
                  width={serviceTileWidth}
                  onPress={openService}
                />
              )}
            />
          )}
        </View>

        {/* Plus membership banner */}
        <Pressable style={[styles.padded, styles.section]} onPress={() => router.push('/membership')}>
          <Surface
            elevation="md"
            radius="xl"
            style={[styles.plusCard, { backgroundColor: theme.colors.primary }]}
          >
            <Crown size={28} color={theme.colors.accent} />
            <View style={styles.plusText}>
              <Text variant="title" weight="700" style={{ color: theme.colors.onPrimary }}>
                {t('home.becomePlus')}
              </Text>
              <Text variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {t('home.plusSubtitle')}
              </Text>
            </View>
            <ChevronRight size={22} color={theme.colors.onPrimary} />
          </Surface>
        </Pressable>

        {/* Recommended */}
        <View style={[styles.padded, styles.section]}>
          <SectionHeader title={t('home.recommendedTitle')} />
          {recommended.isPending ? (
            <View style={{ gap: 12 }}>
              <Skeleton height={116} radius={14} />
              <Skeleton height={116} radius={14} />
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {recommended.data?.slice(0, 4).map((item) => (
                <ServiceCard key={item.id} service={item} layout="wide" onPress={openService} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryGridSkeleton({ tileWidth, gap }: { tileWidth: number; gap: number }) {
  return (
    <View style={[styles.grid, { gap }]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={i} style={{ width: tileWidth, alignItems: 'center' }}>
          <Skeleton width={60} height={60} radius={14} />
          <Skeleton width={tileWidth * 0.8} height={10} radius={5} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 28 },
  padded: { paddingHorizontal: 16 },
  searchSpace: { marginTop: 16 },
  section: { marginTop: 24 },
  hList: { paddingHorizontal: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },

  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
  },
  activeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activeName: { marginVertical: 4 },

  plusCard: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  plusText: { flex: 1, marginLeft: 14 },
});
