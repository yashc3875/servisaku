import React from 'react';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import type { Promo } from '@/types';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { Badge, Text } from '@/components/ui';

export interface PromoBannerProps {
  promo: Promo;
  onPress: (promo: Promo) => void;
  /** Fixed width for carousels; omit for full-width stacked layout. */
  width?: number;
}

/** Full-bleed promotional banner card for the home carousel. */
export function PromoBanner({ promo, onPress, width }: PromoBannerProps) {
  const theme = useTheme();
  const { tl } = useLocale();

  return (
    <Pressable
      onPress={() => onPress(promo)}
      accessibilityRole="button"
      accessibilityLabel={tl(promo.title)}
      style={({ pressed }) => [{ width: width ?? '100%', opacity: pressed ? 0.9 : 1 }]}
    >
      <ImageBackground
        source={{ uri: promo.bannerImage }}
        style={[styles.bg, { height: 150 }]}
        imageStyle={{ borderRadius: theme.radii.xl }}
      >
        <View style={[styles.overlay, { borderRadius: theme.radii.xl }]} />
        <View style={styles.content}>
          <Badge label={promo.code} tone="warning" />
          <Text variant="h3" weight="700" style={styles.title} numberOfLines={2}>
            {tl(promo.title)}
          </Text>
          <Text variant="caption" numberOfLines={2} style={styles.body}>
            {tl(promo.description)}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bg: { justifyContent: 'flex-end' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 32, 24, 0.45)',
  },
  content: { padding: 16 },
  title: { color: '#FFFFFF', marginTop: 8 },
  body: { color: 'rgba(255,255,255,0.9)', marginTop: 4 },
});
