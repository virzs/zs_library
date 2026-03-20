import { useCallback, useEffect, useRef } from "react";
import { useDesktopDnd } from "../context";
import { DndSortItem } from "../types";
import { v4 as uuidv4 } from "uuid";

interface DragEngineOptions {
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
  cols: number;
  cellSize: number;
  pageIndex: number;
}

const GAP_COMMIT_DELAY = 180;
const MERGE_HITBOX_RATIO = 0.7;
const PAGE_SWITCH_TRIGGER_ZONE = 60;
const PAGE_SWITCH_DELAY = 800;
const PAGE_SWITCH_COOLDOWN = 500;

export const useDragEngine = ({
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
  const justLeftMergeRef = useRef(false);
  const leftMergeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageSwitchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageSwitchCooldownRef = useRef(false);
  const pageSwitchZoneRef = useRef<"left" | "right" | null>(null);

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
  }, []);

  const pointerToSlot = useCallback(
    (clientX: number, clientY: number): number => {
      const container = gridContainerRef.current;
      if (!container) return -1;
      const rect = container.getBoundingClientRect();
      const relX = Math.max(0, Math.min(clientX - rect.left, rect.width - 1));
      const relY = Math.max(0, clientY - rect.top);
      const c = colsRef.current;
      const cs = cellSizeRef.current;
      const col = Math.min(Math.floor(relX / cs), c - 1);
      const row = Math.max(0, Math.floor(relY / cs));
      return row * c + col;
    },
    [gridContainerRef],
  );

  const getMergeTarget = useCallback(
    (
      clientX: number,
      clientY: number,
      activeId: string | number,
    ): string | number | null => {
      // 文件夹不能与任何元素合并
      const draggedItem = ctxRef.current.dragState.draggedItem;
      if (draggedItem?.type === "group") return null;

      const el = document
        .elementFromPoint(clientX, clientY)
        ?.closest?.("[data-grid-item-id]") as HTMLElement | null;
      if (!el) return null;

      const id = el.dataset.gridItemId;
      if (!id || id === String(activeId)) return null;

      const elRect = el.getBoundingClientRect();
      const insetX = (elRect.width * (1 - MERGE_HITBOX_RATIO)) / 2;
      const insetY = (elRect.height * (1 - MERGE_HITBOX_RATIO)) / 2;

      if (
        clientX < elRect.left + insetX ||
        clientX > elRect.right - insetX ||
        clientY < elRect.top + insetY ||
        clientY > elRect.bottom - insetY
      ) {
        return null;
      }

      return id;
    },
    [],
  );

  const handlePageSwitch = useCallback(
    (zone: "left" | "right") => {
      const { pages, currentPage, maxPages, dragState } = ctxRef.current;
      const draggedItem = dragState.draggedItem;
      if (!draggedItem) return;

      const totalPages = pages.length;
      let targetPage: number;

      if (zone === "left") {
        if (currentPage <= 0) return;
        targetPage = currentPage - 1;
      } else {
        if (currentPage >= totalPages - 1) {
          if (maxPages > 0 && totalPages >= maxPages) return;
          const newPage = { id: uuidv4(), children: [] as DndSortItem[] };
          const newPages = [...pages, newPage];
          ctxRef.current.setPages(newPages);
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

      ctxRef.current.removeItem(draggedItem.id);
      ctxRef.current.insertItemAt(
        targetPage,
        ctxRef.current.pages[targetPage]?.children?.length ?? 0,
        draggedItem,
      );
      ctxRef.current.setCurrentPage(targetPage);
      ctxRef.current.setDragState((prev) => ({
        ...prev,
        sourcePageIndex: targetPage,
        gapIndex: (ctxRef.current.pages[targetPage]?.children?.length ?? 1) - 1,
        mergeTargetId: null,
      }));

      pageSwitchCooldownRef.current = true;
      setTimeout(() => {
        pageSwitchCooldownRef.current = false;
      }, PAGE_SWITCH_COOLDOWN);
    },
    [clearMergeTimer, clearGapTimer, clearPageSwitchTimer],
  );

  const checkPageSwitchZone = useCallback(
    (clientX: number) => {
      if (pageSwitchCooldownRef.current) {
        clearPageSwitchTimer();
        return;
      }

      const container = ctxRef.current.containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const relX = clientX - rect.left;

      let zone: "left" | "right" | null = null;
      if (relX < PAGE_SWITCH_TRIGGER_ZONE && ctxRef.current.currentPage > 0) {
        zone = "left";
      } else if (relX > rect.width - PAGE_SWITCH_TRIGGER_ZONE) {
        zone = "right";
      }

      if (zone !== pageSwitchZoneRef.current) {
        clearPageSwitchTimer();
        pageSwitchZoneRef.current = zone;

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

      const mergeHoverId = getMergeTarget(e.clientX, e.clientY, activeId);

      if (mergeHoverId != null) {
        if (hoverItemIdRef.current !== mergeHoverId) {
          clearMergeTimer();
          clearGapTimer();
          hoverItemIdRef.current = mergeHoverId;

          const dwellTime = ctxRef.current.mergeDwellTime;
          mergeTimerRef.current = setTimeout(() => {
            if (
              hoverItemIdRef.current === mergeHoverId &&
              dragActiveRef.current
            ) {
              ctxRef.current.setDragState((prev) => ({
                ...prev,
                mergeTargetId: mergeHoverId,
              }));
            }
          }, dwellTime);
        }
        return;
      }

      if (hoverItemIdRef.current !== null) {
        hoverItemIdRef.current = null;
        clearMergeTimer();
        ctxRef.current.setDragState((prev) => ({
          ...prev,
          mergeTargetId: null,
        }));

        justLeftMergeRef.current = true;
        if (leftMergeTimerRef.current) clearTimeout(leftMergeTimerRef.current);
        leftMergeTimerRef.current = setTimeout(() => {
          justLeftMergeRef.current = false;
        }, 250);
        return;
      }

      if (justLeftMergeRef.current) return;

      const pi = pageIndexRef.current;
      const pageChildren = ctxRef.current.pages[pi]?.children ?? [];
      const nonDragItems = pageChildren.filter((c) => c.id !== activeId);
      const itemCount = nonDragItems.length;
      const rawSlot = pointerToSlot(e.clientX, e.clientY);

      if (rawSlot < 0) {
        clearGapTimer();
        lastPointerSlotRef.current = -1;
        return;
      }

      const nextGap = Math.min(rawSlot, itemCount);

      const currentGap = ctxRef.current.dragState.gapIndex;
      if (nextGap !== currentGap) {
        const prevSlot = lastPointerSlotRef.current;
        const pointerDirection = rawSlot - prevSlot;
        const gapDirection = nextGap - currentGap;

        if (
          prevSlot < 0 ||
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
              }));
            }
          }, GAP_COMMIT_DELAY);
        }
      }

      lastPointerSlotRef.current = rawSlot;
    },
    [
      getMergeTarget,
      clearMergeTimer,
      clearGapTimer,
      pointerToSlot,
      checkPageSwitchZone,
    ],
  );

  const handleWindowPointerUp = useCallback(
    (e: PointerEvent) => {
      if (!dragActiveRef.current) return;
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current)
        return;

      dragActiveRef.current = false;
      pointerIdRef.current = null;
      clearMergeTimer();
      clearGapTimer();
      clearPageSwitchTimer();
      hoverItemIdRef.current = null;
      lastPointerSlotRef.current = -1;
      justLeftMergeRef.current = false;
      pageSwitchCooldownRef.current = false;
      if (leftMergeTimerRef.current) {
        clearTimeout(leftMergeTimerRef.current);
        leftMergeTimerRef.current = null;
      }

      const { dragState } = ctxRef.current;
      const draggedItem = dragState.draggedItem;
      if (!draggedItem) {
        ctxRef.current.pointerPositionRef.current = null;
        ctxRef.current.setDragState({
          activeId: null,
          isDragging: false,
          pointerPosition: null,
          pointerOffset: null,
          mergeTargetId: null,
          dragSource: null,
          draggedItem: null,
          gapIndex: -1,
          sourcePageIndex: -1,
        });
        document.body.style.cursor = "";
        return;
      }

      const pi = pageIndexRef.current;

      if (dragState.mergeTargetId != null) {
        ctxRef.current.removeItem(draggedItem.id);
        ctxRef.current.mergeItems(dragState.mergeTargetId, draggedItem);
      } else {
        ctxRef.current.removeItem(draggedItem.id);
        ctxRef.current.insertItemAt(pi, dragState.gapIndex, draggedItem);
      }

      ctxRef.current.pointerPositionRef.current = null;
      ctxRef.current.setDragState({
        activeId: null,
        isDragging: false,
        pointerPosition: null,
        pointerOffset: null,
        mergeTargetId: null,
        dragSource: null,
        draggedItem: null,
        gapIndex: -1,
        sourcePageIndex: -1,
      });

      document.body.style.cursor = "";

      setTimeout(() => {
        const currentPages = ctxRef.current.pages;
        if (currentPages.length > 1) {
          const filtered = currentPages.filter(
            (page) => page.children.length > 0,
          );
          if (filtered.length > 0 && filtered.length < currentPages.length) {
            ctxRef.current.setPages(filtered);
          }
        }
      }, 0);

      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    },
    [
      clearMergeTimer,
      clearGapTimer,
      clearPageSwitchTimer,
      handleWindowPointerMove,
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
      dragActiveRef.current = true;
      pointerIdRef.current = pointerId;
      hoverItemIdRef.current = null;
      lastPointerSlotRef.current = -1;
      justLeftMergeRef.current = false;
      pageSwitchCooldownRef.current = false;
      if (leftMergeTimerRef.current) {
        clearTimeout(leftMergeTimerRef.current);
        leftMergeTimerRef.current = null;
      }

      const rect = el.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;

      document.body.style.cursor = "grabbing";

      const pi = pageIndexRef.current;
      const pageChildren = ctxRef.current.pages[pi]?.children ?? [];
      const nonDragItems = pageChildren.filter((c) => c.id !== item.id);
      const sourceIndex = nonDragItems.length;

      ctxRef.current.pointerPositionRef.current = { x: clientX, y: clientY };
      ctxRef.current.setDragState({
        activeId: item.id,
        isDragging: true,
        pointerPosition: { x: clientX, y: clientY },
        pointerOffset: { x: offsetX, y: offsetY },
        mergeTargetId: null,
        dragSource: "main",
        draggedItem: item,
        gapIndex: Math.min(
          sourceIndex,
          pageChildren.findIndex((c) => c.id === item.id),
        ),
        sourcePageIndex: pi,
      });

      window.addEventListener("pointermove", handleWindowPointerMove);
      window.addEventListener("pointerup", handleWindowPointerUp);
      window.addEventListener("pointercancel", handleWindowPointerUp);
    },
    [handleWindowPointerMove, handleWindowPointerUp],
  );

  useEffect(() => {
    const { dragState } = ctxRef.current;
    if (
      dragState.isDragging &&
      dragState.sourcePageIndex === pageIndexRef.current &&
      !dragActiveRef.current
    ) {
      dragActiveRef.current = true;
      pointerIdRef.current = null;
      hoverItemIdRef.current = null;
      lastPointerSlotRef.current = -1;
      justLeftMergeRef.current = false;
      document.body.style.cursor = "grabbing";

      window.addEventListener("pointermove", handleWindowPointerMove);
      window.addEventListener("pointerup", handleWindowPointerUp);
      window.addEventListener("pointercancel", handleWindowPointerUp);
    }
  }, [
    ctx.dragState.dragSource,
    ctx.dragState.isDragging,
    ctx.dragState.sourcePageIndex,
    handleWindowPointerMove,
    handleWindowPointerUp,
  ]);

  useEffect(() => {
    return () => {
      clearMergeTimer();
      clearGapTimer();
      clearPageSwitchTimer();
      if (leftMergeTimerRef.current) clearTimeout(leftMergeTimerRef.current);
      if (dragActiveRef.current) {
        window.removeEventListener("pointermove", handleWindowPointerMove);
        window.removeEventListener("pointerup", handleWindowPointerUp);
        window.removeEventListener("pointercancel", handleWindowPointerUp);
      }
    };
  }, [
    clearMergeTimer,
    clearGapTimer,
    clearPageSwitchTimer,
    handleWindowPointerMove,
    handleWindowPointerUp,
  ]);

  return { handleDragStart };
};
