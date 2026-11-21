import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { DesktopGridConfig } from "../types";

const mobileQuery = "(pointer: coarse) and (hover: none)";

function subscribeMobile(callback: () => void) {
  const media = window.matchMedia?.(mobileQuery);
  media?.addEventListener("change", callback);
  return () => media?.removeEventListener("change", callback);
}

function matchesMobile() {
  return window.matchMedia?.(mobileQuery).matches ?? false;
}

function fixedCount(value: number | "auto" | undefined) {
  if (value === undefined || value === "auto") return undefined;
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError("DesktopNext grid dimensions must be positive integers or 'auto'.");
  }
  return value;
}

export function useGridLayout(
  iconSize: number,
  grid: DesktopGridConfig | undefined,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0, dotsHeight: 0 });

  useLayoutEffect(() => {
    const element = measureRef.current ?? containerRef.current;
    if (!element) return;
    const measure = () => {
      const { clientWidth: width, clientHeight: height } = element;
      if (width <= 0 || height <= 0) return;
      const dots = containerRef.current?.querySelector<HTMLElement>("[data-desktop-dots]");
      const footer = dots?.parentElement;
      const dotsHeight = footer?.hasAttribute("data-desktop-has-dock") ? dots!.offsetHeight : footer?.offsetHeight ?? 0;
      setSize(last => last.width === width && last.height === height && last.dotsHeight === dotsHeight
        ? last : { width, height, dotsHeight });
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef]);

  const mobile = useSyncExternalStore(subscribeMobile, matchesMobile, () => false);
  const fixedColumns = mobile ? fixedCount(grid?.mobile?.columns ?? grid?.columns) ?? 4 : fixedCount(grid?.columns);
  const fixedRows = mobile ? fixedCount(grid?.mobile?.rows ?? grid?.rows) ?? 5 : fixedCount(grid?.rows);
  const preferredIcon = Number.isFinite(iconSize) && iconSize > 0 ? iconSize : 64;
  const preferredCell = preferredIcon + Math.round(preferredIcon * 0.75);
  const ready = size.width > 0 && size.height > 0;
  // 列数只随宽度变化，分页指示器出现时只重新计算可用高度。
  const columns = fixedColumns ?? Math.max(1, Math.floor(size.width / preferredCell));
  function metrics(height: number) {
    const cellSize = ready ? Math.min(preferredCell, size.width / (fixedColumns ?? 1), height / (fixedRows ?? 1)) : preferredCell;
    const rows = fixedRows ?? Math.max(1, Math.floor(height / cellSize));
    return { columns, rows, cellSize, iconSize: preferredIcon * cellSize / preferredCell };
  }
  const current = metrics(size.height);
  const singlePage = size.dotsHeight ? metrics(size.height + size.dotsHeight) : current;
  return { ready, measureRef, current, singlePage };
}
