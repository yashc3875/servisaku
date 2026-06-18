import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  CreditCard,
  Crown,
  Gift,
  HelpCircle,
  LogOut,
  MapPin,
  Moon,
  Languages,
  type LucideProps,
} from 'lucide-react-native';
import type { Locale } from '@/types';
import { useTheme } from '@/theme';
import { useAuthStore, useLocaleStore, useUIStore } from '@/stores';
import { formatRM } from '@/utils';
import { Avatar, Badge, Chip, Divider, Surface, Text } from '@/components/ui';

export default function AccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const themeMode = useUIStore((s) => s.themeMode);
  const setThemeMode = useUIStore((s) => s.setThemeMode);

  const isDark = theme.scheme === 'dark';

  const menu: { icon: React.ComponentType<LucideProps>; label: string; route: string }[] = [
    { icon: MapPin, label: 'Saved addresses', route: '/address/select' },
    { icon: CreditCard, label: 'Payment methods', route: '/(tabs)/account' },
    { icon: Gift, label: 'Loyalty & rewards', route: '/membership' },
    { icon: HelpCircle, label: 'Help & support', route: '/(tabs)/account' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <Surface elevation="sm" radius="xl" padded style={styles.profile}>
          <Avatar uri={user?.avatar} name={user?.name} size={64} ring />
          <View style={styles.profileText}>
            <Text variant="h3" weight="700">
              {user?.name ?? 'Guest'}
            </Text>
            <Text variant="caption" color="textSecondary">
              {user?.phone}
            </Text>
            <View style={styles.profileBadges}>
              <Badge label={`${user?.loyaltyTier?.toUpperCase() ?? 'SILVER'} · ${user?.loyaltyPoints ?? 0} pts`} tone="warning" />
              {user?.isPlusMember ? <Badge label="Plus" tone="success" /> : null}
            </View>
          </View>
        </Surface>

        {/* Wallet strip */}
        <Surface elevation="sm" radius="lg" padded style={styles.wallet}>
          <Crown size={22} color={theme.colors.accent} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text variant="caption" color="textMuted">
              ServisAku Wallet
            </Text>
            <Text variant="title" weight="700">
              {formatRM(user?.walletBalanceSen ?? 0)}
            </Text>
          </View>
        </Surface>

        {/* Menu */}
        <Surface elevation="sm" radius="lg" style={styles.menu}>
          {menu.map((item, i) => {
            const Icon = item.icon;
            return (
              <View key={item.label}>
                {i > 0 ? <Divider inset={16} /> : null}
                <Pressable style={styles.menuRow} onPress={() => router.push(item.route as never)}>
                  <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
                    <Icon size={18} color={theme.colors.primary} />
                  </View>
                  <Text variant="body" weight="500" style={{ flex: 1 }}>
                    {item.label}
                  </Text>
                  <ChevronRight size={18} color={theme.colors.textMuted} />
                </Pressable>
              </View>
            );
          })}
        </Surface>

        {/* Preferences */}
        <Text variant="caption" color="textMuted" weight="600" style={styles.prefLabel}>
          PREFERENCES
        </Text>
        <Surface elevation="sm" radius="lg" padded style={{ gap: 16 }}>
          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Languages size={18} color={theme.colors.text} />
              <Text variant="body" weight="500" style={{ marginLeft: 12 }}>
                {t('language.title')}
              </Text>
            </View>
            <View style={styles.langChips}>
              {(['en', 'ms'] as Locale[]).map((l) => (
                <Chip
                  key={l}
                  label={l === 'en' ? 'EN' : 'BM'}
                  size="sm"
                  selected={locale === l}
                  onPress={() => setLocale(l)}
                />
              ))}
            </View>
          </View>
          <Divider />
          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Moon size={18} color={theme.colors.text} />
              <Text variant="body" weight="500" style={{ marginLeft: 12 }}>
                Dark mode
              </Text>
            </View>
            <Chip
              label={isDark ? 'On' : 'Off'}
              size="sm"
              selected={isDark}
              onPress={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            />
          </View>
        </Surface>

        {/* Sign out */}
        <Pressable style={styles.signOut} onPress={() => void signOut()}>
          <LogOut size={18} color={theme.colors.danger} />
          <Text variant="body" weight="600" style={{ color: theme.colors.danger, marginLeft: 8 }}>
            Sign out
          </Text>
        </Pressable>

        <Text variant="micro" color="textMuted" center style={{ marginTop: 16 }}>
          ServisAku v1.0.0 · Made in Malaysia 🇲🇾
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  profile: { flexDirection: 'row', alignItems: 'center' },
  profileText: { flex: 1, marginLeft: 16 },
  profileBadges: { flexDirection: 'row', gap: 6, marginTop: 8 },
  wallet: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  menu: { marginTop: 20, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  prefLabel: { marginTop: 24, marginBottom: 10, marginLeft: 4, letterSpacing: 0.5 },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prefLeft: { flexDirection: 'row', alignItems: 'center' },
  langChips: { flexDirection: 'row', gap: 8 },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 28, padding: 12 },
});
