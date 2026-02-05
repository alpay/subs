import { isSameDay } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';

import { useCurrencyRatesStore, useListsStore, useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { calculateAverageMonthly, calculateMonthlyTotal } from '@/lib/utils/totals';

const ALL_LISTS = 'all';

type HomeListOption = {
  label: string;
  value: string;
};

type UseHomeDataOptions = {
  monthDate?: Date;
};

export function useHomeData({ monthDate }: UseHomeDataOptions = {}) {
  const { subscriptions } = useSubscriptionsStore();
  const { lists } = useListsStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();

  const resolvedMonthDate = useMemo(() => monthDate ?? new Date(), [monthDate]);

  const [selectedListId, setSelectedListId] = useState(ALL_LISTS);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [query, setQuery] = useState('');

  const listOptions = useMemo<HomeListOption[]>(
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
      monthDate: resolvedMonthDate,
      settings,
      rates,
    }),
    [filteredSubscriptions, resolvedMonthDate, settings, rates],
  );

  const averageMonthly = useMemo(
    () => calculateAverageMonthly({ subscriptions: filteredSubscriptions, settings, rates }),
    [filteredSubscriptions, settings, rates],
  );

  const hasQuery = query.trim().length > 0;
  const selectedListLabel = listOptions.find(option => option.value === selectedListId)?.label ?? 'All Subs';

  return {
    averageMonthly,
    filteredSubscriptions,
    handleDayPress,
    handleSheetClose,
    hasQuery,
    listOptions,
    monthlyTotal,
    query,
    rates,
    searchResults,
    selectedDay,
    selectedListId,
    selectedListLabel,
    selectedSubscriptions,
    setQuery,
    setSelectedListId,
    settings,
  };
}
