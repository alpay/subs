import type { Theme } from '@react-navigation/native';
import {
  DarkTheme as _DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';

import colors from '@/components/ui/colors';
import { useTheme } from '@/lib/hooks/use-theme';

const DarkTheme: Theme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    primary: colors.primary[400],
    background: colors.dark.background,
    text: colors.dark.text,
    border: colors.dark.border,
    card: colors.dark.card,
  },
};

const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary[500],
    background: colors.light.background,
    text: colors.light.text,
    border: colors.light.border,
    card: colors.light.card,
  },
};

export function useThemeConfig() {
  const { isDark } = useTheme();
  return isDark ? DarkTheme : LightTheme;
}
