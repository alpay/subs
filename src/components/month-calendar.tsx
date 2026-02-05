import type { StyleProp, ViewStyle } from 'react-native';
import type { Subscription } from '@/lib/db/schema';

import { format, getDay, getDaysInMonth, isSameMonth, isToday, startOfMonth } from 'date-fns';
import { useMemo } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

import { getServiceColor, ServiceIcon } from './service-icon';

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

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized
        .split('')
        .map(char => char + char)
        .join('')
    : normalized;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  const cellHeight = Math.round(cellSize * 1.3);
  const cellRadius = Math.round(Math.min(cellSize, cellHeight) * 0.3);
  const iconSize = Math.max(26, Math.floor(cellSize * 0.6));
  const badgeSize = Math.max(18, Math.floor(cellSize * 0.28));

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
                style={{
                  width: cellSize,
                  height: cellHeight,
                  borderRadius: cellRadius,
                  borderCurve: 'continuous',
                  backgroundColor: withAlpha(colors.surfaceMuted, isDark ? 0.28 : 0.45),
                  borderWidth: 1,
                  borderColor: withAlpha(colors.surfaceBorder, isDark ? 0.22 : 0.35),
                  boxShadow: isDark
                    ? '0 6px 12px rgba(0, 0, 0, 0.18)'
                    : '0 6px 12px rgba(15, 23, 42, 0.07)',
                }}
              />
            );
          }

          const key = format(cell.date, 'yyyy-MM-dd');
          const items = paymentMap.get(key) ?? [];
          const highlight = isToday(cell.date);
          const dayLabel = cell.date.getDate();
          const serviceColor = items.length > 0 ? getServiceColor(items[0].iconKey) : null;
          const cellBackground = serviceColor
            ? withAlpha(serviceColor, isDark ? 0.36 : 0.2)
            : colors.surfaceMuted;
          const cellBorderColor = serviceColor
            ? withAlpha(serviceColor, isDark ? 0.75 : 0.55)
            : colors.surfaceBorder;
          const dayLabelColor = serviceColor
            ? withAlpha(colors.text, isDark ? 0.65 : 0.5)
            : withAlpha(colors.textMuted, isDark ? 0.75 : 0.7);

          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              onPress={() => onDayPress?.(cell.date)}
              style={({ pressed }) => [
                {
                  width: cellSize,
                  height: cellHeight,
                  borderRadius: cellRadius,
                  borderCurve: 'continuous',
                  backgroundColor: cellBackground,
                  borderWidth: highlight ? 1.5 : 1,
                  borderColor: highlight ? colors.text : cellBorderColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isDark
                    ? '0 12px 22px rgba(0, 0, 0, 0.32)'
                    : '0 12px 22px rgba(15, 23, 42, 0.12)',
                },
                pressed ? { opacity: 0.88, transform: [{ scale: 0.98 }] } : null,
              ]}
            >
              <Text
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  fontSize: 11,
                  color: dayLabelColor,
                  opacity: 0.85,
                  fontVariant: ['tabular-nums'],
                }}
                selectable
              >
                {dayLabel}
              </Text>

              {items.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <ServiceIcon iconKey={items[0].iconKey} size={iconSize} style={{ boxShadow: 'none' }} />
                  {items.length > 1 && (
                    <View
                      style={{
                        width: badgeSize,
                        height: badgeSize,
                        borderRadius: badgeSize / 2,
                        borderCurve: 'continuous',
                        marginLeft: -Math.round(badgeSize * 0.3),
                        backgroundColor: serviceColor ?? colors.surface,
                        borderWidth: 1,
                        borderColor: withAlpha('#FFFFFF', isDark ? 0.3 : 0.55),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: Math.max(10, Math.round(badgeSize * 0.42)),
                          fontWeight: '600',
                          color: colors.iconOnColor,
                          fontVariant: ['tabular-nums'],
                        }}
                        selectable
                      >
                        {items.length}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
