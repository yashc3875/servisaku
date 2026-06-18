import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export interface RatingStarsProps {
  value: number;
  /** Star glyph size. */
  size?: number;
  /** When provided, stars become tappable for input. */
  onChange?: (value: number) => void;
  /** Show the numeric value + optional review count beside the stars. */
  showValue?: boolean;
  reviewCount?: number;
}

/** Read-only or interactive 5-star rating. */
export function RatingStars({
  value,
  size = 16,
  onChange,
  showValue,
  reviewCount,
}: RatingStarsProps) {
  const theme = useTheme();
  const interactive = !!onChange;

  return (
    <View style={styles.row}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= Math.round(value);
          const star = (
            <Star
              size={size}
              color={theme.colors.star}
              fill={filled ? theme.colors.star : 'transparent'}
              strokeWidth={2}
            />
          );
          return interactive ? (
            <Pressable
              key={i}
              onPress={() => onChange?.(i)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`${i} star${i > 1 ? 's' : ''}`}
              style={styles.starPad}
            >
              {star}
            </Pressable>
          ) : (
            <View key={i} style={styles.starGap}>
              {star}
            </View>
          );
        })}
      </View>
      {showValue ? (
        <Text variant="caption" color="textSecondary" weight="600" style={styles.value}>
          {value.toFixed(1)}
          {reviewCount != null ? ` (${reviewCount})` : ''}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  stars: { flexDirection: 'row', alignItems: 'center' },
  starGap: { marginRight: 2 },
  starPad: { paddingHorizontal: 3 },
  value: { marginLeft: 6 },
});
