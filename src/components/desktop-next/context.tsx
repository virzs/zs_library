import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ComponentRegistry,
  ContextMenuActionPayload,
  ContextMenuData,
  DesktopDndContextMenuProps,
  DndSortItem,
  DndPageItem,
  DragState,
  FolderModalState,
  SortItemUserConfig,
  TypeConfigMap,
  DataTypeMenuConfigMap,
  PageTransition,
} from "./types";
import { Theme, defaultTheme } from "./themes";
import { mergeTheme } from "./themes/utils";
import { v4 as uuidv4 } from "uuid";

interface DesktopDndContextValue {
  pages: DndPageItem[];
  setPages: (pages: DndPageItem[]) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  dragState: DragState;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
  pointerPositionRef: React.MutableRefObject<{ x: number; y: number } | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  folderModal: FolderModalState;
  setFolderModal: React.Dispatch<React.SetStateAction<FolderModalState>>;
  contextMenu: ContextMenuData | null;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuData | null>>;
  hideContextMenu: () => void;
  iconSize: number;
  maxPages: number;
  mergeDwellTime: number;
  typeConfigMap?: TypeConfigMap;
  dataTypeMenuConfigMap?: DataTypeMenuConfigMap;
  onRemoveClick?: (item: DndSortItem) => void;
  onContextMenuItemClick?: (
    item: DndSortItem,
    payload: ContextMenuActionPayload,
  ) => void;
  contextMenuProps?: DesktopDndContextMenuProps;
  theme: Theme;
  noLetters?: boolean;
  itemBuilder?: (item: DndSortItem, index: number) => React.ReactNode | null;
  itemBuilderAllowNull?: boolean;
  itemIconBuilder?: (item: DndSortItem) => React.ReactNode;
  itemIconBuilderAllowNull?: boolean;
  pagingDotBuilder?: (index: number, isActive: boolean) => React.ReactNode;
  pagingDotsBuilder?: (dots: React.ReactNode[]) => React.ReactNode;
  pageTransition?: PageTransition;
  extraItems?: DndSortItem[];
  componentRegistry?: ComponentRegistry;

  removeItem: (itemId: string | number) => void;
  updateItemConfig: (
    itemId: string | number,
    config: SortItemUserConfig,
  ) => void;
  updateItemData: (
    itemId: string | number,
    data: Partial<DndSortItem["data"]>,
  ) => void;
  insertItemAt: (pageIndex: number, index: number, item: DndSortItem) => void;
  mergeItems: (targetId: string | number, draggedItem: DndSortItem) => void;
  removeItemFromFolder: (
    folderId: string | number,
    itemId: string | number,
    toPageIndex: number,
  ) => void;
  addItemToFolder: (folderId: string | number, item: DndSortItem) => void;
  reorderFolderChildren: (
    folderId: string | number,
    fromIndex: number,
    toIndex: number,
  ) => void;
  findItemById: (
    id: string | number,
  ) => { item: DndSortItem; pageIndex: number; itemIndex: number } | null;
  findFolderContaining: (
    itemId: string | number,
  ) => { folder: DndSortItem; pageIndex: number } | null;
}

const initialDragState: DragState = {
  activeId: null,
  isDragging: false,
  pointerPosition: null,
  pointerOffset: null,
  mergeTargetId: null,
  dragSource: null,
  draggedItem: null,
  gapIndex: -1,
  sourcePageIndex: -1,
};

