import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getStorageKey } from '@/constants';

import zhTW from './locales/zh-TW.json';
import enUS from './locales/en-US.json';
import jaJP from './locales/ja-JP.json';

// Get saved language from localStorage
const getSavedLanguage = (): string | null => {
  const settingsKeys = [getStorageKey('SETTINGS'), 'chonky_settings'];

  try {
    for (const key of settingsKeys) {
      const settings = localStorage.getItem(key);
      if (!settings) continue;

      const parsed = JSON.parse(settings);
      if (parsed?.general?.language) {
        return parsed.general.language;
      }
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      'en-US': { translation: enUS },
      'ja-JP': { translation: jaJP },
    },
    lng: getSavedLanguage() || undefined, // Use saved language if available
    fallbackLng: 'zh-TW',
    interpolation: {
      escapeValue: false, // React already handles XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
