import React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { radii } from '@/theme';

export interface SurfaceProps extends ViewProps {
  /** Elevation level mapped to the theme shadow scale. */
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  radius?: keyof typeof radii;
  padded?: boolean | number;
  /** Use the alternate surface tone. */
  alt?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** A themed card/panel surface with consistent radius + shadow. */
export function Surface({
  elevation = 'sm',
  radius = 'lg',
  padded,
  alt,
  style,
  children,
  ...rest
}: SurfaceProps) {
  const theme = useTheme();
  const padding =
    padded === true ? theme.spacing.lg : typeof padded === 'number' ? padded : 0;

  return (
    <View
      style={[
        {
          backgroundColor: alt ? theme.colors.surfaceAlt : theme.colors.surface,
          borderRadius: theme.radii[radius],
          padding,
        },
        theme.shadows[elevation],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
