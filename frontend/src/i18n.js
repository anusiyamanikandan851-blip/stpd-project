import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import taTranslation from './locales/ta.json';
import hiTranslation from './locales/hi.json';
import mlTranslation from './locales/ml.json';
import teTranslation from './locales/te.json';

const resources = {
  en: { translation: enTranslation },
  ta: { translation: taTranslation },
  hi: { translation: hiTranslation },
  ml: { translation: mlTranslation },
  te: { translation: teTranslation }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
