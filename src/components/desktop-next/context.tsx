import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ComponentRegistry,
  ContextMenuActionPayload,
  ContextMenuData,
  DesktopDndContextMenuProps,
  DndSortItem,
  DndPageItem,
  DragState,
  FolderModalState,
  TypeConfigMap,
  DataTypeMenuConfigMap,
  PageTransition,
} from "./types";
import { Theme, defaultTheme } from "./themes";
import { mergeTheme } from "./themes/utils";
import {
  DesktopDndActionsProvider,
  DesktopDndConfigProvider,
  DesktopDndStateProvider,
  useDesktopDndActions,
  useDesktopDndConfig,
  useDesktopDndState,
  type DesktopDndConfigContextValue,
  type DesktopDndContextValue,
  type DesktopDndStateContextValue,
} from "./contexts";
import { useDesktopActions } from "./contexts/use-desktop-actions";
import { usePagesState } from "./contexts/use-pages-state";

const initialDragState: DragState = {
  activeId: null,
  isDragging: false,
  pointerPosition: null,
  pointerOffset: null,
  mergeTargetId: null,
  pageSwitchZone: null,
  dragSource: null,
  draggedItem: null,
  gapIndex: -1,
  sourcePageIndex: -1,
};

const initialFolderModal: FolderModalState = {
  openFolder: null,
  openPosition: null,
};

/**
 * 兼容旧版调用方的聚合 hook。
 *
 * 新代码可以按需使用 useDesktopDndState、useDesktopDndConfig 或 useDesktopDndActions；
 * 现有组件仍可通过该 hook 一次性获取全部状态、配置和操作方法。
 */
export const useDesktopDnd = () => {
  const state = useDesktopDndState();
  const config = useDesktopDndConfig();
  const actions = useDesktopDndActions();
  return useMemo<DesktopDndContextValue>(
    () => ({ ...state, ...config, ...actions }),
    [state, config, actions],
  );
};

/** DesktopDndProvider 的入参。 */
export interface DesktopDndProviderProps {
  /** 外部传入的桌面分页数据。 */
  pages: DndPageItem[];
  /** 桌面分页数据变化回调。 */
  onChange: (pages: DndPageItem[]) => void;
  /** 图标基准尺寸。 */
  iconSize: number;
  /** 最大页数；0 表示不限制。 */
  maxPages: number;
  /** 拖拽悬停多久后触发合并，单位毫秒。 */
  mergeDwellTime: number;
  /** 桌面根容器 DOM 引用。 */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 按 item type 配置默认尺寸、菜单能力等规则。 */
  typeConfigMap?: TypeConfigMap;
  /** 按 item dataType 配置自定义右键菜单项。 */
  dataTypeMenuConfigMap?: DataTypeMenuConfigMap;
  /** 点击默认移除菜单项时的自定义回调。 */
  onRemoveClick?: (item: DndSortItem) => void;
  /** 右键菜单项被触发后的统一回调。 */
  onContextMenuItemClick?: (
    item: DndSortItem,
    payload: ContextMenuActionPayload,
  ) => void;
  /** 控制内置右键菜单按钮显隐等行为的配置。 */
  contextMenuProps?: DesktopDndContextMenuProps;
  /** 桌面主题，可传 light/dark 或完整主题对象。 */
  theme?: Theme | "light" | "dark";
  /** 是否隐藏 item 名称。 */
  noLetters?: boolean;
  /** 自定义整个 item 的渲染内容。 */
  itemBuilder?: (item: DndSortItem, index: number) => React.ReactNode | null;
  /** @deprecated 请让 itemBuilder 返回 null 回退默认渲染。 */
  itemBuilderAllowNull?: boolean;
  /** 自定义 item 图标区域渲染。 */
  itemIconBuilder?: (item: DndSortItem) => React.ReactNode;
  /** @deprecated 请让 itemIconBuilder 返回 null 回退默认图标。 */
  itemIconBuilderAllowNull?: boolean;
  /** 自定义单个分页点渲染。 */
  pagingDotBuilder?: (index: number, isActive: boolean) => React.ReactNode;
  /** 自定义分页点容器渲染。 */
  pagingDotsBuilder?: (dots: React.ReactNode[]) => React.ReactNode;
  /** 页面切换动画类型。 */
  pageTransition?: PageTransition;
  /** 显示在最后一页末尾的额外 item。 */
  extraItems?: DndSortItem[];
  /** 本地缓存 key；提供后会从 localStorage 恢复并保存 pages。 */
  storageKey?: string;
  /** 组件注册表，用于按 type 提供组件、远程组件和默认配置。 */
  componentRegistry?: ComponentRegistry;
  /** Provider 子节点。 */
  children: React.ReactNode;
}

