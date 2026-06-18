import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

/** Pill chip for filters, tags and selectable options. */
export function Chip({ label, selected, onPress, icon, size = 'md', style }: ChipProps) {
  const theme = useTheme();
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected }}
      style={[
        styles.base,
        {
          paddingVertical: size === 'sm' ? 5 : 8,
          paddingHorizontal: size === 'sm' ? 10 : 14,
          borderRadius: theme.radii.pill,
          backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        variant={size === 'sm' ? 'caption' : 'callout'}
        weight="600"
        style={{ color: selected ? theme.colors.onPrimary : theme.colors.textSecondary }}
      >
        {label}
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: { marginRight: 6 },
});
