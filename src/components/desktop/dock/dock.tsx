import React, { useState } from "react";
import { css, cx } from "@emotion/css";
import { ReactSortable } from "react-sortablejs";
import { mainDragConfig } from "../drag-styles";
import SortableItem from "../items/sortable-item";
import { SortItem } from "../types";
import { useSortableState } from "../context/state/hooks";
import { useSortableConfig } from "../context/config/hooks";
import LaunchpadButton from "./launchpad-button";
import { RiApps2AddLine } from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import { useIsMobile } from "../../../hooks/useIsMobile";

export interface DockProps<D, C> {
  /**
   * dock 项目列表
   */
  items?: SortItem<D, C>[];
  /**
   * 固定项目列表（在sortable之前显示，不可拖拽排序）
   */
  fixedItems?: SortItem<D, C>[];
  /**
   * dock 位置
   */
  position?: "top" | "bottom" | "left" | "right";
  /**
   * dock 样式类名
   */
  className?: string;
  /**
   * dock 项目点击事件
   */
  onItemClick?: (item: SortItem<D, C>) => void;
  /**
   * 自定义项目渲染
   */
  itemBuilder?: (item: SortItem<D, C>, index: number) => React.ReactNode;
  /**
   * 自定义固定项目渲染
   */
  fixedItemBuilder?: (item: SortItem<D, C>, index: number) => React.ReactNode;
  /**
   * 是否显示启动台按钮
   */
  showLaunchpad?: boolean;
  /**
   * 启动台按钮点击事件
   */
  onLaunchpadClick?: () => void;
  /**
   * 拖放事件
   */
  onDrop?: () => void;
  /**
   * dock 项目列表变更事件
   */
  onDockItemsChange?: (items: SortItem<D, C>[]) => void;
  /**
   * 图标尺寸
   */
  itemSize?: number;
}

