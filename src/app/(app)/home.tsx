import { format } from 'date-fns';
import { BarChart3, Search, Settings as SettingsIcon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';

import type { Subscription } from '@/lib/db/schema';
import { Pressable, ScrollView, Select, Text, View } from '@/components/ui';
import CalendarGrid from '@/components/subscriptions/calendar-grid';
import DaySubscriptionsSheet from '@/components/subscriptions/day-subscriptions-sheet';
import SubscriptionDetailSheet from '@/components/subscriptions/subscription-detail-sheet';
import { useTheme } from '@/lib/hooks/use-theme';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useCurrencyRatesStore, useListsStore, useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { calculateMonthlyTotal } from '@/lib/utils/totals';
import { getPaymentDatesForMonth } from '@/lib/utils/subscription-dates';
import { useModal } from '@/components/ui/modal';
import { SearchBar } from '@/components/ui/search-bar';

const ALL_LISTS = 'all';

export default function HomeScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();
  const { subscriptions } = useSubscriptionsStore();
  const { lists } = useListsStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();

  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedListId, setSelectedListId] = useState<string>(ALL_LISTS);
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const daySheet = useModal();
  const detailSheet = useModal();

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
      if (searchValue && !sub.name.toLowerCase().includes(searchValue.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [subscriptions, selectedListId, searchValue]);

  const dayMap = useMemo(() => {
    const map: Record<string, Subscription[]> = {};
    filteredSubscriptions.forEach((sub) => {
      const dates = getPaymentDatesForMonth(sub, monthDate);
      dates.forEach((date) => {
        const key = format(date, 'yyyy-MM-dd');
        map[key] = map[key] ? [...map[key], sub] : [sub];
      });
    });
    return map;
  }, [filteredSubscriptions, monthDate]);

  const monthTotal = useMemo(
    () => calculateMonthlyTotal(filteredSubscriptions, monthDate, settings, rates),
    [filteredSubscriptions, monthDate, settings, rates],
  );

  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDaySubscriptions = dayMap[selectedKey] ?? [];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    daySheet.present();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-5 pt-4">
          <View className="flex-row items-center justify-between">
            <View className="w-44">
              <Select
                value={selectedListId}
                options={listOptions}
                onSelect={value => setSelectedListId(String(value))}
                placeholder="All Subs"
              />
            </View>
            <View className="flex-row items-center">
              <Pressable onPress={() => setIsSearching(!isSearching)} className="mr-3">
                <Search size={20} color={colors.text} />
              </Pressable>
              <Pressable onPress={() => router.push('/(modals)/analytics')} className="mr-3">
                <BarChart3 size={20} color={colors.text} />
              </Pressable>
              <Pressable onPress={() => router.push('/(modals)/settings')}>
                <SettingsIcon size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {isSearching && (
            <SearchBar
              value={searchValue}
              onChangeText={setSearchValue}
              onCancel={() => {
                setSearchValue('');
                setIsSearching(false);
              }}
              containerClassName="mx-0"
            />
          )}
        </View>

        <View className="mt-6 items-center px-5">
          <Text className="text-sm" style={{ color: colors.secondaryText }}>
            {format(monthDate, 'MMMM yyyy')}
          </Text>
          <Text className="mt-2 text-4xl font-bold" style={{ color: colors.text }}>
            {monthTotal.toFixed(settings.roundWholeNumbers ? 0 : 2)} {settings.mainCurrency}
          </Text>
        </View>

        <View className="mt-6 px-5">
          <CalendarGrid
            monthDate={monthDate}
            onMonthChange={setMonthDate}
            onDateSelect={handleDateSelect}
            dayMap={dayMap}
            selectedDate={selectedDate}
          />
        </View>

        <View className="mt-6 px-5">
          <Pressable
            onPress={() => router.push('/(modals)/add-subscription')}
            className="items-center justify-center rounded-2xl py-4"
            style={{ backgroundColor: colors.card }}
          >
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              + Add subscription
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <DaySubscriptionsSheet
        date={selectedDate}
        subscriptions={selectedDaySubscriptions}
        modalRef={daySheet.ref}
        onAdd={() => router.push('/(modals)/add-subscription')}
        onSelect={(sub) => {
          setSelectedSubscription(sub);
          daySheet.dismiss();
          detailSheet.present();
        }}
      />

      <SubscriptionDetailSheet
        subscription={selectedSubscription}
        modalRef={detailSheet.ref}
        onEdit={(sub) => {
          detailSheet.dismiss();
          router.push({ pathname: '/(modals)/subscription-form', params: { id: sub.id } });
        }}
      />
    </View>
  );
}
