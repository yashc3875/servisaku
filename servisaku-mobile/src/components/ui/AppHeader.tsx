import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { IconButton } from './IconButton';
import { Text } from './Text';

export interface AppHeaderProps {
  title?: string;
  /** Element rendered on the right (e.g. an action icon). */
  right?: React.ReactNode;
  onBack?: () => void;
  /** Hide the back button (for root-of-stack screens). */
  hideBack?: boolean;
}

/** Standard stack-screen header with a back affordance and centered title. */
export function AppHeader({ title, right, onBack, hideBack }: AppHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.side}>
        {!hideBack ? (
          <IconButton
            accessibilityLabel="Back"
            onPress={onBack ?? (() => router.back())}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </IconButton>
        ) : null}
      </View>
      <Text variant="title" weight="700" numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 8,
  },
  side: { width: 56, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
});
