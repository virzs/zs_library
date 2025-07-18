import React from "react";
import { cx } from "@emotion/css";
import StackedIcon from "./stacked-icon";

export interface LaunchpadButtonProps {
  /**
   * 启动台按钮点击事件
   */
  onClick?: () => void;
  /**
   * 自定义样式类名
   */
  className?: string;
  /**
   * dock 位置，用于调整分隔线样式
   */
  position?: "top" | "bottom" | "left" | "right";
}

const LaunchpadButton: React.FC<LaunchpadButtonProps> = ({ onClick, className }) => {
  return <StackedIcon onClick={onClick} className={cx("zs-flex-shrink-0", className)} />;
};

export default LaunchpadButton;
