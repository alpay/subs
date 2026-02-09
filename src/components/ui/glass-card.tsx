import { BlurView } from 'expo-blur';
import type { StyleProp, ViewStyle } from 'react-native';
import { Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

export const GLASS_CARD_RADIUS = 16;

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GlassCard({ children, style }: GlassCardProps) {
  const { colors, isDark } = useTheme();
  const blurTint = isDark ? 'dark' : 'light';

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
      {Platform.OS === 'android' ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.surface, borderRadius: GLASS_CARD_RADIUS },
          ]}
        />
      ) : (
        <>
          <BlurView
            intensity={52}
            tint={blurTint}
            style={[StyleSheet.absoluteFill, { borderRadius: GLASS_CARD_RADIUS }]}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.glassOverlay,
              {
                backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.4)',
                borderRadius: GLASS_CARD_RADIUS,
              },
            ]}
            pointerEvents="none"
          />
        </>
      )}
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
  glassOverlay: {
    borderRadius: GLASS_CARD_RADIUS,
  },
});
