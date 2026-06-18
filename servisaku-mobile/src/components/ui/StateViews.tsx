import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CloudOff } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';

/** Inline error view for failed queries, with a retry action. */
export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Retry',
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <CloudOff size={40} color={theme.colors.textMuted} />
      <Text variant="title" weight="600" center style={styles.title}>
        {message}
      </Text>
      {onRetry ? (
        <Button
          label={retryLabel}
          variant="outline"
          size="sm"
          onPress={onRetry}
          style={styles.btn}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  title: { marginTop: 12 },
  btn: { marginTop: 16 },
});
