export { default as Desktop } from "./desktop";

export type { DesktopHandle, DesktopProps } from "./desktop";

export { default as DesktopSortable } from "./desktop/sortable";
export type { SortableProps as DesktopSortableProps } from "./desktop/sortable";

export { default as DesktopGroupItem } from "./desktop/items/group-item";
export type { SortableGroupItemProps as DesktopGroupItemProps } from "./desktop/items/group-item";

export { default as DesktopAppItem } from "./desktop/items/sortable-item";
export type { SortableItemProps as DesktopAppItemProps } from "./desktop/items/sortable-item";

export { SortableConfigProvider as DesktopSortableConfigProvider } from "./desktop/context/config/context";
export type { SortableConfigProviderProps as DesktopSortableConfigProviderProps } from "./desktop/context/config/context";

export { SortableStateProvider as DesktopSortableStateProvider } from "./desktop/context/state/context";
export type { SortableStateProviderProps as DesktopSortableStateProviderProps } from "./desktop/context/state/context";

export {
  appDefaultConfig as desktopAppDefaultConfig,
  groupDefaultConfig as desktopGroupDefaultConfig,
  builtinConfigMap as desktopBuiltinConfigMap,
  getDefaultConfig as getDesktopDefaultConfig,
} from "./desktop/config";

export type {
  SortItemBaseConfig as DesktopSortItemBaseConfig,
  SortItemUserConfig as DesktopSortItemUserConfig,
  SortItemDefaultConfig as DesktopSortItemDefaultConfig,
  SortItem as DesktopSortItem,
  ListItem as DesktopListItem,
  SortItemBaseData as DesktopSortItemBaseData,
  TypeConfigMap as DesktopTypeConfigMap,
} from "./desktop/types";

export {
  themeLight as desktopThemeLight,
  themeDark as desktopThemeDark,
  defaultTheme as desktopDefaultTheme,
  themes as desktopThemes,
} from "./desktop/themes";
export type { Theme as DesktopTheme, ThemeType as DesktopThemeType } from "./desktop/themes";

export { default as SortableUtils } from "./desktop/utils";

// 导出desktop dock相关组件
export {
  Dock as DesktopDock,
  LaunchpadModal as DesktopLaunchpadModal,
  LaunchpadButton as DesktopLaunchpadButton,
} from "./desktop/dock";
export type {
  DockProps as DesktopDockProps,
  LaunchpadModalProps as DesktopLaunchpadModalProps,
  LaunchpadButtonProps as DesktopLaunchpadButtonProps,
} from "./desktop/dock";

// 导出desktop modal相关组件
export { BaseModal as DesktopBaseModal } from "./desktop/modal";
export type { BaseModalProps as DesktopBaseModalProps } from "./desktop/modal";

// 导出desktop drawer相关组件
export { BaseDrawer as DesktopBaseDrawer } from "./desktop/drawer";
export type { BaseDrawerProps as DesktopBaseDrawerProps } from "./desktop/drawer";

export { default as MdEditor } from "./md-editor";
export { default as Markdown } from "./md-editor/preview";

export { default as Dock } from "./dock";
export { default as DockDesktop, DesktopIconContainer as DockDesktopItem } from "./dock/dock-desktop";
export { default as DockMobile, MobileIconContainer as DockMobileItem } from "./dock/dock-mobile";
export { useMotionValue as useDockDesktopMouseX } from "motion/react";
export type { DesktopIconContainerProps as DockDesktopItemProps } from "./dock/dock-desktop";
export type { MobileIconContainerProps as DockMobileItemProps } from "./dock/dock-mobile";

export { default as GeoMap } from "./map-view";
export type { GeoMapProps } from "./map-view";

export {
  default as SimpleEditor,
  SimpleEditorViewer,
  useSimpleEditor,
  jsonToHtml,
  htmlToJson,
  EditorFormatConverter,
} from "./tiptap-editor/simple";
export type {
  SimpleEditorProps,
  SimpleEditorViewerProps,
  SimpleEditorFeatures,
  EditorOutputFormat,
  UseSimpleEditorProps,
  JSONContent,
} from "./tiptap-editor/simple";

