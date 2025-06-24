import React from "react";
import { css, cx } from "@emotion/css";

// 启动台图标SVG
const LaunchpadIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
  </svg>
);

export interface DockItem {
  /**
   * 唯一标识
   */
  id: string;
  /**
   * 图标
   */
  icon?: React.ReactNode;
  /**
   * 标题
   */
  title?: string;
  /**
   * 链接
   */
  href?: string;
  /**
   * 点击事件
   */
  onClick?: () => void;
  /**
   * 自定义数据
   */
  data?: any;
}

export interface DockProps {
  /**
   * dock 项目列表
   */
  items?: DockItem[];
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
  onItemClick?: (item: DockItem) => void;
  /**
   * 自定义项目渲染
   */
  itemBuilder?: (item: DockItem, index: number) => React.ReactNode;
  /**
   * 是否显示启动台按钮
   */
  showLaunchpad?: boolean;
  /**
   * 启动台按钮点击事件
   */
  onLaunchpadClick?: () => void;
}

const Dock: React.FC<DockProps> = ({
  items = [],
  position = "bottom",
  className,
  onItemClick,
  itemBuilder,
  showLaunchpad = true,
  onLaunchpadClick,
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

  const dockItemStyle = css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      background: rgba(255, 255, 255, 0.8);
    }

    &:active {
      transform: translateY(-2px);
    }

    .dock-item-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 100%;
        height: 100%;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 6px;
      }
    }

    .dock-item-title {
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    &:hover .dock-item-title {
      opacity: 1;
    }
  `;

  const handleItemClick = (item: DockItem) => {
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item);
    }
    if (item.href) {
      window.open(item.href, "_blank");
    }
  };

  const renderDockItem = (item: DockItem, index: number) => {
    if (itemBuilder) {
      return itemBuilder(item, index);
    }

    return (
      <div
        key={item.id}
        className={dockItemStyle}
        onClick={() => handleItemClick(item)}
        title={item.title}
      >
        {item.icon && <div className="dock-item-icon">{item.icon}</div>}
        {item.title && <div className="dock-item-title">{item.title}</div>}
      </div>
    );
  };

  // 创建启动台按钮项目
  const launchpadItem: DockItem = {
    id: "__launchpad__",
    icon: <LaunchpadIcon />,
    title: "启动台",
    onClick: onLaunchpadClick,
  };

  // 合并启动台按钮和用户项目
  const allItems = showLaunchpad ? [launchpadItem, ...items] : items;

  if (!allItems.length) {
    return null;
  }

  return (
    <div className={cx(dockContainerStyle, className)}>
      {allItems.map((item, index) => renderDockItem(item, index))}
    </div>
  );
};

export default Dock;
