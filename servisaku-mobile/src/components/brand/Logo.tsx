import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/ui';

export interface LogoProps {
  size?: number;
  /** Show the "ServisAku" wordmark beside the glyph. */
  showWordmark?: boolean;
  /** Render light-colored wordmark (for use over the brand background). */
  inverse?: boolean;
}

/** ServisAku brand lockup — an emerald glyph + optional wordmark. */
export function Logo({ size = 44, showWordmark = true, inverse }: LogoProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.glyph,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <Sparkles size={size * 0.52} color={theme.colors.onPrimary} strokeWidth={2.4} />
      </View>
      {showWordmark ? (
        <Text
          variant="h2"
          weight="700"
          style={[styles.word, { color: inverse ? '#FFFFFF' : theme.colors.text }]}
        >
          Servis<Text variant="h2" weight="700" style={{ color: theme.colors.accent }}>Aku</Text>
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  glyph: { alignItems: 'center', justifyContent: 'center' },
  word: { marginLeft: 12 },
});
