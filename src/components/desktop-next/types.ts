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
  type: "app" | "group" | string;
  dataType?: string;
  config?: SortItemUserConfig;
  data?: D & DndItemBaseData;
  children?: DndSortItem<D>[];
}

/** 项目左上角的格子坐标，行列均从 0 开始。 */
export interface GridPosition {
  row: number;
  col: number;
}

export interface PositionedItem<D = any> extends DndSortItem<D> {
  position: GridPosition;
  /** 响应式重排前的格子坐标，空间恢复后优先还原。 */
  preferredPosition?: GridPosition;
}

/** 旧版桌面使用数组顺序指定项目位置。 */
export interface LegacyDesktopPage<D = any> {
  id: string | number;
  children: DndSortItem<D>[];
}

/** 每页保存桌面项目的位置，文件夹内的项目仍按数组顺序排列。 */
export interface DndPageItem<D = any> {
  id: string | number;
  children: PositionedItem<D>[];
  /** 自动分页所属的手动页。手动页省略此字段。 */
  overflowOf?: string | number;
}

export interface DesktopGridConfig {
  rows?: number | "auto";
  columns?: number | "auto";
  /** 触屏移动设备使用的固定网格，默认 4 列 5 行。 */
  mobile?: { rows: number; columns: number };
}

export type PageSwitchZone = "left" | "right" | null;

/** 拖拽状态 */
export interface DragState {
  activeId: string | number | null;
  isDragging: boolean;
  pointerPosition: { x: number; y: number } | null;
  pointerOffset: { x: number; y: number } | null;
  mergeTargetId: string | number | null;
  pageSwitchZone: PageSwitchZone;
  dragSource: "main" | "folder" | null;
  draggedItem: DndSortItem | null;
  gapIndex: number;
  sourcePageIndex: number;
  /** 多格项目抓取点相对左上角的位置，以格为单位。 */
  grabOffsetInCells?: { x: number; y: number };
  previewPosition?: GridPosition | null;
  /** 在目标图标的前面或后面插入当前项目。 */
  previewOrder?: { targetId: DndSortItem["id"]; after: boolean };
  previewPageId?: string | number;
  pageSwitchedAt?: number;
  /** 当前接收拖动的桌面页，用于识别外部页面变更。 */
  targetPageId?: string | number;
  pointerId?: number;
}

/** 文件夹弹窗状态 */
export interface FolderModalState {
  openFolder: DndSortItem | null;
  openPosition: { x: number; y: number } | null;
}

export type PageTransition = "slide" | "cube" | "fade" | "zoom";

export type BeforeRemoveResult = boolean | void;

export type BeforeRemoveHandler<D = unknown> = (
  item: DndSortItem<D>,
) => BeforeRemoveResult | Promise<BeforeRemoveResult>;

/** 组件 Props */
export interface DesktopDndProps<D = any> {
  pages: DndPageItem<D>[];
  onChange: (pages: DndPageItem<D>[]) => void;
  iconSize?: number;
  grid?: DesktopGridConfig;
  /** 默认保留空位。设为 false 时，自动整理项目并合并页面。 */
  preserveGaps?: boolean;
  /** 默认开启。页面空间不足时将项目排到后页。 */
  autoPaginate?: boolean;
  onItemClick?: (item: DndSortItem<D>) => void;
  itemIconBuilder?: (item: DndSortItem<D>) => React.ReactNode;
  className?: string;
  /** 最大页数。 */
  maxPages?: number;
  /** @deprecated 请使用 `maxPages` 代替。 */
  maxSlides?: number;
  mergeDwellTime?: number;
  typeConfigMap?: TypeConfigMap;
  dataTypeMenuConfigMap?: DataTypeMenuConfigMap;
  /** 在移除动画和数据提交前拦截；返回 false 或拒绝 Promise 时取消。 */
  onBeforeRemove?: BeforeRemoveHandler<D>;
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
