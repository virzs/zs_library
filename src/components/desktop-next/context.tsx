import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  BeforeRemoveHandler,
  ComponentRegistry,
  ContextMenuActionPayload,
  ContextMenuData,
  DesktopDndContextMenuProps,
  DndSortItem,
  DndPageItem,
  DesktopGridConfig,
  PositionedItem,
  DragState,
  FolderModalState,
  TypeConfigMap,
  DataTypeMenuConfigMap,
  PageTransition,
} from "./types";
import { Theme, defaultTheme } from "./themes";
import { mergeTheme } from "./themes/utils";
import { useDesktopNextI18n } from "./i18n";
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
import { arrangeDesktopPages, findFreePosition, layoutDesktopPages, type LayoutOptions } from "./layout";
import { useGridLayout } from "./hooks/use-grid-layout";
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

// 额外项目只用于展示。独立记录其位置，使其参与分页并保持业务数据可单独保存。
function placeExtraItems(pages: DndPageItem[], items: DndSortItem[] | undefined, options: LayoutOptions) {
  const extraLayout = new Map<DndPageItem["id"], PositionedItem[]>();
  const extraPageIds = new Set<DndPageItem["id"]>();
  if (!items?.length) return { editablePages: pages, extraLayout, extraPageIds };

  const editablePages = [...pages];
  const ids = new Set(pages.map(page => String(page.id)));
  let sequence = 0;
  const addPage = () => {
    let id: string;
    do { id = `desktop-extra-${++sequence}`; } while (ids.has(id));
    ids.add(id);
    extraPageIds.add(id);
    const page: DndPageItem = { id, children: [] };
    editablePages.push(page);
    return page;
  };
  let page = editablePages[editablePages.length - 1] ?? addPage();
  for (const item of items) {
    const extras = extraLayout.get(page.id) ?? [];
    const atLimit = !!options.maxPages && editablePages.length >= options.maxPages;
    const position = findFreePosition([...page.children, ...extras], item,
      atLimit ? { ...options, autoPaginate: false } : options);
    if (position) {
      extras.push({ ...item, position });
      extraLayout.set(page.id, extras);
    } else {
      page = addPage();
      extraLayout.set(page.id, [{ ...item, position: { row: 0, col: 0 } }]);
    }
  }
  return { editablePages, extraLayout, extraPageIds };
}

