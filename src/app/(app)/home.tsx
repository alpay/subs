import { format, startOfMonth } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeSearchResults } from '@/components/home/home-search-results';
import { HomeSummary } from '@/components/home/home-summary';
import { MonthCalendar } from '@/components/month-calendar';
import { ScreenShell } from '@/components/screen-shell';
import { Haptic } from '@/lib/haptics';
import { useHomeData } from '@/lib/hooks/use-home-data';
import { usePremiumGuard } from '@/lib/hooks/use-premium-guard';
import { useTheme } from '@/lib/hooks/use-theme';
import { storage } from '@/lib/storage';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { navigateToServicesOrPaywall } = usePremiumGuard();
  const insets = useSafeAreaInsets();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [viewMode, setViewMode] = useState<'list' | 'month'>(() => {
    const saved = storage.getString('subs:home_view_mode');
    if (saved === 'list' || saved === 'month')
      return saved;
    return 'month';
  });

  const {
    filteredSubscriptions,
    hasQuery,
    listOptions,
    monthlyTotal,
    remainingInMonth,
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
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Menu>
          <Stack.Toolbar.Label>{selectedListLabel}</Stack.Toolbar.Label>
          {listOptions.map(option => (
            <Stack.Toolbar.MenuAction
              key={option.value}
              isOn={option.value === selectedListId}
              onPress={() => {
                Haptic.Light();
                setSelectedListId(option.value);
              }}
            >
              {option.label}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="chart.bar"
          onPress={() => {
            Haptic.Light();
            router.push('/(app)/analytics');
          }}
        />
        <Stack.Toolbar.Button
          icon="gearshape"
          onPress={() => {
            Haptic.Light();
            router.push('/(app)/settings');
          }}
        />
      </Stack.Toolbar>

      <Stack.Toolbar placement="bottom">
        <Stack.Toolbar.Button
          icon={viewMode !== 'list' ? 'list.bullet' : 'calendar'}
          onPress={() => {
            Haptic.Light();
            setViewMode((prev) => {
              const next = prev === 'list' ? 'month' : 'list';
              storage.set('subs:home_view_mode', next);
              return next;
            });
          }}
        />
        <Stack.Toolbar.Spacer />
        <Stack.SearchBar
          placeholder="Search subs"
          onChangeText={(event) => {
            if (typeof event === 'string') {
              setQuery(event);
              return;
            }
            setQuery(event.nativeEvent.text);
          }}
          onCancelButtonPress={() => {
            Haptic.Light();
            setQuery('');
          }}
          hideNavigationBar={false}
        />
        <Stack.Toolbar.SearchBarSlot />
        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.Button
          icon="plus"
          onPress={() => {
            Haptic.Light();
            navigateToServicesOrPaywall();
          }}
        />
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
                onAddFirst={navigateToServicesOrPaywall}
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
                remainingInMonth={remainingInMonth}
                settings={settings}
                monthDate={visibleMonth}
              />
              <MonthCalendar
                date={visibleMonth}
                subscriptions={filteredSubscriptions}
                onDayPress={(day) => {
                  Haptic.Light();
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
