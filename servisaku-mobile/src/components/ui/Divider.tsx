import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export function Divider({ style, inset }: { style?: ViewStyle; inset?: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          height: StyleSheetHairline,
          backgroundColor: theme.colors.border,
          marginHorizontal: inset ?? 0,
        },
        style,
      ]}
    />
  );
}

const StyleSheetHairline = 1;
