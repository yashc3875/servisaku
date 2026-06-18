import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Friendly empty/zero-data placeholder with optional CTA. */
export function EmptyState({ icon, title, body, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      {icon ? (
        <View
          style={[styles.iconWrap, { backgroundColor: theme.colors.primarySoft }]}
        >
          {icon}
        </View>
      ) : null}
      <Text variant="h3" weight="700" center>
        {title}
      </Text>
      {body ? (
        <Text variant="body" color="textSecondary" center style={styles.body}>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  body: { marginTop: 8 },
  action: { marginTop: 24 },
});
