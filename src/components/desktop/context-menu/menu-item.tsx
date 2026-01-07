import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { useContext } from "react";
import { HoverContext } from "./hover-context";
import { useSortableConfig } from "../context/config/hooks";
import CapsuleBackground from "./capsule-background";

export interface MenuItemProps {
  icon?: React.ReactNode;
  text: string;
  color?: string;
  textColor?: string;
  onClick?: () => void;
  index: number;
  children?: React.ReactNode;
}

export const MenuItem = ({ icon, text, color, textColor, onClick, index, children, ...props }: MenuItemProps) => {
  const { hoveredIndex, setHoveredIndex } = useContext(HoverContext);
  const { theme } = useSortableConfig();
  const isHovered = hoveredIndex === index;

  // 使用主题配置的颜色，如果没有传入自定义颜色的话
  const finalTextColor = textColor || theme.token.contextMenu?.textColor || "#1d1d1f";
  const finalIconColor = color || theme.token.contextMenu?.textColor || "black";

  const content = (
    <motion.div
      className={cx(
        "zs-py-0 zs-px-5 zs-flex zs-items-center zs-gap-4 zs-cursor-pointer zs-relative zs-h-10 zs-outline-none",
        css`
          z-index: 1;
        `
      )}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      onClick={onClick}
      {...props}
    >
      {/* 胶囊背景 */}
      <CapsuleBackground show={isHovered} layoutId="menuHover" className="zs-bg-black zs-bg-opacity-5" />
      <motion.div
        className={cx(
          "zs-flex-1 zs-text-sm",
          css`
            font-weight: 400;
            line-height: 18px;
            color: ${finalTextColor};
            letter-spacing: -0.28px;
          `
        )}
      >
        {text}
      </motion.div>
      {icon && (
        <motion.div
          className={cx(
            "zs-flex zs-items-center zs-justify-center zs-shrink-0",
            css`
              color: ${finalIconColor};
              width: 18px;
              height: 18px;
            `
          )}
        >
          {icon}
        </motion.div>
      )}
      {children}
    </motion.div>
  );

  return content;
};
