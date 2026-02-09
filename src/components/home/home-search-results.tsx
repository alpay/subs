import type { Settings, Subscription } from '@/lib/db/schema';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Pill } from '@/components/pill';
import { ServiceIcon } from '@/components/service-icon';
import { useTheme } from '@/lib/hooks/use-theme';
import { formatAmount } from '@/lib/utils/format';

type HomeSearchResultsProps = {
  results: Subscription[];
  settings: Settings;
};

export function HomeSearchResults({ results, settings }: HomeSearchResultsProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        borderRadius: 24,
        borderCurve: 'continuous',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 20px 32px rgba(0, 0, 0, 0.35)'
          : '0 20px 32px rgba(15, 23, 42, 0.12)',
      }}
    >
      {results.length === 0 && (
        <View style={{ padding: 18 }}>
          <Text style={{ color: colors.textMuted }} selectable>
            No subscriptions found.
          </Text>
        </View>
      )}

      {results.map((sub, index) => {
        const isActive = sub.status === 'active';
        const isLast = index === results.length - 1;

        return (
          <Link key={sub.id} href={`/subscription/${sub.id}`} asChild>
            <Link.Trigger withAppleZoom>
              <Pressable>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <ServiceIcon iconKey={sub.iconKey} size={44} />
                    <View style={{ gap: 4, flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }} selectable>
                        {sub.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                        {sub.scheduleType}
                        {' '}
                        ·
                        {formatAmount(sub.amount, sub.currency, settings.roundWholeNumbers)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Pill tone={isActive ? 'success' : 'neutral'}>{sub.status}</Pill>
                    <Image
                      source="sf:chevron.right"
                      style={{ width: 12, height: 12 }}
                      tintColor={colors.textMuted}
                    />
                  </View>
                </View>
                {!isLast && (
                  <View
                style={{
                  height: 1,
                  marginLeft: 16,
                  marginRight: 16,
                  backgroundColor: colors.surfaceBorder,
                  opacity: 0.7,
                }}
              />
                )}
              </Pressable>
            </Link.Trigger>
          </Link>
        );
      })}
    </View>
  );
}
