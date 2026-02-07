import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import zhTW from './locales/zh-TW.json';
import enUS from './locales/en-US.json';
import jaJP from './locales/ja-JP.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      'en-US': { translation: enUS },
      'ja-JP': { translation: jaJP },
    },
    lng: 'zh-TW',
    fallbackLng: 'zh-TW',
    interpolation: {
      escapeValue: false, // React already handles XSS
    },
  });

export default i18n;
