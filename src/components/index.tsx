/* eslint-disable react-refresh/only-export-components */
export { default as Desktop } from "./desktop";

export type { DesktopHandle, DesktopProps } from "./desktop";

export { default as DesktopSortable } from "./desktop/sortable";
export type { SortableProps as DesktopSortableProps } from "./desktop/sortable";

export { SortableConfigProvider as DesktopSortableConfigProvider } from "./desktop/context/config/context";
export type { SortableConfigProviderProps as DesktopSortableConfigProviderProps } from "./desktop/context/config/context";

export { SortableStateProvider as DesktopSortableStateProvider } from "./desktop/context/state/context";
export type { SortableStateProviderProps as DesktopSortableStateProviderProps } from "./desktop/context/state/context";

export {
  appConfig as desktopAppConfig,
  groupConfig as desktopGroupConfig,
  configMap as desktopConfigMap,
} from "./desktop/config";

export type {
  SortItemBaseConfig as DesktopSortItemBaseConfig,
  SortItem as DesktopSortItem,
  SortItemBaseData as DesktopSortItemBaseData,
} from "./desktop/types";

export {
  themeLight as desktopThemeLight,
  themeDark as desktopThemeDark,
} from "./desktop/theme";
export type { Theme as DesktopTheme } from "./desktop/theme";

export { default as SortableUtils } from "./desktop/utils";

export { default as MdEditor } from "./md-editor";
export { default as Markdown } from "./md-editor/preview";

export { default as Dock } from "./dock";
export {
  default as DockDesktop,
  DesktopIconContainer as DockDesktopItem,
} from "./dock/dock-desktop";
export {
  default as DockMobile,
  MobileIconContainer as DockMobileItem,
} from "./dock/dock-mobile";
export { useMotionValue as useDockDesktopMouseX } from "framer-motion";
export type { DesktopIconContainerProps as DockDesktopItemProps } from "./dock/dock-desktop";
export type { MobileIconContainerProps as DockMobileItemProps } from "./dock/dock-mobile";

export { default as Editor } from "./editor";

export { default as GeoMap } from "./map-view";
export type { GeoMapProps } from "./map-view";
