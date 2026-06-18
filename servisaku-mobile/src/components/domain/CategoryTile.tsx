import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { ServiceCategory } from '@/types';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { CategoryIcon, Text } from '@/components/ui';

export interface CategoryTileProps {
  category: ServiceCategory;
  onPress: (category: ServiceCategory) => void;
  /** Tile width; the home grid computes this from screen width. */
  width: number;
}

/** Square category tile with a tinted icon badge — the home grid cell. */
export function CategoryTile({ category, onPress, width }: CategoryTileProps) {
  const theme = useTheme();
  const { tl } = useLocale();

  return (
    <Pressable
      onPress={() => onPress(category)}
      accessibilityRole="button"
      accessibilityLabel={tl(category.name)}
      style={({ pressed }) => [
        styles.wrap,
        { width, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View
        style={[
          styles.iconBadge,
          {
            backgroundColor: category.accentColor + '1A', // ~10% tint
            borderRadius: theme.radii.lg,
          },
        ]}
      >
        <CategoryIcon name={category.icon} size={26} color={category.accentColor} />
      </View>
      <Text variant="caption" weight="600" center numberOfLines={2} style={styles.label}>
        {tl(category.name)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  iconBadge: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: { paddingHorizontal: 2 },
});
