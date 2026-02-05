import type { Settings } from '@/lib/db/schema';

import { Text, View } from 'react-native';
import { useTheme } from '@/lib/hooks/use-theme';
import { formatAmount, formatMonthYear } from '@/lib/utils/format';

type HomeSummaryProps = {
  monthlyTotal: number;
  averageMonthly: number;
  settings: Settings;
  monthDate: Date;
};

export function HomeSummary({ monthlyTotal, averageMonthly, settings, monthDate }: HomeSummaryProps) {
  const { colors } = useTheme();

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
    </View>
  );
}
