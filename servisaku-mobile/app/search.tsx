import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, X } from 'lucide-react-native';
import type { ServiceListItem } from '@/types';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { useSearch } from '@/hooks/queries';
import { mockServices } from '@/mocks';
import { ServiceCard } from '@/components/domain';
import { Chip, EmptyState, IconButton, Surface, Text } from '@/components/ui';

const SUGGESTIONS = ['Cleaning', 'Aircond', 'Massage', 'Plumbing', 'Car wash'];

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { tl } = useLocale();
  const [query, setQuery] = useState('');

  const search = useSearch(query);
  const results = search.data ?? [];
  const hasQuery = query.trim().length > 0;

  const openService = (s: ServiceListItem) =>
    router.push({ pathname: '/service/[id]', params: { id: s.id } });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.bar}>
        <Surface elevation="sm" radius="lg" style={styles.field}>
          <SearchIcon size={20} color={theme.colors.textMuted} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.input, { color: theme.colors.text }]}
            returnKeyType="search"
          />
          {hasQuery ? (
            <IconButton accessibilityLabel="Clear" size={28} onPress={() => setQuery('')}>
              <X size={18} color={theme.colors.textMuted} />
            </IconButton>
          ) : null}
        </Surface>
        <Text
          variant="callout"
          weight="600"
          style={{ color: theme.colors.primary, marginLeft: 12 }}
          onPress={() => router.back()}
        >
          {t('common.cancel')}
        </Text>
      </View>

      {!hasQuery ? (
        <View style={styles.suggest}>
          <Text variant="caption" color="textMuted" weight="600" style={styles.suggestLabel}>
            POPULAR SEARCHES
          </Text>
          <View style={styles.chips}>
            {SUGGESTIONS.map((s) => (
              <Chip key={s} label={s} onPress={() => setQuery(s)} />
            ))}
          </View>
          <Text variant="caption" color="textMuted" weight="600" style={[styles.suggestLabel, { marginTop: 24 }]}>
            BROWSE ALL
          </Text>
          <View style={{ gap: 12, marginTop: 12 }}>
            {mockServices.slice(0, 4).map((svc) => (
              <ServiceCard key={svc.id} service={svc} layout="wide" onPress={openService} />
            ))}
          </View>
        </View>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon size={40} color={theme.colors.primary} />}
          title={t('common.noResults')}
          body={`"${query}"`}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListHeaderComponent={
            <Text variant="caption" color="textMuted" style={{ marginBottom: 12 }}>
              {results.length} {tl({ en: 'results', ms: 'hasil' })}
            </Text>
          }
          renderItem={({ item }) => <ServiceCard service={item} layout="wide" onPress={openService} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 48 },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  suggest: { padding: 16 },
  suggestLabel: { letterSpacing: 0.5, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  list: { padding: 16 },
});
