import { Text, View } from 'react-native';

import { Pill } from '@/components/pill';
import { useTheme } from '@/lib/hooks/use-theme';
import type { Settings } from '@/lib/db/schema';
import { formatAmount, formatMonthYear } from '@/lib/utils/format';

type HomeSummaryProps = {
  monthlyTotal: number;
  averageMonthly: number;
  settings: Settings;
  monthDate: Date;
};

type MonthBadge = {
  label: string;
  tone: 'accent' | 'neutral' | 'success';
};

function getMonthBadge(monthlyTotal: number, averageMonthly: number): MonthBadge {
  if (averageMonthly === 0) {
    return { label: 'New Month', tone: 'accent' };
  }

  if (monthlyTotal > averageMonthly * 1.1) {
    return { label: 'Peak Month', tone: 'accent' };
  }

  if (monthlyTotal < averageMonthly * 0.9) {
    return { label: 'Low Month', tone: 'neutral' };
  }

  return { label: 'Regular Month', tone: 'success' };
}

export function HomeSummary({ monthlyTotal, averageMonthly, settings, monthDate }: HomeSummaryProps) {
  const { colors } = useTheme();
  const badge = getMonthBadge(monthlyTotal, averageMonthly);

  return (
    <View style={{ alignItems: 'center', gap: 10, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
        {formatMonthYear(monthDate)}
      </Text>
      <Text
        style={{ fontSize: 52, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] }}
        selectable
      >
        {formatAmount(monthlyTotal, settings.mainCurrency, settings.roundWholeNumbers)}
      </Text>
      <Pill tone={badge.tone} style={{ paddingHorizontal: 14, paddingVertical: 6 }}>
        {badge.label}
      </Pill>
    </View>
  );
}
