import { useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import { Uniwind, useUniwind } from 'uniwind';

import colors from '@/components/ui/colors';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { storage } from '../storage';

const SELECTED_THEME = 'SELECTED_THEME';
export type ColorSchemeType = 'light' | 'dark' | 'system';

/**
 * Unified theme hook that provides:
 * - colors: Semantic color palette for the active theme
 * - isDark: Boolean indicating if dark mode is active
 * - activeTheme: The resolved theme ('light' | 'dark')
 * - selectedTheme: User's preference ('light' | 'dark' | 'system')
 * - setTheme: Function to change the theme
 */
export function useTheme() {
  const systemColorScheme = useColorScheme();
  useUniwind(); // Keep uniwind in sync but don't need its theme value
  const [storedTheme, setStoredTheme] = useMMKVString(SELECTED_THEME, storage);
  const { settings } = useSettingsStore();

  const selectedTheme = (storedTheme ?? 'system') as ColorSchemeType;

  // Determine active theme based on user preference or system
  const activeTheme: 'light' | 'dark' = useMemo(() => {
    if (selectedTheme === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return selectedTheme;
  }, [selectedTheme, systemColorScheme]);

  const isDark = activeTheme === 'dark';

  const setTheme = useCallback(
    (theme: ColorSchemeType) => {
      Uniwind.setTheme(theme);
      setStoredTheme(theme);
    },
    [setStoredTheme],
  );

  const themeColors = useMemo(() => {
    const base = colors[activeTheme];
    if (activeTheme === 'dark' && settings.trueDarkColors) {
      return {
        ...base,
        background: '#000000',
        card: '#0B0B0B',
        cardAlt: '#111111',
        border: '#1F1F1F',
        tabBarBackground: '#000000',
        overlay: 'rgba(0, 0, 0, 0.8)',
      };
    }
    return base;
  }, [activeTheme, settings.trueDarkColors]);

  return {
    colors: themeColors,
    isDark,
    activeTheme,
    selectedTheme,
    setTheme,
  };
}

/**
 * Load selected theme from storage on app initialization.
 * Call this in the root _layout.tsx before rendering.
 */
export function loadSelectedTheme() {
  const theme = storage.getString(SELECTED_THEME);
  if (theme !== undefined) {
    Uniwind.setTheme(theme as ColorSchemeType);
  }
}
