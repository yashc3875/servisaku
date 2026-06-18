import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import type { Locale } from '@/types';
import { useTheme } from '@/theme';
import { useLocaleStore } from '@/stores';
import { Button, Screen, Surface, Text } from '@/components/ui';
import { Logo } from '@/components/brand/Logo';

const OPTIONS: { value: Locale; label: string; native: string; flag: string }[] = [
  { value: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { value: 'ms', label: 'Bahasa Malaysia', native: 'Bahasa Malaysia', flag: '🇲🇾' },
];

/** First-launch language selection (EN / BM). */
export default function LanguageScreen() {
  const theme = useTheme();
  const router = useRouter();
  const setLocale = useLocaleStore((s) => s.setLocale);
  const current = useLocaleStore((s) => s.locale);
  const [selected, setSelected] = useState<Locale>(current);

  const onContinue = () => {
    setLocale(selected);
    router.replace('/(onboarding)/walkthrough');
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Logo size={48} showWordmark />
      </View>
      <Text variant="h1" weight="700" style={styles.title}>
        Choose your language
      </Text>
      <Text variant="body" color="textSecondary" style={styles.subtitle}>
        Pilih bahasa anda
      </Text>

      <View style={styles.options}>
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <Pressable key={opt.value} onPress={() => setSelected(opt.value)}>
              <Surface
                elevation={isActive ? 'md' : 'sm'}
                radius="lg"
                style={[
                  styles.option,
                  {
                    borderColor: isActive ? theme.colors.primary : theme.colors.border,
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
              >
                <Text variant="h2">{opt.flag}</Text>
                <View style={styles.optionText}>
                  <Text variant="title" weight="600">
                    {opt.label}
                  </Text>
                  <Text variant="caption" color="textMuted">
                    {opt.native}
                  </Text>
                </View>
                {isActive ? (
                  <View style={[styles.check, { backgroundColor: theme.colors.primary }]}>
                    <Check size={16} color={theme.colors.onPrimary} strokeWidth={3} />
                  </View>
                ) : (
                  <View style={[styles.radio, { borderColor: theme.colors.border }]} />
                )}
              </Surface>
            </Pressable>
          );
        })}
      </View>

      <Button label="Continue" fullWidth onPress={onContinue} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { marginBottom: 4 },
  subtitle: { marginBottom: 28 },
  options: { gap: 14 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  optionText: { flex: 1, marginLeft: 16 },
  check: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2 },
  cta: { marginTop: 36 },
});
