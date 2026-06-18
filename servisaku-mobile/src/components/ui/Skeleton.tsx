import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/** Shimmering placeholder block for loading states. */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const theme = useTheme();
  const progress = useSharedValue(0.5);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.colors.skeleton },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** A vertical stack of skeleton lines. */
export function SkeletonGroup({ count = 3, gap = 10 }: { count?: number; gap?: number }) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={14} width={`${90 - i * 12}%`} />
      ))}
    </View>
  );
}

const _styles = StyleSheet.create({});
