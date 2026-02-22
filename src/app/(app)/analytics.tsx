import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { NativeSheet } from '@/components/native-sheet';
import { Pill } from '@/components/pill';
import { RingChart } from '@/components/ring-chart';
import { GlassCard } from '@/components/ui/glass-card';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCategoriesStore, useCurrencyRatesStore, useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { convertCurrency } from '@/lib/utils/currency';
import { formatAmount } from '@/lib/utils/format';
import {
  calculateAverageMonthly,
  calculateYearlyForecast,
  calculateYearToDateTotal,
  getMonthlyEquivalent,
} from '@/lib/utils/totals';

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0);

  const { subscriptions } = useSubscriptionsStore();
  const { categories } = useCategoriesStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();

  const activeCount = useMemo(
    () => subscriptions.filter(sub => sub.status === 'active').length,
    [subscriptions],
  );

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
            const monthlyEquivalent = getMonthlyEquivalent(sub);
            const yearlyValue = monthlyEquivalent * 12;
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
  const clampedSelectedIndex = categoryTotals.length > 0 ? Math.min(selectedCategoryIndex, categoryTotals.length - 1) : 0;
  const selectedCategory = categoryTotals[clampedSelectedIndex];

  return (
    <NativeSheet title={t('analytics.title')}>
      <View style={{ gap: 16 }}>
        <GlassCard>
          <View style={{ gap: 16, alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 }}>
            {activeCount > 0 && (
              <Text style={{ fontSize: 13, color: colors.textMuted }} selectable>
                {activeCount === 1
                  ? t('analytics.active_count', { count: activeCount })
                  : t('analytics.active_count_plural', { count: activeCount })}
              </Text>
            )}
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <RingChart
                size={210}
                strokeWidth={18}
                segments={categoryTotals.map(category => ({
                  value: category.total,
                  color: category.color,
                }))}
                total={totalSpend}
                selectedIndex={categoryTotals.length > 0 ? clampedSelectedIndex : undefined}
                onSegmentPress={index => setSelectedCategoryIndex(index)}
              />
              {selectedCategory && (
                <View
                  style={{
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  pointerEvents="none"
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
                    {selectedCategory.name}
                  </Text>
                  <Text
                    style={{ fontSize: 20, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] }}
                    selectable
                  >
                    {formatAmount(selectedCategory.total, settings.mainCurrency, settings.roundWholeNumbers)}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                    {totalSpend > 0 ? `${Math.round((selectedCategory.total / totalSpend) * 100)}%` : '0%'}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {categoryTotals.map((category, index) => (
                <View
                  key={category.id}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 99,
                    backgroundColor: category.color,
                    opacity: index === clampedSelectedIndex ? 1 : 0.6,
                  }}
                />
              ))}
            </View>
          </View>
        </GlassCard>

            <View style={{ flexDirection: 'row', gap: 12 }}>
          <GlassCard style={{ flex: 1 }}>
            <View style={{ padding: 16, gap: 4 }}>
              <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                {t('analytics.yearly_forecast')}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                {t('analytics.forecast')}
              </Text>
              <Text
                style={{ fontSize: 20, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] }}
                selectable
              >
                {formatAmount(yearlyForecast, settings.mainCurrency, settings.roundWholeNumbers)}
              </Text>
            </View>
          </GlassCard>
          <GlassCard style={{ flex: 1 }}>
            <View style={{ padding: 16, gap: 4 }}>
              <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                {t('analytics.average_monthly')}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                {t('analytics.monthly_cost')}
              </Text>
              <Text
                style={{ fontSize: 20, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] }}
                selectable
              >
                {formatAmount(averageMonthly, settings.mainCurrency, settings.roundWholeNumbers)}
              </Text>
            </View>
          </GlassCard>
        </View>

        <GlassCard>
          <View style={{ padding: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
                {t('analytics.year_to_date')}
              </Text>
              <Pill tone="accent">
                {formatAmount(yearToDate, settings.mainCurrency, settings.roundWholeNumbers)}
              </Pill>
            </View>
            {categoryTotals.length === 0 && (
              <Text style={{ color: colors.textMuted }} selectable>
                {t('analytics.no_category_spend')}
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
          </View>
        </GlassCard>
      </View>
    </NativeSheet>
  );
}
