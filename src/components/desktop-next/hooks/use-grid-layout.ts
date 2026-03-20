import { useCallback, useEffect, useState } from "react";

interface GridLayout {
  cols: number;
  cellSize: number;
  containerWidth: number;
  gap: number;
}

export const useGridLayout = (iconSize: number, measureRef: React.RefObject<HTMLDivElement | null>) => {
  const gap = Math.round((iconSize / 64) * 48);
  const cellSize = iconSize + gap;

  const [layout, setLayout] = useState<GridLayout>({
    cols: 4,
    cellSize,
    containerWidth: 0,
    gap,
  });

  const computeLayout = useCallback(
    (el: HTMLElement) => {
      const availableWidth = el.clientWidth;
      if (availableWidth <= 0) return;
      const cols = Math.max(1, Math.floor(availableWidth / cellSize));

      setLayout({
        cols,
        cellSize,
        containerWidth: cols * cellSize,
        gap,
      });
    },
    [cellSize, gap],
  );

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    computeLayout(el);

    if ("ResizeObserver" in globalThis) {
      const ro = new ResizeObserver(() => computeLayout(el));
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      const handler = () => computeLayout(el);
      globalThis.addEventListener("resize", handler);
      return () => globalThis.removeEventListener("resize", handler);
    }
  }, [measureRef, computeLayout]);

  const getGridPosition = useCallback(
    (index: number) => ({
      col: index % layout.cols,
      row: Math.floor(index / layout.cols),
    }),
    [layout.cols],
  );

  const getIndexFromPosition = useCallback(
    (x: number, y: number, containerRect: DOMRect) => {
      const relX = x - containerRect.left;
      const relY = y - containerRect.top;
      const col = Math.floor(relX / cellSize);
      const row = Math.floor(relY / cellSize);
      if (col < 0 || col >= layout.cols || row < 0) return -1;
      return row * layout.cols + col;
    },
    [cellSize, layout.cols],
  );

  return { ...layout, getGridPosition, getIndexFromPosition };
};
