import React from "react";
import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { RiFunctionFill } from "@remixicon/react";
import { useState } from "react";

export interface StackedIconProps {
  /**
   * 点击事件
   */
  onClick?: () => void;
  /**
   * 自定义类名
   */
  className?: string;
}

const StackedIcon: React.FC<StackedIconProps> = ({ onClick, className }) => {
  const [isHovered, setIsHovered] = useState(false);

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
          width: "64px", // 明确设置为64px标准大小
          height: "64px", // 明确设置为64px标准大小
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

          return (
            <motion.div
              key={app.id}
              className={cx(
                "zs-absolute zs-w-full zs-h-full zs-rounded-xl zs-flex zs-items-center zs-justify-center zs-text-gray-600 zs-shadow-lg",
                css`
                  background: ${index === 0
                    ? "#ffffff"
                    : index === 1
                    ? "#f5f5f5"
                    : index === 2
                    ? "#e5e5e5"
                    : "#d5d5d5"};
                  z-index: ${zIndex};
                  box-shadow: 0 ${1 + index * 0.5}px ${4 + index * 1}px rgba(0, 0, 0, ${0.1 + index * 0.02});
                  border: 0.5px solid rgba(255, 255, 255, 0.15);
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
            background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
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
