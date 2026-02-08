import { useRouter } from 'expo-router';
import { useToast } from 'heroui-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ModalSheet } from '@/components/modal-sheet';
import { SearchBar } from '@/components/SearchBar';
import { useTheme } from '@/lib/hooks/use-theme';
import { CURRENCIES, type CurrencyEntry } from '@/lib/data/currencies';
import { useSettingsStore } from '@/lib/stores';

function matchesSearch(entry: CurrencyEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    entry.code.toLowerCase().includes(q) ||
    entry.name.toLowerCase().includes(q)
  );
}

type Section = { title: string; data: CurrencyEntry[] };

export default function CurrencyScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const { colors } = useTheme();
  const { settings, update } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const mainCurrency = settings.mainCurrency;
  const favoriteCurrencies = settings.favoriteCurrencies ?? [];

  const sections = useMemo((): Section[] => {
    const filtered = CURRENCIES.filter(c => matchesSearch(c, searchQuery));
    const favorites = filtered.filter(c => favoriteCurrencies.includes(c.code));
    const all = filtered;
    const result: Section[] = [];
    if (favorites.length > 0) {
      result.push({ title: 'FAVORITES', data: favorites });
    }
    result.push({ title: 'ALL CURRENCIES', data: all });
    return result;
  }, [searchQuery, favoriteCurrencies]);

  const handleSave = useCallback(() => {
    update({ mainCurrency });
    toast.show(`Default currency set to ${mainCurrency}`);
    router.back();
  }, [mainCurrency, update, toast, router]);

  const setDefault = useCallback(
    (code: string) => {
      update({ mainCurrency: code });
    },
    [update],
  );

  const toggleFavorite = useCallback(
    (code: string) => {
      const set = new Set(favoriteCurrencies);
      if (set.has(code)) {
        set.delete(code);
      } else {
        set.add(code);
      }
      update({ favoriteCurrencies: Array.from(set) });
    },
    [favoriteCurrencies, update],
  );

  return (
    <ModalSheet
      title="Select Currency"
      closeButtonTitle="Close"
      right={
        <Pressable
          onPress={handleSave}
          hitSlop={10}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.accent,
            }}
          >
            Done
          </Text>
        </Pressable>
      }
      contentContainerStyle={{ paddingHorizontal: 20, gap: 0 }}
    >
      <View style={{ marginBottom: 8 }}>
        <SearchBar
          placeholder="Search"
          onSearch={setSearchQuery}
          onClear={() => setSearchQuery('')}
          enableWidthAnimation={false}
        />
      </View>
      {sections.map(section => (
        <View
          key={section.title}
          style={{
            marginBottom: 8,
            paddingTop: section.title === 'ALL CURRENCIES' ? 16 : 0,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: colors.textMuted,
              letterSpacing: 0.5,
              marginBottom: 8,
            }}
          >
            {section.title}
          </Text>
          {section.data.map(entry => (
            <CurrencyRow
              key={entry.code}
              entry={entry}
              isDefault={mainCurrency === entry.code}
              isFavorite={favoriteCurrencies.includes(entry.code)}
              onSelect={() => setDefault(entry.code)}
              onToggleFavorite={() => toggleFavorite(entry.code)}
              colors={colors}
            />
          ))}
        </View>
      ))}
    </ModalSheet>
  );
}

type CurrencyRowProps = {
  entry: CurrencyEntry;
  isDefault: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  colors: Record<string, string>;
};

function CurrencyRow({
  entry,
  isDefault,
  isFavorite,
  onSelect,
  onToggleFavorite,
  colors,
}: CurrencyRowProps) {
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingRight: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.surfaceBorder,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Pressable
        onPress={e => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        hitSlop={8}
        style={{ padding: 4, marginRight: 12 }}
      >
        <SymbolView
          name={isFavorite ? 'heart.fill' : 'heart'}
          size={22}
          tintColor={isFavorite ? colors.accent : colors.textMuted}
        />
      </Pressable>
      <Text style={{ fontSize: 24, marginRight: 12 }}>{entry.flag}</Text>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            color: colors.text,
          }}
          numberOfLines={1}
        >
          {entry.name} ({entry.code})
        </Text>
      </View>
      {isDefault && (
        <SymbolView
          name="checkmark"
          size={20}
          tintColor={colors.accent}
        />
      )}
    </Pressable>
  );
}
