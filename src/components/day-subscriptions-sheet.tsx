import type { CurrencyRates, Settings, Subscription } from '@/lib/db/schema';

import { format } from 'date-fns';
import { Image } from 'expo-image';
import { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';
import { convertCurrency, roundCurrency } from '@/lib/utils/currency';
import { formatAmount } from '@/lib/utils/format';

import { ModalSheet } from './modal-sheet';
import { ServiceIcon } from './service-icon';

type DaySubscriptionsSheetProps = {
  date: Date | null;
  subscriptions: Subscription[];
  settings: Settings;
  rates: CurrencyRates;
  onClose: () => void;
  onAddPress: () => void;
  onSubscriptionPress: (subscriptionId: string) => void;
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
  const { colors, isDark } = useTheme();

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

  const handleSubscriptionPress = useCallback(
    (subscriptionId: string) => {
      onSubscriptionPress(subscriptionId);
    },
    [onSubscriptionPress],
  );

  if (!date) {
    return null;
  }

  const headerDate = format(date, 'd MMMM yyyy');

  return (
    <ModalSheet
      title="Subscriptions"
      closeButtonTitle="Close"
      topRightActionBar={(
        <Text style={{ fontSize: 12, color: colors.textMuted, fontVariant: ['tabular-nums'] }} selectable>
          {headerDate}
        </Text>
      )}
      onClose={onClose}
      isVisible={Boolean(date)}
      snapPoints={['90%']}
      enableDynamicSizing
      bottomScrollSpacer={24}
    >
      <View
        style={{
          borderRadius: 26,
          borderCurve: 'continuous',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 20px 30px rgba(0, 0, 0, 0.35)'
            : '0 18px 28px rgba(15, 23, 42, 0.12)',
        }}
      >
        {subscriptions.map((sub, index) => (
          <View key={sub.id}>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleSubscriptionPress(sub.id)}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  gap: 12,
                },
                pressed ? { opacity: 0.85 } : null,
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <ServiceIcon iconKey={sub.iconKey} size={42} />
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

            {index !== subscriptions.length - 1 && (
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
          </View>
        ))}

        {subscriptions.length > 0 && (
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

        <Pressable
          accessibilityRole="button"
          onPress={handleAddPress}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
            },
            pressed ? { opacity: 0.85 } : null,
          ]}
        >
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
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }} selectable>
            Add Subscription
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          borderRadius: 26,
          borderCurve: 'continuous',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
          boxShadow: isDark
            ? '0 20px 30px rgba(0, 0, 0, 0.35)'
            : '0 18px 28px rgba(15, 23, 42, 0.12)',
        }}
      >
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
      </View>
    </ModalSheet>
  );
}
