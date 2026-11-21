import { useCallback, useLayoutEffect, useRef } from "react";
import { useDesktopDnd } from "../context";
import type { DndSortItem, DragState, PageSwitchZone, PositionedItem } from "../types";
import { canPlaceItem, findFreePosition, getLayoutSpan } from "../layout";
import { v4 as uuidv4 } from "uuid";

interface DragEngineOptions {
  finishPlacement: (id: DndSortItem["id"]) => void;
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
  cols: number;
  cellSize: number;
  pageIndex: number;
}

const GAP_COMMIT_DELAY = 80;
const EDGE_GAP_COMMIT_DELAY = 40;
const MERGE_HITBOX_RATIO = 0.62;
const PAGE_SWITCH_TRIGGER_ZONE = 60;
const PAGE_SWITCH_DELAY = 800;
const PAGE_SWITCH_COOLDOWN = 500;

function readingOrder(items: PositionedItem[]) {
  return [...items].sort((a, b) => a.position.row - b.position.row || a.position.col - b.position.col);
}

type GridPreview = Pick<DragState, "previewPosition" | "previewOrder">;

type HoverPlacement =
  | { type: "merge"; id: string | number }
  | { type: "gap"; index: number; slot: number }
  | null;

export const useDragEngine = ({
  finishPlacement,
  gridContainerRef,
  cols,
  cellSize,
  pageIndex,
}: DragEngineOptions) => {
  const ctx = useDesktopDnd();

  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const colsRef = useRef(cols);
  colsRef.current = cols;
  const cellSizeRef = useRef(cellSize);
  cellSizeRef.current = cellSize;
  const pageIndexRef = useRef(pageIndex);
  pageIndexRef.current = pageIndex;

  const mergeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverItemIdRef = useRef<string | number | null>(null);
  const dragActiveRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const lastPointerSlotRef = useRef<number>(-1);
  const pageSwitchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageSwitchZoneRef = useRef<PageSwitchZone>(null);

  const clearMergeTimer = useCallback(() => {
    if (mergeTimerRef.current) {
      clearTimeout(mergeTimerRef.current);
      mergeTimerRef.current = null;
    }
  }, []);

  const clearGapTimer = useCallback(() => {
    if (gapTimerRef.current) {
      clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
  }, []);

  const clearPageSwitchTimer = useCallback(() => {
    if (pageSwitchTimerRef.current) {
      clearTimeout(pageSwitchTimerRef.current);
      pageSwitchTimerRef.current = null;
    }
    pageSwitchZoneRef.current = null;
    ctxRef.current.setDragState((prev) =>
      prev.pageSwitchZone === null ? prev : { ...prev, pageSwitchZone: null },
    );
  }, []);

  const pointerToSlot = useCallback(
    (clientX: number, clientY: number): number => {
      const container = gridContainerRef.current;
      if (!container) return -1;
      const rect = container.getBoundingClientRect();
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;
      if (relX < 0 || relY < 0 || relX >= rect.width || relY >= rect.height) return -1;
      const c = colsRef.current;
      const cs = cellSizeRef.current;
      const { dragState, layoutOptions } = ctxRef.current;
      if (!dragState.draggedItem) return -1;
      const span = getLayoutSpan(dragState.draggedItem, layoutOptions);
      // 多格组件以抓取的格子跟随指针。屏幕尺寸计入当前翻页动画的缩放。
      const rows = Math.max(layoutOptions.rows, Math.round(container.clientHeight / cs));
      const x = relX * c / rect.width;
      const y = relY * rows / rect.height;
      const grab = dragState.grabOffsetInCells;
      const col = Math.max(0, Math.min(c - span.col, grab ? Math.round(x - grab.x) : Math.floor(x)));
      const row = Math.max(0, Math.min(rows - span.row, grab ? Math.round(y - grab.y) : Math.floor(y)));
      return row * c + col;
    },
    [gridContainerRef],
  );

  const getHoverPlacement = useCallback(
    (
      clientX: number,
      clientY: number,
      activeId: string | number,
      nonDragItems: DndSortItem[],
    ): HoverPlacement => {
      const el = document
        .elementFromPoint(clientX, clientY)
        ?.closest?.("[data-grid-item-id]") as HTMLElement | null;
      if (!el || !gridContainerRef.current?.contains(el)) return null;

      const domId = el.dataset.gridItemId;
      if (domId == null || domId === String(activeId)) return null;

      const targetIndex = nonDragItems.findIndex(
        (item) => String(item.id) === domId,
      );
      if (targetIndex < 0) return null;

      const targetItem = nonDragItems[targetIndex];

      const elRect = el.getBoundingClientRect();
      const insetX = (elRect.width * (1 - MERGE_HITBOX_RATIO)) / 2;
      const insetY = (elRect.height * (1 - MERGE_HITBOX_RATIO)) / 2;
      const isInMergeCenter =
        clientX >= elRect.left + insetX &&
        clientX <= elRect.right - insetX &&
        clientY >= elRect.top + insetY &&
        clientY <= elRect.bottom - insetY;

      // 文件夹不能与任何元素合并，但仍然可以在目标边缘触发排序。
      const draggedItem = ctxRef.current.dragState.draggedItem;
      if (isInMergeCenter && draggedItem?.type !== "group" &&
          !targetItem.children?.some(child => child.id === activeId)) {
        return { type: "merge", id: targetItem.id };
      }

      const relX = (clientX - elRect.left) / Math.max(1, elRect.width);
      const relY = (clientY - elRect.top) / Math.max(1, elRect.height);
      const xDistance = Math.abs(relX - 0.5);
      const yDistance = Math.abs(relY - 0.5);
      const isBefore =
        yDistance > xDistance ? relY < 0.5 : relX < 0.5;

      return {
        type: "gap",
        index: targetIndex + (isBefore ? 0 : 1),
        slot: targetIndex,
      };
    },
    [gridContainerRef],
  );

  const setMergeTarget = useCallback((id: string | number | null) => {
    ctxRef.current.setDragState((prev) =>
      prev.mergeTargetId === id ? prev : { ...prev, mergeTargetId: id },
    );
  }, []);

  const scheduleGapCommit = useCallback(
    (nextGap: number, rawSlot: number, preview: GridPreview, delay = GAP_COMMIT_DELAY) => {
      const currentGap = ctxRef.current.dragState.gapIndex;
      if (nextGap === currentGap) {
        clearGapTimer();
        lastPointerSlotRef.current = rawSlot;
        return;
      }

      const prevSlot = lastPointerSlotRef.current;
      const pointerDirection = rawSlot - prevSlot;
      const gapDirection = nextGap - currentGap;

      if (
        prevSlot < 0 || currentGap < 0 ||
        pointerDirection === 0 ||
        (pointerDirection > 0 && gapDirection > 0) ||
        (pointerDirection < 0 && gapDirection < 0)
      ) {
        clearGapTimer();
        gapTimerRef.current = setTimeout(() => {
          if (dragActiveRef.current) {
            ctxRef.current.setDragState((prev) => ({
              ...prev,
              gapIndex: nextGap,
              ...preview,
            }));
          }
        }, delay);
      }

      lastPointerSlotRef.current = rawSlot;
    },
    [clearGapTimer],
  );

  const handlePageSwitch = useCallback(
    (zone: Exclude<PageSwitchZone, null>) => {
      const { pages, currentPage, maxPages, dragState } = ctxRef.current;
      const draggedItem = dragState.draggedItem;
      if (!draggedItem) return;

      const totalPages = pages.length;
      let targetPage: number;
      let previewPageId = dragState.previewPageId;

      if (zone === "left") {
        if (currentPage <= 0) return;
        targetPage = currentPage - 1;
      } else {
        if (currentPage >= totalPages - 1) {
          if (maxPages > 0 && totalPages >= maxPages) return;
          if (previewPageId != null) return;
          previewPageId = uuidv4();
          targetPage = totalPages;
        } else {
          targetPage = currentPage + 1;
        }
      }

      dragActiveRef.current = false;
      clearMergeTimer();
      clearGapTimer();
      clearPageSwitchTimer();
      hoverItemIdRef.current = null;
      lastPointerSlotRef.current = -1;

      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);

      const target = pages[targetPage];
      const previewPosition = findFreePosition(target?.children ?? [], draggedItem, ctxRef.current.layoutOptions);
      ctxRef.current.setCurrentPage(targetPage);
      ctxRef.current.setDragState((prev) => ({
        ...prev,
        sourcePageIndex: targetPage,
        targetPageId: target?.id ?? previewPageId,
        previewPageId, previewPosition, previewOrder: undefined,
        pageSwitchedAt: Date.now(), gapIndex: -1,
        mergeTargetId: null,
        pageSwitchZone: null,
      }));
    },
    [clearMergeTimer, clearGapTimer, clearPageSwitchTimer],
  );

  const checkPageSwitchZone = useCallback(
    (clientX: number) => {
      if (Date.now() - (ctxRef.current.dragState.pageSwitchedAt ?? 0) < PAGE_SWITCH_COOLDOWN) {
        clearPageSwitchTimer();
        return;
      }

      const container = ctxRef.current.containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const relX = clientX - rect.left;

      let zone: PageSwitchZone = null;
      if (relX < PAGE_SWITCH_TRIGGER_ZONE && ctxRef.current.currentPage > 0) {
        zone = "left";
      } else if (relX > rect.width - PAGE_SWITCH_TRIGGER_ZONE) {
        const { pages, currentPage, maxPages } = ctxRef.current;
        const canSwitchNext = currentPage < pages.length - 1;
        const canCreatePage = ctxRef.current.dragState.previewPageId == null &&
          (maxPages <= 0 || pages.length < maxPages);
        if (canSwitchNext || canCreatePage) {
          zone = "right";
        }
      }

      if (zone !== pageSwitchZoneRef.current) {
        clearPageSwitchTimer();
        pageSwitchZoneRef.current = zone;
        ctxRef.current.setDragState((prev) =>
          prev.pageSwitchZone === zone ? prev : { ...prev, pageSwitchZone: zone },
        );

        if (zone) {
          pageSwitchTimerRef.current = setTimeout(() => {
            if (dragActiveRef.current && pageSwitchZoneRef.current === zone) {
              handlePageSwitch(zone);
            }
          }, PAGE_SWITCH_DELAY);
        }
      }
    },
    [clearPageSwitchTimer, handlePageSwitch],
  );

  const handleWindowPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragActiveRef.current) return;
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current)
        return;

      const { dragState } = ctxRef.current;
      const activeId = dragState.activeId;
      if (activeId == null) return;

      ctxRef.current.pointerPositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      checkPageSwitchZone(e.clientX);

      const pi = pageIndexRef.current;
      const pageChildren = readingOrder(ctxRef.current.pages[pi]?.children ?? []);
      const nonDragItems = pageChildren.filter((c) => c.id !== activeId);
      const itemCount = nonDragItems.length;
      const draggedItem = dragState.draggedItem;
      if (!draggedItem) return;
      const layout = ctxRef.current.layoutOptions;
      const span = getLayoutSpan(draggedItem, layout);
      const isBlock = span.col > 1 || span.row > 1;
      const hoverPlacement = !isBlock || draggedItem.type === "app"
        ? getHoverPlacement(e.clientX, e.clientY, activeId, nonDragItems)
        : null;

      if (hoverPlacement?.type === "merge") {
        if (hoverItemIdRef.current !== hoverPlacement.id) {
          clearMergeTimer();
          clearGapTimer();
          hoverItemIdRef.current = hoverPlacement.id;
          setMergeTarget(null);

          const dwellTime = ctxRef.current.mergeDwellTime;
          mergeTimerRef.current = setTimeout(() => {
            if (
              hoverItemIdRef.current === hoverPlacement.id &&
              dragActiveRef.current
            ) {
              setMergeTarget(hoverPlacement.id);
            }
          }, dwellTime);
        }
        return;
      }

      if (hoverItemIdRef.current !== null) {
        hoverItemIdRef.current = null;
        clearMergeTimer();
        setMergeTarget(null);
      }

      const rawSlot = pointerToSlot(e.clientX, e.clientY);

      if (rawSlot < 0) {
        clearGapTimer();
        lastPointerSlotRef.current = -1;
        return;
      }

      const position = { col: rawSlot % colsRef.current, row: Math.floor(rawSlot / colsRef.current) };
      if (isBlock) {
        // 大图标按整块的目标坐标预览，经过单个图标的边缘时保持同一个落点。
        clearGapTimer();
        if (dragState.previewPosition?.row === position.row && dragState.previewPosition.col === position.col) return;
        if (ctxRef.current.previewItemMove(activeId, pi, position, dragState.previewPageId)) {
          ctxRef.current.setDragState(prev => ({ ...prev, previewPosition: position, previewOrder: undefined, gapIndex: -1 }));
        }
        return;
      }
      if (hoverPlacement?.type === "gap") {
        const nextGap = Math.min(Math.max(0, hoverPlacement.index), itemCount);
        scheduleGapCommit(
          nextGap,
          hoverPlacement.slot,
          { previewPosition: position, previewOrder: {
            targetId: nonDragItems[hoverPlacement.slot].id, after: hoverPlacement.index > hoverPlacement.slot,
          } },
          EDGE_GAP_COMMIT_DELAY,
        );
        return;
      }

      const { previewOrder, previewPosition } = dragState;
      if (previewOrder && previewPosition?.row === position.row && previewPosition.col === position.col) {
        clearGapTimer();
        return;
      }
      // 真正的空格可直接指定坐标，已占用格子的间隙继续按原来的方向和延时排序。
      if (canPlaceItem(pageChildren, draggedItem, position, { ...layout, autoPaginate: false })) {
        clearGapTimer();
        lastPointerSlotRef.current = -1;
        if (previewOrder || previewPosition?.row !== position.row || previewPosition.col !== position.col) {
          ctxRef.current.setDragState(prev => ({ ...prev, previewPosition: position, previewOrder: undefined, gapIndex: -1 }));
        }
        return;
      }
      const rank = pageChildren.filter(item => item.position.row * colsRef.current + item.position.col < rawSlot).length;
      const nextGap = Math.min(rank, itemCount);
      const neighbor = nonDragItems[Math.min(nextGap, itemCount - 1)];
      if (!neighbor) return;
      const isFullDestination = layout.autoPaginate && ctxRef.current.findItemById(activeId)?.pageIndex !== pi &&
        !findFreePosition(pageChildren, draggedItem, layout);
      scheduleGapCommit(nextGap, rank, {
        previewPosition: position,
        previewOrder: isFullDestination ? undefined : { targetId: neighbor.id, after: nextGap === itemCount },
      });
    },
    [
      getHoverPlacement,
      clearMergeTimer,
      clearGapTimer,
      pointerToSlot,
      checkPageSwitchZone,
      scheduleGapCommit,
      setMergeTarget,
    ],
  );

  const handleWindowPointerUp = useCallback(
    (e?: PointerEvent) => {
      if (!dragActiveRef.current) return;
      if (e && pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current)
        return;

      dragActiveRef.current = false;
      pointerIdRef.current = null;
      clearMergeTimer();
      clearGapTimer();
      clearPageSwitchTimer();
      hoverItemIdRef.current = null;
      lastPointerSlotRef.current = -1;

      const { dragState } = ctxRef.current;
      const draggedItem = dragState.draggedItem;
      const pi = pageIndexRef.current;
      if (e?.type === "pointerup" && draggedItem && ctxRef.current.findItemById(draggedItem.id)) {
        const { previewPosition, previewPageId, previewOrder } = dragState;
        if (dragState.mergeTargetId != null) {
          const preview = previewPosition && ctxRef.current.previewItemMove(
            draggedItem.id, pi, previewPosition, previewPageId, previewOrder,
          );
          ctxRef.current.mergeItems(dragState.mergeTargetId, draggedItem, preview ?? undefined);
        } else if (previewPosition) {
          finishPlacement(draggedItem.id);
          ctxRef.current.moveItemToCell(draggedItem.id, pi, previewPosition, previewPageId, previewOrder);
        }
      }

      ctxRef.current.pointerPositionRef.current = null;
      ctxRef.current.setDragState({
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
      });

      document.body.style.cursor = "";

      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    },
    [
      clearMergeTimer,
      clearGapTimer,
      clearPageSwitchTimer,
      handleWindowPointerMove,
      finishPlacement,
    ],
  );

  const handleDragStart = useCallback(
    (
      item: DndSortItem,
      clientX: number,
      clientY: number,
      pointerId: number,
      el: HTMLElement,
    ) => {
      if (dragActiveRef.current) return;
      const pi = pageIndexRef.current;
      const page = ctxRef.current.pages[pi];
      const pageChildren = readingOrder(page?.children ?? []);
      const itemIndex = pageChildren.findIndex((child) => child.id === item.id);
      if (itemIndex < 0) return;
      dragActiveRef.current = true;
      pointerIdRef.current = pointerId;
      hoverItemIdRef.current = null;
      lastPointerSlotRef.current = -1;

      const rect = el.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;
      const span = getLayoutSpan(item, ctxRef.current.layoutOptions);
      const bounds = el.closest("[data-desktop-item]")?.getBoundingClientRect();
      const grabOffsetInCells = (span.col > 1 || span.row > 1) && bounds?.width && bounds.height
        ? { x: (clientX - bounds.left) * span.col / bounds.width, y: (clientY - bounds.top) * span.row / bounds.height }
        : undefined;

      document.body.style.cursor = "grabbing";

      ctxRef.current.pointerPositionRef.current = { x: clientX, y: clientY };
      ctxRef.current.setDragState({
        activeId: item.id,
        isDragging: true,
        pointerPosition: { x: clientX, y: clientY },
        pointerOffset: { x: offsetX, y: offsetY },
        mergeTargetId: null,
        pageSwitchZone: null,
        dragSource: "main",
        draggedItem: item,
        pointerId, grabOffsetInCells, previewPosition: pageChildren[itemIndex].position,
        targetPageId: page.id, gapIndex: itemIndex,
        sourcePageIndex: pi,
      });

      window.addEventListener("pointermove", handleWindowPointerMove);
      window.addEventListener("pointerup", handleWindowPointerUp);
      window.addEventListener("pointercancel", handleWindowPointerUp);
    },
    [handleWindowPointerMove, handleWindowPointerUp],
  );

  const active = ctx.dragState.isDragging && ctx.dragState.sourcePageIndex === pageIndex;
  useLayoutEffect(() => {
    if (!active) return;
    if (!dragActiveRef.current) {
      // 从相邻页或文件夹接手同一次拖动。
      dragActiveRef.current = true;
      pointerIdRef.current = ctxRef.current.dragState.pointerId ?? null;
      hoverItemIdRef.current = null;
      lastPointerSlotRef.current = -1;
      document.body.style.cursor = "grabbing";

      window.addEventListener("pointermove", handleWindowPointerMove);
      window.addEventListener("pointerup", handleWindowPointerUp);
      window.addEventListener("pointercancel", handleWindowPointerUp);
    }
    const cancel = () => handleWindowPointerUp();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") cancel(); };
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", onKey);
      clearMergeTimer();
      clearGapTimer();
      clearPageSwitchTimer();
      if (dragActiveRef.current) {
        dragActiveRef.current = false;
        document.body.style.cursor = "";
        window.removeEventListener("pointermove", handleWindowPointerMove);
        window.removeEventListener("pointerup", handleWindowPointerUp);
        window.removeEventListener("pointercancel", handleWindowPointerUp);
      }
    };
  }, [active, clearMergeTimer, clearGapTimer, clearPageSwitchTimer, handleWindowPointerMove, handleWindowPointerUp]);

  return { handleDragStart };
};
