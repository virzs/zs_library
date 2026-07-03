import React, { createContext, useContext } from "react";

export type ZsI18nLanguage = string;
export type ZsI18nResources = Record<string, Record<string, unknown>>;

export interface ZsI18nContextValue {
  language?: ZsI18nLanguage;
  i18n?: ZsI18nResources;
}

const ZsI18nContext = createContext<ZsI18nContextValue>({});

export const ZsI18nConfigProvider = ({
  value,
  children,
}: {
  value: ZsI18nContextValue;
  children: React.ReactNode;
}) => (
  <ZsI18nContext.Provider value={value}>{children}</ZsI18nContext.Provider>
);

export const useZsI18nConfig = () => useContext(ZsI18nContext);
