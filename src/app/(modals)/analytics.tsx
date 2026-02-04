import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DonutChart from '@/components/subscriptions/donut-chart';
import { Pressable, ScrollView, Select, Text, View } from '@/components/ui';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCategoriesStore, useCurrencyRatesStore, useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { convertCurrency, roundCurrency } from '@/lib/utils/currency';
import { calculateAverageMonthly, calculateYearlyForecast } from '@/lib/utils/totals';

export default function AnalyticsScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();
  const { subscriptions } = useSubscriptionsStore();
  const { categories } = useCategoriesStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();
  const { top } = useSafeAreaInsets();
  const [year] = useState(() => new Date().getFullYear());

  const segments = useMemo(() => {
    const activeSubs = subscriptions.filter(sub => sub.status === 'active');
    const byCategory = categories.map((cat) => {
      const total = activeSubs
        .filter(sub => sub.categoryId === cat.id)
        .reduce((sum, sub) => {
          const yearly = sub.amount * 12;
          const converted = convertCurrency({
            amount: yearly,
            from: sub.currency,
            to: settings.mainCurrency,
            rates,
          });
          return sum + converted;
        }, 0);
      return {
        label: cat.name,
        value: total,
        color: cat.color,
      };
    }).filter(item => item.value > 0);

    return byCategory;
  }, [subscriptions, categories, settings, rates]);

  const yearlyForecast = useMemo(
    () => calculateYearlyForecast({ subscriptions, settings, rates }),
    [subscriptions, settings, rates],
  );
  const averageMonthly = useMemo(
    () => calculateAverageMonthly({ subscriptions, settings, rates }),
    [subscriptions, settings, rates],
  );

  const activeCount = subscriptions.filter(sub => sub.status === 'active').length;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background, paddingTop: top }}>
      <View className="px-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-base" style={{ color: colors.primary }}>
              Close
            </Text>
          </Pressable>
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            Analytics
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View className="mt-6 flex-row items-center justify-between">
          <Select
            value={String(year)}
            options={[{ label: String(year), value: String(year) }]}
            onSelect={() => {}}
          />
          <Select
            value="category"
            options={[{ label: 'Category', value: 'category' }]}
            onSelect={() => {}}
          />
        </View>

        <View className="mt-8 items-center">
          {segments.length === 0
            ? (
                <View className="items-center rounded-3xl px-6 py-8" style={{ backgroundColor: colors.card }}>
                  <Text className="text-base font-semibold" style={{ color: colors.text }}>
                    No analytics yet
                  </Text>
                  <Text className="mt-2 text-sm" style={{ color: colors.secondaryText }}>
                    Add subscriptions to see category breakdowns.
                  </Text>
                </View>
              )
            : (
                <>
                  <DonutChart
                    segments={segments}
                    centerLabel={segments[0]?.label ?? 'Categories'}
                    centerValue={`${roundCurrency(segments[0]?.value ?? 0, settings.roundWholeNumbers).toFixed(settings.roundWholeNumbers ? 0 : 2)} ${settings.mainCurrency}`}
                  />
                  <Text className="mt-4 text-sm" style={{ color: colors.secondaryText }}>
                    You have
                    {' '}
                    {activeCount}
                    {' '}
                    active subscriptions
                  </Text>
                </>
              )}
        </View>

        <View className="mt-8 flex-row gap-4">
          <View className="flex-1 rounded-3xl px-4 py-6" style={{ backgroundColor: colors.card }}>
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Yearly Forecast
            </Text>
            <Text className="mt-3 text-2xl font-semibold" style={{ color: colors.text }}>
              {yearlyForecast.toFixed(settings.roundWholeNumbers ? 0 : 2)}
              {' '}
              {settings.mainCurrency}
            </Text>
          </View>
          <View className="flex-1 rounded-3xl px-4 py-6" style={{ backgroundColor: colors.card }}>
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Average Monthly Cost
            </Text>
            <Text className="mt-3 text-2xl font-semibold" style={{ color: colors.text }}>
              {averageMonthly.toFixed(settings.roundWholeNumbers ? 0 : 2)}
              {' '}
              {settings.mainCurrency}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
