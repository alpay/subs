import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  isToday as isTodayFns,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { WeekStrip } from './week-strip';

type ExpandableCalendarProps = {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  hasEvents?: (date: Date) => boolean;
};

export function ExpandableCalendar({ selectedDate, onDateSelect, hasEvents }: ExpandableCalendarProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith('tr') ? tr : enUS;
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setViewDate(selectedDate);
    }
  };

  const handleMonthChange = (direction: 'next' | 'prev') => {
    setViewDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const monthGrid = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(day);
        day = addDays(day, 1);
      }
      rows.push(days);
      days = [];
    }
    return rows;
  }, [viewDate]);

  const weekdayDates = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, []);

  const handleDatePress = (day: Date) => {
    onDateSelect(day);
    setIsExpanded(false);
  };

  const isSelected = (day: Date) => isSameDay(day, selectedDate);
  const isToday = (day: Date) => isTodayFns(day);
  const isCurrentMonth = (day: Date) => isSameMonth(day, viewDate);
  const isFuture = (day: Date) => isAfter(startOfDay(day), startOfDay(new Date()));

  return (
    <Animated.View
      layout={LinearTransition.duration(400).easing(Easing.linear)} // Smooth linear transition for the height
      className="overflow-hidden bg-transparent"
    >
      {!isExpanded
        ? (
            <Animated.View
              key="week-view"
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(400)}
            >
              <WeekStrip
                selectedDate={selectedDate}
                onDateSelect={onDateSelect}
                hasEvents={hasEvents}
              />
              <TouchableOpacity
                onPress={toggleExpand}
                className="mt-2 items-center pb-2"
                activeOpacity={0.7}
              >
                <ChevronDown size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          )
        : (
            <Animated.View
              key="month-view"
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(400)}
              className="px-4"
            >
              {/* Header */}
              <View className="flex-row items-center justify-between p-2">
                <TouchableOpacity onPress={() => handleMonthChange('prev')} className="p-2">
                  <ChevronLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View className="items-center">
                  <Text className="text-xl font-bold text-white">
                    {format(viewDate, 'MMMM yyyy', { locale: dateLocale })}
                  </Text>
                  {isSameMonth(viewDate, new Date()) && (
                    <Text className="text-xs text-white/60">
                      {t('calendar.this_month')}
                    </Text>
                  )}

                </View>

                <TouchableOpacity onPress={() => handleMonthChange('next')} className="p-2">
                  <ChevronRight size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Weekday Labels */}
              <View className="mb-2 flex-row justify-between">
                {weekdayDates.map(date => (
                  <View key={date.toISOString()} className="w-12 items-center">
                    <Text className="text-xs font-medium text-white/40">
                      {format(date, 'EEEEE', { locale: dateLocale })}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Grid */}
              <View>
                {monthGrid.map(row => (
                  <View key={row[0].toISOString()} className="mb-1 flex-row justify-between">
                    {row.map((day) => {
                      const selected = isSelected(day);
                      const currentMonth = isCurrentMonth(day);
                      const today = isToday(day);
                      const future = isFuture(day);
                      const hasEvent = hasEvents?.(day);

                      return (
                        <TouchableOpacity
                          key={day.toISOString()}
                          onPress={() => !future && handleDatePress(day)}
                          disabled={future}
                          className={`w-12 items-center justify-center rounded-2xl py-3 ${
                            selected ? 'bg-white/15' : 'bg-transparent'
                          } ${today && !selected ? 'border border-amber-400/40' : 'border border-transparent'}`}
                        >
                          <Text className={`text-lg font-semibold ${
                            future
                              ? 'text-white/20'
                              : !currentMonth
                                  ? 'text-white/20'
                                  : selected
                                    ? 'text-white'
                                    : today
                                      ? 'text-amber-200'
                                      : 'text-white/85'
                          }`}
                          >
                            {format(day, 'd', { locale: dateLocale })}
                          </Text>
                          <View className="mt-1 h-1 items-center justify-center">
                            {hasEvent && !future && (
                              <View className={`size-1.5 rounded-full ${selected ? 'bg-amber-300' : 'bg-white/70'}`} />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={toggleExpand}
                className="mt-4 items-center pb-2"
                activeOpacity={0.7}
              >
                <ChevronUp size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          )}
    </Animated.View>
  );
}
