import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Bell, ChevronDown, MapPin } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { useAuthStore, useLocationStore } from '@/stores';
import { Avatar, IconButton, Text } from '@/components/ui';

/** Home top bar: greeting, location selector, notifications, avatar. */
export function HomeHeader({ unreadCount }: { unreadCount: number }) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const address = useLocationStore((s) => s.selectedAddress);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color="textMuted">
            {user ? t('home.greeting', { name: user.name.split(' ')[0] }) : t('home.greetingGuest')}
          </Text>
          <Pressable
            style={styles.locationRow}
            onPress={() => router.push('/address/select')}
            accessibilityRole="button"
            accessibilityLabel={t('home.deliverTo')}
          >
            <MapPin size={16} color={theme.colors.primary} />
            <Text variant="bodyStrong" weight="600" numberOfLines={1} style={styles.locationText}>
              {address ? `${address.label} · ${address.area}` : t('home.deliverTo')}
            </Text>
            <ChevronDown size={16} color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        <IconButton
          accessibilityLabel="Notifications"
          variant="soft"
          onPress={() => router.push('/notifications')}
        >
          <Bell size={20} color={theme.colors.text} />
          {unreadCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.danger }]}>
              <Text variant="micro" weight="700" style={{ color: '#fff' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </IconButton>

        <Pressable onPress={() => router.push('/(tabs)/account')} style={styles.avatar}>
          <Avatar uri={user?.avatar} name={user?.name} size={40} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locationText: { marginHorizontal: 5, maxWidth: 200 },
  avatar: { marginLeft: 2 },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
