import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export type Language = 'zh-CN' | 'en-US';

export const defaultNS = 'common';

i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
  lng: 'zh-CN',
  fallbackLng: 'zh-CN',
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
});

export const changeLang = (lang: Language) => {
  i18n.changeLanguage(lang);
};

export default i18n;