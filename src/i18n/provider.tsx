import React, { useEffect, useMemo } from "react";
import { I18nextProvider } from "react-i18next";
import i18nInstance from "./index";
import {
  ZsI18nConfigProvider,
  type ZsI18nLanguage,
  type ZsI18nResources,
} from "./context";

export interface ZsI18nProviderProps {
  language?: ZsI18nLanguage;
  i18n?: ZsI18nResources;
  children?: React.ReactNode;
}

export const ZsI18nProvider = ({
  language,
  i18n,
  children,
}: ZsI18nProviderProps) => {
  useEffect(() => {
    if (language && i18nInstance.language !== language) {
      void i18nInstance.changeLanguage(language);
    }
  }, [language]);

  const value = useMemo(() => ({ language, i18n }), [language, i18n]);

  return (
    <ZsI18nConfigProvider value={value}>
      <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
    </ZsI18nConfigProvider>
  );
};

export const I18nProvider = ZsI18nProvider;
