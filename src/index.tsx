/* eslint-disable react-refresh/only-export-components */
import "./index.css";
import "./i18n";

export {
  // Desktop相关
  Desktop,
  DesktopSortable,
  DesktopAppItem,
  DesktopGroupItem,
  DesktopBaseModal,
  DesktopBaseDrawer,
  DesktopSortableConfigProvider,
  DesktopSortableStateProvider,
  getDesktopDefaultConfig,
  desktopThemeLight,
  desktopThemeDark,
  SortableUtils,

  // Dock相关
  Dock,
  DockDesktop,
  DockDesktopItem,
  DockMobile,
  DockMobileItem,
  useDockDesktopMouseX,

  // 其他组件
  MdEditor,
  Markdown,
  Editor,
  GeoMap,
} from "./components";

export type {
  DesktopHandle,
  DesktopProps,
  DesktopAppItemProps,
  DesktopGroupItemProps,
  DesktopSortableProps,
  DesktopSortableConfigProviderProps,
  DesktopSortableStateProviderProps,
  DesktopBaseModalProps,
  DesktopBaseDrawerProps,
  DesktopSortItemBaseConfig,
  DesktopSortItemUserConfig,
  DesktopSortItemDefaultConfig,
  DesktopTypeConfigMap,
  DesktopSortItem,
  DesktopListItem,
  DesktopSortItemBaseData,
  DesktopTheme,

  // Dock相关类型
  DockDesktopItemProps,
  DockMobileItemProps,
} from "./components";

// 导出所有组件作为默认导出
import * as Components from "./components";
export default Components;
