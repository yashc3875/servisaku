import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerStyle?: ViewStyle;
}

/** Themed text field with label, validation error and adornment slots. */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, leftSlot, rightSlot, containerStyle, style, onFocus, onBlur, ...rest },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.inputBorder;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="callout" color="textSecondary" weight="600" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor,
            borderRadius: theme.radii.md,
          },
        ]}
      >
        {leftSlot ? <View style={styles.adornment}>{leftSlot}</View> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={theme.colors.placeholder}
          style={[styles.input, { color: theme.colors.text }, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightSlot ? <View style={styles.adornment}>{rightSlot}</View> : null}
      </View>
      {error ? (
        <Text variant="caption" color="danger" style={styles.helper}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textMuted" style={styles.helper}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: { marginBottom: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 14 },
  adornment: { justifyContent: 'center' },
  helper: { marginTop: 6 },
});
