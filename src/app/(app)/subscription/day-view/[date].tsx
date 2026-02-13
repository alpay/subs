import { format, isSameDay, isValid, parseISO, startOfMonth } from 'date-fns';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { InteractionManager, Pressable, Text, View } from 'react-native';

import { NativeSheet } from '@/components/native-sheet';
import { ServiceIcon } from '@/components/service-icon';
import { GlassCard } from '@/components/ui/glass-card';
import { Haptic } from '@/lib/haptics';
import { usePremiumGuard } from '@/lib/hooks/use-premium-guard';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCurrencyRatesStore, useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { convertCurrency, roundCurrency } from '@/lib/utils/currency';
import { formatAmount } from '@/lib/utils/format';
import { getPaymentDatesForMonth } from '@/lib/utils/subscription-dates';

function parseSelectedDay(dateParam: unknown): Date {
  if (typeof dateParam !== 'string' || !dateParam)
    return new Date();
  const parsed = parseISO(dateParam);
  return isValid(parsed) ? parsed : new Date();
}

type Params = {
  date?: string;
};

export default function SubscriptionDayViewScreen() {
  const params = useLocalSearchParams<Params>();

  const { subscriptions } = useSubscriptionsStore();
  const router = useRouter();
  const { canAdd } = usePremiumGuard();

  const handleAddSubscription = () => {
    Haptic.Light();
    router.dismiss();
    const startDate = typeof params.date === 'string' ? params.date : format(selectedDay, 'yyyy-MM-dd');
    InteractionManager.runAfterInteractions(() => {
      if (canAdd)
        router.push({ pathname: '/(app)/services', params: { startDate } });
      else router.push('/(app)/paywall');
    });
  };
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();
  const { colors } = useTheme();

  const selectedDay = parseSelectedDay(params.date);

  const daySubscriptions = useMemo(() => {
    const monthStart = startOfMonth(selectedDay);
    return subscriptions.filter((sub) => {
      if (sub.status !== 'active') {
        return false;
      }
      return getPaymentDatesForMonth(sub, monthStart).some(d => isSameDay(d, selectedDay));
    });
  }, [selectedDay, subscriptions]);

  const total = useMemo(() => {
    const sum = daySubscriptions.reduce((acc, sub) => {
      const converted = convertCurrency({
        amount: sub.amount,
        from: sub.currency,
        to: settings.mainCurrency,
        rates,
      });
      return acc + converted;
    }, 0);
    return roundCurrency(sum, settings.roundWholeNumbers);
  }, [daySubscriptions, settings.mainCurrency, settings.roundWholeNumbers, rates]);

  const headerDate = useMemo(
    () => format(selectedDay, 'd MMMM yyyy'),
    [selectedDay],
  );

  return (
    <NativeSheet title="Subscriptions" subtitle={headerDate} showCloseIcon>
      <View style={{ gap: 8 }}>
        {daySubscriptions.map(sub => (
          <GlassCard key={sub.id}>
            <Link
              href={{ pathname: '/subscription/[id]', params: { id: sub.id } }}
              replace
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
                onPress={() => Haptic.Light()}
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
          <Pressable
            accessibilityRole="button"
            onPress={handleAddSubscription}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                gap: 12,
              },
              pressed ? { opacity: 0.85 } : null,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
                Add new subscription
              </Text>
            </View>
          </Pressable>
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
      </View>
    </NativeSheet>
  );
}
