/**
 * Shine: Care Routine - Week Strip Component
 * 7-day horizontal scroll with selection and dot indicators
 */

import { addDays, format, isAfter, isSameDay, startOfDay, startOfWeek } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { Haptic } from '@/lib/haptics';

type WeekStripProps = {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  hasEvents?: (date: Date) => boolean;
};

export function WeekStrip({ selectedDate, onDateSelect, hasEvents }: WeekStripProps) {
  const { i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith('tr') ? tr : enUS;
  // Generate 7 days starting from Monday of selectedDate's week
  const weekDays = useMemo(() => {
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 }); // 1 = Monday
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [selectedDate]);

  const formatDayInitial = (date: Date) => format(date, 'EEEEE', { locale: dateLocale }); // M, T, W...
  const formatDayNumber = (date: Date) => format(date, 'd', { locale: dateLocale });

  const isSelected = (date: Date) => isSameDay(date, selectedDate);
  const isToday = (date: Date) => isSameDay(date, new Date());
  const isFuture = (date: Date) => isAfter(startOfDay(date), startOfDay(new Date()));

  return (
    <View className="bg-transparent px-4">
      <View className="flex-row justify-between">
        {weekDays.map((day: Date) => {
          const selected = isSelected(day);
          const today = isToday(day);
          const hasEvent = hasEvents?.(day);
          const disabled = isFuture(day);

          return (
            <TouchableOpacity
              key={day.toISOString()}
              onPress={() => {
                if (!disabled) {
                  Haptic.Light();
                  onDateSelect(day);
                }
              }}
              disabled={disabled}
              className={`w-12 items-center rounded-2xl py-2 ${
                selected ? 'bg-white/15' : 'bg-transparent'
              } ${today ? 'border border-amber-400/40' : 'border border-transparent'}`}
              activeOpacity={disabled ? 1 : 0.85}
            >
              <Text className={`text-xs font-medium ${
                disabled
                  ? 'text-white/30'
                  : selected
                    ? 'text-white/90'
                    : today
                      ? 'text-amber-100/90'
                      : 'text-white/60'
              }`}
              >
                {formatDayInitial(day)}
              </Text>

              <Text className={`text-xl font-semibold ${
                disabled
                  ? 'text-white/30'
                  : selected
                    ? 'text-white'
                    : today
                      ? 'text-amber-200'
                      : 'text-white/85'
              }`}
              >
                {formatDayNumber(day)}
              </Text>

              <View className="mt-1 h-1 items-center justify-center">
                {hasEvent && !disabled
                  ? (
                      <View className={`size-2 rounded-full ${selected ? 'bg-amber-300' : 'bg-white/70'}`} />
                    )
                  : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
