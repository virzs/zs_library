import { css, cx } from "@emotion/css";
import { AnimatePresence, motion } from "motion/react";
import React, { useMemo, useRef } from "react";
import { useDesktopDnd } from "./context";
import { DndSortItem } from "./types";
import { useGridLayout } from "./hooks/use-grid-layout";
import { useDragEngine } from "./hooks/use-drag-engine";
import GridItem from "./items/grid-item";
import FolderItem from "./items/folder-item";
import { getItemSize } from "./config";

interface PageGridProps {
  pageIndex: number;
  onItemClick?: (item: DndSortItem) => void;
  iconBuilder?: (item: DndSortItem) => React.ReactNode;
}

const PageGrid = ({ pageIndex, onItemClick, iconBuilder }: PageGridProps) => {
  const { pages, iconSize, dragState, typeConfigMap } = useDesktopDnd();
  const measureRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { cols, cellSize, containerWidth } = useGridLayout(
    iconSize,
    measureRef,
  );

  const { handleDragStart } = useDragEngine({
    gridContainerRef: gridRef,
    cols,
    cellSize,
    pageIndex,
  });

  const pageData = pages[pageIndex];

  const renderItems = useMemo(() => {
    if (!pageData) return [];

    const items = pageData.children;
    const isDraggingOnThisPage =
      dragState.isDragging && dragState.sourcePageIndex === pageIndex;

    if (!isDraggingOnThisPage) {
      return items;
    }

    const activeId = dragState.activeId;
    const draggedItem = items.find((item) => item.id === activeId);
    const others = items.filter((item) => item.id !== activeId);
    const gapIndex = Math.min(Math.max(0, dragState.gapIndex), others.length);

    const result = [...others];
    if (draggedItem) {
      result.splice(gapIndex, 0, draggedItem);
    }

    return result;
  }, [
    pageData,
    dragState.isDragging,
    dragState.sourcePageIndex,
    dragState.gapIndex,
    dragState.activeId,
    pageIndex,
  ]);

  if (!pageData) return null;

  return (
    <div ref={measureRef} className="zs-w-full zs-h-full">
      <div
        ref={gridRef}
        className={cx(
          "zs-grid zs-content-start",
          css`
            width: ${containerWidth}px;
            grid-template-columns: repeat(${cols}, ${cellSize}px);
            grid-auto-rows: ${cellSize}px;
            margin: 0 auto;
          `,
        )}
      >
        <AnimatePresence mode="popLayout">
          {renderItems.map((item) => {
            const { col, row } = getItemSize(
              item.type,
              item.config?.sizeId,
              typeConfigMap,
            );

            if (item.type === "group" && (item.children?.length ?? 0) > 0) {
              return (
                <motion.div
                  key={item.id}
                  className="zs-flex zs-justify-center zs-items-start zs-pt-2"
                  style={{
                    gridColumn: `span ${col}`,
                    gridRow: `span ${row}`,
                  }}
                  layout="position"
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 380, damping: 38 }}
                >
                  <FolderItem
                    item={item}
                    onDragStart={handleDragStart}
                    onItemClick={onItemClick}
                    iconBuilder={iconBuilder}
                    size={{ col, row }}
                  />
                </motion.div>
              );
            }

            return (
              <motion.div
                key={item.id}
                className="zs-flex zs-justify-center zs-items-start zs-pt-2"
                style={{
                  gridColumn: `span ${col}`,
                  gridRow: `span ${row}`,
                }}
                layout="position"
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 380, damping: 38 }}
              >
                <GridItem
                  item={item}
                  onDragStart={handleDragStart}
                  onItemClick={onItemClick}
                  iconBuilder={iconBuilder}
                  size={{ col, row }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PageGrid;
