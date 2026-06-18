import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { MoneySen } from '@/types';
import { formatRM } from '@/utils';
import { Text } from './Text';

export interface PriceTagProps {
  amount: MoneySen;
  /** Strike-through original price, shown when discounted. */
  compareAt?: MoneySen;
  size?: 'sm' | 'md' | 'lg';
  /** Prefix like "From". */
  prefix?: string;
  /** Suffix like "/ unit". */
  suffix?: string;
}

/** Consistent RM price display with optional compare-at and prefix/suffix. */
export function PriceTag({ amount, compareAt, size = 'md', prefix, suffix }: PriceTagProps) {
  const variant = size === 'lg' ? 'h2' : size === 'sm' ? 'title' : 'h3';

  return (
    <View style={styles.row}>
      {prefix ? (
        <Text variant="caption" color="textMuted" style={styles.prefix}>
          {prefix}
        </Text>
      ) : null}
      <Text variant={variant} weight="700" color="text">
        {formatRM(amount)}
      </Text>
      {compareAt && compareAt > amount ? (
        <Text
          variant="caption"
          color="textMuted"
          style={[styles.compare, { textDecorationLine: 'line-through' }]}
        >
          {formatRM(compareAt)}
        </Text>
      ) : null}
      {suffix ? (
        <Text variant="caption" color="textMuted" style={styles.suffix}>
          {suffix}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline' },
  prefix: { marginRight: 5 },
  compare: { marginLeft: 6 },
  suffix: { marginLeft: 3 },
});
