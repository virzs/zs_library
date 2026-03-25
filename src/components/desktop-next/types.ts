import type { ReactNode } from "react";

/** 基础数据接口 */
export interface DndItemBaseData {
  name: string;
  icon?: string;
  iconColor?: string;
}

/** 桌面项 */
export interface DndSortItem<D = any> {
  id: string | number;
  /** 项目类型: app 或 group(文件夹) */
  type: "app" | "group";
  dataType?: string;
  config?: SortItemUserConfig;
  data?: D & DndItemBaseData;
  children?: DndSortItem<D>[];
}

/** 分页数据 */
export interface DndPageItem<D = any> {
  id: string | number;
  children: DndSortItem<D>[];
}

/** 拖拽状态 */
export interface DragState {
  activeId: string | number | null;
  isDragging: boolean;
  pointerPosition: { x: number; y: number } | null;
  pointerOffset: { x: number; y: number } | null;
  mergeTargetId: string | number | null;
  dragSource: "main" | "folder" | null;
  draggedItem: DndSortItem | null;
  gapIndex: number;
  sourcePageIndex: number;
}

/** 文件夹弹窗状态 */
export interface FolderModalState {
  openFolder: DndSortItem | null;
  openPosition: { x: number; y: number } | null;
}

export type PageTransition = "slide" | "cube" | "fade" | "zoom";

/** 组件 Props */
export interface DesktopDndProps<D = any> {
  pages: DndPageItem<D>[];
  onChange: (pages: DndPageItem<D>[]) => void;
  iconSize?: number;
  onItemClick?: (item: DndSortItem<D>) => void;
  itemIconBuilder?: (item: DndSortItem<D>) => React.ReactNode;
  className?: string;
  maxPages?: number;
  mergeDwellTime?: number;
  typeConfigMap?: TypeConfigMap;
  dataTypeMenuConfigMap?: DataTypeMenuConfigMap;
  onRemoveClick?: (item: DndSortItem<D>) => void;
  onContextMenuItemClick?: (
    item: DndSortItem<D>,
    payload: ContextMenuActionPayload,
  ) => void;
  contextMenuProps?: DesktopDndContextMenuProps;
}

export interface SizeConfig {
  id?: string;
  name: string;
  col: number;
  row: number;
}

export interface SortItemUserConfig {
  sizeId?: string;
  sourceId?: string;
}

export interface MenuItemConfig {
  text: string;
  icon?: ReactNode;
  color?: string;
  textColor?: string;
  onClick?: (
    item: DndSortItem,
    contextActions: DesktopDndContextActions,
  ) => void;
}

export type DataTypeMenuConfigMap = Record<string, MenuItemConfig[]>;

export interface SortItemDefaultConfig {
  sizeConfigs?: SizeConfig[];
  defaultSizeId?: string;
  allowResize?: boolean;
  allowContextMenu?: boolean;
  allowShare?: boolean;
  allowDelete?: boolean;
  allowInfo?: boolean;
}

/** 完整的配置接口（用户配置 + 系统默认配置） */
export interface SortItemBaseConfig
  extends SortItemUserConfig, SortItemDefaultConfig {}

export interface SortItemBaseData {
  name: string;
  icon?: string;
  iconColor?: string;
}

/** List项目类型，只包含id、type、children三个属性 */
export interface ListItem<D = any> {
  id: string | number;
  /** 区分数据类型：page表示分页数据，dock表示dock数据，string任意类型 */
  type: "page" | "dock" | string;
  children: DndSortItem<D>[];
}

export interface ComponentRegistryEntry {
  name: string;
  sizeConfigs?: SizeConfig[];
  defaultSizeId?: string;
  allowResize?: boolean;
  allowContextMenu?: boolean;
  allowShare?: boolean;
  allowDelete?: boolean;
  allowInfo?: boolean;
  component?: React.ComponentType<{ item: DndSortItem }>;
  iconUrl?: string;
  remoteUrl?: string;
  meta?: Record<string, unknown>;
}

export type ComponentRegistry = Record<string, ComponentRegistryEntry>;

// 类型别名，保持向后兼容
export type SortableItemData = DndSortItem;
export type DesktopSizeConfig = SizeConfig;
export type DesktopTypeConfigMap = TypeConfigMap;

export type TypeConfigMap = Record<string, SortItemDefaultConfig>;

export interface ContextMenuData {
  rect: DOMRect;
  data: DndSortItem;
  pageX?: number;
  pageY?: number;
  element?: Element | null;
}

export interface DesktopDndContextActions {
  setContextMenu: (data: ContextMenuData | null) => void;
  hideContextMenu: () => void;
  removeItem: (itemId: string | number) => void;
  updateItemConfig: (
    itemId: string | number,
    config: SortItemUserConfig,
  ) => void;
}

export interface DesktopDndContextMenuProps {
  showRemoveButton?: boolean;
  showSizeButton?: boolean;
}

export type ContextMenuActionType = "remove" | "resize" | "custom";

export interface ContextMenuActionPayload {
  actionType: ContextMenuActionType;
  menuItem?: MenuItemConfig;
  sizeConfig?: SizeConfig;
}
