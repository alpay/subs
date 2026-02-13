import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useIsUnderSheet } from '@/lib/hooks/use-is-under-sheet';
import { useTheme } from '@/lib/hooks/use-theme';

const springConfig = {
  mass: 10,
  damping: 1000,
  stiffness: 1000,
};

/**
 * Wraps content that sits behind a sheet. When a sheet is open,
 * applies a 3D perspective transform so the background appears to recede on the z-axis.
 */
export function UnderSheetTransform({ children }: { children: ReactNode }) {
  const isUnderSheet = useIsUnderSheet();
  const progress = useSharedValue(0);
  const { colors } = useTheme();

  useEffect(() => {
    progress.value = withSpring(isUnderSheet ? 1 : 0, springConfig);
  }, [isUnderSheet, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (Platform.OS !== 'ios') {
      return {};
    }
    const scale = 1 - progress.value * 0.1;
    const perspective = 1000;
    return {
      transform: [
        { perspective },
        { scale },
      ],
    };
  }, []);

  if (Platform.OS !== 'ios') {
    return <>{children}</>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}
