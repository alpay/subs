import type { PredefinedService } from '@/lib/data/predefined-services';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButtonWithHaptic } from '@/components/back-button-with-haptic';
import { ServiceIcon } from '@/components/service-icon';
import { getLogoUrl, searchBrands } from '@/lib/api/brandfetch';
import { PREDEFINED_SERVICES } from '@/lib/data/predefined-services';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import { Haptic } from '@/lib/haptics';
import { usePremiumGuard } from '@/lib/hooks/use-premium-guard';
import { useTheme } from '@/lib/hooks/use-theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_PADDING = 20;
const GRID_GAP = 14;
/** Content width = screen minus horizontal padding (20 each side). */
const CONTENT_WIDTH = SCREEN_WIDTH - CONTENT_PADDING * 2;
const CARD_WIDTH = (CONTENT_WIDTH - GRID_GAP) / 2;

const IMPORT_OPTIONS = [
  { id: 'notion', label: 'Import from Notion', symbol: 'doc.text' },
  { id: 'sheets', label: 'Import from Google Sheets', symbol: 'tablecells' },
  { id: 'file', label: 'Import from file', symbol: 'doc' },
  { id: 'apple', label: 'Import from Apple', symbol: 'apple.logo' },
] as const;

const IMPORT_CARD_SIZE = 88;

const DEBOUNCE_MS = 400;

export default function ServicesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ startDate?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { canAdd, countLabel, isPremium, showPaywall } = usePremiumGuard();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const startDate = typeof params.startDate === 'string' ? params.startDate : undefined;

  useEffect(() => {
    if (!canAdd)
      router.replace('/(app)/paywall');
  }, [canAdd, router]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: brandResults = [], isFetching: isBrandSearching } = useQuery({
    queryKey: ['brandfetch', debouncedQuery],
    queryFn: () => searchBrands(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
  });

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

  const hasQuery = searchQuery.trim().length > 0;
  const displayQuery = searchQuery.trim();

  const handleServicePress = (service: PredefinedService) => {
    Haptic.Light();
    router.push({
      pathname: '/(app)/subscription/add',
      params: { name: service.name, iconKey: service.iconKey, ...(startDate && { startDate }) },
    });
  };

  const handleAddCustomPress = () => {
    if (!displayQuery)
      return;
    Haptic.Light();
    router.push({
      pathname: '/(app)/subscription/add',
      params: { name: displayQuery, iconKey: 'custom', ...(startDate && { startDate }) },
    });
  };

  const handleBrandSelect = (name: string, domain: string) => {
    Haptic.Light();
    const logoUrl = getLogoUrl(domain);
    router.push({
      pathname: '/(app)/subscription/add',
      params: { name, iconKey: 'custom', iconUri: logoUrl, ...(startDate && { startDate }) },
    });
  };

  const cardStyle = (pressed: boolean) => [
    {
      width: CARD_WIDTH,
      minWidth: CARD_WIDTH,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
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
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Services',
          headerTitleStyle: { color: colors.text },

          headerLeft: () => <BackButtonWithHaptic displayMode="minimal" />,
          headerRight: () => (isPremium
            ? undefined
            : (
                <Pressable
                  onPress={() => {
                    Haptic.Light();
                    showPaywall();
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.text,
                    }}
                  >
                    {countLabel}
                  </Text>
                </Pressable>
              )),
        }}
      />

      <Stack.Toolbar placement="bottom">
        <Stack.SearchBar
          placeholder="Search services"
          onChangeText={(event) => {
            const text = typeof event === 'string' ? event : event.nativeEvent.text;
            setSearchQuery(text);
          }}
          onCancelButtonPress={() => {
            Haptic.Light();
            setSearchQuery('');
          }}
          hideNavigationBar={false}
        />
        <Stack.Toolbar.SearchBarSlot />
      </Stack.Toolbar>

      <Link.AppleZoomTarget>
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={{
            paddingHorizontal: CONTENT_PADDING,
            paddingTop: 32,
            paddingBottom: insets.bottom + 32,
          }}
          contentInsetAdjustmentBehavior="automatic"
        >
          {/* Import options – only when no search query. Hidden when FEATURE_FLAGS.hideImport is true. */}
          {!hasQuery && !FEATURE_FLAGS.hideImport && (
            <View style={{ marginHorizontal: -CONTENT_PADDING }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: CONTENT_PADDING,
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
            </View>
          )}

          {/* When searching: only "Add custom" at top + search results. No popular services. */}
          {hasQuery && (
            <>
              {/* Search results: "Add [query] +" as first option, then Brandfetch results */}
              {debouncedQuery.length >= 2 && (
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: colors.textMuted,
                      letterSpacing: 0.8,
                      marginBottom: 10,
                    }}
                  >
                    SEARCH RESULTS
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP }}>
                    {/* First option: Add custom with user's query + */}
                    <Pressable
                      onPress={handleAddCustomPress}
                      style={({ pressed }) => cardStyle(pressed)}
                    >
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(118, 118, 128, 0.12)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: colors.surfaceBorder,
                          borderStyle: 'dashed',
                        }}
                      >
                        <SymbolView
                          name="plus"
                          size={24}
                          tintColor={colors.textMuted}
                        />
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 13,
                            fontWeight: '500',
                            color: colors.text,
                            textAlign: 'center',
                            maxWidth: CARD_WIDTH - 24,
                          }}
                        >
                          {displayQuery}
                        </Text>
                        <SymbolView name="plus" size={12} tintColor={colors.textMuted} />
                      </View>
                    </Pressable>
                    {isBrandSearching && brandResults.length === 0 && (
                      <View style={[cardStyle(false), { justifyContent: 'center', minHeight: 100 }]}>
                        <ActivityIndicator size="small" color={colors.textMuted} />
                      </View>
                    )}
                    {brandResults.map(brand => (
                      <Pressable
                        key={brand.brandId}
                        onPress={() => handleBrandSelect(brand.name ?? brand.domain, brand.domain)}
                        style={({ pressed }) => cardStyle(pressed)}
                      >
                        <ServiceIcon
                          iconKey="custom"
                          iconUri={getLogoUrl(brand.domain)}
                          size={48}
                        />
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
                          {brand.name ?? brand.domain}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {debouncedQuery.length >= 2 && !isBrandSearching && brandResults.length === 0 && (
                <Text style={{ fontSize: 14, color: colors.textMuted }}>
                  No brands found. Tap the card above to add
                  {' '}
                  {displayQuery}
                  {' '}
                  as a custom service.
                </Text>
              )}
            </>
          )}

          {/* When not searching: Popular services grid */}
          {!hasQuery && (
            <>
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
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP }}>
                {filteredServices.map(service => (
                  <Pressable
                    key={service.id}
                    onPress={() => handleServicePress(service)}
                    style={({ pressed }) => cardStyle(pressed)}
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
            </>
          )}
        </ScrollView>
      </Link.AppleZoomTarget>
    </>
  );
}
