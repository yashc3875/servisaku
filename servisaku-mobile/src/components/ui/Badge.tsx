import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import type { ThemeColors } from '@/theme';
import { Text } from './Text';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
  label: string;
  tone?: Tone;
  /** Show a small leading dot. */
  dot?: boolean;
  style?: ViewStyle;
}

const toneMap: Record<
  Tone,
  { surface: keyof ThemeColors; text: keyof ThemeColors }
> = {
  primary: { surface: 'primarySoft', text: 'primary' },
  success: { surface: 'successSurface', text: 'success' },
  warning: { surface: 'warningSurface', text: 'warning' },
  danger: { surface: 'dangerSurface', text: 'danger' },
  info: { surface: 'infoSurface', text: 'info' },
  neutral: { surface: 'surfaceAlt', text: 'textSecondary' },
};

/** Compact status/label badge. */
export function Badge({ label, tone = 'neutral', dot, style }: BadgeProps) {
  const theme = useTheme();
  const { surface, text } = toneMap[tone];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.colors[surface],
          borderRadius: theme.radii.pill,
        },
        style,
      ]}
    >
      {dot ? (
        <View
          style={[styles.dot, { backgroundColor: theme.colors[text] }]}
        />
      ) : null}
      <Text variant="micro" weight="600" style={{ color: theme.colors[text] }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
});
