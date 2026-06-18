import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { hitSlop } from '@/theme';

export interface IconButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  size?: number;
  variant?: 'plain' | 'surface' | 'soft';
  accessibilityLabel: string;
  style?: ViewStyle;
}

/** Square, accessible icon tap target. */
export function IconButton({
  children,
  onPress,
  size = 44,
  variant = 'plain',
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const theme = useTheme();
  const bg =
    variant === 'surface'
      ? theme.colors.surface
      : variant === 'soft'
        ? theme.colors.surfaceAlt
        : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: theme.radii.md,
          backgroundColor: bg,
          opacity: pressed ? 0.6 : 1,
        },
        variant !== 'plain' ? theme.shadows.sm : null,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
