import type { Settings, Subscription } from '@/lib/db/schema';
import { GlassContainer, GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Pill } from '@/components/pill';
import { ServiceIcon } from '@/components/service-icon';
import { GLASS_CARD_RADIUS } from '@/components/ui/glass-card';
import { Haptic } from '@/lib/haptics';
import { useTheme } from '@/lib/hooks/use-theme';
import { formatAmount } from '@/lib/utils/format';

const ROW_PADDING_H = 20;
const ROW_PADDING_V = 16;
const ICON_SIZE = 48;
const DIVIDER_INSET_LEFT = ICON_SIZE + 12 + 12; // icon + gap + align with text

type HomeSearchResultsProps = {
  results: Subscription[];
  settings: Settings;
  onAddFirst?: () => void;
};

function SearchRow({
  sub,
  settings,
  isLast,
  colors,
}: {
  sub: Subscription;
  settings: Settings;
  isLast: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const isActive = sub.status === 'active';
  const rowContent = (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: ROW_PADDING_H,
          paddingVertical: ROW_PADDING_V,
          gap: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          <ServiceIcon
            iconKey={sub.iconKey}
            iconUri={sub.iconType === 'image' ? sub.iconUri : undefined}
            size={ICON_SIZE}
          />
          <View style={{ gap: 4, flex: 1, minWidth: 0 }}>
            <Text
              style={{ fontSize: 17, fontWeight: '600', color: colors.text, letterSpacing: -0.2 }}
              selectable
              numberOfLines={1}
            >
              {sub.name}
            </Text>
            <Text
              style={{ fontSize: 13, color: colors.textMuted }}
              selectable
              numberOfLines={1}
            >
              {sub.scheduleType}
              {' · '}
              {formatAmount(sub.amount, sub.currency, settings.roundWholeNumbers)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Pill tone={isActive ? 'success' : 'neutral'}>
            {isActive ? 'Active' : sub.status}
          </Pill>
          <Image
            source="sf:chevron.right"
            style={{ width: 14, height: 14 }}
            tintColor={colors.textMuted}
          />
        </View>
      </View>
      {!isLast && (
        <View
          style={{
            height: 1,
            marginLeft: DIVIDER_INSET_LEFT,
            marginRight: ROW_PADDING_H,
            backgroundColor: colors.surfaceBorder,
            opacity: 0.6,
          }}
        />
      )}
    </>
  );

  return (
    <Link href={`/subscription/${sub.id}`} asChild>
      <Link.Trigger withAppleZoom>
        <Pressable onPress={() => Haptic.Light()}>
          {({ pressed }) => (
            <GlassView
              style={{
                flex: 1,
                backgroundColor: pressed ? colors.surface : 'transparent',
                opacity: pressed ? 0.9 : 1,
              }}
            >
              {rowContent}
            </GlassView>
          )}
        </Pressable>
      </Link.Trigger>
    </Link>
  );
}

export function HomeSearchResults({ results, settings, onAddFirst }: HomeSearchResultsProps) {
  const { colors } = useTheme();

  if (results.length === 0) {
    return (
      <View style={{ overflow: 'hidden', borderRadius: GLASS_CARD_RADIUS, borderWidth: 1, borderColor: colors.surfaceBorder, marginTop: '50%' }}>
        <GlassContainer spacing={0} style={{ borderRadius: GLASS_CARD_RADIUS, overflow: 'hidden' }}>
          <GlassView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Pressable
              onPress={() => {
                Haptic.Light();
                onAddFirst?.();
              }}
              style={({ pressed }) => ({
                paddingHorizontal: ROW_PADDING_H,
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
                No subscriptions found
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
                  Tap here to add your first
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
      }}
    >
      <GlassContainer spacing={0} style={{ borderRadius: GLASS_CARD_RADIUS, overflow: 'hidden' }}>
        {
          results.map((sub, index) => (
            <SearchRow
              key={sub.id}
              sub={sub}
              settings={settings}
              isLast={index === results.length - 1}
              colors={colors}
            />
          ))
        }
      </GlassContainer>
    </View>
  );
}
