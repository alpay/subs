import { startOfMonth } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DaySubscriptionsSheet } from '@/components/day-subscriptions-sheet';
import { HomeSearchResults } from '@/components/home/home-search-results';
import { HomeSummary } from '@/components/home/home-summary';
import { MonthCalendar } from '@/components/month-calendar';
import { ScreenShell } from '@/components/screen-shell';
import { useHomeData } from '@/lib/hooks/use-home-data';
import { useTheme } from '@/lib/hooks/use-theme';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));

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
  } = useHomeData({ monthDate: visibleMonth });

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
        <Stack.Toolbar.Button icon="chart.bar" onPress={() => router.push('/(app)/(modals)/analytics')} />
        <Stack.Toolbar.Button icon="gearshape" onPress={() => router.push('/(app)/(modals)/settings')} />
      </Stack.Toolbar>

      <Stack.Toolbar placement="bottom">
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
        <Stack.Toolbar.SearchBarSlot />
        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.Button icon="plus" onPress={() => router.push('/(app)/(modals)/add-subscription')} />
      </Stack.Toolbar>

      {hasQuery
        ? (
            <ScreenShell
              contentContainerStyle={{
                paddingTop: insets.top,
                paddingBottom: insets.bottom + 20,
              }}
            >
              <HomeSearchResults
                results={searchResults}
                settings={settings}
                onSelect={(subscriptionId) => {
                  router.push({ pathname: '/(app)/(modals)/subscription-form', params: { id: subscriptionId } });
                }}
              />
            </ScreenShell>
          )
        : (
            <View
              style={{
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 12,
                justifyContent: 'center',
                gap: 48,
              }}
            >
              <HomeSummary
                monthlyTotal={monthlyTotal}
                averageMonthly={averageMonthly}
                settings={settings}
                monthDate={visibleMonth}
              />
              <MonthCalendar
                date={visibleMonth}
                subscriptions={filteredSubscriptions}
                onDayPress={handleDayPress}
                onMonthChange={setVisibleMonth}
              />
            </View>
          )}

      <DaySubscriptionsSheet
        date={selectedDay}
        subscriptions={selectedSubscriptions}
        settings={settings}
        rates={rates}
        onClose={handleSheetClose}
        onAddPress={() => router.push('/(app)/(modals)/add-subscription')}
        onSubscriptionPress={(subscriptionId) => {
          router.push({ pathname: '/(app)/(modals)/subscription-form', params: { id: subscriptionId } });
        }}
      />
    </>
  );
}
