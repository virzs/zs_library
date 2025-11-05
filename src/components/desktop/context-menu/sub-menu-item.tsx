import { css, cx } from "@emotion/css";
import { AnimatePresence, motion } from "motion/react";
import { useState, useContext, useRef, useEffect } from "react";
import { RiArrowRightSLine } from "@remixicon/react";
import { HoverContext } from "./hover-context";
import ContextMenuContent from "./content";
import { useSortableConfig } from "../context/config/hooks";

export interface SubMenuItemProps {
  text: string;
  icon: React.ReactNode;
  index: number;
  children: React.ReactNode;
  color?: string;
  textColor?: string;
}

export const SubMenuItem = ({ text, index, children, color, textColor, ...props }: SubMenuItemProps) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [subMenuPosition, setSubMenuPosition] = useState({ x: 0, y: 0 });
  const menuItemRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { hoveredIndex, setHoveredIndex } = useContext(HoverContext);
  const { theme } = useSortableConfig();
  const isHovered = hoveredIndex === index;

  // 使用主题配置的颜色，如果没有传入自定义颜色的话
  const finalTextColor = textColor || theme.token.contextMenu?.textColor || "#1d1d1f";
  const finalIconColor = color || theme.token.contextMenu?.textColor || "black";

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setHoveredIndex(index);
    setIsSubMenuOpen(true);

    if (menuItemRef.current) {
      const rect = menuItemRef.current.getBoundingClientRect();
      setSubMenuPosition({
        x: rect.width - 4,
        y: 0,
      });
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsSubMenuOpen(false);
    }, 150);
  };

  const handleSubMenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleSubMenuMouseLeave = () => {
    setIsSubMenuOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={menuItemRef}
      className={cx(
        "zs-py-0 zs-px-5 zs-flex zs-items-center zs-gap-4 zs-cursor-pointer zs-relative zs-h-10 zs-outline-none",
        css`
          z-index: 1;
        `
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* 胶囊背景 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            layoutId="menuHover"
            className={cx(
              "zs-absolute zs-top-0.5 zs-left-2 zs-right-2 zs-bottom-0.5 zs-rounded-lg",
              css`
                z-index: -1;
                background-color: ${theme.token.contextMenu?.activeColor || "rgba(0, 0, 0, 0.05)"};
              `
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
        )}
      </AnimatePresence>
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
        <RiArrowRightSLine size={16} />
      </motion.div>

      <AnimatePresence>
        {isSubMenuOpen && (
          <ContextMenuContent
            className={cx(
              "zs-absolute zs-overflow-hidden zs-z-50",
              css`
                left: ${subMenuPosition.x}px;
                top: ${subMenuPosition.y}px;
              `
            )}
            initial={{ opacity: 0, scale: 0.6, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            style={{
              transformOrigin: "left",
            }}
            onMouseEnter={handleSubMenuMouseEnter}
            onMouseLeave={handleSubMenuMouseLeave}
          >
            {children}
          </ContextMenuContent>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
