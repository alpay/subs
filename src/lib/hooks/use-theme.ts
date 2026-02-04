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
  surface: string;
  surfaceMuted: string;
  surfaceElevated: string;
  surfaceBorder: string;
  text: string;
  secondaryText: string;
  textMuted: string;
  border: string;
  primary: string;
  accent: string;
  accentSoft: string;
  pill: string;
  success: string;
  successSoft: string;
  warning: string;
  danger: string;
  iconOnColor: string;
};

const THEME_COLORS: Record<'light' | 'dark', ThemePalette> = {
  light: {
    background: '#F3F2F0',
    card: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F0EFED',
    surfaceElevated: '#FAFAFA',
    surfaceBorder: '#E2E2E2',
    text: '#151515',
    secondaryText: '#6E6E6E',
    textMuted: '#6E6E6E',
    border: '#E0E0E0',
    primary: '#FF8A33',
    accent: '#FF8A33',
    accentSoft: '#FFE3CD',
    pill: '#EAE9E6',
    success: '#34C759',
    successSoft: '#E6F9EE',
    warning: '#F59E0B',
    danger: '#EF4444',
    iconOnColor: '#FFFFFF',
  },
  dark: {
    background: '#1C1C1E',
    card: '#2C2C2E',
    surface: '#2C2C2E',
    surfaceMuted: '#343437',
    surfaceElevated: '#3A3A3C',
    surfaceBorder: '#3A3A3C',
    text: '#F5F5F5',
    secondaryText: '#A1A1A6',
    textMuted: '#A1A1A6',
    border: '#3A3A3C',
    primary: '#FF8A33',
    accent: '#FF8A33',
    accentSoft: '#3A2D22',
    pill: '#3A3A3C',
    success: '#34C759',
    successSoft: '#1F2D25',
    warning: '#F59E0B',
    danger: '#EF4444',
    iconOnColor: '#FFFFFF',
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
        surface: '#0B0B0B',
        surfaceMuted: '#151515',
        surfaceElevated: '#171717',
        surfaceBorder: '#1F1F1F',
        border: '#1F1F1F',
        pill: '#1A1A1A',
        accentSoft: '#2A1C14',
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
