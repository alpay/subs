import { useRouter } from 'expo-router';
import { Button, Card, Chip } from 'heroui-native';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useCategoriesStore, useCurrencyRatesStore, useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { convertCurrency } from '@/lib/utils/currency';
import { calculateAverageMonthly, calculateYearlyForecast, calculateYearToDateTotal } from '@/lib/utils/totals';

function formatAmount(value: number, currency: string, roundWholeNumbers: boolean) {
  return `${value.toFixed(roundWholeNumbers ? 0 : 2)} ${currency}`;
}

export default function AnalyticsScreen() {
  useBootstrap();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();

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

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottom + 40, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>Analytics</Text>
          <Button variant="secondary" onPress={() => router.back()}>
            Close
          </Button>
        </View>

        <Card>
          <Card.Body style={{ gap: 8 }}>
            <Text style={{ opacity: 0.7 }}>Yearly Forecast</Text>
            <Text style={{ fontSize: 30, fontWeight: '700' }}>
              {formatAmount(yearlyForecast, settings.mainCurrency, settings.roundWholeNumbers)}
            </Text>
          </Card.Body>
        </Card>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <Card.Body style={{ gap: 6 }}>
              <Text style={{ opacity: 0.7 }}>Avg Monthly</Text>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>
                {formatAmount(averageMonthly, settings.mainCurrency, settings.roundWholeNumbers)}
              </Text>
            </Card.Body>
          </Card>
          <Card style={{ flex: 1 }}>
            <Card.Body style={{ gap: 6 }}>
              <Text style={{ opacity: 0.7 }}>Year to Date</Text>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>
                {formatAmount(yearToDate, settings.mainCurrency, settings.roundWholeNumbers)}
              </Text>
            </Card.Body>
          </Card>
        </View>

        <Card>
          <Card.Header>
            <Card.Title>Category Share</Card.Title>
            <Card.Description>Based on yearly totals for active subscriptions.</Card.Description>
          </Card.Header>
          <Card.Body style={{ gap: 10 }}>
            {categoryTotals.length === 0 && (
              <Text style={{ opacity: 0.7 }}>No category spend yet.</Text>
            )}
            {categoryTotals.map(category => (
              <View key={category.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: category.color }} />
                  <Text>{category.name}</Text>
                </View>
                <Chip>
                  {formatAmount(category.total, settings.mainCurrency, settings.roundWholeNumbers)}
                </Chip>
              </View>
            ))}
          </Card.Body>
        </Card>
      </ScrollView>
    </View>
  );
}
