import { css, cx } from "@emotion/css";
import { AnimatePresence, motion } from "motion/react";
import { useState, useContext, useRef, useEffect, type MouseEvent as ReactMouseEvent } from "react";
import { RiArrowRightSLine } from "@remixicon/react";
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";
import { HoverContext } from "./hover-context";
import CapsuleBackground from "./capsule-background";
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

export const SubMenuItem = ({
  text,
  index,
  children,
  color,
  textColor,
  ...props
}: SubMenuItemProps) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const menuItemRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { hoveredIndex, setHoveredIndex } = useContext(HoverContext);
  const { theme } = useSortableConfig();
  const isHovered = hoveredIndex === index;

  const { refs, floatingStyles } = useFloating({
    strategy: "fixed",
    placement: "right-start",
    open: isSubMenuOpen,
    transform: false,
    middleware: [offset(-4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // 使用主题配置的颜色，如果没有传入自定义颜色的话
  const finalTextColor =
    textColor || theme.token.contextMenu?.textColor || "#1d1d1f";
  const finalIconColor = color || theme.token.contextMenu?.textColor || "black";

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setHoveredIndex(index);
    setIsSubMenuOpen(true);
  };

  const handleMouseLeave = (e: ReactMouseEvent<HTMLDivElement>) => {
    const relatedTarget = e.relatedTarget as Node | null;
    const floatingEl = refs.floating.current;
    if (floatingEl && relatedTarget && floatingEl.contains(relatedTarget)) {
      return;
    }
    timeoutRef.current = setTimeout(() => {
      setIsSubMenuOpen(false);
    }, 150);
  };

  const handleSubMenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleSubMenuMouseLeave = (e: ReactMouseEvent<HTMLDivElement>) => {
    const relatedTarget = e.relatedTarget as Node | null;
    const referenceEl = menuItemRef.current;
    if (referenceEl && relatedTarget && referenceEl.contains(relatedTarget)) {
      return;
    }
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
      ref={(node) => {
        menuItemRef.current = node;
        refs.setReference(node);
      }}
      className={cx(
        "zs-py-0 zs-px-5 zs-flex zs-items-center zs-gap-4 zs-cursor-pointer zs-relative zs-h-10 zs-outline-none",
        css`
          z-index: 1;
        `,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* 胶囊背景 */}
      <CapsuleBackground show={isHovered} layoutId="menuHover" />
      <motion.div
        className={cx(
          "zs-flex-1 zs-text-sm",
          css`
            font-weight: 400;
            line-height: 18px;
            color: ${finalTextColor};
            letter-spacing: -0.28px;
          `,
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
          `,
        )}
      >
        <RiArrowRightSLine size={16} />
      </motion.div>

      <AnimatePresence>
        {isSubMenuOpen && (
          <FloatingPortal>
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles, zIndex: 9999 }}
              onMouseEnter={handleSubMenuMouseEnter}
              onMouseLeave={handleSubMenuMouseLeave}
            >
              <ContextMenuContent
                className="zs-overflow-hidden"
                style={{
                  transformOrigin: "left",
                }}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                {children}
              </ContextMenuContent>
            </div>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
