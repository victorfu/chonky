import { create } from 'zustand';
import type { UserSettings, ThemeMode } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import { themeService } from '@/services/theme';
import {
  ensureDefaultUserSettings,
  normalizeUserSettings,
  resetUserSettings,
  subscribeUserSettings,
  upsertUserSettings,
} from '@/services/firestoreSettings';
import { useAuthStore } from './useAuthStore';
import i18n from '@/i18n';

function applySettingsSideEffects(settings: UserSettings) {
  themeService.setTheme(settings.appearance.theme);
  void i18n.changeLanguage(settings.general.language);
}

function mergeSettings(
  current: UserSettings,
  updates: Partial<UserSettings>
): UserSettings {
  return normalizeUserSettings({
    general: { ...current.general, ...updates.general },
    appearance: { ...current.appearance, ...updates.appearance },
    chat: { ...current.chat, ...updates.chat },
    search: { ...current.search, ...updates.search },
    profile: { ...current.profile, ...updates.profile },
  });
}

interface SettingsStore {
  settings: UserSettings;
  isLoading: boolean;

  // Actions
  initialize: () => () => void;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  updateGeneralSettings: (updates: Partial<UserSettings['general']>) => Promise<void>;
  updateAppearanceSettings: (updates: Partial<UserSettings['appearance']>) => Promise<void>;
  updateChatSettings: (updates: Partial<UserSettings['chat']>) => Promise<void>;
  updateProfileSettings: (updates: Partial<UserSettings['profile']>) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => {
  let authStoreUnsubscribe: (() => void) | null = null;
  let firestoreSettingsUnsubscribe: (() => void) | null = null;
  let activeUid: string | null = null;

  return {
    settings: DEFAULT_SETTINGS,
    isLoading: true,

    initialize: () => {
      themeService.initialize(DEFAULT_SETTINGS.appearance.theme);
      void i18n.changeLanguage(DEFAULT_SETTINGS.general.language);
      set({ settings: DEFAULT_SETTINGS, isLoading: false });

      const bindUserSettings = async (uid: string | null) => {
        if (activeUid === uid) {
          return;
        }

        firestoreSettingsUnsubscribe?.();
        firestoreSettingsUnsubscribe = null;
        activeUid = uid;

        if (!uid) {
          set({ settings: DEFAULT_SETTINGS, isLoading: false });
          applySettingsSideEffects(DEFAULT_SETTINGS);
          return;
        }

        set({ isLoading: true });
        const currentUid = uid;

        try {
          await ensureDefaultUserSettings(uid);
        } catch (error) {
          console.error('Failed to ensure default Firestore settings:', error);
        }

        if (activeUid !== currentUid) {
          return;
        }

        firestoreSettingsUnsubscribe = subscribeUserSettings(
          uid,
          (settings) => {
            const normalized = normalizeUserSettings(settings);
            set({ settings: normalized, isLoading: false });
            applySettingsSideEffects(normalized);
          },
          (error) => {
            console.error('Failed to subscribe Firestore settings:', error);
            set({ settings: DEFAULT_SETTINGS, isLoading: false });
            applySettingsSideEffects(DEFAULT_SETTINGS);
          }
        );
      };

      void bindUserSettings(useAuthStore.getState().user?.id ?? null);

      authStoreUnsubscribe?.();
      authStoreUnsubscribe = useAuthStore.subscribe((state, previousState) => {
        const uid = state.user?.id ?? null;
        const previousUid = previousState.user?.id ?? null;

        if (uid !== previousUid) {
          void bindUserSettings(uid);
        }
      });

      return () => {
        authStoreUnsubscribe?.();
        authStoreUnsubscribe = null;
        firestoreSettingsUnsubscribe?.();
        firestoreSettingsUnsubscribe = null;
        activeUid = null;
      };
    },

    updateSettings: async (updates) => {
      const uid = useAuthStore.getState().user?.id;
      if (!uid) {
        throw new Error('User must be signed in to update settings');
      }

      const previous = get().settings;
      const next = mergeSettings(previous, updates);
      set({ settings: next });
      applySettingsSideEffects(next);

      try {
        await upsertUserSettings(uid, next);
      } catch (error) {
        set({ settings: previous });
        applySettingsSideEffects(previous);
        throw error;
      }
    },

    updateGeneralSettings: async (updates) => {
      await get().updateSettings({
        general: { ...get().settings.general, ...updates },
      });
    },

    updateAppearanceSettings: async (updates) => {
      await get().updateSettings({
        appearance: { ...get().settings.appearance, ...updates },
      });
    },

    updateChatSettings: async (updates) => {
      await get().updateSettings({
        chat: { ...get().settings.chat, ...updates },
      });
    },

    updateProfileSettings: async (updates) => {
      await get().updateSettings({
        profile: { ...get().settings.profile, ...updates },
      });
    },

    setTheme: async (theme) => {
      await get().updateAppearanceSettings({ theme });
    },

    resetSettings: async () => {
      const uid = useAuthStore.getState().user?.id;
      if (!uid) {
        throw new Error('User must be signed in to reset settings');
      }

      const previous = get().settings;
      set({ settings: DEFAULT_SETTINGS });
      applySettingsSideEffects(DEFAULT_SETTINGS);

      try {
        await resetUserSettings(uid);
      } catch (error) {
        set({ settings: previous });
        applySettingsSideEffects(previous);
        throw error;
      }
    },
  };
});