const initialFolderModal: FolderModalState = {
  openFolder: null,
  openPosition: null,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DesktopDndContext = createContext<DesktopDndContextValue>(null as any);

export const useDesktopDnd = () => {
  const ctx = useContext(DesktopDndContext);
  if (!ctx) {
    throw new Error("useDesktopDnd must be used within DesktopDndProvider");
  }
  return ctx;
};

interface DesktopDndProviderProps {
  pages: DndPageItem[];
  onChange: (pages: DndPageItem[]) => void;
  iconSize: number;
  maxPages: number;
  mergeDwellTime: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  typeConfigMap?: TypeConfigMap;
  dataTypeMenuConfigMap?: DataTypeMenuConfigMap;
  onRemoveClick?: (item: DndSortItem) => void;
  onContextMenuItemClick?: (
    item: DndSortItem,
    payload: ContextMenuActionPayload,
  ) => void;
  contextMenuProps?: DesktopDndContextMenuProps;
  theme?: Theme | "light" | "dark";
  noLetters?: boolean;
  itemBuilder?: (item: DndSortItem, index: number) => React.ReactNode | null;
  itemBuilderAllowNull?: boolean;
  itemIconBuilder?: (item: DndSortItem) => React.ReactNode;
  itemIconBuilderAllowNull?: boolean;
  pagingDotBuilder?: (index: number, isActive: boolean) => React.ReactNode;
  pagingDotsBuilder?: (dots: React.ReactNode[]) => React.ReactNode;
  pageTransition?: PageTransition;
  extraItems?: DndSortItem[];
  storageKey?: string;
  componentRegistry?: ComponentRegistry;
  children: React.ReactNode;
}

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

  const [internalPages, setInternalPages] = useState<DndPageItem[]>(() => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) return JSON.parse(stored) as DndPageItem[];
      } catch {}
    }
    return externalPages;
  });

  const pages = storageKey ? internalPages : externalPages;

  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  useEffect(() => {
    if (!storageKey) {
      pagesRef.current = externalPages;
    }
  }, [externalPages, storageKey]);

  const setPages = useCallback(
    (newPages: DndPageItem[]) => {
      pagesRef.current = newPages;
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newPages));
        } catch {}
        setInternalPages(newPages);
      }
      onChange(newPages);
    },
    [onChange, storageKey],
  );

  const findItemById = useCallback(
    (
      id: string | number,
    ): { item: DndSortItem; pageIndex: number; itemIndex: number } | null => {
      for (let pi = 0; pi < pagesRef.current.length; pi++) {
        const page = pagesRef.current[pi];
        for (let ii = 0; ii < page.children.length; ii++) {
          const item = page.children[ii];
          if (item.id === id) return { item, pageIndex: pi, itemIndex: ii };
          if (item.children) {
            const childIdx = item.children.findIndex((c) => c.id === id);
            if (childIdx >= 0)
              return {
                item: item.children[childIdx],
                pageIndex: pi,
                itemIndex: ii,
              };
          }
        }
      }
      return null;
    },
    [],
  );

  const findFolderContaining = useCallback(
    (
      itemId: string | number,
    ): { folder: DndSortItem; pageIndex: number } | null => {
      for (let pi = 0; pi < pagesRef.current.length; pi++) {
        const page = pagesRef.current[pi];
        for (const item of page.children) {
          if (
            item.type === "group" &&
            item.children?.some((c) => c.id === itemId)
          ) {
            return { folder: item, pageIndex: pi };
          }
        }
      }
      return null;
    },
    [],
  );

  const removeItem = useCallback(
    (itemId: string | number) => {
      const pages = pagesRef.current.map((page) => ({
        ...page,
        children: page.children.filter((c) => c.id !== itemId),
      }));
      setPages(pages);
    },
    [setPages],
  );

  const updateItemConfig = useCallback(
    (itemId: string | number, config: SortItemUserConfig) => {
      const pages = pagesRef.current.map((page) => {
        let pageChanged = false;

        const children = page.children.map((item) => {
          if (item.id === itemId) {
            pageChanged = true;
            return {
              ...item,
              config: {
                ...(item.config ?? {}),
                ...config,
              },
            };
          }

          if (item.children?.length) {
            let childChanged = false;
            const nextChildren = item.children.map((child) => {
              if (child.id !== itemId) return child;
              childChanged = true;
              return {
                ...child,
                config: {
                  ...(child.config ?? {}),
                  ...config,
                },
              };
            });

            if (childChanged) {
              pageChanged = true;
              return {
                ...item,
                children: nextChildren,
              };
            }
          }

          return item;
        });

        return pageChanged
          ? {
              ...page,
              children,
            }
          : page;
      });

      setPages(pages);
    },
    [setPages],
  );

  const updateItemData = useCallback(
    (itemId: string | number, data: Partial<DndSortItem["data"]>) => {
      const pages = pagesRef.current.map((page) => {
        let pageChanged = false;

        const children = page.children.map((item) => {
          if (item.id === itemId) {
            pageChanged = true;
            return {
              ...item,
              data: {
                ...(item.data ?? {}),
                ...data,
              },
            };
          }

          if (item.children?.length) {
            let childChanged = false;
            const nextChildren = item.children.map((child) => {
              if (child.id !== itemId) return child;
              childChanged = true;
              return {
                ...child,
                data: {
                  ...(child.data ?? {}),
                  ...data,
                },
              };
            });

            if (childChanged) {
              pageChanged = true;
              return {
                ...item,
                children: nextChildren,
              };
            }
          }

          return item;
        });

        return pageChanged
          ? {
              ...page,
              children,
            }
          : page;
      });

      setPages(pages);
    },
    [setPages],
  );

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const insertItemAt = useCallback(
    (pageIndex: number, index: number, item: DndSortItem) => {
      const pages = [...pagesRef.current];
      const page = {
        ...pages[pageIndex],
        children: [...pages[pageIndex].children],
      };
      const clampedIndex = Math.min(index, page.children.length);
      page.children.splice(clampedIndex, 0, item);
      pages[pageIndex] = page;
      setPages(pages);
    },
    [setPages],
  );

  const mergeItems = useCallback(
    (targetId: string | number, draggedItem: DndSortItem) => {
      const pages = [...pagesRef.current];

      let targetPageIdx = -1;
      let targetItemIdx = -1;
      for (let pi = 0; pi < pages.length; pi++) {
        const idx = pages[pi].children.findIndex((c) => c.id === targetId);
        if (idx >= 0) {
          targetPageIdx = pi;
          targetItemIdx = idx;
          break;
        }
      }

      if (targetPageIdx < 0) return;

      const targetPage = {
        ...pages[targetPageIdx],
        children: [...pages[targetPageIdx].children],
      };
      const target = { ...targetPage.children[targetItemIdx] };

      if (target.type === "group") {
        target.children = [...(target.children ?? []), draggedItem];
      } else {
        const folder: DndSortItem = {
          id: uuidv4(),
          type: "group",
          data: {
            name: "文件夹",
            icon: undefined,
            iconColor: undefined,
          },
          children: [target, draggedItem],
        };
        targetPage.children[targetItemIdx] = folder;
        pages[targetPageIdx] = targetPage;
        setPages(pages);
        return;
      }

      targetPage.children[targetItemIdx] = target;
      pages[targetPageIdx] = targetPage;
      setPages(pages);
    },
    [setPages],
  );

  const removeItemFromFolder = useCallback(
    (
      folderId: string | number,
      itemId: string | number,
      toPageIndex: number,
    ) => {
      const pages = [...pagesRef.current];
      let folderPageIdx = -1;
      let folderItemIdx = -1;

      for (let pi = 0; pi < pages.length; pi++) {
        const idx = pages[pi].children.findIndex((c) => c.id === folderId);
        if (idx >= 0) {
          folderPageIdx = pi;
          folderItemIdx = idx;
          break;
        }
      }

      if (folderPageIdx < 0) return;

      const folderPage = {
        ...pages[folderPageIdx],
        children: [...pages[folderPageIdx].children],
      };
      const folder = { ...folderPage.children[folderItemIdx] };
      const children = [...(folder.children ?? [])];
      const childIdx = children.findIndex((c) => c.id === itemId);
      if (childIdx < 0) return;

      const [removed] = children.splice(childIdx, 1);
      folder.children = children;

      if (children.length <= 1) {
        if (children.length === 1) {
          folderPage.children[folderItemIdx] = children[0];
        } else {
          folderPage.children.splice(folderItemIdx, 1);
        }
      } else {
        folderPage.children[folderItemIdx] = folder;
      }

      pages[folderPageIdx] = folderPage;

      const toPage = {
        ...pages[toPageIndex],
        children: [...pages[toPageIndex].children],
      };
      toPage.children.push(removed);
      pages[toPageIndex] = toPage;

      setPages(pages);
    },
    [setPages],
  );

  const reorderFolderChildren = useCallback(
    (folderId: string | number, fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const pages = [...pagesRef.current];
      for (let pi = 0; pi < pages.length; pi++) {
        const idx = pages[pi].children.findIndex((c) => c.id === folderId);
        if (idx >= 0) {
          const page = { ...pages[pi], children: [...pages[pi].children] };
          const folder = { ...page.children[idx] };
          const children = [...(folder.children ?? [])];
          const [moved] = children.splice(fromIndex, 1);
          children.splice(toIndex, 0, moved);
          folder.children = children;
          page.children[idx] = folder;
          pages[pi] = page;
          setPages(pages);
          return;
        }
      }
    },
    [setPages],
  );

  const addItemToFolder = useCallback(
    (folderId: string | number, item: DndSortItem) => {
      const pages = [...pagesRef.current];

      for (let pi = 0; pi < pages.length; pi++) {
        const idx = pages[pi].children.findIndex((c) => c.id === folderId);
        if (idx >= 0) {
          const page = { ...pages[pi], children: [...pages[pi].children] };
          const folder = { ...page.children[idx] };
          folder.children = [...(folder.children ?? []), item];
          page.children[idx] = folder;
          pages[pi] = page;
          setPages(pages);
          return;
        }
      }
    },
    [setPages],
  );

  const value = useMemo<DesktopDndContextValue>(
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
      removeItem,
      updateItemConfig,
      updateItemData,
      insertItemAt,
      mergeItems,
      removeItemFromFolder,
      addItemToFolder,
      reorderFolderChildren,
      findItemById,
      findFolderContaining,
    }),
    [
      pages,
      setPages,
      currentPage,
      dragState,
      folderModal,
      contextMenu,
      hideContextMenu,
      iconSize,
      maxPages,
      containerRef,
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
      removeItem,
      updateItemConfig,
      updateItemData,
      insertItemAt,
      mergeItems,
      removeItemFromFolder,
      addItemToFolder,
      reorderFolderChildren,
      findItemById,
      findFolderContaining,
      setContextMenu,
      setFolderModal,
    ],
  );

  return (
    <DesktopDndContext.Provider value={value}>
      {children}
    </DesktopDndContext.Provider>
  );
};
