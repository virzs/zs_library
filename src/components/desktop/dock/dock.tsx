import React from "react";
import { css, cx } from "@emotion/css";
import { ReactSortable } from "react-sortablejs";
import { mainDragConfig } from "../drag-styles";
import SortableItem from "../items/sortable-item";
import { SortItem } from "../types";
import { useSortableState } from "../context/state/hooks";
import { useSortableConfig } from "../context/config/hooks";
import LaunchpadButton from "./launchpad-button";
import { AnimatePresence } from "motion/react";

export interface DockProps {
  /**
   * dock 项目列表
   */
  items?: SortItem[];
  /**
   * 固定项目列表（在sortable之前显示，不可拖拽排序）
   */
  fixedItems?: SortItem[];
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
  onItemClick?: (item: SortItem) => void;
  /**
   * 自定义项目渲染
   */
  itemBuilder?: (item: SortItem, index: number) => React.ReactNode;
  /**
   * 自定义固定项目渲染
   */
  fixedItemBuilder?: (item: SortItem, index: number) => React.ReactNode;
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
  onDockItemsChange?: (items: SortItem[]) => void;
}

const Dock: React.FC<DockProps> = ({
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
}) => {
  const { setListStatus } = useSortableState();
  const { theme } = useSortableConfig();
  const dockTheme = theme.token.dock;

  const renderDockItem = (item: SortItem, index: number) => {
    if (itemBuilder) {
      return itemBuilder(item, index);
    }

    return <SortableItem data={item} itemIndex={index} noLetters from="dock" />;
  };

  const renderFixedItem = (item: SortItem, index: number) => {
    if (fixedItemBuilder) {
      return fixedItemBuilder(item, index);
    }

    return <SortableItem data={item} itemIndex={index} noLetters from="dock" disabledDrag />;
  };

  if (!items.length && !fixedItems.length && !showLaunchpad) {
    return null;
  }

  return (
    <div
      className={cx(
        "zs-flex zs-justify-between zs-items-center zs-rounded-2xl py-2 px-4 zs-backdrop-blur-xl zs-gap-1 zs-border zs-transition-colors zs-max-w-full",
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
      {fixedItems.length > 0 && items.length > 0 && (
        <div
          className={cx(
            "zs-flex zs-transition-colors",
            position === "top" || position === "bottom" ? "zs-w-[1px] zs-h-8 zs-mx-1" : "zs-w-8 zs-h-[1px] zs-my-1",
            css`
              background-color: ${dockTheme?.divider?.color || "rgba(255, 255, 255, 0.3)"};
            `
          )}
        />
      )}

      {/* Sortable项目 */}
      {items.length > 0 && (
        <ReactSortable
          list={items}
          setList={(newItems) => {
            if (onDockItemsChange) {
              onDockItemsChange(newItems);
            }
          }}
          {...mainDragConfig}
          className={cx(
            "desktop-dock-sortable zs-flex zs-gap-3 flex-1",
            css`
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
            `
          )}
          onMove={() => {
            setListStatus("onMove");
            return true;
          }}
          onEnd={() => {
            setListStatus(null);
          }}
        >
          <AnimatePresence mode="popLayout">{items.map((item, index) => renderDockItem(item, index))}</AnimatePresence>
        </ReactSortable>
      )}

      {/* sortable项目与启动台按钮之间的分隔线 */}
      {showLaunchpad && (fixedItems.length > 0 || items.length > 0) && (
        <div
          className={cx(
            "zs-flex zs-transition-colors",
            position === "top" || position === "bottom" ? "zs-w-[1px] zs-h-8 zs-mx-1" : "zs-w-8 zs-h-[1px] zs-my-1",
            css`
              background-color: ${dockTheme?.divider?.color || "rgba(255, 255, 255, 0.3)"};
            `
          )}
        />
      )}

      {/* 启动台按钮 */}
      {showLaunchpad && <LaunchpadButton onClick={onLaunchpadClick} position={position} />}
    </div>
  );
};

export default Dock;
