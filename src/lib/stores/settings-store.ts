import type { Settings } from '@/lib/db/schema';

import { create } from 'zustand';
import { DEFAULT_SETTINGS } from '@/lib/data/seed-defaults';
import { getSettings, getSubscriptions, saveSettings } from '@/lib/db/storage';
import { rescheduleAllNotifications } from '@/lib/notifications';

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
    void rescheduleAllNotifications(getSubscriptions(), next);
  },
}));
