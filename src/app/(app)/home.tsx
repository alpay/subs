import { isSameDay } from 'date-fns';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { DaySubscriptionsSheet } from '@/components/day-subscriptions-sheet';
import { IconButton } from '@/components/icon-button';
import { MonthCalendar } from '@/components/month-calendar';
import { Pill } from '@/components/pill';
import { ScreenShell } from '@/components/screen-shell';
import { SelectPill } from '@/components/select-pill';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCurrencyRatesStore, useListsStore, useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { formatAmount, formatMonthYear } from '@/lib/utils/format';
import { calculateAverageMonthly, calculateMonthlyTotal } from '@/lib/utils/totals';

type SelectOption = { label: string; value: string } | undefined;

const ALL_LISTS = 'all';

function getMonthBadge(monthlyTotal: number, averageMonthly: number) {
  if (averageMonthly === 0) {
    return { label: 'New Month', tone: 'accent' as const };
  }

  if (monthlyTotal > averageMonthly * 1.1) {
    return { label: 'Peak Month', tone: 'accent' as const };
  }

  if (monthlyTotal < averageMonthly * 0.9) {
    return { label: 'Low Month', tone: 'neutral' as const };
  }

  return { label: 'Regular Month', tone: 'success' as const };
}

export default function HomeScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { subscriptions } = useSubscriptionsStore();
  const { lists } = useListsStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();

  const [selectedListId, setSelectedListId] = useState(ALL_LISTS);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const listOptions = useMemo(
    () => [
      { label: 'All Subs', value: ALL_LISTS },
      ...lists.map(list => ({ label: list.name, value: list.id })),
    ],
    [lists],
  );

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      if (sub.status !== 'active') {
        return false;
      }
      if (selectedListId !== ALL_LISTS && sub.listId !== selectedListId) {
        return false;
      }
      return true;
    });
  }, [subscriptions, selectedListId]);

  const selectedSubscriptions = useMemo(() => {
    if (!selectedDay) {
      return [];
    }
    return filteredSubscriptions.filter(sub => isSameDay(new Date(sub.nextPaymentDate), selectedDay));
  }, [filteredSubscriptions, selectedDay]);

  const handleDayPress = useCallback((day: Date) => {
    setSelectedDay(day);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSelectedDay(null);
  }, []);

  const monthlyTotal = useMemo(
    () => calculateMonthlyTotal({
      subscriptions: filteredSubscriptions,
      monthDate: new Date(),
      settings,
      rates,
    }),
    [filteredSubscriptions, settings, rates],
  );

  const averageMonthly = useMemo(
    () => calculateAverageMonthly({ subscriptions: filteredSubscriptions, settings, rates }),
    [filteredSubscriptions, settings, rates],
  );

  const selectedListOption = listOptions.find(option => option.value === selectedListId) as SelectOption;
  const badge = getMonthBadge(monthlyTotal, averageMonthly);

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
          headerLeft: () => (
            <SelectPill
              value={selectedListOption}
              options={listOptions}
              onValueChange={option => setSelectedListId(option?.value ?? ALL_LISTS)}
              placeholder="All Subs"
            />
          ),
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                gap: 6,
                padding: 2,
              }}
            >
              <IconButton symbol="magnifyingglass" size={30} variant="muted" onPress={() => router.push('/search')} />
              <IconButton symbol="chart.bar" size={30} variant="muted" onPress={() => router.push('/(modals)/analytics')} />
              <IconButton symbol="gearshape" size={30} variant="muted" onPress={() => router.push('/(sheets)/settings')} />
            </View>
          ),
        }}
      />

      <ScreenShell contentContainerStyle={{ gap: 22, paddingTop: 12 }}>
        <View style={{ alignItems: 'center', gap: 10, paddingVertical: 6 }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
            {formatMonthYear(new Date())}
          </Text>
          <Text
            style={{ fontSize: 52, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] }}
            selectable
          >
            {formatAmount(monthlyTotal, settings.mainCurrency, settings.roundWholeNumbers)}
          </Text>
          <Pill tone={badge.tone} style={{ paddingHorizontal: 14, paddingVertical: 6 }}>
            {badge.label}
          </Pill>
        </View>

        <MonthCalendar date={new Date()} subscriptions={filteredSubscriptions} onDayPress={handleDayPress} />

        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <Pressable onPress={() => router.push('/(sheets)/add-subscription')}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 12,
                paddingHorizontal: 18,
                borderRadius: 999,
                borderCurve: 'continuous',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.surfaceBorder,
                boxShadow: isDark
                  ? '0 16px 28px rgba(0, 0, 0, 0.35)'
                  : '0 16px 28px rgba(15, 23, 42, 0.12)',
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  backgroundColor: colors.surfaceMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image source="sf:plus" style={{ width: 12, height: 12 }} tintColor={colors.text} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
                Add subscription
              </Text>
            </View>
          </Pressable>
        </View>
      </ScreenShell>

      <DaySubscriptionsSheet
        date={selectedDay}
        subscriptions={selectedSubscriptions}
        settings={settings}
        rates={rates}
        onClose={handleSheetClose}
        onAddPress={() => router.push('/(sheets)/add-subscription')}
        onSubscriptionPress={(subscriptionId) => {
          router.push({ pathname: '/(modals)/subscription-form', params: { id: subscriptionId } });
        }}
      />
    </>
  );
}
