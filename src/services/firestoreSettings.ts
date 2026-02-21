import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  DEFAULT_SETTINGS,
  getValidModelOrDefault,
  type Language,
  type ThemeMode,
  type UserSettings,
  type WorkDescription,
} from '@/types';
import { db } from './firebase';

const USER_SETTINGS_COLLECTION = 'user_settings';
const SETTINGS_SCHEMA_VERSION = 1;

const SUPPORTED_LANGUAGES: readonly Language[] = ['zh-TW', 'en-US', 'ja-JP'];
const SUPPORTED_THEMES: readonly ThemeMode[] = ['light', 'dark', 'auto'];
const SUPPORTED_WORK_DESCRIPTIONS: readonly WorkDescription[] = [
  'software_engineer',
  'data_scientist',
  'researcher',
  'student',
  'writer',
  'other',
];

type FirestoreUserSettings = Partial<UserSettings> & {
  updatedAt?: unknown;
  schemaVersion?: number;
};

function isValidLanguage(value: unknown): value is Language {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as Language);
}

function isValidTheme(value: unknown): value is ThemeMode {
  return typeof value === 'string' && SUPPORTED_THEMES.includes(value as ThemeMode);
}

function isValidWorkDescription(value: unknown): value is WorkDescription {
  return (
    typeof value === 'string' &&
    SUPPORTED_WORK_DESCRIPTIONS.includes(value as WorkDescription)
  );
}

function normalizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function getUserSettingsRef(uid: string) {
  return doc(db, USER_SETTINGS_COLLECTION, uid);
}

function toFirestoreDoc(settings: UserSettings) {
  return {
    ...settings,
    updatedAt: serverTimestamp(),
    schemaVersion: SETTINGS_SCHEMA_VERSION,
  };
}

export function normalizeUserSettings(settings: Partial<UserSettings> | null | undefined): UserSettings {
  const next = settings ?? {};

  return {
    general: {
      language: isValidLanguage(next.general?.language)
        ? next.general.language
        : DEFAULT_SETTINGS.general.language,
      defaultModel: getValidModelOrDefault(next.general?.defaultModel ?? ''),
    },
    appearance: {
      theme: isValidTheme(next.appearance?.theme)
        ? next.appearance.theme
        : DEFAULT_SETTINGS.appearance.theme,
    },
    chat: {
      enableStreaming:
        typeof next.chat?.enableStreaming === 'boolean'
          ? next.chat.enableStreaming
          : DEFAULT_SETTINGS.chat.enableStreaming,
      sendWithEnter:
        typeof next.chat?.sendWithEnter === 'boolean'
          ? next.chat.sendWithEnter
          : DEFAULT_SETTINGS.chat.sendWithEnter,
    },
    search: {
      enableAIRanking:
        typeof next.search?.enableAIRanking === 'boolean'
          ? next.search.enableAIRanking
          : DEFAULT_SETTINGS.search.enableAIRanking,
      maxResults:
        typeof next.search?.maxResults === 'number'
          ? next.search.maxResults
          : DEFAULT_SETTINGS.search.maxResults,
    },
    profile: {
      fullName: normalizeString(next.profile?.fullName, DEFAULT_SETTINGS.profile.fullName),
      displayName: normalizeString(
        next.profile?.displayName,
        DEFAULT_SETTINGS.profile.displayName
      ),
      workDescription: isValidWorkDescription(next.profile?.workDescription)
        ? next.profile.workDescription
        : DEFAULT_SETTINGS.profile.workDescription,
      preferences: normalizeString(next.profile?.preferences, DEFAULT_SETTINGS.profile.preferences),
    },
  };
}

export async function ensureDefaultUserSettings(uid: string): Promise<void> {
  const ref = getUserSettingsRef(uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;

  await setDoc(ref, toFirestoreDoc(DEFAULT_SETTINGS), { merge: false });
}

export function subscribeUserSettings(
  uid: string,
  onData: (settings: UserSettings) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const ref = getUserSettingsRef(uid);

  return onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(DEFAULT_SETTINGS);
        return;
      }

      const data = snapshot.data() as FirestoreUserSettings;
      onData(normalizeUserSettings(data));
    },
    onError
  );
}

export async function upsertUserSettings(
  uid: string,
  settings: Partial<UserSettings>
): Promise<void> {
  const normalized = normalizeUserSettings(settings);
  await setDoc(getUserSettingsRef(uid), toFirestoreDoc(normalized), { merge: true });
}

export async function resetUserSettings(uid: string): Promise<void> {
  await setDoc(getUserSettingsRef(uid), toFirestoreDoc(DEFAULT_SETTINGS), { merge: false });
}
