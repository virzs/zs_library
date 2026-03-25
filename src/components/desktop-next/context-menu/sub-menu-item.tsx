import { css, cx } from "@emotion/css";
import { AnimatePresence, motion } from "motion/react";
import {
  useState,
  useContext,
  useRef,
  useEffect,
  type MouseEvent as ReactMouseEvent,
} from "react";
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
import { useDesktopDnd } from "../context";

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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { hoveredIndex, setHoveredIndex } = useContext(HoverContext);
  const isHovered = hoveredIndex === index;
  const { theme } = useDesktopDnd();
  const cmTheme = theme.token.contextMenu;

  const finalTextColor = textColor || cmTheme?.textColor || "rgba(255, 255, 255, 0.9)";
  const finalIconColor = color || cmTheme?.textColor || "rgba(255, 255, 255, 0.9)";

  const { refs, floatingStyles } = useFloating({
    strategy: "fixed",
    placement: "right-start",
    open: isSubMenuOpen,
    transform: false,
    middleware: [offset(-4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredIndex(index);
    setIsSubMenuOpen(true);
  };

  const handleMouseLeave = (e: ReactMouseEvent<HTMLDivElement>) => {
    const relatedTarget = e.relatedTarget as Node | null;
    const floatingEl = refs.floating.current;
    if (floatingEl && relatedTarget && floatingEl.contains(relatedTarget))
      return;
    setHoveredIndex(null);
    timeoutRef.current = setTimeout(() => {
      setIsSubMenuOpen(false);
    }, 150);
  };

  const handleSubMenuMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleSubMenuMouseLeave = (e: ReactMouseEvent<HTMLDivElement>) => {
    const relatedTarget = e.relatedTarget as Node | null;
    const referenceEl = menuItemRef.current;
    if (referenceEl && relatedTarget && referenceEl.contains(relatedTarget))
      return;
    setHoveredIndex(null);
    setIsSubMenuOpen(false);
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (
    <motion.div
      ref={(node) => {
        menuItemRef.current = node;
        refs.setReference(node);
      }}
      className="zs-py-0 zs-px-5 zs-flex zs-items-center zs-gap-4 zs-cursor-pointer zs-relative zs-h-10 zs-outline-none zs-z-[1]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
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
          "zs-flex zs-items-center zs-justify-center zs-shrink-0 zs-w-[18px] zs-h-[18px]",
          css`
            color: ${finalIconColor};
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
              style={{ ...floatingStyles, zIndex: 10000 }}
              onMouseEnter={handleSubMenuMouseEnter}
              onMouseLeave={handleSubMenuMouseLeave}
            >
              <ContextMenuContent
                className="zs-overflow-hidden"
                style={{ transformOrigin: "left" }}
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
