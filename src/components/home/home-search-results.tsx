import type { Settings, Subscription } from '@/lib/db/schema';
import { FlashList } from '@shopify/flash-list';
import { GlassContainer, GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { SubscriptionRow } from '@/components/subscription-row';
import { GLASS_CARD_RADIUS } from '@/components/ui/glass-card';
import { SUBSCRIPTION_ROW_PADDING_H } from '@/lib/constants';
import { Haptic } from '@/lib/haptics';
import { useTheme } from '@/lib/hooks/use-theme';

type HomeSearchResultsProps = {
  results: Subscription[];
  settings: Settings;
  onAddFirst?: () => void;
};

function SearchRowItem({
  sub,
  settings,
  isLast,
}: {
  sub: Subscription;
  settings: Settings;
  isLast: boolean;
}) {
  const { colors } = useTheme();

  return (
    <Link href={`/subscription/${sub.id}`} asChild>
      <Link.Trigger withAppleZoom>
        <Pressable onPress={() => Haptic.Light()}>
          {({ pressed }) => (
            <GlassView
              style={{
                backgroundColor: pressed ? colors.surface : 'transparent',
                opacity: pressed ? 0.9 : 1,
              }}
            >
              <SubscriptionRow
                sub={sub}
                settings={settings}
                variant="search"
                showDivider={!isLast}
              />
            </GlassView>
          )}
        </Pressable>
      </Link.Trigger>
    </Link>
  );
}

export function HomeSearchResults({ results, settings, onAddFirst }: HomeSearchResultsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item, index }: { item: Subscription; index: number }) => (
      <SearchRowItem
        sub={item}
        settings={settings}
        isLast={index === results.length - 1}
      />
    ),
    [results.length, settings],
  );

  const keyExtractor = useCallback((item: Subscription) => item.id, []);

  if (results.length === 0) {
    return (
      <View
        style={{
          overflow: 'hidden',
          borderRadius: GLASS_CARD_RADIUS,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
        }}
      >
        <GlassContainer spacing={0} style={{ borderRadius: GLASS_CARD_RADIUS, overflow: 'hidden' }}>
          <GlassView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Pressable
              onPress={() => {
                Haptic.Light();
                onAddFirst?.();
              }}
              style={({ pressed }) => ({
                paddingHorizontal: SUBSCRIPTION_ROW_PADDING_H,
                paddingVertical: 32,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 24,
                  textAlign: 'center',
                }}
              >
                {t('home_search.no_results')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.surfaceBorder,
                }}
              >
                <Image
                  source="sf:plus.circle.fill"
                  style={{ width: 20, height: 20 }}
                  tintColor={colors.text}
                />
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {t('home_search.tap_to_add_first')}
                </Text>
              </View>
            </Pressable>
          </GlassView>
        </GlassContainer>
      </View>
    );
  }

  return (
    <View
      style={{
        overflow: 'hidden',
        borderRadius: GLASS_CARD_RADIUS,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        flex: 1,
      }}
    >
      <GlassContainer spacing={0} style={{ borderRadius: GLASS_CARD_RADIUS, overflow: 'hidden', flex: 1 }}>
        <GlassView style={{ flex: 1 }}>
          <FlashList
            data={results}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            scrollEnabled
            drawDistance={500}
          />
        </GlassView>
      </GlassContainer>
    </View>
  );
}
