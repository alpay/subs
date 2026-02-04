import { create } from 'zustand';

import type { Settings } from '@/lib/db/schema';
import { getSettings, saveSettings } from '@/lib/db/storage';
import { DEFAULT_SETTINGS } from '@/lib/data/seed-defaults';

const nowSettings = () => ({ ...DEFAULT_SETTINGS });

type SettingsState = {
  settings: Settings;
  isLoaded: boolean;
  load: () => void;
  update: (partial: Partial<Settings>) => void;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: nowSettings(),
  isLoaded: false,
  load: () => {
    const stored = getSettings();
    set({ settings: stored, isLoaded: true });
  },
  update: (partial) => {
    const next = { ...get().settings, ...partial };
    saveSettings(next);
    set({ settings: next });
  },
}));
