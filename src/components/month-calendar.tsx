import type { StyleProp, ViewStyle } from 'react-native';
import type { Subscription } from '@/lib/db/schema';

import { format, getDay, getDaysInMonth, isSameMonth, isToday, startOfMonth } from 'date-fns';
import { useMemo } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

import { ServiceIcon } from './service-icon';

type MonthCalendarProps = {
  date: Date;
  subscriptions: Subscription[];
  style?: StyleProp<ViewStyle>;
  onDayPress?: (date: Date) => void;
};

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getMondayIndex(date: Date) {
  const day = getDay(date);
  return (day + 6) % 7;
}

export function MonthCalendar({ date, subscriptions, style, onDayPress }: MonthCalendarProps) {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();

  const monthStart = startOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const leadingEmpty = getMondayIndex(monthStart);
  const totalCells = Math.ceil((leadingEmpty + daysInMonth) / 7) * 7;
  const gap = 10;
  const cellSize = Math.floor((width - 40 - gap * 6) / 7);

  const paymentMap = useMemo(() => {
    const map = new Map<string, Subscription[]>();

    subscriptions.forEach((subscription) => {
      const nextDate = new Date(subscription.nextPaymentDate);
      if (!isSameMonth(nextDate, date)) {
        return;
      }
      const key = format(nextDate, 'yyyy-MM-dd');
      const existing = map.get(key) ?? [];
      existing.push(subscription);
      map.set(key, existing);
    });

    return map;
  }, [subscriptions, date]);

  const cells = useMemo(() => {
    const items: Array<{ date: Date | null; index: number }> = [];

    for (let i = 0; i < totalCells; i += 1) {
      const dayIndex = i - leadingEmpty + 1;
      if (dayIndex <= 0 || dayIndex > daysInMonth) {
        items.push({ date: null, index: i });
      }
      else {
        items.push({ date: new Date(date.getFullYear(), date.getMonth(), dayIndex), index: i });
      }
    }

    return items;
  }, [date, daysInMonth, leadingEmpty, totalCells]);

  return (
    <View style={[{ gap: 14 }, style]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {WEEKDAYS.map((day, index) => (
          <Text
            key={`${day}-${index}`}
            style={{ width: cellSize, textAlign: 'center', fontSize: 11, color: colors.textMuted }}
            selectable
          >
            {day}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
        {cells.map((cell) => {
          if (!cell.date) {
            return (
              <View
                key={`empty-${cell.index}`}
                style={{ width: cellSize, height: cellSize }}
              />
            );
          }

          const key = format(cell.date, 'yyyy-MM-dd');
          const items = paymentMap.get(key) ?? [];
          const highlight = isToday(cell.date);
          const dayLabel = cell.date.getDate();

          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              onPress={() => onDayPress?.(cell.date)}
              style={({ pressed }) => [
                {
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 18,
                  borderCurve: 'continuous',
                  backgroundColor: colors.surfaceMuted,
                  borderWidth: highlight ? 1.5 : 1,
                  borderColor: highlight ? colors.text : colors.surfaceBorder,
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isDark
                    ? '0 12px 22px rgba(0, 0, 0, 0.35)'
                    : '0 12px 22px rgba(15, 23, 42, 0.12)',
                },
                pressed ? { opacity: 0.88, transform: [{ scale: 0.98 }] } : null,
              ]}
            >
              <Text
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 8,
                  fontSize: 11,
                  color: colors.textMuted,
                  opacity: 0.85,
                }}
                selectable
              >
                {dayLabel}
              </Text>

              {items.length > 0 && (
                <ServiceIcon
                  iconKey={items[0].iconKey}
                  size={Math.max(24, Math.floor(cellSize * 0.56))}
                  style={{ boxShadow: 'none' }}
                />
              )}

              {items.length > 1 && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 999,
                    borderCurve: 'continuous',
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.surfaceBorder,
                  }}
                >
                  <Text style={{ fontSize: 10, color: colors.textMuted }} selectable>
                    +
                    {items.length - 1}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
