export const STORAGE_KEYS = {
  AUTH: 'auth',
  USERS: 'users',
  CONVERSATIONS: 'conversations',
  SETTINGS: 'settings',
  THEME: 'theme',
  SCREENSHOT_HISTORY: 'screenshot_history',
} as const;

export const STORAGE_VERSION = '1.0.0';

export function getStorageKey(key: keyof typeof STORAGE_KEYS): string {
  const prefix = import.meta.env.VITE_STORAGE_PREFIX || 'chonky_';
  return `${prefix}${STORAGE_KEYS[key]}`;
}
