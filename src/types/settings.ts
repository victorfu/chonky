export type ThemeMode = 'light' | 'dark' | 'auto';

// Model types (shared across features)
export type ModelType = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.5-flash-lite';

export const DEFAULT_MODEL: ModelType = 'gemini-2.5-flash';

export const SUPPORTED_MODELS: readonly ModelType[] = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-lite',
] as const;

export const MODEL_LABELS: Record<ModelType, string> = {
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
};

export function isValidModel(model: string): model is ModelType {
  return SUPPORTED_MODELS.includes(model as ModelType);
}

export function getValidModelOrDefault(model: string): ModelType {
  return isValidModel(model) ? model : DEFAULT_MODEL;
}

export type Language = 'zh-TW' | 'en-US' | 'ja-JP';

export type WorkDescription =
  | 'software_engineer'
  | 'data_scientist'
  | 'researcher'
  | 'student'
  | 'writer'
  | 'other';

export interface GeneralSettings {
  language: Language;
  defaultModel: ModelType;
}

export interface AppearanceSettings {
  theme: ThemeMode;
}

export interface ChatSettings {
  enableStreaming: boolean;
  sendWithEnter: boolean;
}

export interface ProfileSettings {
  fullName: string;
  displayName: string;
  workDescription: WorkDescription;
  preferences: string;
}

export interface UserSettings {
  general: GeneralSettings;
  appearance: AppearanceSettings;
  chat: ChatSettings;
  profile: ProfileSettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  general: {
    language: 'zh-TW',
    defaultModel: 'gemini-2.5-flash',
  },
  appearance: {
    theme: 'light',
  },
  chat: {
    enableStreaming: true,
    sendWithEnter: true,
  },
  profile: {
    fullName: '',
    displayName: '',
    workDescription: 'other',
    preferences: '',
  },
};
