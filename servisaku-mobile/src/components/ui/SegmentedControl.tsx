import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export interface SegmentOption {
  value: string;
  label: string;
  /** Optional count badge, e.g. for booking tabs. */
  count?: number;
}

export interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

/** Pill-style segmented tab control (used for booking filters etc.). */
export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.track,
        { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radii.pill },
      ]}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[
              styles.segment,
              {
                backgroundColor: active ? theme.colors.surface : 'transparent',
                borderRadius: theme.radii.pill,
              },
              active ? theme.shadows.sm : null,
            ]}
          >
            <Text
              variant="callout"
              weight="600"
              style={{ color: active ? theme.colors.text : theme.colors.textMuted }}
            >
              {opt.label}
              {opt.count != null ? ` (${opt.count})` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 4 },
  segment: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
