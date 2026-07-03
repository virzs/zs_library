import type React from "react";
import type {
  ComponentRegistry,
  ContextMenuActionPayload,
  ContextMenuData,
  DesktopDndContextMenuProps,
  DndPageItem,
  DndSortItem,
  DragState,
  FolderModalState,
  PageTransition,
  SortItemUserConfig,
  TypeConfigMap,
  DataTypeMenuConfigMap,
} from "../types";
import type { Theme } from "../themes";
import type {
  DesktopNextI18nT,
  DesktopNextLanguage,
} from "../i18n";

/** 桌面运行时状态，描述当前页面、拖拽、弹窗和右键菜单的即时状态。 */
export interface DesktopDndStateContextValue {
  /** 当前桌面分页数据。 */
  pages: DndPageItem[];
  /** 更新桌面分页数据，并同步触发外部 onChange。 */
  setPages: (pages: DndPageItem[]) => void;
  /** 当前激活页索引。 */
  currentPage: number;
  /** 设置当前激活页索引。 */
  setCurrentPage: (page: number) => void;
  /** 当前拖拽状态。 */
  dragState: DragState;
  /** 更新拖拽状态。 */
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
  /** 指针当前位置引用，用于跨组件共享拖拽过程中的实时坐标。 */
  pointerPositionRef: React.RefObject<{ x: number; y: number } | null>;
  /** 桌面根容器 DOM 引用。 */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 文件夹弹窗状态。 */
  folderModal: FolderModalState;
  /** 设置文件夹弹窗状态。 */
  setFolderModal: React.Dispatch<React.SetStateAction<FolderModalState>>;
  /** 当前右键菜单数据；为 null 时不显示菜单。 */
  contextMenu: ContextMenuData | null;
  /** 设置右键菜单数据。 */
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuData | null>>;
  /** 隐藏当前右键菜单。 */
  hideContextMenu: () => void;
}

/** 桌面配置上下文，保存渲染、交互和主题相关的稳定配置。 */
export interface DesktopDndConfigContextValue {
  /** 图标基准尺寸，网格单元会基于该尺寸计算。 */
  iconSize: number;
  /** 最大页数；0 表示不限制。 */
  maxPages: number;
  /** 拖拽悬停多久后触发合并，单位毫秒。 */
  mergeDwellTime: number;
  /** 按 item type 配置默认尺寸、菜单能力等规则。 */
  typeConfigMap?: TypeConfigMap;
  /** 按 item dataType 配置自定义右键菜单项。 */
  dataTypeMenuConfigMap?: DataTypeMenuConfigMap;
  /** 点击默认移除菜单项时的自定义回调；未提供时直接移除 item。 */
  onRemoveClick?: (item: DndSortItem) => void;
  /** 右键菜单项被触发后的统一回调，包括移除、改尺寸和自定义菜单项。 */
  onContextMenuItemClick?: (
    item: DndSortItem,
    payload: ContextMenuActionPayload,
  ) => void;
  /** 控制内置右键菜单按钮显隐等行为的配置。 */
  contextMenuProps?: DesktopDndContextMenuProps;
  /** DesktopNext 内置文案当前使用语言。 */
  language: DesktopNextLanguage;
  /** DesktopNext 内置文案翻译函数。 */
  t: DesktopNextI18nT;
  /** 合并后的桌面主题对象。 */
  theme: Theme;
  /** 是否隐藏 item 名称。 */
  noLetters?: boolean;
  /** 自定义整个 item 的渲染内容；返回 null 时默认回退内置渲染。 */
  itemBuilder?: (item: DndSortItem, index: number) => React.ReactNode | null;
  /** @deprecated 请让 itemBuilder 返回 null 回退默认渲染；false 保留旧版 null 也作为渲染结果的行为。 */
  itemBuilderAllowNull?: boolean;
  /** 自定义 item 图标区域渲染。 */
  itemIconBuilder?: (item: DndSortItem) => React.ReactNode;
  /** @deprecated 请让 itemIconBuilder 返回 null 回退默认图标；false 保留旧版 null 也作为渲染结果的行为。 */
  itemIconBuilderAllowNull?: boolean;
  /** 自定义单个分页点渲染。 */
  pagingDotBuilder?: (index: number, isActive: boolean) => React.ReactNode;
  /** 自定义分页点容器渲染。 */
  pagingDotsBuilder?: (dots: React.ReactNode[]) => React.ReactNode;
  /** 页面切换动画类型。 */
  pageTransition?: PageTransition;
  /** 显示在最后一页末尾的额外 item。 */
  extraItems?: DndSortItem[];
  /** 组件注册表，用于按 type 提供组件、远程组件和默认配置。 */
  componentRegistry?: ComponentRegistry;
}

/** 桌面数据操作上下文，集中提供页面、item 和文件夹的变更方法。 */
export interface DesktopDndActionsContextValue {
  /** 从所有桌面页中移除指定 item。 */
  removeItem: (itemId: string | number) => void;
  /** 更新指定 item 的用户配置，支持更新文件夹内子项。 */
  updateItemConfig: (
    itemId: string | number,
    config: SortItemUserConfig,
  ) => void;
  /** 更新指定 item 的业务数据，支持更新文件夹内子项。 */
  updateItemData: (
    itemId: string | number,
    data: Partial<DndSortItem["data"]>,
  ) => void;
  /** 将 item 插入到指定页面的指定位置。 */
  insertItemAt: (pageIndex: number, index: number, item: DndSortItem) => void;
  /** 将拖拽 item 合并到目标 item；目标不是文件夹时会创建新文件夹。 */
  mergeItems: (targetId: string | number, draggedItem: DndSortItem) => void;
  /** 从文件夹中移除子项，并放回指定桌面页。 */
  removeItemFromFolder: (
    folderId: string | number,
    itemId: string | number,
    toPageIndex: number,
  ) => void;
  /** 将 item 添加到指定文件夹末尾。 */
  addItemToFolder: (folderId: string | number, item: DndSortItem) => void;
  /** 调整文件夹内部子项顺序。 */
  reorderFolderChildren: (
    folderId: string | number,
    fromIndex: number,
    toIndex: number,
  ) => void;
  /** 按 id 查找桌面或文件夹内的 item，并返回所在页面和顶层索引。 */
  findItemById: (
    id: string | number,
  ) => { item: DndSortItem; pageIndex: number; itemIndex: number } | null;
  /** 查找包含指定子项的文件夹。 */
  findFolderContaining: (
    itemId: string | number,
  ) => { folder: DndSortItem; pageIndex: number } | null;
}

/** 兼容旧 useDesktopDnd 的聚合上下文类型。 */
export type DesktopDndContextValue = DesktopDndStateContextValue &
  DesktopDndConfigContextValue &
  DesktopDndActionsContextValue;
