import type { PredefinedService } from '@/features/subscriptions/predefined-services';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ModalSheet } from '@/components/modal-sheet';
import { SearchBar } from '@/components/SearchBar';
import { ServiceIcon } from '@/components/service-icon';
import { PREDEFINED_SERVICES } from '@/features/subscriptions/predefined-services';
import { useTheme } from '@/lib/hooks/use-theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_PADDING = 20;
const GRID_GAP = 14;
/** Content width = screen minus modal's horizontal padding (20 each side). */
const CONTENT_WIDTH = SCREEN_WIDTH - MODAL_PADDING * 2;
const CARD_WIDTH = (CONTENT_WIDTH - GRID_GAP) / 2;

const IMPORT_OPTIONS = [
  { id: 'notion', label: 'Import from Notion', symbol: 'doc.text' },
  { id: 'sheets', label: 'Import from Google Sheets', symbol: 'tablecells' },
  { id: 'file', label: 'Import from file', symbol: 'doc' },
  { id: 'apple', label: 'Import from Apple', symbol: 'apple.logo' },
] as const;

const IMPORT_CARD_SIZE = 88;

export default function AddSubscriptionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q)
      return PREDEFINED_SERVICES;
    return PREDEFINED_SERVICES.filter(
      s =>
        s.name.toLowerCase().includes(q)
        || s.iconKey.toLowerCase().replace(/_/g, ' ').includes(q),
    );
  }, [searchQuery]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleServicePress = (service: PredefinedService) => {
    router.push({
      pathname: '/(app)/subscription-form',
      params: { name: service.name, iconKey: service.iconKey },
    });
  };

  return (
    <ModalSheet title="Add Subscription">
      {/* Search bar – matches mockup: rounded bar, magnifying glass, "Search services" */}
      <SearchBar
        placeholder="Search services"
        onSearch={handleSearch}
        onClear={handleSearchClear}
        enableWidthAnimation={false}
        centerWhenUnfocused={false}
        tint={colors.accent}
        style={{ paddingVertical: 0 }}
        inputStyle={{ color: colors.text }}
      />

      {/* Import options – horizontal row of light grey rounded cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          marginHorizontal: -MODAL_PADDING,
          paddingHorizontal: MODAL_PADDING,
          paddingBottom: 20,
          gap: GRID_GAP,
        }}
      >
        {IMPORT_OPTIONS.map(opt => (
          <Pressable
            key={opt.id}
            style={({ pressed }) => [
              {
                width: IMPORT_CARD_SIZE,
                minWidth: IMPORT_CARD_SIZE,
                height: IMPORT_CARD_SIZE,
                borderRadius: 12,
                backgroundColor: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(118, 118, 128, 0.12)',
                borderWidth: 0,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                paddingHorizontal: 6,
                gap: 6,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Image
              source={`sf:${opt.symbol}`}
              style={{ width: 28, height: 28 }}
              tintColor={colors.text}
            />
            <Text
              numberOfLines={2}
              style={{
                fontSize: 11,
                fontWeight: '500',
                color: colors.text,
                textAlign: 'center',
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Section label – uppercase light grey */}
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.textMuted,
            letterSpacing: 0.8,
          }}
        >
          POPULAR SERVICES
        </Text>
      </View>

      {/* Predefined services – 2-column grid, dark grey rounded cards */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginHorizontal: -GRID_GAP / 2,
          gap: GRID_GAP,
        }}
      >
        {filteredServices.map(service => (
          <Pressable
            key={service.id}
            onPress={() => handleServicePress(service)}
            style={({ pressed }) => [
              {
                width: CARD_WIDTH,
                minWidth: CARD_WIDTH,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                paddingHorizontal: 8,
                borderRadius: 12,
                backgroundColor: isDark
                  ? 'rgba(58, 58, 60, 0.8)'
                  : colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.surfaceBorder,
                gap: 10,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <ServiceIcon iconKey={service.iconKey} size={48} />
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: colors.text,
                textAlign: 'center',
                maxWidth: CARD_WIDTH - 16,
              }}
            >
              {service.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {filteredServices.length === 0 && (
        <View style={{ paddingVertical: 32, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>
            No services match your search.
          </Text>
        </View>
      )}
    </ModalSheet>
  );
}