const Dock = <D, C>({
  items = [],
  fixedItems = [],
  position = "bottom",
  className,
  itemBuilder,
  fixedItemBuilder,
  showLaunchpad = true,
  onLaunchpadClick,
  onDrop,
  onDockItemsChange,
  itemSize = 56,
}: DockProps<D, C>) => {
  const { setListStatus } = useSortableState();
  const { theme } = useSortableConfig();
  const dockTheme = theme.token.dock;
  const baseTheme = theme.token.base;
  const isMobile = useIsMobile();

  // 移动端小白条上滑手势状态
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaY, setTouchDeltaY] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const swipeThreshold = 60; // 触发阈值（向上滑动距离，单位：px）

  const renderDockItem = (item: SortItem, index: number) => {
    if (itemBuilder) {
      return itemBuilder(item, index);
    }

    return <SortableItem key={item.id} data={item} itemIndex={index} noLetters from="dock" iconSize={itemSize} />;
  };

  const renderFixedItem = (item: SortItem, index: number) => {
    if (fixedItemBuilder) {
      return fixedItemBuilder(item, index);
    }

    return (
      <SortableItem
        key={item.id}
        data={item}
        itemIndex={index}
        noLetters
        from="dock"
        disabledDrag
        iconSize={itemSize}
      />
    );
  };

  if (!items.length && !fixedItems.length && !showLaunchpad) {
    return null;
  }

  const divider = (
    <div
      className={cx(
        "zs-flex zs-transition-colors",
        position === "top" || position === "bottom" ? "zs-w-[1px] zs-h-8 zs-mx-1" : "zs-w-8 zs-h-[1px] zs-my-1",
        css`
          background-color: ${dockTheme?.divider?.color || "rgba(255, 255, 255, 0.3)"};
        `
      )}
    />
  );

  return (
    <>
      <div
        className={cx(
          "zs-flex zs-justify-between zs-items-center zs-rounded-2xl zs-py-3 zs-px-4 zs-backdrop-blur-xl zs-gap-1 zs-border zs-transition-colors zs-max-w-full",
          position === "top" || position === "bottom" ? "zs-flex-row" : "zs-flex-col",
          position === "top" && "zs-mb-4",
          position === "bottom" && "zs-mt-4",
          css`
            background-color: ${dockTheme?.backgroundColor || "rgba(255, 255, 255, 0.8)"};
            border-color: ${dockTheme?.borderColor || "rgba(255, 255, 255, 0.2)"};
            box-shadow: 0 8px 32px ${dockTheme?.boxShadowColor || "rgba(0, 0, 0, 0.1)"};
          `,
          className
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (onDrop) {
            onDrop();
          }
        }}
      >
        {/* 固定项目 */}
        {fixedItems.length > 0 && (
          <div
            className={cx(
              "zs-flex zs-gap-3",
              css`
                ${position === "top" || position === "bottom" ? `flex-direction: row;` : `flex-direction: column;`}
              `
            )}
          >
            <AnimatePresence mode="popLayout">
              {fixedItems.map((item, index) => (
                <div key={item.id}>{renderFixedItem(item, index)}</div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* 固定项目与sortable项目之间的分隔线 */}
        {fixedItems.length > 0 && items.length > 0 && divider}

        {/* Sortable项目 */}

        <ReactSortable
          list={items}
          setList={(newItems) => {
            if (onDockItemsChange) {
              onDockItemsChange(newItems);
            }
          }}
          {...mainDragConfig}
          className={cx(
            "desktop-dock-sortable zs-flex zs-gap-3 flex-1 zs-relative",
            css`
              min-height: ${itemSize}px;
              ${position === "top" || position === "bottom"
                ? `flex-direction: row; overflow-x: auto; overflow-y: hidden;`
                : `flex-direction: column; overflow-y: auto; overflow-x: hidden;`}

              /* 隐藏滚动条但保持滚动功能 */
              scrollbar-width: none; /* Firefox */
              -ms-overflow-style: none; /* IE and Edge */

              &::-webkit-scrollbar {
                display: none; /* Chrome, Safari and Opera */
              }

              /* 确保子元素不会收缩 */
              & > * {
                flex-shrink: 0;
              }

              .sortable-ghost {
                width: ${itemSize}px;
                height: ${itemSize}px;
                div,
                img {
                  width: ${itemSize}px;
                  height: ${itemSize}px;
                }
              }
            `,
            items.length === 0 && "zs-ml-2.5 zs-w-14"
          )}
          onMove={() => {
            setListStatus("onMove");
            return true;
          }}
          onEnd={() => {
            setListStatus(null);
          }}
        >
          {items.length > 0 ? (
            items.map((item, index) => renderDockItem(item, index))
          ) : (
            <motion.div
              className={cx(
                "drag-disabled dock-items-empty zs-flex zs-items-center zs-justify-center zs-gap-2 zs-rounded-xl zs-border-2 zs-border-dashed zs-absolute zs-top-0 zs-left-0",
                css`
                  min-height: ${itemSize}px;
                  ${position === "top" || position === "bottom"
                    ? `width: 100%; padding: 8px 12px;`
                    : `height: 100%; min-width: ${itemSize}px; padding: 12px 8px;`};
                  color: ${baseTheme?.textColor || "rgba(0, 0, 0, 0.6)"};
                  border-color: ${dockTheme?.borderColor || "rgba(0, 0, 0, 0.2)"};
                  background-color: ${dockTheme?.backgroundColor || "rgba(255, 255, 255, 0.25)"};
                  opacity: 0.5 !important;
                `
              )}
            >
              <RiApps2AddLine />
            </motion.div>
          )}
        </ReactSortable>

        {/* sortable项目与启动台按钮之间的分隔线 */}
        {showLaunchpad && !isMobile && (fixedItems.length > 0 || items.length > 0) && divider}

        {/* 启动台按钮（非移动端或非底部） */}
        {showLaunchpad && (!isMobile || position !== "bottom") && (
          <LaunchpadButton onClick={onLaunchpadClick} position={position} />
        )}
      </div>

      {/* 移动端底部小白条 */}
      {showLaunchpad && isMobile && (
        <motion.div
          className={cx(
            "zs-absolute zs-left-1/2 -zs-bottom-3 zs--translate-x-1/2 zs-rounded-full zs-cursor-pointer",
            css`
              width: 50vw;
              height: 8px;
              background-color: ${baseTheme?.backgroundColor || "#ffffff"};
              box-shadow: 0 6px 18px ${baseTheme?.shadowColor || "rgba(0, 0, 0, 0.18)"};
              z-index: 50;
              touch-action: none;
              overscroll-behavior-y: contain;
            `
          )}
          style={{
            // 根据上滑距离做轻微的视觉反馈
            transform: `translateX(-50%) translateY(0) scale(${1 + Math.min(Math.max(-touchDeltaY, 0), 80) / 800})`,
          }}
          onTouchStart={(e) => {
            setTouchStartY(e.touches[0].clientY);
            setTouchStartX(e.touches[0].clientX);
            setTouchDeltaY(0);
            setIsSwiping(false);
          }}
          onTouchMove={(e) => {
            if (touchStartY === null || touchStartX === null) return;
            const dy = e.touches[0].clientY - touchStartY;
            const dx = e.touches[0].clientX - touchStartX;

            if (!isSwiping) {
              if (Math.abs(dy) > Math.abs(dx) && dy < 0) {
                setIsSwiping(true);
              } else {
                return; // 非垂直向上手势，放行默认行为
              }
            }

            e.preventDefault();
            e.stopPropagation();
            setTouchDeltaY(dy);
          }}
          onTouchEnd={() => {
            if (isSwiping && touchStartY !== null && touchDeltaY < -swipeThreshold) {
              onLaunchpadClick?.();
            }
            setTouchStartY(null);
            setTouchStartX(null);
            setTouchDeltaY(0);
            setIsSwiping(false);
          }}
          onTouchCancel={() => {
            setTouchStartY(null);
            setTouchStartX(null);
            setTouchDeltaY(0);
            setIsSwiping(false);
          }}
          title="上滑打开启动台"
        />
      )}
    </>
  );
};

export default Dock;
