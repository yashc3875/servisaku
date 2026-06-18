import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { ServiceListItem } from '@/types';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { Badge, PriceTag, RatingStars, Surface, Text } from '@/components/ui';

export interface ServiceCardProps {
  service: ServiceListItem;
  onPress: (service: ServiceListItem) => void;
  /** 'wide' = full-width row, 'tile' = fixed-width carousel card. */
  layout?: 'wide' | 'tile';
  width?: number;
}

/** The primary service card, used across home carousels and category lists. */
export function ServiceCard({ service, onPress, layout = 'wide', width }: ServiceCardProps) {
  const theme = useTheme();
  const { tl } = useLocale();
  const isTile = layout === 'tile';

  return (
    <Pressable
      onPress={() => onPress(service)}
      accessibilityRole="button"
      accessibilityLabel={tl(service.name)}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, width: isTile ? width : '100%' }]}
    >
      <Surface elevation="sm" radius="lg" style={isTile ? styles.tile : styles.wide}>
        <Image
          source={{ uri: service.image }}
          style={[isTile ? styles.tileImage : styles.wideImage]}
        />
        <View style={isTile ? styles.tileBody : styles.wideBody}>
          {service.tags[0] ? (
            <Badge label={tl(service.tags[0])} tone="primary" style={styles.tag} />
          ) : null}
          <Text variant="title" weight="700" numberOfLines={1}>
            {tl(service.name)}
          </Text>
          <Text
            variant="caption"
            color="textSecondary"
            numberOfLines={isTile ? 2 : 1}
            style={styles.desc}
          >
            {tl(service.shortDescription)}
          </Text>
          <View style={styles.metaRow}>
            <RatingStars
              value={service.rating}
              size={13}
              showValue
              reviewCount={service.reviewCount}
            />
          </View>
          <View style={styles.priceRow}>
            <PriceTag amount={service.fromPrice} size="sm" prefix="From" />
          </View>
        </View>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wide: { flexDirection: 'row', overflow: 'hidden' },
  wideImage: { width: 108, height: 116 },
  wideBody: { flex: 1, padding: 12 },

  tile: { overflow: 'hidden' },
  tileImage: { width: '100%', height: 120 },
  tileBody: { padding: 12 },

  tag: { marginBottom: 6 },
  desc: { marginTop: 3 },
  metaRow: { marginTop: 8 },
  priceRow: { marginTop: 6 },
});
