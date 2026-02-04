import type { Theme } from '@react-navigation/native';
import {
  DarkTheme as _DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';

import colors from '@/components/ui/colors';
import { useTheme } from '@/lib/hooks/use-theme';
import { useSettingsStore } from '@/lib/stores/settings-store';

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
  const { settings } = useSettingsStore();

  if (isDark && settings.trueDarkColors) {
    return {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: '#000000',
        card: '#0B0B0B',
        border: '#1F1F1F',
      },
    };
  }

  return isDark ? DarkTheme : LightTheme;
}
