import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { ModalSheet } from '@/components/modal-sheet';
import { Pill } from '@/components/pill';
import { RingChart } from '@/components/ring-chart';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCategoriesStore, useCurrencyRatesStore, useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { convertCurrency } from '@/lib/utils/currency';
import { formatAmount } from '@/lib/utils/format';
import { calculateAverageMonthly, calculateYearlyForecast, calculateYearToDateTotal } from '@/lib/utils/totals';

export default function AnalyticsScreen() {
  useBootstrap();
  const { colors } = useTheme();

  const { subscriptions } = useSubscriptionsStore();
  const { categories } = useCategoriesStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();

  const yearlyForecast = useMemo(
    () => calculateYearlyForecast({ subscriptions, settings, rates }),
    [subscriptions, settings, rates],
  );

  const averageMonthly = useMemo(
    () => calculateAverageMonthly({ subscriptions, settings, rates }),
    [subscriptions, settings, rates],
  );

  const yearToDate = useMemo(
    () => calculateYearToDateTotal({ subscriptions, settings, rates }),
    [subscriptions, settings, rates],
  );

  const categoryTotals = useMemo(() => {
    return categories
      .map((category) => {
        const total = subscriptions
          .filter(sub => sub.status === 'active' && sub.categoryId === category.id)
          .reduce((sum, sub) => {
            const yearlyValue = sub.amount * 12;
            return sum + convertCurrency({
              amount: yearlyValue,
              from: sub.currency,
              to: settings.mainCurrency,
              rates,
            });
          }, 0);

        return { ...category, total };
      })
      .filter(category => category.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [categories, subscriptions, settings.mainCurrency, rates]);

  const totalSpend = categoryTotals.reduce((sum, category) => sum + category.total, 0);
  const topCategory = categoryTotals[0];

  return (
    <ModalSheet title="Analytics">
      <GlassCard>
        <GlassCardBody style={{ gap: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
            Category Share
          </Text>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <RingChart
              size={210}
              strokeWidth={18}
              segments={categoryTotals.map(category => ({
                value: category.total,
                color: category.color,
              }))}
            />
            {topCategory && (
              <View
                style={{
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
                  {topCategory.name}
                </Text>
                <Text
                  style={{ fontSize: 20, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] }}
                  selectable
                >
                  {formatAmount(topCategory.total, settings.mainCurrency, settings.roundWholeNumbers)}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                  {totalSpend > 0 ? `${Math.round((topCategory.total / totalSpend) * 100)}%` : '0%'}
                </Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {categoryTotals.map(category => (
              <View
                key={category.id}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  backgroundColor: category.color,
                }}
              />
            ))}
          </View>
        </GlassCardBody>
      </GlassCard>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <GlassCard style={{ flex: 1 }}>
          <GlassCardBody>
            <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
              Yearly Forecast
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] }}
              selectable
            >
              {formatAmount(yearlyForecast, settings.mainCurrency, settings.roundWholeNumbers)}
            </Text>
          </GlassCardBody>
        </GlassCard>
        <GlassCard style={{ flex: 1 }}>
          <GlassCardBody>
            <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
              Avg Monthly
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] }}
              selectable
            >
              {formatAmount(averageMonthly, settings.mainCurrency, settings.roundWholeNumbers)}
            </Text>
          </GlassCardBody>
        </GlassCard>
      </View>

      <GlassCard>
        <GlassCardBody style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
              Year to Date
            </Text>
            <Pill tone="accent">
              {formatAmount(yearToDate, settings.mainCurrency, settings.roundWholeNumbers)}
            </Pill>
          </View>
          {categoryTotals.length === 0 && (
            <Text style={{ color: colors.textMuted }} selectable>
              No category spend yet.
            </Text>
          )}
          {categoryTotals.map(category => (
            <View
              key={category.id}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: category.color }} />
                <Text style={{ color: colors.text }} selectable>
                  {category.name}
                </Text>
              </View>
              <Text style={{ color: colors.text, fontWeight: '600', fontVariant: ['tabular-nums'] }} selectable>
                {formatAmount(category.total, settings.mainCurrency, settings.roundWholeNumbers)}
              </Text>
            </View>
          ))}
        </GlassCardBody>
      </GlassCard>
    </ModalSheet>
  );
}
