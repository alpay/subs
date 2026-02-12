import type { StyleProp, ViewStyle } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

export const GLASS_CARD_RADIUS = 16;

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Glass effect style. Default: 'regular'. */
  glassEffectStyle?: 'clear' | 'regular';
};

export function GlassCard({ children, style, glassEffectStyle = 'regular' }: GlassCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.glassCard,
        style,
        {
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
        },
      ]}
    >
      <GlassView
        glassEffectStyle={glassEffectStyle}
        style={[StyleSheet.absoluteFill, styles.glassView]}
      />
      <View style={styles.glassCardContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: GLASS_CARD_RADIUS,
    overflow: 'hidden',
  },
  glassCardContent: {},
  glassView: {
    borderRadius: GLASS_CARD_RADIUS,
  },
});
