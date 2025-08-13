import React from "react";
import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { RiFunctionFill } from "@remixicon/react";
import { useState } from "react";
import { Theme } from "../themes";
import { useSortableConfig } from "../context/config/hooks";

export interface StackedIconProps {
  /**
   * 点击事件
   */
  onClick?: () => void;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 主题配置
   */
  theme?: Theme;
}

const StackedIcon: React.FC<StackedIconProps> = ({ onClick, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useSortableConfig();

  // 获取主题配置
  const iconTheme = theme?.token?.dock?.launchpad?.icon;
  const textColor = iconTheme!.textColor!;
  const backgroundColor = iconTheme!.backgroundColor!;
  const borderColor = iconTheme!.borderColor!;
  const shadowColor = iconTheme!.shadowColor!;
  const hoverGlowColor = iconTheme!.hoverGlowColor!;

  // 基于基础背景色计算多层背景色
  const calculateLayerColor = (baseColor: string, layer: number): string => {
    // 如果是hex颜色，转换为rgb
    if (baseColor.startsWith("#")) {
      const hex = baseColor.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      // 每层递减约10-15的亮度值
      const factor = layer * 15;
      const newR = Math.max(0, r - factor);
      const newG = Math.max(0, g - factor);
      const newB = Math.max(0, b - factor);

      return `rgb(${newR}, ${newG}, ${newB})`;
    }

    // 如果是rgba颜色，保持透明度不变，调整RGB值
    const rgbaMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1]);
      const g = parseInt(rgbaMatch[2]);
      const b = parseInt(rgbaMatch[3]);
      const a = rgbaMatch[4] || "1";

      const factor = layer * 15;
      const newR = Math.max(0, r - factor);
      const newG = Math.max(0, g - factor);
      const newB = Math.max(0, b - factor);

      return `rgba(${newR}, ${newG}, ${newB}, ${a})`;
    }

    // 如果无法解析，返回原色
    return baseColor;
  };

  // 模拟的堆叠应用图标
  const stackedApps = [
    {
      id: "app1",
      icon: <RiFunctionFill size={32} />,
    },
    {
      id: "app2",
    },
    {
      id: "app3",
    },
    {
      id: "app4",
    },
  ];

  return (
    <motion.div
      className={cx("zs-cursor-pointer zs-relative", className)}
      style={{
        overflow: "visible",
        padding: "0 8px 0 0",
      }}
      whileTap={{ scale: 0.9 }}
      whileHover={{
        scale: 1.05, // 减少悬浮缩放
        transition: { duration: 0.2 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* 堆叠的图标容器 */}
      <div
        className="zs-relative"
        style={{
          width: "56px",
          height: "56px",
          overflow: "visible",
        }}
      >
        {stackedApps.map((app, index) => {
          // 计算每个图标的位置偏移 - 从左侧中间向右堆叠
          const baseOffsetX = index * 4; // 增加水平偏移量
          const baseOffsetY = 0; // 保持垂直居中
          const hoverOffsetX = isHovered ? baseOffsetX + index * 2 : baseOffsetX;
          const hoverOffsetY = isHovered ? baseOffsetY : baseOffsetY;
          const rotation = 0; // 移除旋转效果
          const scale = 1 - index * 0.05; // 所有图标依次缩小
          const zIndex = stackedApps.length - index;

          // 根据层级获取背景色
          const getBackgroundColor = (index: number) => {
            if (index === 0) {
              return backgroundColor;
            }
            return calculateLayerColor(backgroundColor, index);
          };

          return (
            <motion.div
              key={app.id}
              className={cx(
                "zs-absolute zs-w-full zs-h-full zs-rounded-xl zs-flex zs-items-center zs-justify-center zs-shadow-lg",
                css`
                  background: ${getBackgroundColor(index)};
                  color: ${textColor};
                  z-index: ${zIndex};
                  box-shadow: 0 ${1 + index * 0.5}px ${4 + index * 1}px
                    ${shadowColor.replace(/[\d.]+\)$/, `${0.1 + index * 0.02})`)};
                  border: 0.5px solid ${borderColor};
                `
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale,
                x: hoverOffsetX,
                y: hoverOffsetY,
                rotate: rotation,
              }}
              transition={{
                delay: index * 0.1,
                duration: 0.3,
                x: { duration: 0.2 },
                y: { duration: 0.2 },
                rotate: { duration: 0.2 },
              }}
            >
              {/* 只有首层（index === 0）显示图标，其余层只显示背景 */}
              {index === 0 && (
                <div className="zs-flex zs-items-center zs-justify-center zs-w-full zs-h-full">{app.icon}</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 悬浮时的光晕效果 */}
      <motion.div
        className={cx(
          "zs-absolute zs-inset-0 zs-rounded-xl zs-pointer-events-none",
          css`
            background: radial-gradient(circle, ${hoverGlowColor} 0%, transparent 70%);
            opacity: 0;
          `
        )}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

export default StackedIcon;
