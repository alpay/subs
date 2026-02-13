import type { StyleProp, ViewStyle } from 'react-native';
import type { Subscription } from '@/lib/db/schema';

import { addMonths, format, getDay, getDaysInMonth, isToday, startOfMonth } from 'date-fns';
import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Haptic } from '@/lib/haptics';
import { useTheme } from '@/lib/hooks/use-theme';
import { getPaymentDatesForMonth } from '@/lib/utils/subscription-dates';
import { getServiceColor, ServiceIcon } from './service-icon';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TOTAL_CELLS = 6 * 7;
const SIDE_PADDING = 8;
const GAP_BETWEEN_PAGES = 16;
const CELL_GAP = 4;

function withAlpha(hex: string, alpha: number) {
  const n = hex.replace('#', '');
  const v = n.length === 3 ? n.split('').map(c => c + c).join('') : n;
  const r = Number.parseInt(v.slice(0, 2), 16);
  const g = Number.parseInt(v.slice(2, 4), 16);
  const b = Number.parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildMonthCells(date: Date): Array<{ date: Date | null; index: number }> {
  const start = startOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const lead = (getDay(start) + 6) % 7;
  const cells: Array<{ date: Date | null; index: number }> = [];
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const d = i - lead + 1;
    cells.push({
      date: d > 0 && d <= daysInMonth ? new Date(date.getFullYear(), date.getMonth(), d) : null,
      index: i,
    });
  }
  return cells;
}

export type MonthCalendarMetrics = {
  gap: number;
  cellSize: number;
  cellHeight: number;
  cellRadius: number;
  iconSize: number;
  badgeSize: number;
  calendarWidth: number;
  viewportWidth: number;
};

type MonthGridProps = {
  date: Date;
  subscriptions: Subscription[];
  onDayPress?: (date: Date) => void;
  metrics: MonthCalendarMetrics;
  colors: ReturnType<typeof useTheme>['colors'];
  isDark: boolean;
};

