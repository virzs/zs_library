import { css, cx } from "@emotion/css";
import { AnimatePresence, motion, visualElementStore } from "motion/react";
import React, { useCallback, useRef } from "react";
import { useDesktopDnd } from "./context";
import { DndSortItem } from "./types";
import { useDragEngine } from "./hooks/use-drag-engine";
import GridItem from "./items/grid-item";
import FolderItem from "./items/folder-item";
import { getLayoutSpan } from "./layout";

interface PageGridProps {
  pageIndex: number;
  onItemClick?: (item: DndSortItem) => void;
  iconBuilder?: (item: DndSortItem) => React.ReactNode;
}

const PageGrid = ({ pageIndex, onItemClick, iconBuilder }: PageGridProps) => {
  const {
    pages,
    ready,
    layoutOptions,
    cellSize,
    dragState,
    previewPages,
    noLetters,
    itemBuilder,
    itemBuilderAllowNull,
    extraLayout,
  } = useDesktopDnd();
  const gridRef = useRef<HTMLDivElement>(null);
  const { columns: cols, rows } = layoutOptions;
  const containerWidth = cols * cellSize;

  const finishPlacement = useCallback((id: DndSortItem["id"]) => {
    // 快速松手时直接显示落点，其余图标继续原有的让位动画。
    const cell = gridRef.current?.querySelector<HTMLElement>(`[data-desktop-item="${CSS.escape(String(id))}"]`);
    if (!cell) return;
    const projection = visualElementStore.get(cell)?.projection;
    if (projection?.currentAnimation) {
      projection.finishAnimation();
      cell.style.transform = "none";
    }
  }, []);

  const { handleDragStart } = useDragEngine({
    finishPlacement,
    gridContainerRef: gridRef,
    cols,
    cellSize,
    pageIndex,
  });

  const pageData = pages[pageIndex];

  if (!pageData || !ready) return null;

  const children = previewPages ? previewPages.get(pageData.id)?.children ?? [] : pageData.children;
  const renderItems = [...children, ...(extraLayout.get(pageData.id) ?? [])];
  const draggedItem = dragState.sourcePageIndex === pageIndex ? dragState.draggedItem : null;
  const FloatingItem = draggedItem?.type === "group" ? FolderItem : GridItem;

  return (
    <div className="zs-w-full zs-h-full">
      <div
        ref={gridRef}
        data-desktop-grid={pageIndex}
        className={cx(
          "zs-grid zs-content-start",
          css`
            width: ${containerWidth}px;
            grid-template-columns: repeat(${cols}, ${cellSize}px);
            grid-template-rows: repeat(${rows}, ${cellSize}px);
            grid-auto-rows: ${cellSize}px;
            margin: 0 auto;
          `,
        )}
      >
        <AnimatePresence mode="popLayout">
          {renderItems.map((item, index) => {
            const { col, row } = getLayoutSpan(item, layoutOptions);
            const style = {
              gridColumn: `${item.position.col + 1} / span ${col}`,
              gridRow: `${item.position.row + 1} / span ${row}`,
            };

            const builtItem = itemBuilder?.(item, index);
            if (builtItem || (builtItem === null && itemBuilderAllowNull === false)) {
              return (
                <motion.div
                  key={item.id}
                  data-desktop-item={item.id}
                  className="zs-flex zs-justify-center zs-items-start zs-pt-2"
                  style={style}
                  layout="position"
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 380, damping: 38 }}
                >
                  {builtItem}
                </motion.div>
              );
            }

            if (item.type === "group" && (item.children?.length ?? 0) > 0) {
              return (
                <motion.div
                  key={item.id}
                  data-desktop-item={item.id}
                  className="zs-flex zs-justify-center zs-items-start zs-pt-2"
                  style={style}
                  layout="position"
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 380, damping: 38 }}
                >
                  <FolderItem
                    item={item}
                    floating={false}
                    onDragStart={handleDragStart}
                    onItemClick={onItemClick}
                    iconBuilder={iconBuilder}
                    size={{ col, row }}
                    noLabel={noLetters}
                  />
                </motion.div>
              );
            }

            return (
              <motion.div
                key={item.id}
                data-desktop-item={item.id}
                className="zs-flex zs-justify-center zs-items-start zs-pt-2"
                style={style}
                layout="position"
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 380, damping: 38 }}
              >
                <GridItem
                  item={item}
                  floating={false}
                  onDragStart={handleDragStart}
                  onItemClick={onItemClick}
                  iconBuilder={iconBuilder}
                  size={{ col, row }}
                  noLabel={noLetters}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {draggedItem && (
        <div style={{ display: "none" }}>
          <FloatingItem
            item={draggedItem}
            onDragStart={handleDragStart}
            iconBuilder={iconBuilder}
            size={getLayoutSpan(draggedItem, layoutOptions)}
            noLabel={noLetters}
          />
        </div>
      )}
    </div>
  );
};

export default PageGrid;
