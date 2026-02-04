import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { memo, useMemo } from 'react';

import type { Subscription } from '@/lib/db/schema';
import { Pressable, Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';

export type CalendarDayMap = Record<string, Subscription[]>;

type CalendarGridProps = {
  monthDate: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  dayMap: CalendarDayMap;
  selectedDate?: Date;
};

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const CalendarGrid = memo(function CalendarGrid({
  monthDate,
  onMonthChange,
  onDateSelect,
  dayMap,
  selectedDate,
}: CalendarGridProps) {
  const { colors } = useTheme();

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows: Date[][] = [];
    let day = startDate;
    while (day <= endDate) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i += 1) {
        week.push(day);
        day = addDays(day, 1);
      }
      rows.push(week);
    }
    return rows;
  }, [monthDate]);

  const headerLabel = format(monthDate, 'MMMM, yyyy');

  return (
    <View className="rounded-3xl bg-white/5 p-4" style={{ backgroundColor: colors.card }}>
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable onPress={() => onMonthChange(subMonths(monthDate, 1))} className="p-2">
          <ChevronLeft size={20} color={colors.text} />
        </Pressable>
        <Text className="text-base font-semibold" style={{ color: colors.text }}>
          {headerLabel}
        </Text>
        <Pressable onPress={() => onMonthChange(addMonths(monthDate, 1))} className="p-2">
          <ChevronRight size={20} color={colors.text} />
        </Pressable>
      </View>

      <View className="mb-2 flex-row justify-between">
        {WEEKDAYS.map(day => (
          <Text key={day} className="w-8 text-center text-xs font-semibold" style={{ color: colors.secondaryText }}>
            {day}
          </Text>
        ))}
      </View>

      {weeks.map((week) => (
        <View key={week[0].toISOString()} className="mb-2 flex-row justify-between">
          {week.map((date) => {
            const key = format(date, 'yyyy-MM-dd');
            const items = dayMap[key] ?? [];
            const isCurrentMonth = isSameMonth(date, monthDate);
            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

            return (
              <Pressable
                key={date.toISOString()}
                onPress={() => onDateSelect(date)}
                className="h-16 w-10 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  opacity: isCurrentMonth ? 1 : 0.4,
                }}
              >
                <Text className="text-sm font-semibold" style={{ color: isSelected ? colors.headerText : colors.text }}>
                  {format(date, 'd')}
                </Text>
                <View className="mt-1 flex-row">
                  {items.slice(0, 2).map(item => (
                    <View
                      key={item.id}
                      className="mr-1 size-2 rounded-full"
                      style={{ backgroundColor: colors.primaryLight }}
                    />
                  ))}
                  {items.length > 2 && (
                    <Text className="text-[10px]" style={{ color: colors.secondaryText }}>
                      +{items.length - 2}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
});

export default CalendarGrid;
