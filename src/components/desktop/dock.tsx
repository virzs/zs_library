import React from "react";
import { css, cx } from "@emotion/css";
import { ReactSortable } from "react-sortablejs";
import { mainDragConfig } from "./drag-styles";
import SortableItem from "./items/sortable-item";
import { SortItem } from "./types";
import { RiApps2Line } from "@remixicon/react";

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
  const dockContainerStyle = css`
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 8px 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);

    ${position === "top" || position === "bottom"
      ? `
        flex-direction: row;
        gap: 12px;
      `
      : `
        flex-direction: column;
        gap: 12px;
      `}
  `;

  const renderDockItem = (item: SortItem, index: number) => {
    if (itemBuilder) {
      return itemBuilder(item, index);
    }

    return <SortableItem data={item} itemIndex={index} />;
  };

  // 创建启动台按钮项目
  const launchpadItem: SortItem = {
    id: "__launchpad__",
    type: "app",
  };

  const launchpadButton = showLaunchpad ? (
    <SortableItem
      data={launchpadItem}
      itemIndex={-1}
      onClick={onLaunchpadClick}
      icon={
        <div
          className={css`
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          `}
        >
          <RiApps2Line />
        </div>
      }
      disabledDrag
    />
  ) : null;

  if (!items.length && !showLaunchpad) {
    return null;
  }

  return (
    <div
      className={cx(dockContainerStyle, className)}
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
          "zs-w-full zs-h-full flex zs-gap-3",
          css`
            ${position === "top" || position === "bottom" ? `flex-direction: row;` : `flex-direction: column;`}
          `
        )}
      >
        {items.map((item, index) => renderDockItem(item, index))}
      </ReactSortable>
      {launchpadButton}
    </div>
  );
};

export default Dock;
