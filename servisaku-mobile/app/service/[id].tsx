import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Clock } from 'lucide-react-native';
import type { ServiceAddOn, ServicePackage } from '@/types';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { useService, useServiceReviews } from '@/hooks/queries';
import { useCartStore } from '@/stores';
import { findServiceById } from '@/mocks';
import { formatDuration, formatRM } from '@/utils';
import {
  Badge,
  Button,
  Chip,
  Divider,
  IconButton,
  PriceTag,
  RatingStars,
  Skeleton,
  Surface,
  Text,
} from '@/components/ui';

export default function ServiceDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { tl } = useLocale();
  const { id } = useLocalSearchParams<{ id: string }>();

  const serviceQuery = useService(String(id));
  const reviews = useServiceReviews(String(id));
  const addToCart = useCartStore((s) => s.addItem);

  const service = serviceQuery.data;
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const selectedPkg: ServicePackage | undefined = useMemo(() => {
    if (!service) return undefined;
    return (
      service.packages.find((p) => p.id === selectedPkgId) ??
      service.packages.find((p) => p.recommended) ??
      service.packages[0]
    );
  }, [service, selectedPkgId]);

  const total = useMemo(() => {
    if (!service || !selectedPkg) return 0;
    const addOnTotal = service.addOns
      .filter((a) => selectedAddOns.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    return selectedPkg.price + addOnTotal;
  }, [service, selectedPkg, selectedAddOns]);

  if (serviceQuery.isPending) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={220} radius={0} />
          <Skeleton height={28} width="70%" />
          <Skeleton height={16} width="90%" />
          <Skeleton height={120} />
        </View>
      </SafeAreaView>
    );
  }

  // Resolve from the query, falling back to a direct mock lookup defensively.
  const svc = service ?? findServiceById(String(id));
  if (!svc) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Text variant="body" center style={{ marginTop: 80 }}>
          {t('errors.loadFailed')}
        </Text>
      </SafeAreaView>
    );
  }
  const toggleAddOn = (a: ServiceAddOn) =>
    setSelectedAddOns((prev) =>
      prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id],
    );

  const onBook = () => {
    if (!selectedPkg) return;
    addToCart(svc, selectedPkg, selectedAddOns, 1);
    router.push('/booking/new');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View>
          <Image source={{ uri: svc.image }} style={styles.hero} />
          <SafeAreaView edges={['top']} style={styles.heroBar}>
            <IconButton accessibilityLabel={t('common.back')} variant="surface" onPress={() => router.back()}>
              <ArrowLeft size={22} color={theme.colors.text} />
            </IconButton>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.tagsRow}>
            {svc.tags.map((tag, i) => (
              <Badge key={i} label={tl(tag)} tone="primary" />
            ))}
          </View>
          <Text variant="h1" weight="700" style={styles.title}>
            {tl(svc.name)}
          </Text>
          <View style={styles.ratingRow}>
            <RatingStars value={svc.rating} size={16} showValue reviewCount={svc.reviewCount} />
          </View>
          <Text variant="body" color="textSecondary" style={styles.desc}>
            {tl(svc.description)}
          </Text>

          {/* Packages */}
          <Text variant="h3" weight="700" style={styles.sectionTitle}>
            {t('service.selectPackage')}
          </Text>
          <View style={{ gap: 12 }}>
            {svc.packages.map((pkg) => {
              const active = selectedPkg?.id === pkg.id;
              return (
                <Pressable key={pkg.id} onPress={() => setSelectedPkgId(pkg.id)}>
                  <Surface
                    elevation={active ? 'md' : 'sm'}
                    radius="lg"
                    style={[
                      styles.pkg,
                      { borderColor: active ? theme.colors.primary : theme.colors.border, borderWidth: active ? 2 : 1 },
                    ]}
                  >
                    <View style={styles.pkgHead}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.pkgTitleRow}>
                          <Text variant="title" weight="700">
                            {tl(pkg.name)}
                          </Text>
                          {pkg.recommended ? <Badge label={t('service.recommended')} tone="success" /> : null}
                        </View>
                        <Text variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                          {tl(pkg.description)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.pkgMeta}>
                      <View style={styles.durationRow}>
                        <Clock size={14} color={theme.colors.textMuted} />
                        <Text variant="caption" color="textMuted" style={{ marginLeft: 4 }}>
                          {formatDuration(pkg.durationMinutes)}
                          {pkg.unitLabel ? ` · ${tl(pkg.unitLabel)}` : ''}
                        </Text>
                      </View>
                      <PriceTag amount={pkg.price} compareAt={pkg.compareAtPrice} size="sm" />
                    </View>
                    {active ? (
                      <View style={styles.includes}>
                        {pkg.includes.map((inc, i) => (
                          <View key={i} style={styles.includeRow}>
                            <Check size={15} color={theme.colors.primary} strokeWidth={2.5} />
                            <Text variant="caption" color="textSecondary" style={{ marginLeft: 8 }}>
                              {tl(inc)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </Surface>
                </Pressable>
              );
            })}
          </View>

          {/* Add-ons */}
          {svc.addOns.length > 0 ? (
            <>
              <Text variant="h3" weight="700" style={styles.sectionTitle}>
                {t('service.addOns')}
              </Text>
              <View style={styles.chips}>
                {svc.addOns.map((a) => (
                  <Chip
                    key={a.id}
                    label={`${tl(a.name)} · ${formatRM(a.price)}`}
                    selected={selectedAddOns.includes(a.id)}
                    onPress={() => toggleAddOn(a)}
                  />
                ))}
              </View>
            </>
          ) : null}

          {/* FAQs */}
          {svc.faqs.length > 0 ? (
            <>
              <Text variant="h3" weight="700" style={styles.sectionTitle}>
                {t('service.faqs')}
              </Text>
              <Surface elevation="sm" radius="lg" padded>
                {svc.faqs.map((faq, i) => (
                  <View key={i}>
                    {i > 0 ? <Divider style={{ marginVertical: 12 }} /> : null}
                    <Pressable
                      onPress={() => setOpenFaq(openFaq === i ? null : i)}
                      style={styles.faqHead}
                    >
                      <Text variant="bodyStrong" weight="600" style={{ flex: 1 }}>
                        {tl(faq.question)}
                      </Text>
                      {openFaq === i ? (
                        <ChevronUp size={18} color={theme.colors.textMuted} />
                      ) : (
                        <ChevronDown size={18} color={theme.colors.textMuted} />
                      )}
                    </Pressable>
                    {openFaq === i ? (
                      <Text variant="caption" color="textSecondary" style={{ marginTop: 8 }}>
                        {tl(faq.answer)}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </Surface>
            </>
          ) : null}

          {/* Reviews */}
          <Text variant="h3" weight="700" style={styles.sectionTitle}>
            {t('service.reviewsTitle')}
          </Text>
          {reviews.data?.slice(0, 3).map((rev) => (
            <Surface key={rev.id} elevation="sm" radius="lg" padded style={{ marginBottom: 10 }}>
              <View style={styles.reviewHead}>
                <Text variant="bodyStrong" weight="600">
                  {rev.authorName}
                </Text>
                <RatingStars value={rev.rating} size={13} />
              </View>
              <Text variant="caption" color="textSecondary" style={{ marginTop: 6 }}>
                {rev.comment}
              </Text>
            </Surface>
          ))}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <View style={styles.footerInner}>
          <View>
            <Text variant="caption" color="textMuted">
              {t('common.from')}
            </Text>
            <PriceTag amount={total} size="md" />
          </View>
          <Button label={t('service.bookNow')} onPress={onBook} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 240 },
  heroBar: { position: 'absolute', top: 0, left: 0, padding: 12 },
  body: { padding: 16 },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  title: { marginTop: 10 },
  ratingRow: { marginTop: 8 },
  desc: { marginTop: 12 },
  sectionTitle: { marginTop: 28, marginBottom: 12 },
  pkg: { padding: 14 },
  pkgHead: { flexDirection: 'row' },
  pkgTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  pkgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  durationRow: { flexDirection: 'row', alignItems: 'center' },
  includes: { marginTop: 14, gap: 8 },
  includeRow: { flexDirection: 'row', alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  faqHead: { flexDirection: 'row', alignItems: 'center' },
  reviewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1 },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
