import { format, startOfMonth } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [viewMode, setViewMode] = useState<'list' | 'month'>('list');

  const {
    averageMonthly,
    filteredSubscriptions,
    hasQuery,
    listOptions,
    monthlyTotal,
    searchResults,
    selectedListId,
    selectedListLabel,
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
        <Stack.Toolbar.Button icon="chart.bar" onPress={() => router.push('/(app)/analytics')} />
        <Stack.Toolbar.Button icon="gearshape" onPress={() => router.push('/(app)/settings')} />
      </Stack.Toolbar>

      <Stack.Toolbar placement="bottom">
        <Stack.Toolbar.Button
          icon={viewMode !== 'list' ? 'list.bullet' : 'calendar'}
          onPress={() => setViewMode(prev => (prev === 'list' ? 'month' : 'list'))}
        />
        <Stack.Toolbar.Spacer />
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
        <Stack.Toolbar.Button icon="plus" onPress={() => router.push('/(app)/services')} />
      </Stack.Toolbar>

      {viewMode === 'list' || hasQuery
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
              />
            </ScreenShell>
          )
        : (
            <View
              style={{
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: insets.top,
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
                onDayPress={(day) => {
                  const dateParam = format(day, 'yyyy-MM-dd');
                  router.push({
                    pathname: '/(app)/subscription/day-view/[date]',
                    params: { date: dateParam },
                  });
                }}
                onMonthChange={setVisibleMonth}
              />
            </View>
          )}
    </>
  );
}
