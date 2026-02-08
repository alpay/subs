import type { StyleProp, ViewStyle } from 'react-native';
import type { Subscription } from '@/lib/db/schema';

import { addMonths, format, getDay, getDaysInMonth, isToday, startOfMonth } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

import { getPaymentDatesForMonth } from '@/lib/utils/subscription-dates';

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
const GRID_ROWS = 6;
const TOTAL_CELLS = GRID_ROWS * 7;

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

function buildMonthCells(date: Date) {
  const monthStart = startOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const leadingEmpty = getMondayIndex(monthStart);
  const cells: Array<{ date: Date | null; index: number }> = [];

  for (let i = 0; i < TOTAL_CELLS; i += 1) {
    const dayIndex = i - leadingEmpty + 1;
    if (dayIndex <= 0 || dayIndex > daysInMonth) {
      cells.push({ date: null, index: i });
    }
    else {
      cells.push({ date: new Date(date.getFullYear(), date.getMonth(), dayIndex), index: i });
    }
  }

  return cells;
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
  const paymentMap = useMemo(() => {
    const map = new Map<string, Subscription[]>();

    subscriptions.forEach((subscription) => {
      const paymentDates = getPaymentDatesForMonth(subscription, date);
      paymentDates.forEach((paymentDate) => {
        const key = format(paymentDate, 'yyyy-MM-dd');
        const existing = map.get(key) ?? [];
        existing.push(subscription);
        map.set(key, existing);
      });
    });

    return map;
  }, [subscriptions, date]);

  const cells = useMemo(() => {
    return buildMonthCells(date);
  }, [date]);

  const cellShape = useMemo(
    () => ({
      width: cellSize,
      height: cellHeight,
      borderRadius: cellRadius,
    }),
    [cellHeight, cellRadius, cellSize],
  );

  const handleDayPress = useCallback(
    (selectedDate: Date) => {
      onDayPress?.(selectedDate);
    },
    [onDayPress],
  );

  return (
    <View style={[styles.gridContainer, { width, gap: 14 }]}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, index) => (
          <Text
            key={`${day}-${index}`}
            style={[styles.weekdayLabel, { width: cellSize, color: colors.textMuted }]}
            selectable
          >
            {day}
          </Text>
        ))}
      </View>

      <View style={[styles.cells, { gap }]}>
        {cells.map((cell) => {
          if (!cell.date) {
            return (
              <View
                key={`empty-${cell.index}`}
                style={[
                  styles.cellBase,
                  cellShape,
                  {
                    backgroundColor: withAlpha(colors.surfaceMuted, isDark ? 0.28 : 0.45),
                    borderWidth: 1,
                    borderColor: withAlpha(colors.surfaceBorder, isDark ? 0.22 : 0.35),
                    boxShadow: isDark
                      ? '0 6px 12px rgba(0, 0, 0, 0.18)'
                      : '0 6px 12px rgba(15, 23, 42, 0.07)',
                  },
                ]}
              />
            );
          }

          const dayDate = cell.date;
          const key = format(dayDate, 'yyyy-MM-dd');
          const items = paymentMap.get(key) ?? [];
          const highlight = isToday(dayDate);
          const dayLabel = dayDate.getDate();
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
              onPress={() => handleDayPress(dayDate)}
              style={({ pressed }) => [
                styles.cellBase,
                cellShape,
                {
                  backgroundColor: cellBackground,
                  borderWidth: highlight ? 1.5 : 1,
                  borderColor: highlight ? colors.text : cellBorderColor,
                  boxShadow: isDark
                    ? '0 12px 22px rgba(0, 0, 0, 0.32)'
                    : '0 12px 22px rgba(15, 23, 42, 0.12)',
                },
                pressed ? styles.cellPressed : null,
              ]}
            >
              <Text
                style={[styles.dayLabel, { color: dayLabelColor }]}
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
                        style={[
                          styles.badgeText,
                          {
                            fontSize: Math.max(10, Math.round(badgeSize * 0.42)),
                            color: colors.iconOnColor,
                          },
                        ]}
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
  const { width: windowWidth } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  const handleLayout = useCallback((event: { nativeEvent: { layout: { width: number } } }) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    setContainerWidth(prev => (prev === nextWidth ? prev : nextWidth));
  }, []);

  const metrics = useMemo(() => {
    const gap = 10;
    const availableWidth = containerWidth ?? windowWidth;
    const pageWidth = Math.max(0, Math.floor(availableWidth));
    const cellSize = Math.floor((pageWidth - gap * 6) / 7);
    const cellHeight = Math.round(cellSize * 1.3);
    const cellRadius = Math.round(Math.min(cellSize, cellHeight) * 0.3);
    const iconSize = Math.max(26, Math.floor(cellSize * 0.6));
    const badgeSize = Math.max(18, Math.floor(cellSize * 0.28));
    const calendarWidth = cellSize * 7 + gap * 6;

    return {
      gap,
      cellSize,
      cellHeight,
      cellRadius,
      iconSize,
      badgeSize,
      calendarWidth,
      pageWidth,
    };
  }, [containerWidth, windowWidth]);

  const {
    gap,
    cellSize,
    cellHeight,
    cellRadius,
    iconSize,
    badgeSize,
    calendarWidth,
    pageWidth,
  } = metrics;

  const resetScroll = useCallback(() => {
    if (pageWidth <= 0) {
      return;
    }
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: pageWidth, animated: false });
    });
  }, [pageWidth]);

  useEffect(() => {
    resetScroll();
  }, [date, resetScroll]);

  const handleMomentumEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      if (!onMonthChange || pageWidth <= 0) {
        return;
      }
      const offsetX = event.nativeEvent.contentOffset.x;
      const page = Math.round(offsetX / pageWidth);
      if (page === 1) {
        return;
      }
      const direction = page === 0 ? -1 : 1;
      onMonthChange(addMonths(date, direction));
      resetScroll();
    },
    [date, onMonthChange, pageWidth, resetScroll],
  );

  const prevMonth = useMemo(() => addMonths(date, -1), [date]);
  const nextMonth = useMemo(() => addMonths(date, 1), [date]);
  const scrollEnabled = Boolean(onMonthChange);

  return (
    <View onLayout={handleLayout} style={[styles.root, style]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{ width: pageWidth * 3 }}
        scrollEventThrottle={16}
        style={{ width: pageWidth }}
      >
        <View style={{ flexDirection: 'row' }}>
          <View style={[styles.page, { width: pageWidth }]}>
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
          </View>
          <View style={[styles.page, { width: pageWidth }]}>
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
          </View>
          <View style={[styles.page, { width: pageWidth }]}>
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
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  page: {
    alignItems: 'center',
  },
  gridContainer: {
    alignSelf: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayLabel: {
    textAlign: 'center',
    fontSize: 11,
  },
  cells: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellBase: {
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  dayLabel: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    fontSize: 11,
    opacity: 0.85,
    fontVariant: ['tabular-nums'],
  },
  badgeText: {
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
