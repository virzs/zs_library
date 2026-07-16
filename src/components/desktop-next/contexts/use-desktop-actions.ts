import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { DesktopDndActionsContextValue } from "./types";
import type { DndPageItem, DndSortItem, SortItemUserConfig } from "../types";
import type { DesktopNextI18nT } from "../i18n";

/** useDesktopActions 的入参。 */
interface UseDesktopActionsOptions {
  /** 最新分页数据引用，供拖拽事件等闭包读取实时数据。 */
  pagesRef: React.RefObject<DndPageItem[]>;
  /** 写入新的分页数据并通知外部。 */
  setPages: (pages: DndPageItem[]) => void;
  /** DesktopNext 内置文案翻译函数。 */
  t: DesktopNextI18nT;
}

/**
 * 创建桌面数据操作方法。
 *
 * 该 hook 只处理 pages 数据结构变更，不直接处理 DOM、拖拽事件或展示状态。
 */
export const useDesktopActions = ({
  pagesRef,
  setPages,
  t,
}: UseDesktopActionsOptions): DesktopDndActionsContextValue => {
  /** 按 id 查找桌面或文件夹内的 item。 */
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
    [pagesRef],
  );

  /** 查找包含指定子项的文件夹。 */
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
    [pagesRef],
  );

  /** 从所有桌面页中移除指定 item。 */
  const removeItem = useCallback(
    (itemId: string | number) => {
      const removeFromItems = (
        items: DndSortItem[],
      ): { items: DndSortItem[]; changed: boolean } => {
        let changed = false;
        const nextItems: DndSortItem[] = [];

        for (const item of items) {
          if (item.id === itemId) {
            changed = true;
            continue;
          }

          if (item.children?.length) {
            const nested = removeFromItems(item.children);
            if (nested.changed) {
              changed = true;
              nextItems.push({ ...item, children: nested.items });
              continue;
            }
          }

          nextItems.push(item);
        }

        return { items: nextItems, changed };
      };

      const pages = pagesRef.current.map((page) => {
        const result = removeFromItems(page.children);
        return result.changed ? { ...page, children: result.items } : page;
      });
      setPages(pages);
    },
    [pagesRef, setPages],
  );

  /** 更新指定 item 的用户配置。 */
  const updateItemConfig = useCallback(
    (itemId: string | number, config: SortItemUserConfig) => {
      const pages = pagesRef.current.map((page) => {
        let pageChanged = false;

        const children = page.children.map((item) => {
          if (item.id === itemId) {
            pageChanged = true;
            return { ...item, config: { ...(item.config ?? {}), ...config } };
          }

          if (item.children?.length) {
            let childChanged = false;
            const nextChildren = item.children.map((child) => {
              if (child.id !== itemId) return child;
              childChanged = true;
              return { ...child, config: { ...(child.config ?? {}), ...config } };
            });

            if (childChanged) {
              pageChanged = true;
              return { ...item, children: nextChildren };
            }
          }

          return item;
        });

        return pageChanged ? { ...page, children } : page;
      });

      setPages(pages);
    },
    [pagesRef, setPages],
  );

  /** 更新指定 item 的业务数据。 */
  const updateItemData = useCallback(
    (itemId: string | number, data: Partial<DndSortItem["data"]>) => {
      const pages = pagesRef.current.map((page) => {
        let pageChanged = false;

        const children = page.children.map((item) => {
          if (item.id === itemId) {
            pageChanged = true;
            return { ...item, data: { ...(item.data ?? {}), ...data } };
          }

          if (item.children?.length) {
            let childChanged = false;
            const nextChildren = item.children.map((child) => {
              if (child.id !== itemId) return child;
              childChanged = true;
              return { ...child, data: { ...(child.data ?? {}), ...data } };
            });

            if (childChanged) {
              pageChanged = true;
              return { ...item, children: nextChildren };
            }
          }

          return item;
        });

        return pageChanged ? { ...page, children } : page;
      });

      setPages(pages);
    },
    [pagesRef, setPages],
  );

  /** 将 item 插入到指定页面的指定位置。 */
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
    [pagesRef, setPages],
  );

  /** 合并两个 item，必要时创建文件夹。 */
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
        targetPage.children[targetItemIdx] = {
          id: uuidv4(),
          type: "group",
          data: {
            name: t("folder.defaultName"),
            icon: undefined,
            iconColor: undefined,
          },
          children: [target, draggedItem],
        };
        pages[targetPageIdx] = targetPage;
        setPages(pages);
        return;
      }

      targetPage.children[targetItemIdx] = target;
      pages[targetPageIdx] = targetPage;
      setPages(pages);
    },
    [pagesRef, setPages, t],
  );

  /** 从文件夹中移除子项并追加到指定桌面页。 */
  const removeItemFromFolder = useCallback(
    (folderId: string | number, itemId: string | number, toPageIndex: number) => {
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
    [pagesRef, setPages],
  );

  /** 调整文件夹内部子项顺序。 */
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
    [pagesRef, setPages],
  );

  /** 将 item 添加到指定文件夹末尾。 */
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
    [pagesRef, setPages],
  );

  return {
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
  };
};
