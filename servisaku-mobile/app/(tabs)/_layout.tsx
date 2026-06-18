import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Home, CalendarCheck, Tag, User, type LucideProps } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  const icon =
    (Icon: React.ComponentType<LucideProps>) =>
    ({ color, size }: { color: string; size: number }) => (
      <Icon color={color} size={size} strokeWidth={2.2} />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: Platform.OS === 'ios' ? 86 : 66,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.home'), tabBarIcon: icon(Home) }}
      />
      <Tabs.Screen
        name="bookings"
        options={{ title: t('tabs.bookings'), tabBarIcon: icon(CalendarCheck) }}
      />
      <Tabs.Screen
        name="offers"
        options={{ title: t('tabs.offers'), tabBarIcon: icon(Tag) }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: t('tabs.account'), tabBarIcon: icon(User) }}
      />
    </Tabs>
  );
}