/** DesktopDndProvider 的入参。 */
export interface DesktopDndProviderProps {
  /** 外部传入的桌面分页数据。 */
  pages: DndPageItem[];
  /** 桌面分页数据变化回调。 */
  onChange: (pages: DndPageItem[]) => void;
  /** 图标基准尺寸。 */
  iconSize: number;
  grid?: DesktopGridConfig;
  autoPaginate?: boolean;
  preserveGaps?: boolean;
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
  /** 默认移除动作提交前的同步或异步拦截器。 */
  onBeforeRemove?: BeforeRemoveHandler;
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
  pagingDotBuilder?: (index: number, isActive: boolean, selectPage?: () => void) => React.ReactNode;
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
export const DesktopDndProvider = (props: DesktopDndProviderProps) => (
  <DesktopDndSession key={props.storageKey} {...props} />
);

const DesktopDndSession = ({
  pages: externalPages,
  onChange,
  iconSize,
  grid,
  autoPaginate = true,
  preserveGaps = true,
  maxPages,
  mergeDwellTime,
  containerRef,
  typeConfigMap,
  dataTypeMenuConfigMap,
  onBeforeRemove,
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
  const desktopNextI18n = useDesktopNextI18n();

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

  const [selection, setSelection] = useState<{
    index: number; id?: DndPageItem["id"]; ownerId?: DndPageItem["id"];
  }>({ index: 0 });
  const [dragState, setDragState] = useState<DragState>(initialDragState);
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  const [folderModal, setFolderModal] =
    useState<FolderModalState>(initialFolderModal);
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

  const { pages: inputPages, setPages: savePages } = usePagesState({
    externalPages,
    onChange,
    storageKey,
  });
  const { ready, measureRef, current: measured, singlePage } = useGridLayout(iconSize, grid, containerRef);
  // 多页切回单页时分页点会消失。将归还的高度计入可用空间，以便恢复最后一行。
  const useSinglePage = useMemo(() => {
    if (!ready || singlePage.rows === measured.rows || dragState.previewPageId != null) return false;
    const options = { columns: singlePage.columns, rows: singlePage.rows, autoPaginate, maxPages, typeConfigMap: mergedTypeConfigMap };
    const candidate = preserveGaps ? layoutDesktopPages(inputPages, options) : arrangeDesktopPages(inputPages, options);
    return candidate.length <= 1 && placeExtraItems(candidate, extraItems, options).editablePages.length <= 1;
  }, [ready, singlePage.rows, singlePage.columns, measured.rows, dragState.previewPageId, autoPaginate,
    maxPages, mergedTypeConfigMap, preserveGaps, inputPages, extraItems]);
  const { columns, rows, cellSize, iconSize: fittedIconSize } = useSinglePage ? singlePage : measured;
  const layoutOptions = useMemo<LayoutOptions>(
    () => ({ columns, rows, autoPaginate, maxPages, typeConfigMap: mergedTypeConfigMap }),
    [columns, rows, autoPaginate, maxPages, mergedTypeConfigMap],
  );
  const fitPages = useCallback((next: DndPageItem[]) => {
    return preserveGaps ? layoutDesktopPages(next, layoutOptions) : arrangeDesktopPages(next, layoutOptions);
  }, [layoutOptions, preserveGaps]);
  const fittedPages = useMemo(
    () => ready ? fitPages(inputPages) : inputPages,
    [inputPages, fitPages, ready],
  );
  // 相同的重排结果只提交一次，包括受控调用方延迟保存的情况。
  const lastSubmitted = useRef<DndPageItem[] | null>(null);
  useEffect(() => {
    if (fittedPages !== inputPages && lastSubmitted.current !== fittedPages) {
      lastSubmitted.current = fittedPages;
      savePages(fittedPages);
    }
  }, [inputPages, fittedPages, savePages]);

  const { editablePages, extraLayout, extraPageIds } = useMemo(
    () => placeExtraItems(fittedPages, ready ? extraItems : undefined, layoutOptions),
    [fittedPages, extraItems, layoutOptions, ready],
  );
  const pagesRef = useRef(editablePages);
  pagesRef.current = editablePages;
  const setPages = useCallback((next: DndPageItem[]) => {
    const businessPages = extraPageIds.size
      ? next.filter(page => page.children.length || !extraPageIds.has(page.id))
      : next;
    const result = ready ? fitPages(businessPages) : businessPages;
    pagesRef.current = result;
    savePages(result);
  }, [ready, extraPageIds, fitPages, savePages]);
  const pages = useMemo(() => {
    const id = dragState.previewPageId;
    return id != null && !editablePages.some(page => page.id === id)
      ? [...editablePages, { id, children: [] }]
      : editablePages;
  }, [editablePages, dragState.previewPageId]);
  // 源页前的自动页数量可以随尺寸变化。按 id 保持当前页，已合并的自动页回到源页。
  const currentPage = useMemo(() => {
    const current = pages.findIndex(page => page.id === selection.id);
    if (current >= 0) return current;
    const owner = pages.findIndex(page => page.id === selection.ownerId);
    return owner >= 0 ? owner : Math.max(0, Math.min(selection.index, pages.length - 1));
  }, [selection, pages]);
  const setCurrentPage = useCallback((index: number) => {
    const page = pages[index];
    setSelection({ index, id: page?.id, ownerId: page?.overflowOf });
  }, [pages]);
  useEffect(() => {
    const page = pages[currentPage];
    if (selection.index !== currentPage || selection.id !== page?.id || selection.ownerId !== page?.overflowOf) {
      setSelection({ index: currentPage, id: page?.id, ownerId: page?.overflowOf });
    }
  }, [selection, currentPage, pages]);
  const arrange = useCallback(() => {
    if (ready) setPages(arrangeDesktopPages(fittedPages, layoutOptions));
  }, [ready, fittedPages, layoutOptions, setPages]);

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const actionsValue = useDesktopActions({
    pagesRef,
    setPages,
    layoutOptions,
    normalizePages: fitPages,
    t: desktopNextI18n.t,
  });

  // 受控数据可能在拖动期间被替换，页面卸载时原有的指针监听也会移除。
  const { activeId, isDragging, sourcePageIndex, targetPageId } = dragState;
  const { findItemById } = actionsValue;
  useLayoutEffect(() => {
    if (!isDragging || activeId == null) return;
    const target = pages[sourcePageIndex];
    const lostPage = sourcePageIndex >= 0 && (
      !target || currentPage !== sourcePageIndex ||
      (targetPageId != null && target.id !== targetPageId)
    );
    if (lostPage || !findItemById(activeId)) {
      pointerPositionRef.current = null;
      setDragState(initialDragState);
    }
  }, [activeId, isDragging, sourcePageIndex, targetPageId, currentPage, pages, findItemById]);

  const { previewItemMove } = actionsValue;
  const { previewPosition, previewPageId, previewOrder } = dragState;
  const preview = useMemo(() => {
    if (!isDragging || activeId == null || sourcePageIndex < 0 || !previewPosition) return null;
    const moved = previewItemMove(activeId, sourcePageIndex, previewPosition, previewPageId, previewOrder);
    if (!moved) return null;
    const businessPages = moved.filter(page => page.children.length || !extraPageIds.has(page.id));
    const display = placeExtraItems(businessPages, extraItems, layoutOptions);
    return {
      pages: new Map(display.editablePages.map(page => [page.id, page])),
      extraLayout: display.extraLayout,
    };
  }, [
    isDragging, activeId, sourcePageIndex, previewPosition, previewPageId, previewOrder,
    previewItemMove, extraPageIds, extraItems, layoutOptions,
  ]);

  const stateValue = useMemo<DesktopDndStateContextValue>(
    () => ({
      pages,
      ready,
      measureRef,
      arrange,
      previewPages: preview?.pages ?? null,
      extraLayout: preview?.extraLayout ?? extraLayout,
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
      ready,
      measureRef,
      arrange,
      preview,
      extraLayout,
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
      iconSize: fittedIconSize,
      cellSize,
      layoutOptions,
      maxPages,
      mergeDwellTime,
      typeConfigMap: mergedTypeConfigMap,
      dataTypeMenuConfigMap,
      onBeforeRemove,
      onRemoveClick,
      onContextMenuItemClick,
      contextMenuProps,
      language: desktopNextI18n.language,
      t: desktopNextI18n.t,
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
      fittedIconSize,
      cellSize,
      layoutOptions,
      maxPages,
      mergeDwellTime,
      mergedTypeConfigMap,
      dataTypeMenuConfigMap,
      onBeforeRemove,
      onRemoveClick,
      onContextMenuItemClick,
      contextMenuProps,
      desktopNextI18n.language,
      desktopNextI18n.t,
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
