import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Surface, Text } from '@/components/ui';

/** Tappable search affordance on the home screen — opens the search route. */
export function SearchBar({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable onPress={onPress} accessibilityRole="search" accessibilityLabel={t('home.searchPlaceholder')}>
      <Surface elevation="sm" radius="lg" style={styles.bar}>
        <Search size={20} color={theme.colors.textMuted} />
        <Text variant="body" color="placeholder" style={styles.text}>
          {t('home.searchPlaceholder')}
        </Text>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52 },
  text: { marginLeft: 10 },
});
