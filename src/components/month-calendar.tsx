import type { StyleProp, ViewStyle } from 'react-native';
import type { Subscription } from '@/lib/db/schema';

import { addMonths, format, getDay, getDaysInMonth, isSameMonth, isToday, startOfMonth } from 'date-fns';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/lib/hooks/use-theme';

import { getServiceColor, ServiceIcon } from './service-icon';

type MonthCalendarProps = {
  date: Date;
  subscriptions: Subscription[];
  style?: StyleProp<ViewStyle>;
  onDayPress?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
};

type ThemeColors = ReturnType<typeof useTheme>['colors'];

type MonthGridProps = {
  date: Date;
  subscriptions: Subscription[];
  onDayPress?: (date: Date) => void;
  cellSize: number;
  cellHeight: number;
  cellRadius: number;
  iconSize: number;
  badgeSize: number;
  gap: number;
  width: number;
  colors: ThemeColors;
  isDark: boolean;
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function MonthGrid({
  date,
  subscriptions,
  onDayPress,
  cellSize,
  cellHeight,
  cellRadius,
  iconSize,
  badgeSize,
  gap,
  width,
  colors,
  isDark,
}: MonthGridProps) {
  const monthStart = startOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const leadingEmpty = getMondayIndex(monthStart);
  const totalCells = Math.ceil((leadingEmpty + daysInMonth) / 7) * 7;

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
    <View style={{ width, gap: 14 }}>
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

export function MonthCalendar({ date, subscriptions, style, onDayPress, onMonthChange }: MonthCalendarProps) {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();

  const gap = 10;
  const cellSize = Math.floor((width - 40 - gap * 6) / 7);
  const cellHeight = Math.round(cellSize * 1.3);
  const cellRadius = Math.round(Math.min(cellSize, cellHeight) * 0.3);
  const iconSize = Math.max(26, Math.floor(cellSize * 0.6));
  const badgeSize = Math.max(18, Math.floor(cellSize * 0.28));
  const calendarWidth = cellSize * 7 + gap * 6;

  const translateX = useSharedValue(-calendarWidth);
  const isAnimatingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isAnimatingRef.current = false;
    translateX.value = -calendarWidth;
  }, [calendarWidth, date, translateX]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const swipeGesture = useMemo(
    () => Gesture.Pan()
      .enabled(Boolean(onMonthChange))
      .activeOffsetX([-12, 12])
      .failOffsetY([-12, 12])
      .onBegin(() => {
        if (!onMonthChange) {
          return;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        isAnimatingRef.current = false;
        cancelAnimation(translateX);
      })
      .onUpdate((event) => {
        if (!onMonthChange || isAnimatingRef.current) {
          return;
        }
        const min = -2 * calendarWidth;
        const max = 0;
        translateX.value = clamp(-calendarWidth + event.translationX, min, max);
      })
      .onEnd((event) => {
        if (!onMonthChange || isAnimatingRef.current) {
          return;
        }
        const threshold = calendarWidth * 0.25;
        let direction: 'prev' | 'next' | null = null;

        if (event.translationX > threshold) {
          direction = 'prev';
        }
        else if (event.translationX < -threshold) {
          direction = 'next';
        }

        if (!direction) {
          translateX.value = withTiming(-calendarWidth, {
            duration: 200,
            easing: Easing.out(Easing.cubic),
          });
          return;
        }

        const duration = 260;
        const target = direction === 'next' ? -2 * calendarWidth : 0;
        isAnimatingRef.current = true;
        translateX.value = withTiming(target, {
          duration,
          easing: Easing.out(Easing.cubic),
        });

        timeoutRef.current = setTimeout(() => {
          onMonthChange(addMonths(date, direction === 'next' ? 1 : -1));
          translateX.value = -calendarWidth;
          isAnimatingRef.current = false;
        }, duration);
      })
      .runOnJS(true),
    [calendarWidth, date, onMonthChange, translateX],
  );

  const prevMonth = useMemo(() => addMonths(date, -1), [date]);
  const nextMonth = useMemo(() => addMonths(date, 1), [date]);

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={[{ width: calendarWidth, overflow: 'hidden' }, style]}>
        <Animated.View style={[{ flexDirection: 'row', width: calendarWidth * 3 }, animatedRowStyle]}>
          <MonthGrid
            date={prevMonth}
            subscriptions={subscriptions}
            onDayPress={onDayPress}
            cellSize={cellSize}
            cellHeight={cellHeight}
            cellRadius={cellRadius}
            iconSize={iconSize}
            badgeSize={badgeSize}
            gap={gap}
            width={calendarWidth}
            colors={colors}
            isDark={isDark}
          />
          <MonthGrid
            date={date}
            subscriptions={subscriptions}
            onDayPress={onDayPress}
            cellSize={cellSize}
            cellHeight={cellHeight}
            cellRadius={cellRadius}
            iconSize={iconSize}
            badgeSize={badgeSize}
            gap={gap}
            width={calendarWidth}
            colors={colors}
            isDark={isDark}
          />
          <MonthGrid
            date={nextMonth}
            subscriptions={subscriptions}
            onDayPress={onDayPress}
            cellSize={cellSize}
            cellHeight={cellHeight}
            cellRadius={cellRadius}
            iconSize={iconSize}
            badgeSize={badgeSize}
            gap={gap}
            width={calendarWidth}
            colors={colors}
            isDark={isDark}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
