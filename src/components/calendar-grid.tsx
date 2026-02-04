import type { Subscription } from '@/lib/db/schema';
import type { StyleProp, ViewStyle } from 'react-native';

import { useMemo } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { format, getDay, getDaysInMonth, isSameMonth, isToday, startOfMonth } from 'date-fns';

import { useTheme } from '@/lib/hooks/use-theme';

import { ServiceIcon } from './service-icon';

type CalendarGridProps = {
  date: Date;
  subscriptions: Subscription[];
  style?: StyleProp<ViewStyle>;
};

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getMondayIndex(date: Date) {
  const day = getDay(date);
  return (day + 6) % 7;
}

export function CalendarGrid({ date, subscriptions, style }: CalendarGridProps) {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();

  const monthStart = startOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const leadingEmpty = getMondayIndex(monthStart);
  const totalCells = Math.ceil((leadingEmpty + daysInMonth) / 7) * 7;
  const gap = 8;
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
    <View style={[{ gap: 12 }, style]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {WEEKDAYS.map(day => (
          <Text
            key={day}
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

          return (
            <View
              key={key}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: 16,
                borderCurve: 'continuous',
                backgroundColor: colors.surfaceMuted,
                borderWidth: highlight ? 1.5 : 1,
                borderColor: highlight ? colors.accent : colors.surfaceBorder,
                padding: 6,
                justifyContent: 'space-between',
                boxShadow: isDark
                  ? '0 10px 18px rgba(0, 0, 0, 0.2)'
                  : '0 10px 18px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Text style={{ fontSize: 12, color: colors.text, opacity: 0.8 }} selectable>
                {cell.date.getDate()}
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                {items.slice(0, 1).map(subscription => (
                  <ServiceIcon
                    key={subscription.id}
                    iconKey={subscription.iconKey}
                    size={Math.max(20, Math.floor(cellSize * 0.38))}
                    style={{ boxShadow: 'none' }}
                  />
                ))}
                {items.length > 1 && (
                  <Text style={{ fontSize: 10, color: colors.textMuted }} selectable>
                    +{items.length - 1}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
