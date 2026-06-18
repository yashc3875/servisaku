import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { palette } from '@/theme';
import { Logo } from '@/components/brand/Logo';
import { Text } from '@/components/ui';

/**
 * Animated splash. This is the router entry; `useAuthGate` redirects away once
 * state is hydrated, so this primarily serves as the branded intro.
 */
export default function SplashScreen() {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.4)) });
    taglineOpacity.value = withDelay(350, withTiming(1, { duration: 500 }));
  }, [opacity, scale, taglineOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <View style={styles.container}>
      <Animated.View style={logoStyle}>
        <Logo size={72} showWordmark inverse />
      </Animated.View>
      <Animated.View style={taglineStyle}>
        <Text variant="callout" center style={styles.tagline}>
          Home services, the Malaysian way
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.emerald500,
  },
  tagline: { color: 'rgba(255,255,255,0.85)', marginTop: 20 },
});
