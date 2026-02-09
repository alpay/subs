import type { PredefinedService } from '@/lib/data/predefined-services';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ServiceIcon } from '@/components/service-icon';
import { PREDEFINED_SERVICES } from '@/lib/data/predefined-services';
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

export default function ServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const hasQuery = searchQuery.trim().length > 0;
  const displayQuery = searchQuery.trim();

  const handleServicePress = (service: PredefinedService) => {
    router.push({
      pathname: '/(app)/subscription-form',
      params: { name: service.name, iconKey: service.iconKey },
    });
  };

  const handleAddCustomPress = () => {
    if (!displayQuery)
      return;
    router.push({
      pathname: '/(app)/subscription-form',
      params: { name: displayQuery, iconKey: 'custom' },
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
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <Stack.Screen.BackButton displayMode="minimal" />

      <Stack.Toolbar placement="bottom">
        <Stack.SearchBar
          placeholder="Search services"
          onChangeText={(event) => {
            const text = typeof event === 'string' ? event : event.nativeEvent.text;
            setSearchQuery(text);
          }}
          onCancelButtonPress={() => setSearchQuery('')}
          hideNavigationBar={false}
        />
        <Stack.Toolbar.SearchBarSlot />
      </Stack.Toolbar>

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: CONTENT_PADDING,
          paddingTop: 24,
          paddingBottom: insets.bottom + 32,
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Import options – only when no search query. Wrapper extends to edges; scroll content has padding so first/last items aren't cropped. */}
        {!hasQuery && (
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

        {/* Section label – only when no query; when query we show results from top */}
        {!hasQuery && (
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
        )}

        {/* Results grid – when query: first card is "Add [query] +", then matching services. No negative margin so left/right padding stay equal. */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: GRID_GAP,
          }}
        >
          {/* First result: Add custom with user's query + */}
          {hasQuery && (
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
          )}

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

        {hasQuery && filteredServices.length === 0 && (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: colors.textMuted }}>
              No other services match. Tap the card above to add
              {' '}
              {displayQuery}
              .
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}
