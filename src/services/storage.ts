import { v4 as uuidv4 } from 'uuid';
import type { User, UserSettings } from '@/types';
import { DEFAULT_SETTINGS, getValidModelOrDefault } from '@/types';
import { getStorageKey } from '@/constants';

// Legacy StoredUser type for backwards compatibility with existing localStorage data
interface StoredUser extends User {
  passwordHash: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function generateId(): string {
  return uuidv4();
}

export function now(): string {
  return new Date().toISOString();
}

function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    console.error(`Error reading from localStorage: ${key}`);
    return null;
  }
}

function setItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
    return false;
  }
}

function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    console.error(`Error removing from localStorage: ${key}`);
  }
}

export function checkStorageQuota(): { used: number; available: number } {
  let used = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      used += localStorage.getItem(key)?.length || 0;
    }
  }
  // Assuming 5MB limit (conservative estimate)
  const available = 5 * 1024 * 1024 - used;
  return { used, available };
}

// ============================================================================
// Auth Storage
// ============================================================================

// Simple hash for mock auth (NOT secure - for demo only)
function hashPassword(password: string): string {
  return btoa(password + '_salt_chonky');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function toPublicUser(storedUser: StoredUser): User {
  return {
    id: storedUser.id,
    email: storedUser.email,
    fullName: storedUser.fullName,
    displayName: storedUser.displayName,
    avatarUrl: storedUser.avatarUrl,
    plan: storedUser.plan,
    createdAt: storedUser.createdAt,
    updatedAt: storedUser.updatedAt,
  };
}

// Get current logged-in user
export function getAuth(): User | null {
  return getItem<User>(getStorageKey('AUTH'));
}

export function setAuth(user: User): boolean {
  return setItem(getStorageKey('AUTH'), user);
}

// User registry (all registered users)
export function getUsers(): StoredUser[] {
  return getItem<StoredUser[]>(getStorageKey('USERS')) || [];
}

function setUsers(users: StoredUser[]): boolean {
  return setItem(getStorageKey('USERS'), users);
}

export function findUserByEmail(email: string): StoredUser | null {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// Register new user
export function registerUser(
  email: string,
  fullName: string,
  password: string
): { success: boolean; user?: User; error?: string } {
  // Check if user already exists
  const existing = findUserByEmail(email);
  if (existing) {
    return { success: false, error: 'An account with this email already exists' };
  }

  const users = getUsers();
  const storedUser: StoredUser = {
    id: generateId(),
    email: email.toLowerCase(),
    fullName,
    displayName: fullName.split(' ')[0],
    plan: 'free',
    passwordHash: hashPassword(password),
    createdAt: now(),
    updatedAt: now(),
  };

  users.push(storedUser);
  setUsers(users);

  // Create user without passwordHash for auth state
  const user = toPublicUser(storedUser);
  setAuth(user);

  return { success: true, user };
}

// Validate login credentials
export function validateLogin(
  email: string,
  password: string
): { success: boolean; user?: User; error?: string } {
  const storedUser = findUserByEmail(email);

  if (!storedUser) {
    return { success: false, error: 'No account found with this email' };
  }

  if (!verifyPassword(password, storedUser.passwordHash)) {
    return { success: false, error: 'Incorrect password' };
  }

  // Create user without passwordHash for auth state
  const user = toPublicUser(storedUser);
  setAuth(user);

  return { success: true, user };
}

export function logout(): void {
  removeItem(getStorageKey('AUTH'));
}

export function updateUser(updates: Partial<User>): User | null {
  const user = getAuth();
  if (!user) return null;

  const updated = { ...user, ...updates, updatedAt: now() };
  setAuth(updated);

  // Also update in users registry
  const users = getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates, updatedAt: now() };
    setUsers(users);
  }

  return updated;
}

// ============================================================================
// Conversation Storage (simplified - no persistence)
// ============================================================================

// Note: Conversations are now managed in-memory only via useChatStore
// These utility functions are kept for the store to use

// ============================================================================
// Settings Storage
// ============================================================================

export function getSettings(): UserSettings {
  const settings = getItem<UserSettings>(getStorageKey('SETTINGS'));
  if (!settings) return DEFAULT_SETTINGS;

  // Merge with defaults and validate model
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  merged.general = {
    ...DEFAULT_SETTINGS.general,
    ...settings.general,
    // Validate model - fallback to default if invalid
    defaultModel: getValidModelOrDefault(settings.general?.defaultModel || ''),
  };
  return merged;
}

export function setSettings(settings: UserSettings): boolean {
  return setItem(getStorageKey('SETTINGS'), settings);
}

export function updateSettings(updates: Partial<UserSettings>): UserSettings {
  const current = getSettings();
  const updated = {
    ...current,
    ...updates,
    general: { ...current.general, ...updates.general },
    appearance: { ...current.appearance, ...updates.appearance },
    chat: { ...current.chat, ...updates.chat },
    profile: { ...current.profile, ...updates.profile },
  };
  setSettings(updated);
  return updated;
}

export function resetSettings(): UserSettings {
  setSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

// ============================================================================
// Data Export/Import
// ============================================================================

export interface ExportData {
  version: string;
  exportedAt: string;
  auth: User | null;
  users?: StoredUser[];
  settings: UserSettings;
}

export function exportData(): ExportData {
  return {
    version: '1.0.0',
    exportedAt: now(),
    auth: getAuth(),
    users: getUsers(),
    settings: getSettings(),
  };
}

export function importData(data: ExportData): boolean {
  try {
    if (data.auth) setAuth(data.auth);
    if (data.users) setUsers(data.users);
    if (data.settings) setSettings(data.settings);
    return true;
  } catch {
    console.error('Error importing data');
    return false;
  }
}

export function clearAllData(): void {
  removeItem(getStorageKey('AUTH'));
  removeItem(getStorageKey('USERS'));
  removeItem(getStorageKey('SETTINGS'));
  removeItem(getStorageKey('THEME'));
}
