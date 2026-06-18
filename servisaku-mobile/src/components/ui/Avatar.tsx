import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  /** Show a small verified/online ring. */
  ring?: boolean;
}

const initials = (name?: string): string =>
  (name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Circular avatar with image or initials fallback. */
export function Avatar({ uri, name, size = 44, ring }: AvatarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.primarySoft,
          borderWidth: ring ? 2 : 0,
          borderColor: theme.colors.primary,
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text variant="title" weight="700" color="primary">
          {initials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
