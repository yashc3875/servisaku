import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  BellOff,
  CalendarClock,
  CreditCard,
  Gift,
  Info,
  TicketPercent,
  type LucideProps,
} from 'lucide-react-native';
import type { AppNotification, NotificationType } from '@/types';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { useNotifications, useMarkNotificationRead } from '@/hooks/queries';
import { formatRelative } from '@/utils';
import { AppHeader, EmptyState, Skeleton, Surface, Text } from '@/components/ui';

const ICONS: Record<NotificationType, React.ComponentType<LucideProps>> = {
  booking: CalendarClock,
  promo: TicketPercent,
  payment: CreditCard,
  loyalty: Gift,
  system: Info,
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { data, isPending } = useNotifications();
  const markRead = useMarkNotificationRead();

  const onPress = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
    if (n.route) router.push(n.route as never);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <AppHeader title="Notifications" />

      {isPending ? (
        <View style={styles.list}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={72} radius={14} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={<BellOff size={40} color={theme.colors.primary} />}
          title="No notifications"
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => {
            const Icon = ICONS[item.type];
            return (
              <Pressable onPress={() => onPress(item)}>
                <Surface
                  elevation="sm"
                  radius="lg"
                  padded
                  style={[
                    styles.row,
                    !item.read ? { borderLeftWidth: 3, borderLeftColor: theme.colors.primary } : null,
                  ]}
                >
                  <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
                    <Icon size={18} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <Text variant="bodyStrong" weight="600" numberOfLines={1} style={{ flex: 1 }}>
                        {item.title}
                      </Text>
                      {!item.read ? <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} /> : null}
                    </View>
                    <Text variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                      {item.body}
                    </Text>
                    <Text variant="micro" color="textMuted" style={{ marginTop: 6 }}>
                      {formatRelative(item.createdAt, locale)}
                    </Text>
                  </View>
                </Surface>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
});
