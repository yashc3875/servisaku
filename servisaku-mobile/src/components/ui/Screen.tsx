import React from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

export interface ScreenProps {
  children: React.ReactNode;
  /** Wrap content in a ScrollView. */
  scroll?: boolean;
  /** Horizontal padding applied to content. */
  padded?: boolean;
  edges?: readonly Edge[];
  /** Background tone. */
  tone?: 'background' | 'surface';
  contentStyle?: ViewStyle;
  /** Extra bottom padding for fixed footers. */
  footerSpace?: number;
}

/** Safe-area screen wrapper with optional scrolling + consistent padding. */
export function Screen({
  children,
  scroll,
  padded = true,
  edges = ['top'],
  tone = 'background',
  contentStyle,
  footerSpace = 0,
}: ScreenProps) {
  const theme = useTheme();
  const bg = theme.colors[tone];
  const padding = padded ? theme.spacing.lg : 0;

  const inner = (
    <View
      style={[
        { paddingHorizontal: padding, paddingBottom: footerSpace },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={edges}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{inner}</View>
      )}
    </SafeAreaView>
  );
}
