import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Tag, MapPin, type LucideProps } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { useUIStore } from '@/stores';
import { Button, Screen, Text } from '@/components/ui';

const { width } = Dimensions.get('window');

interface Slide {
  key: string;
  icon: React.ComponentType<LucideProps>;
  titleKey: string;
  bodyKey: string;
}

const SLIDES: Slide[] = [
  { key: '1', icon: ShieldCheck, titleKey: 'onboarding.slide1Title', bodyKey: 'onboarding.slide1Body' },
  { key: '2', icon: Tag, titleKey: 'onboarding.slide2Title', bodyKey: 'onboarding.slide2Body' },
  { key: '3', icon: MapPin, titleKey: 'onboarding.slide3Title', bodyKey: 'onboarding.slide3Body' },
];

/** Three-slide onboarding carousel ending in "Get started". */
export default function WalkthroughScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const setOnboarded = useUIStore((s) => s.setOnboarded);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const finish = () => {
    setOnboarded(true);
    router.replace('/(auth)/login');
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      finish();
    }
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <View style={styles.skipRow}>
        <Button label={t('common.skip')} variant="ghost" size="sm" onPress={finish} />
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <View style={[styles.slide, { width }]}>
              <View
                style={[styles.iconWrap, { backgroundColor: theme.colors.primarySoft }]}
              >
                <Icon size={64} color={theme.colors.primary} strokeWidth={1.8} />
              </View>
              <Text variant="h1" weight="700" center style={styles.title}>
                {t(item.titleKey)}
              </Text>
              <Text variant="body" color="textSecondary" center style={styles.body}>
                {t(item.bodyKey)}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={s.key}
              style={[
                styles.dot,
                {
                  width: i === index ? 22 : 8,
                  backgroundColor: i === index ? theme.colors.primary : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
        <Button
          label={isLast ? t('onboarding.getStarted') : t('common.next')}
          fullWidth
          onPress={next}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  skipRow: { alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 8 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  iconWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: { marginBottom: 12 },
  body: { paddingHorizontal: 8 },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4 },
});