/**
 * desktop-next 的根上下文 Provider。
 *
 * 负责组装状态、配置和数据操作三个细粒度 context，并保持 useDesktopDnd 的兼容返回值。
 */
export const DesktopDndProvider = ({
  pages: externalPages,
  onChange,
  iconSize,
  maxPages,
  mergeDwellTime,
  containerRef,
  typeConfigMap,
  dataTypeMenuConfigMap,
  onRemoveClick,
  onContextMenuItemClick,
  contextMenuProps,
  theme: themeProp,
  noLetters,
  itemBuilder,
  itemBuilderAllowNull,
  itemIconBuilder,
  itemIconBuilderAllowNull,
  pagingDotBuilder,
  pagingDotsBuilder,
  pageTransition,
  extraItems,
  storageKey,
  componentRegistry,
  children,
}: DesktopDndProviderProps) => {
  const resolvedTheme = useMemo(
    () => mergeTheme(themeProp ?? defaultTheme),
    [themeProp],
  );

  const mergedTypeConfigMap = useMemo<TypeConfigMap | undefined>(() => {
    if (!componentRegistry || Object.keys(componentRegistry).length === 0) {
      return typeConfigMap;
    }
    const fromRegistry: TypeConfigMap = {};
    for (const [key, entry] of Object.entries(componentRegistry)) {
      const hasMultipleSizes = (entry.sizeConfigs?.length ?? 0) > 1;
      fromRegistry[key] = {
        sizeConfigs: entry.sizeConfigs ?? [],
        defaultSizeId: entry.defaultSizeId,
        allowResize: entry.allowResize ?? hasMultipleSizes,
        allowContextMenu: entry.allowContextMenu ?? true,
        allowShare: entry.allowShare ?? false,
        allowDelete: entry.allowDelete ?? true,
        allowInfo: entry.allowInfo ?? false,
      };
    }
    return { ...fromRegistry, ...(typeConfigMap ?? {}) };
  }, [componentRegistry, typeConfigMap]);

  const [currentPage, setCurrentPage] = useState(0);
  const [dragState, setDragState] = useState<DragState>(initialDragState);
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  const [folderModal, setFolderModal] =
    useState<FolderModalState>(initialFolderModal);
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

  const { pages, pagesRef, setPages } = usePagesState({
    externalPages,
    onChange,
    storageKey,
  });

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const actionsValue = useDesktopActions({ pagesRef, setPages });

  const stateValue = useMemo<DesktopDndStateContextValue>(
    () => ({
      pages,
      setPages,
      currentPage,
      setCurrentPage,
      dragState,
      setDragState,
      pointerPositionRef,
      containerRef,
      folderModal,
      setFolderModal,
      contextMenu,
      setContextMenu,
      hideContextMenu,
    }),
    [
      pages,
      setPages,
      currentPage,
      dragState,
      folderModal,
      contextMenu,
      hideContextMenu,
      containerRef,
      setContextMenu,
      setFolderModal,
    ],
  );

  const configValue = useMemo<DesktopDndConfigContextValue>(
    () => ({
      iconSize,
      maxPages,
      mergeDwellTime,
      typeConfigMap: mergedTypeConfigMap,
      dataTypeMenuConfigMap,
      onRemoveClick,
      onContextMenuItemClick,
      contextMenuProps,
      theme: resolvedTheme,
      noLetters,
      itemBuilder,
      itemBuilderAllowNull,
      itemIconBuilder,
      itemIconBuilderAllowNull,
      pagingDotBuilder,
      pagingDotsBuilder,
      pageTransition,
      extraItems,
      componentRegistry,
    }),
    [
      iconSize,
      maxPages,
      mergeDwellTime,
      mergedTypeConfigMap,
      dataTypeMenuConfigMap,
      onRemoveClick,
      onContextMenuItemClick,
      contextMenuProps,
      resolvedTheme,
      noLetters,
      itemBuilder,
      itemBuilderAllowNull,
      itemIconBuilder,
      itemIconBuilderAllowNull,
      pagingDotBuilder,
      pagingDotsBuilder,
      pageTransition,
      extraItems,
      componentRegistry,
    ],
  );

  return (
    <DesktopDndStateProvider value={stateValue}>
      <DesktopDndConfigProvider value={configValue}>
        <DesktopDndActionsProvider value={actionsValue}>
          {children}
        </DesktopDndActionsProvider>
      </DesktopDndConfigProvider>
    </DesktopDndStateProvider>
  );
};
