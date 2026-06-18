import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** Optional leading icon element. */
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  icon,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heights: Record<Size, number> = { sm: 40, md: 52, lg: 58 };
  const paddings: Record<Size, number> = { sm: 14, md: 20, lg: 24 };

  const bg: Record<Variant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.primarySoft,
    outline: 'transparent',
    ghost: 'transparent',
    danger: theme.colors.danger,
  };
  const fg: Record<Variant, string> = {
    primary: theme.colors.onPrimary,
    secondary: theme.colors.primary,
    outline: theme.colors.primary,
    ghost: theme.colors.text,
    danger: theme.colors.onPrimary,
  };

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => (scale.value = withTiming(0.97, { duration: 90 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 120 }))}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      style={[
        styles.base,
        animatedStyle,
        {
          height: heights[size],
          paddingHorizontal: paddings[size],
          backgroundColor: bg[variant],
          borderRadius: theme.radii.lg,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: theme.colors.primary,
          opacity: isDisabled ? 0.55 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
          <Text
            variant={size === 'sm' ? 'callout' : 'title'}
            weight="600"
            style={{ color: fg[variant] }}
          >
            {label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center' },
});