export { default as DesktopNext } from "./desktop-next";
export {
  DesktopDndProvider as DesktopNextProvider,
  useDesktopDnd as useDesktopNext,
  DesktopDndActionsProvider as DesktopNextActionsProvider,
  DesktopDndConfigProvider as DesktopNextConfigProvider,
  DesktopDndStateProvider as DesktopNextStateProvider,
  useDesktopDndActions as useDesktopNextActions,
  useDesktopDndConfig as useDesktopNextConfig,
  useDesktopDndState as useDesktopNextState,
  ContextMenu as DesktopNextContextMenu,
  ContextMenuItem as DesktopNextContextMenuItem,
  ContextMenuSubMenuItem as DesktopNextContextMenuSubMenuItem,
  ContextMenuSizeSubMenuContent as DesktopNextContextMenuSizeSubMenuContent,
  ContextMenuHoverContext as DesktopNextContextMenuHoverContext,
  Dock as DesktopNextDock,
  LaunchpadModal as DesktopNextLaunchpadModal,
  LaunchpadButton as DesktopNextLaunchpadButton,
  StackedIcon as DesktopNextStackedIcon,
  SearchBox as DesktopNextSearchBox,
  BaseModal as DesktopNextBaseModal,
  BaseDrawer as DesktopNextBaseDrawer,
  loadRemoteComponent as loadDesktopNextRemoteComponent,
  RemoteComponentErrorBoundary as DesktopNextRemoteComponentErrorBoundary,
  mergeTheme as mergeDesktopNextTheme,
} from "./desktop-next";
export {
  commonSizeConfigs as desktopNextCommonSizeConfigs,
  commonSizeConfigsArray as desktopNextCommonSizeConfigsArray,
  appDefaultConfig as desktopNextAppDefaultConfig,
  groupDefaultConfig as desktopNextGroupDefaultConfig,
  builtinConfigMap as desktopNextBuiltinConfigMap,
  getDefaultConfig as getDesktopNextDefaultConfig,
  getSizeConfig as getDesktopNextSizeConfig,
  getItemSize as getDesktopNextItemSize,
  getDataTypeMenuConfig as getDesktopNextDataTypeMenuConfig,
} from "./desktop-next/config";
export {
  themeLight as desktopNextThemeLight,
  themeDark as desktopNextThemeDark,
  defaultTheme as desktopNextDefaultTheme,
  themes as desktopNextThemes,
} from "./desktop-next/themes";
export type {
  Theme as DesktopNextTheme,
  ThemeType as DesktopNextThemeType,
} from "./desktop-next/themes";
export type {
  DesktopDndExtendedProps as DesktopNextProps,
  DesktopHandle as DesktopNextHandle,
  DesktopDndProviderProps as DesktopNextProviderProps,
  DesktopDndActionsContextValue as DesktopNextActionsContextValue,
  DesktopDndConfigContextValue as DesktopNextConfigContextValue,
  DesktopDndContextValue as DesktopNextContextValue,
  DesktopDndStateContextValue as DesktopNextStateContextValue,
  ContextMenuProps as DesktopNextContextMenuComponentProps,
  ContextMenuItemProps as DesktopNextContextMenuItemProps,
  ContextMenuSubMenuItemProps as DesktopNextContextMenuSubMenuItemProps,
  ContextMenuSizeMenuItemProps as DesktopNextContextMenuSizeMenuItemProps,
  ContextMenuHoverContextType as DesktopNextContextMenuHoverContextType,
  DockProps as DesktopNextDockProps,
  LaunchpadModalProps as DesktopNextLaunchpadModalProps,
  LaunchpadButtonProps as DesktopNextLaunchpadButtonProps,
  StackedIconProps as DesktopNextStackedIconProps,
  SearchBoxProps as DesktopNextSearchBoxProps,
  BaseModalFloatingControlsConfig as DesktopNextBaseModalFloatingControlsConfig,
  BaseModalProps as DesktopNextBaseModalProps,
  BaseDrawerProps as DesktopNextBaseDrawerProps,
  DndSortItem,
  DndPageItem,
  DndItemBaseData,
  SizeConfig,
  SortItemUserConfig,
  MenuItemConfig,
  DataTypeMenuConfigMap,
  SortItemDefaultConfig,
  TypeConfigMap,
  ContextMenuData,
  DesktopDndContextMenuProps as DesktopNextContextMenuProps,
  ContextMenuActionPayload,
  ContextMenuActionType,
  ListItem as DesktopNextListItem,
  SortItemBaseData as DesktopNextSortItemBaseData,
  SortItemBaseConfig as DesktopNextSortItemBaseConfig,
  ComponentRegistryEntry as DesktopNextComponentRegistryEntry,
  ComponentRegistry as DesktopNextComponentRegistry,
  PageTransition as DesktopNextPageTransition,
  DesktopNextLanguage,
  DesktopNextI18n,
  DesktopNextI18nResource,
  DesktopNextI18nT,
} from "./desktop-next";

// @deprecated Use DesktopNext instead
export { default as DesktopDnd } from "./desktop-next";
/** @deprecated Use desktopNextCommonSizeConfigs instead */
export {
  commonSizeConfigs as desktopDndCommonSizeConfigs,
  appDefaultConfig as desktopDndAppDefaultConfig,
  groupDefaultConfig as desktopDndGroupDefaultConfig,
  builtinConfigMap as desktopDndBuiltinConfigMap,
  getDefaultConfig as getDesktopDndDefaultConfig,
  getSizeConfig as getDesktopDndSizeConfig,
  getItemSize as getDesktopDndItemSize,
} from "./desktop-next/config";
export type {
  DesktopDndProps,
  DesktopDndContextMenuProps,
} from "./desktop-next/types";

export {
  PhotoWatermark,
  availableTemplates,
  extractExifData,
  parseExifData,
  formatXiaomiLeicaExifData,
  HtmlRenderer,
} from "./photo-watermark";
export type { 
  ExifData,
  ExifExtractResult,
  WatermarkComponentProps as PhotoWatermarkProps,
  TemplateConfig,
  ExifParamsForm
} from "./photo-watermark";
