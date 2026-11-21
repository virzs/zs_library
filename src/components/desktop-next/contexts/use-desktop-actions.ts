import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { DesktopDndActionsContextValue } from "./types";
import type { DndPageItem, DndSortItem, DragState, GridPosition, PositionedItem, SortItemUserConfig } from "../types";
import { canPlaceItem, findFreePosition, getLayoutSpan, pushBlockNeighbors, relocateBlockNeighbors, type LayoutOptions } from "../layout";
import type { DesktopNextI18nT } from "../i18n";

function asFolderChild(item: DndSortItem): DndSortItem {
  if (!("position" in item) && !("preferredPosition" in item)) return item;
  const child = { ...item };
  if ("position" in child) delete child.position;
  if ("preferredPosition" in child) delete child.preferredPosition;
  return child;
}

function placeByHand(item: DndSortItem, position: GridPosition): PositionedItem {
  const placed: PositionedItem = { ...item, position };
  delete placed.preferredPosition;
  return placed;
}

function manualPage(page: DndPageItem): DndPageItem {
  if (page.overflowOf === undefined) return page;
  const result = { ...page, children: page.children.map(item => placeByHand(item, item.position)) };
  delete result.overflowOf;
  return result;
}

function overlappingItems(position: GridPosition, span: GridPosition, items: PositionedItem[], options: LayoutOptions) {
  return items.filter(item => {
    const size = getLayoutSpan(item, options);
    return position.col < item.position.col + size.col && position.col + span.col > item.position.col &&
      position.row < item.position.row + size.row && position.row + span.row > item.position.row;
  });
}

function detachItem(pages: DndPageItem[], itemId: DndSortItem["id"]) {
  return pages.map(page => {
    const index = page.children.findIndex(item =>
      item.id === itemId || item.children?.some(child => child.id === itemId),
    );
    if (index < 0) return page;
    const children = [...page.children];
    const owner = children[index];
    if (owner.id === itemId) {
      children.splice(index, 1);
    } else {
      const remaining = owner.children!.filter(child => child.id !== itemId);
      if (remaining.length <= 1) {
        children.splice(index, 1, ...remaining.map(child => ({ ...child, position: owner.position })));
      } else {
        children[index] = { ...owner, children: remaining };
      }
    }
    return { ...page, children };
  });
}

/** 按阅读顺序移动图标，保留这段顺序中尚未占用的格子。 */
function insertAtEdge(
  pages: DndPageItem[], sourceIndex: number, pageIndex: number,
  owner: PositionedItem, moved: PositionedItem, order: NonNullable<DragState["previewOrder"]>,
  options: LayoutOptions,
) {
  const page = manualPage(pages[pageIndex]);
  const byPosition = (a: GridPosition, b: GridPosition) => a.row - b.row || a.col - b.col;
  const items = [...page.children].sort((a, b) => byPosition(a.position, b.position));
  const targetIndex = items.findIndex(item => item.id === order.targetId);
  if (targetIndex < 0) return null;

  const slots = items.map(item => item.position);
  const sourceOnDesktop = owner.id === moved.id;
  const available = sourceOnDesktop && sourceIndex === pageIndex ? owner.position :
    findFreePosition(page.children, moved, options);
  items.splice(targetIndex + Number(order.after), 0, moved);

  if (available) {
    slots.push(available);
    slots.sort(byPosition);
  } else {
    // 满页上把尾项移至原页腾出的格子；拖到尾项后方时，腾出的应是原来的尾项。
    const last = items.length - 1;
    const displacedIndex = items[last].id === moved.id ? last - 1 : last;
    const displaced = items[displacedIndex];
    const origin = pages[sourceIndex];
    if (sourceOnDesktop && sourceIndex !== pageIndex &&
        canPlaceItem(origin.children, displaced, owner.position, options)) {
      items.splice(displacedIndex, 1);
      const source = manualPage(origin);
      pages[sourceIndex] = { ...source, children: [...source.children, placeByHand(displaced, owner.position)] };
    } else {
      slots.push({ row: options.rows, col: 0 });
    }
  }
  const children = items.map((item, i) => item.position === slots[i] ? item : placeByHand(item, slots[i]));
  pages[pageIndex] = { ...page, children };
  return pages;
}

