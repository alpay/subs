import type { CurrencyRates, Settings, Subscription } from '@/lib/db/schema';

import { format } from 'date-fns';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';
import { convertCurrency, roundCurrency } from '@/lib/utils/currency';
import { formatAmount } from '@/lib/utils/format';

import { ModalSheet } from './modal-sheet';
import { ServiceIcon } from './service-icon';
import { GlassCard } from './ui/glass-card';

type DaySubscriptionsSheetProps = {
  date: Date | null;
  subscriptions: Subscription[];
  settings: Settings;
  rates: CurrencyRates;
  onClose: () => void;
  onAddPress: () => void;
  onSubscriptionPress: () => void;
};

export function DaySubscriptionsSheet({
  date,
  subscriptions,
  settings,
  rates,
  onClose,
  onAddPress,
  onSubscriptionPress,
}: DaySubscriptionsSheetProps) {
  const { colors } = useTheme();

  const total = useMemo(() => {
    const sum = subscriptions.reduce((acc, sub) => {
      const converted = convertCurrency({
        amount: sub.amount,
        from: sub.currency,
        to: settings.mainCurrency,
        rates,
      });
      return acc + converted;
    }, 0);
    return roundCurrency(sum, settings.roundWholeNumbers);
  }, [subscriptions, settings.mainCurrency, settings.roundWholeNumbers, rates]);

  const handleAddPress = useCallback(() => {
    onAddPress();
  }, [onAddPress]);

  if (!date) {
    return null;
  }

  const headerDate = format(date, 'd MMMM yyyy');

  return (
    <ModalSheet
      title={headerDate}
      closeButtonTitle="Close"
      onClose={onClose}
      isVisible={Boolean(date)}
      snapPoints={['90%']}
      enableDynamicSizing
      bottomScrollSpacer={24}
      contentContainerStyle={{ gap: 8 }}
    >
      {subscriptions.map(sub => (
        <GlassCard key={sub.id}>
          <Link
            href={{ pathname: '/subscription/[id]', params: { id: sub.id } }}
            asChild
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: 12,
            }}
          >
            <Pressable
              accessibilityRole="button"
              onPress={onSubscriptionPress}
              style={({ pressed }) => [
                pressed ? { opacity: 0.85 } : null,
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <Link.AppleZoom>
                  <ServiceIcon
                    iconKey={sub.iconKey}
                    iconUri={sub.iconType === 'image' ? sub.iconUri : undefined}
                    size={42}
                  />
                </Link.AppleZoom>
                <View style={{ gap: 4, flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }} selectable>
                    {sub.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                    {sub.scheduleType.charAt(0).toUpperCase() + sub.scheduleType.slice(1)}
                    {' '}
                    ·
                    {' '}
                    {formatAmount(sub.amount, sub.currency, settings.roundWholeNumbers)}
                  </Text>
                </View>
              </View>
              <Image
                source="sf:chevron.right"
                style={{ width: 14, height: 14 }}
                tintColor={colors.textMuted}
              />
            </Pressable>
          </Link>
        </GlassCard>
      ))}

      <GlassCard>
        <Link
          href="/(app)/services"
          asChild
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 12,
          }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={handleAddPress}
            style={({ pressed }) => [
              pressed ? { opacity: 0.85 } : null,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Link.AppleZoom>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderCurve: 'continuous',
                    backgroundColor: colors.surfaceMuted,
                    borderWidth: 1,
                    borderColor: colors.surfaceBorder,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image source="sf:plus" style={{ width: 16, height: 16 }} tintColor={colors.text} />
                </View>
              </Link.AppleZoom>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }} selectable>
                Add new subscription
              </Text>
            </View>
          </Pressable>
        </Link>
      </GlassCard>

      <GlassCard style={{ marginTop: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            paddingVertical: 14,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
            Total
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: colors.text,
              fontVariant: ['tabular-nums'],
            }}
            selectable
          >
            {formatAmount(total, settings.mainCurrency, settings.roundWholeNumbers)}
          </Text>
        </View>
      </GlassCard>
    </ModalSheet>
  );
}
