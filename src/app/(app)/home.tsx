import { Stack, useRouter } from 'expo-router';

import { DaySubscriptionsSheet } from '@/components/day-subscriptions-sheet';
import { HomeSearchResults } from '@/components/home/home-search-results';
import { HomeSummary } from '@/components/home/home-summary';
import { MonthCalendar } from '@/components/month-calendar';
import { ScreenShell } from '@/components/screen-shell';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useHomeData } from '@/lib/hooks/use-home-data';
import { useTheme } from '@/lib/hooks/use-theme';

export default function HomeScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();

  const {
    averageMonthly,
    filteredSubscriptions,
    handleDayPress,
    handleSheetClose,
    hasQuery,
    listOptions,
    monthlyTotal,
    rates,
    searchResults,
    selectedDay,
    selectedListId,
    selectedListLabel,
    selectedSubscriptions,
    setQuery,
    setSelectedListId,
    settings,
  } = useHomeData();

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
                <MonthCalendar date={new Date()} subscriptions={filteredSubscriptions} onDayPress={handleDayPress} />
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
