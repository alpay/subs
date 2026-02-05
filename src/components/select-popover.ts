import type { ViewStyle } from 'react-native';
import { useMemo } from 'react';

import { useTheme } from '@/lib/hooks/use-theme';

const MIN_POPOVER_WIDTH = 200;

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;

  if (full.length !== 6) {
    return hex;
  }

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function useSelectPopoverStyles() {
  const { colors, isDark } = useTheme();

  return useMemo(
    () => ({
      content: {
        minWidth: MIN_POPOVER_WIDTH,
        backgroundColor: withAlpha(colors.surfaceElevated, isDark ? 0.9 : 0.94),
        borderRadius: 24,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: withAlpha(colors.surfaceBorder, isDark ? 0.55 : 0.75),
        boxShadow: isDark
          ? '0 20px 40px rgba(0, 0, 0, 0.35)'
          : '0 18px 30px rgba(15, 23, 42, 0.12)',
        overflow: 'hidden',
      } as ViewStyle,
    }),
    [colors.surfaceBorder, colors.surfaceElevated, isDark],
  );
}
