import { isSameDay } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { DaySubscriptionsSheet } from '@/components/day-subscriptions-sheet';
import { HomeSearchResults } from '@/components/home/home-search-results';
import { HomeSummary } from '@/components/home/home-summary';
import { MonthCalendar } from '@/components/month-calendar';
import { ScreenShell } from '@/components/screen-shell';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCurrencyRatesStore, useListsStore, useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { calculateAverageMonthly, calculateMonthlyTotal } from '@/lib/utils/totals';

const ALL_LISTS = 'all';

export default function HomeScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();

  const { subscriptions } = useSubscriptionsStore();
  const { lists } = useListsStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();

  const [selectedListId, setSelectedListId] = useState(ALL_LISTS);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [query, setQuery] = useState('');

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

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return filteredSubscriptions;
    }
    return filteredSubscriptions.filter(sub => sub.name.toLowerCase().includes(normalized));
  }, [filteredSubscriptions, query]);

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

  const hasQuery = query.trim().length > 0;

  const selectedListLabel
    = listOptions.find(option => option.value === selectedListId)?.label ?? 'All Subs';

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Menu>
          <Stack.Toolbar.Label>{selectedListLabel}</Stack.Toolbar.Label>
          {listOptions.map(option => (
            <Stack.Toolbar.MenuAction
              key={option.value}
              isOn={option.value === selectedListId}
              onPress={() => setSelectedListId(option.value)}
            >
              {option.label}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="chart.bar" onPress={() => router.push('/(modals)/analytics')} />
        <Stack.Toolbar.Button icon="gearshape" onPress={() => router.push('/(sheets)/settings')} />
      </Stack.Toolbar>
      <Stack.SearchBar
        placeholder="Search subscriptions"
        onChangeText={(event) => {
          if (typeof event === 'string') {
            setQuery(event);
            return;
          }
          setQuery(event.nativeEvent.text);
        }}
        onCancelButtonPress={() => setQuery('')}
        hideNavigationBar={false}
      />
      <Stack.Toolbar placement="bottom">
        <Stack.Toolbar.SearchBarSlot />
        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.Button icon="plus" onPress={() => router.push('/(sheets)/add-subscription')} />
      </Stack.Toolbar>

      <ScreenShell contentContainerStyle={{ gap: 22, paddingTop: 12 }}>
        {hasQuery
          ? (
              <HomeSearchResults
                results={searchResults}
                settings={settings}
                onSelect={(subscriptionId) => {
                  router.push({ pathname: '/(modals)/subscription-form', params: { id: subscriptionId } });
                }}
              />
            )
          : (
              <>
                <HomeSummary monthlyTotal={monthlyTotal} averageMonthly={averageMonthly} settings={settings} />
                <MonthCalendar date={new Date()} subscriptions={subscriptions} onDayPress={handleDayPress} />
              </>
            )}
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
