import { create } from 'zustand';
import type { UserSettings, ThemeMode } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import * as storage from '@/services/storage';
import { themeService } from '@/services/theme';

interface SettingsStore {
  settings: UserSettings;
  isLoading: boolean;

  // Actions
  initialize: () => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateGeneralSettings: (updates: Partial<UserSettings['general']>) => void;
  updateAppearanceSettings: (updates: Partial<UserSettings['appearance']>) => void;
  updateChatSettings: (updates: Partial<UserSettings['chat']>) => void;
  updateProfileSettings: (updates: Partial<UserSettings['profile']>) => void;
  setTheme: (theme: ThemeMode) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,

  initialize: () => {
    const settings = storage.getSettings();
    set({ settings, isLoading: false });

    // Initialize theme
    themeService.setTheme(settings.appearance.theme);
  },

  updateSettings: (updates) => {
    const updated = storage.updateSettings(updates);
    set({ settings: updated });
  },

  updateGeneralSettings: (updates) => {
    get().updateSettings({
      general: { ...get().settings.general, ...updates },
    });
  },

  updateAppearanceSettings: (updates) => {
    const newSettings = {
      appearance: { ...get().settings.appearance, ...updates },
    };
    get().updateSettings(newSettings);

    // Apply theme if changed
    if (updates.theme) {
      themeService.setTheme(updates.theme);
    }
  },

  updateChatSettings: (updates) => {
    get().updateSettings({
      chat: { ...get().settings.chat, ...updates },
    });
  },

  updateProfileSettings: (updates) => {
    get().updateSettings({
      profile: { ...get().settings.profile, ...updates },
    });
  },

  setTheme: (theme) => {
    get().updateAppearanceSettings({ theme });
  },

  resetSettings: () => {
    const settings = storage.resetSettings();
    set({ settings });
    themeService.setTheme(settings.appearance.theme);
  },
}));
