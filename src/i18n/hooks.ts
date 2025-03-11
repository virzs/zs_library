import { useTranslation } from 'react-i18next';
import type { Language } from './index';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLang = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  return {
    t,
    currentLang: i18n.language as Language,
    changeLang,
  };
};