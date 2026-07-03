import { useMemo } from "react";
import i18next, { type Resource, type TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useZsI18nConfig, type ZsI18nResources } from "../../i18n/context";
import zhCN from "../../i18n/locales/desktop-next/zh-CN";
import enUS from "../../i18n/locales/desktop-next/en-US";

export const desktopNextI18nNamespace = "desktopNext";
export const desktopNextDefaultLanguage = "zh-CN";

export type DesktopNextLanguage = "zh-CN" | "en-US" | (string & {});

export interface DesktopNextI18nResource {
  contextMenu: {
    remove: string;
    size: string;
  };
  launchpad: {
    searchPlaceholder: string;
    noSearchResults: string;
    noApps: string;
    searchHint: string;
    emptyHint: string;
    close: string;
  };
  folder: {
    defaultName: string;
    placeholder: string;
  };
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type DesktopNextI18n = Record<
  string,
  {
    desktopNext: DeepPartial<DesktopNextI18nResource>;
  }
>;

export type DesktopNextI18nT = TFunction<typeof desktopNextI18nNamespace>;

export const desktopNextI18nResources = {
  "zh-CN": {
    desktopNext: zhCN,
  },
  "en-US": {
    desktopNext: enUS,
  },
} satisfies Record<
  "zh-CN" | "en-US",
  { desktopNext: DesktopNextI18nResource }
>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const mergeDeep = (
  base: Record<string, unknown>,
  override?: Record<string, unknown>,
): Record<string, unknown> => {
  if (!override) return { ...base };

  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = result[key];
    result[key] =
      isRecord(current) && isRecord(value) ? mergeDeep(current, value) : value;
  }
  return result;
};

const buildDesktopNextI18nResources = (i18n?: DesktopNextI18n): Resource => {
  const resources = mergeDeep(
    desktopNextI18nResources as unknown as Record<string, unknown>,
    i18n as Record<string, unknown> | undefined,
  );
  return resources as Resource;
};

const pickDesktopNextI18n = (
  resources?: ZsI18nResources,
): DesktopNextI18n | undefined => {
  if (!resources) return undefined;

  const desktopNextResources: DesktopNextI18n = {};
  for (const [language, namespaces] of Object.entries(resources)) {
    const desktopNext = namespaces[desktopNextI18nNamespace];
    if (isRecord(desktopNext)) {
      desktopNextResources[language] = {
        desktopNext: desktopNext as DeepPartial<DesktopNextI18nResource>,
      };
    }
  }

  return Object.keys(desktopNextResources).length > 0
    ? desktopNextResources
    : undefined;
};

export function useDesktopNextI18n() {
  const i18nConfig = useZsI18nConfig();
  const { i18n: globalI18n } = useTranslation();
  const resolvedLanguage =
    i18nConfig.language ??
    globalI18n.resolvedLanguage ??
    globalI18n.language ??
    desktopNextDefaultLanguage;
  const resources = useMemo(
    () => buildDesktopNextI18nResources(pickDesktopNextI18n(i18nConfig.i18n)),
    [i18nConfig.i18n],
  );

  const instance = useMemo(() => {
    const nextI18n = i18next.createInstance();
    nextI18n.init({
      resources,
      lng: resolvedLanguage,
      fallbackLng: desktopNextDefaultLanguage,
      ns: [desktopNextI18nNamespace],
      defaultNS: desktopNextI18nNamespace,
      interpolation: {
        escapeValue: false,
      },
      initImmediate: false,
    });
    return nextI18n;
  }, [resources, resolvedLanguage]);

  const t = useMemo(
    () =>
      instance.getFixedT(
        resolvedLanguage,
        desktopNextI18nNamespace,
      ) as DesktopNextI18nT,
    [instance, resolvedLanguage],
  );

  return {
    language: resolvedLanguage,
    t,
  };
}
