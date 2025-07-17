import React from "react";
import { css, cx } from "@emotion/css";
import { ReactSortable } from "react-sortablejs";
import { mainDragConfig } from "../drag-styles";
import SortableItem from "../items/sortable-item";
import { SortItem } from "../types";
import { useSortableState } from "../context/state/hooks";
import LaunchpadButton from "./launchpad-button";

export interface DockProps {
  /**
   * dock 项目列表
   */
  items?: SortItem[];
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
  position = "bottom",
  className,
  itemBuilder,
  showLaunchpad = true,
  onLaunchpadClick,
  onDrop,
  onDockItemsChange,
}) => {
  const { setListStatus } = useSortableState();

  const renderDockItem = (item: SortItem, index: number) => {
    if (itemBuilder) {
      return itemBuilder(item, index);
    }

    return <SortableItem data={item} itemIndex={index} noLetters />;
  };

  if (!items.length && !showLaunchpad) {
    return null;
  }

  return (
    <div
      className={cx(
        "zs-flex zs-justify-center zs-items-center zs-rounded-2xl py-2 px-4 zs-backdrop-blur-xl zs-bg-white zs-bg-opacity-80 zs-gap-3 zs-border zs-border-white zs-border-opacity-20",
        position === "top" || position === "bottom" ? "zs-flex-row" : "zs-flex-col",
        position === "top" && "zs-mb-4",
        position === "bottom" && "zs-mt-4",
        css`
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
      <ReactSortable
        list={items}
        setList={(newItems) => {
          if (onDockItemsChange) {
            onDockItemsChange(newItems);
          }
        }}
        {...mainDragConfig}
        className={cx(
          "desktop-dock-sortable zs-w-full zs-h-full zs-flex zs-gap-3",
          css`
            ${position === "top" || position === "bottom" ? `flex-direction: row;` : `flex-direction: column;`}
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
        {items.map((item, index) => renderDockItem(item, index))}
      </ReactSortable>
      {showLaunchpad && <LaunchpadButton onClick={onLaunchpadClick} position={position} />}
    </div>
  );
};

export default Dock;
