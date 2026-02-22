import type { Settings } from '@/lib/db/schema';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedReaction,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Haptic } from '@/lib/haptics';
import { useTheme } from '@/lib/hooks/use-theme';
import { formatAmount, formatMonthYear } from '@/lib/utils/format';

const labelEntering = FadeIn.duration(400);
const labelExiting = FadeOut.duration(350);

const amountSpringConfig = { damping: 100, stiffness: 250 };

type HomeSummaryProps = {
  monthlyTotal: number;
  remainingInMonth: number;
  settings: Settings;
  monthDate: Date;
};

export function HomeSummary({
  monthlyTotal,
  remainingInMonth,
  settings,
  monthDate,
}: HomeSummaryProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [showRemaining, setShowRemaining] = useState(false);
  const label = showRemaining ? t('home.remaining') : formatMonthYear(monthDate);
  const amount = showRemaining ? remainingInMonth : monthlyTotal;

  const amountValue = useSharedValue(amount);
  const [displayAmount, setDisplayAmount] = useState(amount);

  useEffect(() => {
    amountValue.value = withSpring(amount, amountSpringConfig);
  }, [amount, amountValue]);

  useAnimatedReaction(
    () => amountValue.value,
    (current) => {
      scheduleOnRN(setDisplayAmount, current);
    },
    [amountValue],
  );

  return (
    <Pressable
      onPress={() => {
        Haptic.Light();
        setShowRemaining(prev => !prev);
      }}
      style={{ alignItems: 'center', gap: 8, paddingVertical: 6 }}
    >
      <Animated.View
        key={label}
        entering={labelEntering}
        exiting={labelExiting}
        style={{ alignItems: 'center' }}
        collapsable={false}
      >
        <Text style={{ fontSize: 18, color: colors.textMuted }} selectable>
          {label}
        </Text>
      </Animated.View>
      <Text
        style={{ fontSize: 56, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] }}
        selectable
      >
        {formatAmount(displayAmount, settings.mainCurrency, settings.roundWholeNumbers)}
      </Text>
    </Pressable>
  );
}
