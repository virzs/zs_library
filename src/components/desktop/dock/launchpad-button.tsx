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

const LaunchpadButton: React.FC<LaunchpadButtonProps> = ({ onClick, className, position = "bottom" }) => {
  return (
    <>
      {/* 分隔线 */}
      <div
        className={cx(
          "zs-flex zs-bg-white zs-bg-opacity-30",
          position === "top" || position === "bottom" ? "zs-w-[1px] zs-h-8 zs-mx-1" : "zs-w-8 zs-h-[1px] zs-my-1"
        )}
      />
      {/* 启动台按钮 */}
      <StackedIcon onClick={onClick} className={cx("zs-flex-shrink-0", className)} />
    </>
  );
};

export default LaunchpadButton;
