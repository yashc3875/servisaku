import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/theme';
import type { TypographyVariant } from '@/theme';
import type { ThemeColors } from '@/theme';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  /** Semantic color token; defaults to primary text. */
  color?: keyof ThemeColors;
  center?: boolean;
  /** Override font weight independently of the variant. */
  weight?: '400' | '500' | '600' | '700';
}

/**
 * The single text primitive. Always use this instead of RN's <Text> so type
 * scale, color tokens and dark mode stay consistent.
 */
export function Text({
  variant = 'body',
  color = 'text',
  center,
  weight,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const typeStyle = theme.typography[variant];

  return (
    <RNText
      style={[
        {
          fontSize: typeStyle.fontSize,
          lineHeight: typeStyle.lineHeight,
          fontWeight: (weight ?? typeStyle.fontWeight) as '400',
          color: theme.colors[color],
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}
      {...rest}
    />
  );
}