const MonthGrid = memo(({
  date,
  subscriptions,
  onDayPress,
  metrics,
  colors,
  isDark,
}: MonthGridProps) => {
  const { gap, cellSize, cellHeight, cellRadius, iconSize, badgeSize, calendarWidth: width } = metrics;

  const paymentMap = useMemo(() => {
    const map = new Map<string, Subscription[]>();
    subscriptions.forEach((sub) => {
      getPaymentDatesForMonth(sub, date).forEach((d) => {
        const k = format(d, 'yyyy-MM-dd');
        const list = map.get(k) ?? [];
        list.push(sub);
        map.set(k, list);
      });
    });
    return map;
  }, [subscriptions, date]);

  const cells = useMemo(() => buildMonthCells(date), [date]);

  const cellShape = useMemo(
    () => ({ width: cellSize, height: cellHeight, borderRadius: cellRadius }),
    [cellSize, cellHeight, cellRadius],
  );

  const emptyCellStyle = useMemo(
    () => ({
      backgroundColor: withAlpha(colors.surfaceMuted, isDark ? 0.28 : 0.45),
      borderWidth: 1,
      borderColor: withAlpha(colors.surfaceBorder, isDark ? 0.22 : 0.35),
    }),
    [colors.surfaceMuted, colors.surfaceBorder, isDark],
  );

  return (
    <View style={[styles.gridContainer, { width, gap: 14 }]}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, i) => (
          <Text key={`weekday-${day}-${i}`} style={[styles.weekdayLabel, { width: cellSize, color: colors.textMuted }]}>
            {day}
          </Text>
        ))}
      </View>
      <View style={[styles.cells, { gap }]}>
        {cells.map((cell) => {
          if (!cell.date) {
            return (
              <View key={`e-${cell.index}`} style={[styles.cellBase, cellShape, emptyCellStyle]} />
            );
          }
          const dayDate = cell.date;
          const key = format(dayDate, 'yyyy-MM-dd');
          const items = paymentMap.get(key) ?? [];
          const isHighlight = isToday(dayDate);
          const serviceColor = items[0] ? getServiceColor(items[0].iconKey) : null;
          const bg = serviceColor ? withAlpha(serviceColor, isDark ? 0.36 : 0.2) : colors.surfaceMuted;
          const border = serviceColor ? withAlpha(serviceColor, isDark ? 0.75 : 0.55) : colors.surfaceBorder;
          const textColor = serviceColor
            ? withAlpha(colors.text, isDark ? 0.65 : 0.5)
            : withAlpha(colors.textMuted, isDark ? 0.75 : 0.7);

          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              onPress={() => {
                Haptic.Light();
                onDayPress?.(dayDate);
              }}
              style={({ pressed }) => [
                styles.cellBase,
                cellShape,
                {
                  backgroundColor: bg,
                  borderWidth: isHighlight ? 1.5 : 1,
                  borderColor: isHighlight ? colors.text : border,
                },
                pressed && styles.cellPressed,
              ]}
            >
              <Text style={[styles.dayLabel, { color: textColor }]}>{dayDate.getDate()}</Text>
              {items.length > 0 && (
                <View style={styles.cellIcons}>
                  {items.length === 1 && (
                    <ServiceIcon iconKey={items[0].iconKey} iconUri={items[0].iconType === 'image' ? items[0].iconUri : undefined} size={iconSize} style={styles.iconNoShadow} />
                  )}
                  {items.length > 1 && (
                    <>
                      <ServiceIcon iconKey={items[0].iconKey} iconUri={items[0].iconType === 'image' ? items[0].iconUri : undefined} size={iconSize * 0.8} style={styles.iconNoShadow} />
                      <View style={[styles.badge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, marginLeft: -Math.round(badgeSize * 0.5), backgroundColor: serviceColor ?? colors.surface, borderColor: withAlpha('#FFF', isDark ? 0.3 : 0.55) }]}>
                        <Text style={[styles.badgeText, { fontSize: Math.max(10, Math.round(badgeSize * 0.42)), color: colors.iconOnColor }]}>
                          {items.length}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

type MonthCalendarProps = {
  date: Date;
  subscriptions: Subscription[];
  style?: StyleProp<ViewStyle>;
  onDayPress?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
};

export function MonthCalendar({ date, subscriptions, style, onDayPress, onMonthChange }: MonthCalendarProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const [layoutWidth, setLayoutWidth] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const metrics = useMemo((): MonthCalendarMetrics | null => {
    const w = layoutWidth ?? windowWidth;
    const viewportWidth = Math.max(0, Math.floor(w - 2 * SIDE_PADDING));
    if (viewportWidth <= 0)
      return null;
    const contentW = Math.max(0, viewportWidth - GAP_BETWEEN_PAGES);
    const cellSize = Math.floor((contentW - CELL_GAP * 6) / 7);
    const cellHeight = Math.round(cellSize * 1.3);
    return {
      gap: CELL_GAP,
      cellSize,
      cellHeight,
      cellRadius: Math.round(Math.min(cellSize, cellHeight) * 0.3),
      iconSize: Math.max(26, Math.floor(cellSize * 0.6)),
      badgeSize: Math.max(18, Math.floor(cellSize * 0.28)),
      calendarWidth: cellSize * 7 + CELL_GAP * 6,
      viewportWidth,
    };
  }, [layoutWidth, windowWidth]);

  const resetScroll = useCallback(() => {
    if (metrics?.viewportWidth) {
      scrollRef.current?.scrollTo({ x: metrics.viewportWidth, animated: false });
    }
  }, [metrics]);

  useLayoutEffect(() => {
    resetScroll();
  }, [date, resetScroll]);

  const handleMomentumEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      if (!onMonthChange || !metrics)
        return;
      const page = Math.round(e.nativeEvent.contentOffset.x / metrics.viewportWidth);
      if (page !== 1) {
        onMonthChange(addMonths(date, page === 0 ? -1 : 1));
      }
    },
    [date, onMonthChange, metrics],
  );

  const months = useMemo(() => [addMonths(date, -1), date, addMonths(date, 1)], [date]);

  const onLayout = useCallback((e: { nativeEvent: { layout: { width: number } } }) => {
    const next = Math.round(e.nativeEvent.layout.width);
    setLayoutWidth(prev => (prev === next ? prev : next));
  }, []);

  if (!metrics) {
    return <View style={[styles.root, style, { paddingHorizontal: SIDE_PADDING }]} onLayout={onLayout} />;
  }

  const { viewportWidth } = metrics;
  const pageStyle = [styles.page, { width: viewportWidth, backgroundColor: colors.background }];

  return (
    <View style={[styles.root, style, { paddingHorizontal: SIDE_PADDING }]} onLayout={onLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        scrollEnabled={Boolean(onMonthChange)}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{ width: viewportWidth * 3 }}
        style={{ width: viewportWidth }}
        removeClippedSubviews={false}
        backgroundColor={colors.background}
      >
        <View style={styles.pagesRow}>
          {months.map((monthDate, i) => (
            <View key={i} style={pageStyle} collapsable={false}>
              <MonthGrid
                date={monthDate}
                subscriptions={subscriptions}
                onDayPress={onDayPress}
                metrics={metrics}
                colors={colors}
                isDark={isDark}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden', alignSelf: 'stretch' },
  page: { alignItems: 'center', overflow: 'hidden' },
  pagesRow: { flexDirection: 'row' },
  gridContainer: { alignSelf: 'center' },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekdayLabel: { textAlign: 'center', fontSize: 11 },
  cells: { flexDirection: 'row', flexWrap: 'wrap' },
  cellBase: { borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  cellPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  dayLabel: { position: 'absolute', bottom: 4, right: 4, fontSize: 10, opacity: 0.85, fontVariant: ['tabular-nums'] },
  cellIcons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 },
  iconNoShadow: { boxShadow: 'none' },
  badge: { borderCurve: 'continuous', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontWeight: '600', fontVariant: ['tabular-nums'] },
});
