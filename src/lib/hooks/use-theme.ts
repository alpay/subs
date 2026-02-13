import { useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import { Uniwind } from 'uniwind';

import { useSettingsStore } from '@/lib/stores/settings-store';
import { storage } from '../storage';

const SELECTED_THEME_MODE = 'SELECTED_THEME_MODE';
const SELECTED_APP_THEME = 'SELECTED_APP_THEME';

export type ColorSchemeType = 'light' | 'dark' | 'system';

const APP_THEME_IDS = ['classic', 'midnight', 'forest', 'sunset'] as const;

export type AppThemeId = (typeof APP_THEME_IDS)[number];

export type ThemePalette = {
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

export type AppThemeMeta = {
  id: AppThemeId;
  name: string;
  description: string;
};

export const APP_THEME_COLORS: Record<AppThemeId, Record<'light' | 'dark', ThemePalette>> = {
  classic: {
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
  },
  midnight: {
    light: {
      background: '#EFF3FF',
      card: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceMuted: '#E3E8FF',
      surfaceElevated: '#F5F7FF',
      surfaceBorder: '#D4DCFF',
      text: '#111322',
      secondaryText: '#5B647F',
      textMuted: '#7A86A1',
      border: '#D4DCFF',
      primary: '#4158D0',
      accent: '#4158D0',
      accentSoft: '#DDE3FF',
      pill: '#E6EBFF',
      success: '#16A34A',
      successSoft: '#DCFCE7',
      warning: '#F59E0B',
      danger: '#EF4444',
      iconOnColor: '#FFFFFF',
    },
    dark: {
      background: '#050816',
      card: '#0B1020',
      surface: '#0B1020',
      surfaceMuted: '#14172A',
      surfaceElevated: '#181B2F',
      surfaceBorder: '#222749',
      text: '#F9FAFB',
      secondaryText: '#A3B0D0',
      textMuted: '#7C86AC',
      border: '#222749',
      primary: '#6366F1',
      accent: '#6366F1',
      accentSoft: '#20224A',
      pill: '#151826',
      success: '#22C55E',
      successSoft: '#052E16',
      warning: '#FACC15',
      danger: '#F97373',
      iconOnColor: '#FFFFFF',
    },
  },
  forest: {
    light: {
      background: '#F1F7F3',
      card: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceMuted: '#E6F0E8',
      surfaceElevated: '#F6FBF7',
      surfaceBorder: '#D1E3D6',
      text: '#102116',
      secondaryText: '#5B6D61',
      textMuted: '#6B7E72',
      border: '#C9DBC9',
      primary: '#22C55E',
      accent: '#22C55E',
      accentSoft: '#DCFCE7',
      pill: '#E3F3E7',
      success: '#16A34A',
      successSoft: '#DCFCE7',
      warning: '#F59E0B',
      danger: '#EF4444',
      iconOnColor: '#FFFFFF',
    },
    dark: {
      background: '#020D07',
      card: '#07140E',
      surface: '#07140E',
      surfaceMuted: '#0C1C13',
      surfaceElevated: '#0F2318',
      surfaceBorder: '#143321',
      text: '#ECFDF3',
      secondaryText: '#9AE6B4',
      textMuted: '#72C58F',
      border: '#166534',
      primary: '#22C55E',
      accent: '#22C55E',
      accentSoft: '#052E16',
      pill: '#0A1A11',
      success: '#22C55E',
      successSoft: '#052E16',
      warning: '#FACC15',
      danger: '#F97373',
      iconOnColor: '#FFFFFF',
    },
  },
  sunset: {
    light: {
      background: '#FFF4ED',
      card: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceMuted: '#FFE7D6',
      surfaceElevated: '#FFF8F3',
      surfaceBorder: '#FED7AA',
      text: '#1F130F',
      secondaryText: '#7A5B4A',
      textMuted: '#8C6B57',
      border: '#FEC6A1',
      primary: '#FB923C',
      accent: '#FB923C',
      accentSoft: '#FFEDD5',
      pill: '#FFE4D0',
      success: '#16A34A',
      successSoft: '#DCFCE7',
      warning: '#F97316',
      danger: '#EF4444',
      iconOnColor: '#FFFFFF',
    },
    dark: {
      background: '#1A0B07',
      card: '#220E08',
      surface: '#220E08',
      surfaceMuted: '#2A130C',
      surfaceElevated: '#32170E',
      surfaceBorder: '#4A2614',
      text: '#FEF3C7',
      secondaryText: '#FCD34D',
      textMuted: '#FDBA74',
      border: '#4A2614',
      primary: '#FB923C',
      accent: '#FB923C',
      accentSoft: '#451A0A',
      pill: '#2A130C',
      success: '#22C55E',
      successSoft: '#052E16',
      warning: '#FACC15',
      danger: '#F97373',
      iconOnColor: '#FFFFFF',
    },
  },
};

export const APP_THEMES: readonly AppThemeMeta[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Warm orange accent with balanced neutrals.',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep blues for a focused, cinematic look.',
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Soft greens inspired by nature.',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Golden hour oranges with cozy contrast.',
  },
] as const;

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [storedThemeMode, setStoredThemeMode] = useMMKVString(SELECTED_THEME_MODE, storage);
  const [storedAppTheme, setStoredAppTheme] = useMMKVString(SELECTED_APP_THEME, storage);
  const { settings } = useSettingsStore();

  const selectedTheme = (storedThemeMode ?? 'system') as ColorSchemeType;

  const activeTheme: 'light' | 'dark' = useMemo(() => {
    if (selectedTheme === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return selectedTheme;
  }, [selectedTheme, systemColorScheme]);

  const appThemeId: AppThemeId = useMemo(() => {
    const fallback: AppThemeId = 'classic';
    if (!storedAppTheme)
      return fallback;
    return (APP_THEME_IDS as readonly string[]).includes(storedAppTheme)
      ? (storedAppTheme as AppThemeId)
      : fallback;
  }, [storedAppTheme]);

  const setTheme = useCallback(
    (theme: ColorSchemeType) => {
      Uniwind.setTheme(theme);
      setStoredThemeMode(theme);
    },
    [setStoredThemeMode],
  );

  const setAppTheme = useCallback(
    (id: AppThemeId) => {
      setStoredAppTheme(id);
    },
    [setStoredAppTheme],
  );

  const colors = useMemo(() => {
    const base = APP_THEME_COLORS[appThemeId][activeTheme];

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
  }, [activeTheme, appThemeId, settings.trueDarkColors]);

  return {
    colors,
    isDark: activeTheme === 'dark',
    activeTheme,
    selectedTheme,
    setTheme,
    appThemeId,
    setAppTheme,
  };
}

export function loadSelectedTheme() {
  const theme = storage.getString(SELECTED_THEME_MODE);
  if (theme !== undefined) {
    Uniwind.setTheme(theme as ColorSchemeType);
  }
}
