import { useCallback, useEffect, useRef } from "react";
import { useDesktopDnd } from "../context";
import { DndSortItem } from "../types";

interface FolderSortEngineOptions {
  gridRef: React.RefObject<HTMLDivElement | null>;
  dialogRef: React.RefObject<HTMLDivElement | null>;
  folderId: string | number | null;
  cols: number;
  cellSize: number;
  onDragOut: (item: DndSortItem, clientX: number, clientY: number) => void;
}

const GAP_COMMIT_DELAY = 120;

export const useFolderSortEngine = ({
  gridRef,
  dialogRef,
  folderId,
  cols,
  cellSize,
  onDragOut,
}: FolderSortEngineOptions) => {
  const ctx = useDesktopDnd();

  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const colsRef = useRef(cols);
  colsRef.current = cols;
  const cellSizeRef = useRef(cellSize);
  cellSizeRef.current = cellSize;
  const folderIdRef = useRef(folderId);
  folderIdRef.current = folderId;
  const onDragOutRef = useRef(onDragOut);
  onDragOutRef.current = onDragOut;

  const dragActiveRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointerSlotRef = useRef(-1);

  const clearGapTimer = useCallback(() => {
    if (gapTimerRef.current) {
      clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
  }, []);

  const pointerToSlot = useCallback(
    (clientX: number, clientY: number): number => {
      const container = gridRef.current;
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
    [gridRef],
  );

  const isOutsideDialog = useCallback(
    (clientX: number, clientY: number) => {
      const el = dialogRef.current?.closest(".rc-dialog-section");
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      );
    },
    [dialogRef],
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

      if (isOutsideDialog(e.clientX, e.clientY)) {
        dragActiveRef.current = false;
        pointerIdRef.current = null;
        clearGapTimer();
        lastPointerSlotRef.current = -1;

        window.removeEventListener("pointermove", handleWindowPointerMove);
        window.removeEventListener("pointerup", handleWindowPointerUp);
        window.removeEventListener("pointercancel", handleWindowPointerUp);

        const item = dragState.draggedItem;
        if (item) {
          onDragOutRef.current(item, e.clientX, e.clientY);
        }
        return;
      }

      const fId = folderIdRef.current;
      if (!fId) return;
      const folder = ctxRef.current.pages
        .flatMap((p) => p.children)
        .find((c) => c.id === fId);
      const folderChildren = folder?.children ?? [];
      const nonDragCount = folderChildren.filter(
        (c) => c.id !== activeId,
      ).length;
      const rawSlot = pointerToSlot(e.clientX, e.clientY);

      if (rawSlot < 0) {
        clearGapTimer();
        lastPointerSlotRef.current = -1;
        return;
      }

      const nextGap = Math.min(rawSlot, nonDragCount);
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
    [isOutsideDialog, clearGapTimer, pointerToSlot],
  );

  const handleWindowPointerUp = useCallback(
    (e: PointerEvent) => {
      if (!dragActiveRef.current) return;
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current)
        return;

      dragActiveRef.current = false;
      pointerIdRef.current = null;
      clearGapTimer();
      lastPointerSlotRef.current = -1;

      const { dragState } = ctxRef.current;
      const draggedItem = dragState.draggedItem;
      const fId = folderIdRef.current;

      if (draggedItem && fId) {
        const folder = ctxRef.current.pages
          .flatMap((p) => p.children)
          .find((c) => c.id === fId);
        const folderChildren = folder?.children ?? [];
        const fromIndex = folderChildren.findIndex(
          (c) => c.id === draggedItem.id,
        );
        if (fromIndex >= 0 && fromIndex !== dragState.gapIndex) {
          ctxRef.current.reorderFolderChildren(
            fId,
            fromIndex,
            dragState.gapIndex,
          );
        }
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

      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    },
    [clearGapTimer, handleWindowPointerMove],
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
      lastPointerSlotRef.current = -1;

      const rect = el.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;

      document.body.style.cursor = "grabbing";

      const fId = folderIdRef.current;
      if (!fId) return;
      const folder = ctxRef.current.pages
        .flatMap((p) => p.children)
        .find((c) => c.id === fId);
      const folderChildren = folder?.children ?? [];
      const fromIndex = folderChildren.findIndex((c) => c.id === item.id);

      ctxRef.current.pointerPositionRef.current = { x: clientX, y: clientY };
      ctxRef.current.setDragState({
        activeId: item.id,
        isDragging: true,
        pointerPosition: { x: clientX, y: clientY },
        pointerOffset: { x: offsetX, y: offsetY },
        mergeTargetId: null,
        dragSource: "folder",
        draggedItem: item,
        gapIndex: Math.max(0, fromIndex),
        sourcePageIndex: -1,
      });

      window.addEventListener("pointermove", handleWindowPointerMove);
      window.addEventListener("pointerup", handleWindowPointerUp);
      window.addEventListener("pointercancel", handleWindowPointerUp);
    },
    [handleWindowPointerMove, handleWindowPointerUp],
  );

  useEffect(() => {
    return () => {
      clearGapTimer();
      if (dragActiveRef.current) {
        window.removeEventListener("pointermove", handleWindowPointerMove);
        window.removeEventListener("pointerup", handleWindowPointerUp);
        window.removeEventListener("pointercancel", handleWindowPointerUp);
      }
    };
  }, [clearGapTimer, handleWindowPointerMove, handleWindowPointerUp]);

  return { handleDragStart };
};
