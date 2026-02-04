import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { Text, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

type PillTone = 'neutral' | 'accent' | 'success';

type PillProps = {
  children: ReactNode;
  tone?: PillTone;
  style?: StyleProp<ViewStyle>;
};

export function Pill({ children, tone = 'neutral', style }: PillProps) {
  const { colors } = useTheme();

  const toneStyles: Record<PillTone, { backgroundColor: string; color: string }> = {
    neutral: { backgroundColor: colors.pill, color: colors.text },
    accent: { backgroundColor: colors.accentSoft, color: colors.accent },
    success: { backgroundColor: colors.successSoft, color: colors.success },
  };

  return (
    <View
      style={[
        {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          borderCurve: 'continuous',
          backgroundColor: toneStyles[tone].backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: toneStyles[tone].color }} selectable>
        {children}
      </Text>
    </View>
  );
}
