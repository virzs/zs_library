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
  commonSizeConfigs as desktopNextCommonSizeConfigs,
  appDefaultConfig as desktopNextAppDefaultConfig,
  groupDefaultConfig as desktopNextGroupDefaultConfig,
  builtinConfigMap as desktopNextBuiltinConfigMap,
  getDefaultConfig as getDesktopNextDefaultConfig,
  getSizeConfig as getDesktopNextSizeConfig,
  getItemSize as getDesktopNextItemSize,
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
  DesktopDndProps as DesktopNextProps,
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
} from "./desktop-next/types";

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

export {
  IdPhotoChecker,
  useIdPhotoChecker,
} from "./id-photo-checker";
export type {
  IdPhotoCheckerProps,
  UseIdPhotoCheckerReturn,
  ValidationResult as IdPhotoValidationResult,
  ValidationItem as IdPhotoValidationItem,
  ValidationStatus as IdPhotoValidationStatus,
  ValidationRuleConfig as IdPhotoRuleConfig,
  BoundsConfig as IdPhotoBoundsConfig,
  ThresholdConfig as IdPhotoThresholdConfig,
  CameraConfig as IdPhotoCameraConfig,
  MessageConfig as IdPhotoMessageConfig,
  ValidatableImage as IdPhotoValidatableImage,
} from "./id-photo-checker";