/** useDesktopActions 的入参。 */
interface UseDesktopActionsOptions {
  /** 最新分页数据引用，供拖拽事件等闭包读取实时数据。 */
  pagesRef: React.RefObject<DndPageItem[]>;
  layoutOptions: LayoutOptions;
  normalizePages: (pages: DndPageItem[]) => DndPageItem[];
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
  layoutOptions,
  normalizePages,
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
      const removeFromItems = <T extends DndSortItem>(
        items: T[],
      ): { items: T[]; changed: boolean } => {
        let changed = false;
        const nextItems: T[] = [];

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

        let resizedIndex = -1;
        const children = page.children.map((item, index) => {
          if (item.id === itemId) {
            if (config.sizeId !== undefined && config.sizeId !== item.config?.sizeId) resizedIndex = index;
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

        if (resizedIndex >= 0) {
          const before = page.children[resizedIndex];
          const item = children[resizedIndex];
          const oldSpan = getLayoutSpan(before, layoutOptions);
          const span = getLayoutSpan(item, layoutOptions);
          if ((span.col > oldSpan.col || span.row > oldSpan.row) && canPlaceItem([], item, item.position, layoutOptions)) {
            // 手动放大时先在原处推开邻项，避免将让位误记成需要随窗口尺寸恢复的位置。
            const neighbors = children.filter(child => child.id !== item.id);
            const covered = overlappingItems(item.position, span, neighbors, layoutOptions);
            const towards = {
              col: item.position.col + Math.max(0, span.col - oldSpan.col),
              row: item.position.row + Math.max(0, span.row - oldSpan.row),
            };
            const pushed = pushBlockNeighbors(placeByHand(item, item.position), neighbors, covered, layoutOptions, towards);
            if (pushed) return { ...page, children: pushed };
          }
        }
        return pageChanged ? { ...page, children } : page;
      });

      setPages(pages);
    },
    [pagesRef, setPages, layoutOptions],
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

  const previewItemMove = useCallback(
    (itemId: DndSortItem["id"], pageIndex: number, position: GridPosition, newPageId?: DndPageItem["id"],
      order?: DragState["previewOrder"]) => {
      const current = pagesRef.current;
      const source = findItemById(itemId);
      if (!source || !Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex > current.length) return null;
      const { columns, rows, autoPaginate, maxPages = 0 } = layoutOptions;
      const span = getLayoutSpan(source.item, layoutOptions);
      const target = current[pageIndex];
      const extendedRows = !!target && maxPages > 0 && current.length >= maxPages &&
        !current.some((page, index) => index > pageIndex && page.overflowOf === (target.overflowOf ?? target.id));
      if (!Number.isInteger(position.col) || !Number.isInteger(position.row) ||
          position.col < 0 || position.row < 0 || position.col + span.col > columns ||
          (autoPaginate && position.row + span.row > rows && !extendedRows)) {
        return null;
      }
      const owner = current[source.pageIndex].children[source.itemIndex];
      if (!order && source.pageIndex === pageIndex && owner.id === itemId &&
          owner.position.col === position.col && owner.position.row === position.row) return current;

      const pages = detachItem(current, itemId);
      if (pageIndex === pages.length) {
        if (newPageId == null || (maxPages > 0 && pages.length >= maxPages)) return null;
        pages.push({ id: newPageId, children: [] });
      }
      const moved = placeByHand(source.item, position);
      if (order) {
        const next = insertAtEdge(pages, source.pageIndex, pageIndex, owner, moved, order, layoutOptions);
        return next ? normalizePages(next) : null;
      }
      const targetPage = manualPage(pages[pageIndex]);
      const overlapping = overlappingItems(position, span, targetPage.children, layoutOptions);
      if ((span.col > 1 || span.row > 1) && overlapping.length) {
        const options = extendedRows ? { ...layoutOptions, autoPaginate: false } : layoutOptions;
        const origin = owner.id === itemId && source.pageIndex === pageIndex ? owner.position : undefined;
        const pushed = pushBlockNeighbors(moved, targetPage.children, overlapping, options, origin);
        if (pushed) {
          pages[pageIndex] = { ...targetPage, children: pushed };
          return normalizePages(pages);
        }
        const covered = new Set(overlapping);
        const fixed = [moved, ...targetPage.children.filter(item => !covered.has(item))];
        const local = relocateBlockNeighbors(overlapping, fixed, options);
        if (local) {
          pages[pageIndex] = { ...targetPage, children: [...fixed, ...local] };
        } else {
          if (source.pageIndex === pageIndex || owner.id !== itemId) return null;
          const origin = manualPage(pages[source.pageIndex]);
          const atSource = relocateBlockNeighbors(overlapping, origin.children, layoutOptions, {
            col: owner.position.col - moved.position.col, row: owner.position.row - moved.position.row,
          });
          if (!atSource) return null;
          pages[pageIndex] = { ...targetPage, children: fixed };
          pages[source.pageIndex] = { ...origin, children: [...origin.children, ...atSource] };
        }
        return normalizePages(pages);
      }
      pages[pageIndex] = { ...targetPage, children: [moved, ...targetPage.children] };

      // 两个项目都能放进对方的原位置时，交换它们的位置。其他重叠交给布局函数处理。
      if (owner.id === itemId && overlapping.length === 1) {
        const other = overlapping[0];
        if (canPlaceItem(pages[source.pageIndex].children, other, owner.position, layoutOptions)) {
          const target = pages[pageIndex];
          pages[pageIndex] = { ...target, children: target.children.filter(item => item.id !== other.id) };
          const origin = manualPage(pages[source.pageIndex]);
          pages[source.pageIndex] = {
            ...origin, children: [...origin.children, placeByHand(other, owner.position)],
          };
        }
      }
      return normalizePages(pages);
    },
    [findItemById, layoutOptions, normalizePages, pagesRef],
  );

  const moveItemToCell = useCallback<DesktopDndActionsContextValue["moveItemToCell"]>(
    (...args) => {
      const result = previewItemMove(...args);
      if (!result) return false;
      if (result !== pagesRef.current) setPages(result);
      return true;
    },
    [pagesRef, previewItemMove, setPages],
  );

  /** 将 item 插入到指定页面的指定位置。 */
  const insertItemAt = useCallback(
    (pageIndex: number, index: number, item: DndSortItem) => {
      const pages = [...pagesRef.current];
      if (!pages[pageIndex]) return;
      const source = manualPage(pages[pageIndex]);
      const page = { ...source, children: [...source.children] };
      const clampedIndex = Math.min(index, page.children.length);
      const position = page.children[clampedIndex]?.position ?? findFreePosition(page.children, item, layoutOptions)
        ?? { row: layoutOptions.rows, col: 0 };
      page.children.splice(clampedIndex, 0, placeByHand(item, position));
      pages[pageIndex] = page;
      setPages(pages);
    },
    [layoutOptions, pagesRef, setPages],
  );

  /** 合并两个 item，必要时创建文件夹。 */
  const mergeItems = useCallback(
    (targetId: string | number, draggedItem: DndSortItem, fromPages?: DndPageItem[]) => {
      if (targetId === draggedItem.id || draggedItem.type === "group") return;
      const current = fromPages ?? pagesRef.current;
      if (current.some(page => page.children.some(item =>
        item.id === targetId && item.children?.some(child => child.id === draggedItem.id)))) return;
      const pages = detachItem(current, draggedItem.id);
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

      const source = manualPage(pages[targetPageIdx]);
      const targetPage = { ...source, children: [...source.children] };
      const target = placeByHand(targetPage.children[targetItemIdx], targetPage.children[targetItemIdx].position);
      const child = asFolderChild(findItemById(draggedItem.id)?.item ?? draggedItem);

      if (target.type === "group") {
        target.children = [...(target.children ?? []), child];
      } else {
        targetPage.children[targetItemIdx] = {
          id: uuidv4(),
          type: "group",
          data: {
            name: t("folder.defaultName"),
            icon: undefined,
            iconColor: undefined,
          },
          position: target.position,
          children: [asFolderChild(target), child],
        };
        pages[targetPageIdx] = targetPage;
        setPages(pages);
        return;
      }

      targetPage.children[targetItemIdx] = target;
      pages[targetPageIdx] = targetPage;
      setPages(pages);
    },
    [findItemById, pagesRef, setPages, t],
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

      if (folderPageIdx < 0 || !pages[toPageIndex]) return;

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
          folderPage.children[folderItemIdx] = placeByHand(children[0], folder.position);
        } else {
          folderPage.children.splice(folderItemIdx, 1);
        }
      } else {
        folderPage.children[folderItemIdx] = folder;
      }

      pages[folderPageIdx] = folderPage;

      const destination = manualPage(pages[toPageIndex]);
      const toPage = { ...destination, children: [...destination.children] };
      const position = findFreePosition(toPage.children, removed, layoutOptions) ?? { row: layoutOptions.rows, col: 0 };
      toPage.children.push(placeByHand(removed, position));
      pages[toPageIndex] = toPage;

      setPages(pages);
    },
    [layoutOptions, pagesRef, setPages],
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
          folder.children = [...(folder.children ?? []), asFolderChild(item)];
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
    moveItemToCell,
    previewItemMove,
    mergeItems,
    removeItemFromFolder,
    addItemToFolder,
    reorderFolderChildren,
    findItemById,
    findFolderContaining,
  };
};
