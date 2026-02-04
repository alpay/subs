import { useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import { Uniwind } from 'uniwind';

import { useSettingsStore } from '@/lib/stores/settings-store';
import { storage } from '../storage';

const SELECTED_THEME = 'SELECTED_THEME';

export type ColorSchemeType = 'light' | 'dark' | 'system';

type ThemePalette = {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  border: string;
  primary: string;
};

const THEME_COLORS: Record<'light' | 'dark', ThemePalette> = {
  light: {
    background: '#FFFFFF',
    card: '#F7F7F8',
    text: '#0F172A',
    secondaryText: '#64748B',
    border: '#E2E8F0',
    primary: '#FF6C00',
  },
  dark: {
    background: '#0B0B0B',
    card: '#171717',
    text: '#F8FAFC',
    secondaryText: '#94A3B8',
    border: '#262626',
    primary: '#FF8A33',
  },
};

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [storedTheme, setStoredTheme] = useMMKVString(SELECTED_THEME, storage);
  const { settings } = useSettingsStore();

  const selectedTheme = (storedTheme ?? 'system') as ColorSchemeType;

  const activeTheme: 'light' | 'dark' = useMemo(() => {
    if (selectedTheme === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return selectedTheme;
  }, [selectedTheme, systemColorScheme]);

  const setTheme = useCallback(
    (theme: ColorSchemeType) => {
      Uniwind.setTheme(theme);
      setStoredTheme(theme);
    },
    [setStoredTheme],
  );

  const colors = useMemo(() => {
    const base = THEME_COLORS[activeTheme];

    if (activeTheme === 'dark' && settings.trueDarkColors) {
      return {
        ...base,
        background: '#000000',
        card: '#0B0B0B',
        border: '#1F1F1F',
      };
    }

    return base;
  }, [activeTheme, settings.trueDarkColors]);

  return {
    colors,
    isDark: activeTheme === 'dark',
    activeTheme,
    selectedTheme,
    setTheme,
  };
}

export function loadSelectedTheme() {
  const theme = storage.getString(SELECTED_THEME);
  if (theme !== undefined) {
    Uniwind.setTheme(theme as ColorSchemeType);
  }
}
