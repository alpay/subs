import { addDays, addMonths, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ModalSheet } from '@/components/modal-sheet';
import { useTheme } from '@/lib/hooks/use-theme';
import { useAddSubscriptionDraftStore } from '@/lib/stores';

const WEEKDAY_LABELS = [
  { key: 'monday', label: 'M' },
  { key: 'tuesday', label: 'T' },
  { key: 'wednesday', label: 'W' },
  { key: 'thursday', label: 'T' },
  { key: 'friday', label: 'F' },
  { key: 'saturday', label: 'S' },
  { key: 'sunday', label: 'S' },
] as const;

function buildCalendarDays(month: Date) {
  const monthStart = startOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export default function DatePickerScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { startDate, setStartDate } = useAddSubscriptionDraftStore();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(startDate));

  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);

  return (
    <ModalSheet
      title="Start Date"
      closeButtonTitle="Close"
      snapPoints={['88%']}
      lockSnapPoint
      bottomScrollSpacer={88}
      scrollViewProps={{ bounces: false }}
    >
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable
            onPress={() => setVisibleMonth(prev => addMonths(prev, -1))}
            style={({ pressed }) => [
              {
                width: 40,
                height: 40,
                borderRadius: 20,
                borderCurve: 'continuous',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surfaceMuted,
                borderWidth: 1,
                borderColor: colors.surfaceBorder,
              },
              pressed && { opacity: 0.78 },
            ]}
          >
            <Image
              source="sf:chevron.left"
              style={{ width: 14, height: 14 }}
              tintColor={colors.text}
            />
          </Pressable>

          <View style={{ alignItems: 'center', gap: 2 }}>
            <Text style={{ fontSize: 19, fontWeight: '700', color: colors.text }} selectable>
              {format(visibleMonth, 'MMMM yyyy')}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
              {format(startDate, 'dd MMM yyyy')}
            </Text>
          </View>

          <Pressable
            onPress={() => setVisibleMonth(prev => addMonths(prev, 1))}
            style={({ pressed }) => [
              {
                width: 40,
                height: 40,
                borderRadius: 20,
                borderCurve: 'continuous',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surfaceMuted,
                borderWidth: 1,
                borderColor: colors.surfaceBorder,
              },
              pressed && { opacity: 0.78 },
            ]}
          >
            <Image
              source="sf:chevron.right"
              style={{ width: 14, height: 14 }}
              tintColor={colors.text}
            />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row' }}>
          {WEEKDAY_LABELS.map(day => (
            <View key={day.key} style={{ width: '14.2857%', alignItems: 'center', paddingVertical: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted }} selectable>
                {day.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 }}>
          {days.map((day) => {
            const isSelected = isSameDay(day, startDate);
            const inCurrentMonth = isSameMonth(day, visibleMonth);
            const today = isToday(day);

            return (
              <View key={day.toISOString()} style={{ width: '14.2857%', alignItems: 'center' }}>
                <Pressable
                  onPress={() => {
                    setStartDate(day);
                    if (!inCurrentMonth) {
                      setVisibleMonth(startOfMonth(day));
                    }
                  }}
                  style={({ pressed }) => [
                    {
                      width: 42,
                      height: 42,
                      borderRadius: 16,
                      borderCurve: 'continuous',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: today || isSelected ? 1.5 : 1,
                      borderColor: isSelected ? colors.text : today ? colors.accent : colors.surfaceBorder,
                      backgroundColor: isSelected ? colors.text : colors.surfaceMuted,
                      boxShadow: isDark
                        ? '0 8px 14px rgba(0, 0, 0, 0.24)'
                        : '0 8px 14px rgba(15, 23, 42, 0.08)',
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isSelected ? '700' : '600',
                      color: isSelected
                        ? colors.background
                        : inCurrentMonth
                          ? colors.text
                          : colors.textMuted,
                      fontVariant: ['tabular-nums'],
                    }}
                    selectable
                  >
                    {format(day, 'd')}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          {
            marginTop: 12,
            borderRadius: 999,
            borderCurve: 'continuous',
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? '#F5F5F5' : colors.text,
          },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? '#1C1C1E' : colors.background,
          }}
          selectable
        >
          Done
        </Text>
      </Pressable>
    </ModalSheet>
  );
}
