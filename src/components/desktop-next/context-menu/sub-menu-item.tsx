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
import { menuIcon, menuRow, useMenuTheme } from "./styles";

export interface SubMenuItemProps {
  text: string;
  icon: React.ReactNode;
  index: number;
  children: React.ReactNode;
  color?: string;
  textColor?: string;
  isRootMenuOpen?: boolean;
}

export const SubMenuItem = ({
  text,
  icon,
  index,
  children,
  color,
  textColor,
  isRootMenuOpen = true,
  ...props
}: SubMenuItemProps) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const menuItemRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { hoveredIndex, setHoveredIndex } = useContext(HoverContext);
  const isHovered = hoveredIndex === index;
  const cmTheme = useMenuTheme();

  const finalTextColor = textColor ?? cmTheme.textColor;
  const finalIconColor = color ?? cmTheme.iconColor;
  const shouldShowSubMenu = isRootMenuOpen && isSubMenuOpen;

  const { refs, floatingStyles } = useFloating({
    strategy: "fixed",
    placement: "right-start",
    open: shouldShowSubMenu,
    transform: false,
    middleware: [offset(10), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const handleMouseEnter = () => {
    if (!isRootMenuOpen) return;
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

  useEffect(() => {
    if (isRootMenuOpen) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsSubMenuOpen(false);
  }, [isRootMenuOpen]);

  return (
    <motion.div
      ref={(node) => {
        menuItemRef.current = node;
        refs.setReference(node);
      }}
      className={menuRow}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <CapsuleBackground show={isHovered || shouldShowSubMenu} layoutId="menuHover" />
      {icon && <span aria-hidden="true" className={menuIcon} style={{ color: finalIconColor }}>{icon}</span>}
      <span style={{ flex: 1, color: finalTextColor }}>{text}</span>
      <RiArrowRightSLine aria-hidden="true" size={16} style={{ color: finalIconColor, opacity: .72 }} />

      <FloatingPortal>
        <AnimatePresence>
          {shouldShowSubMenu && (
            <motion.div
              key="desktop-next-context-submenu"
              ref={refs.setFloating}
              style={{
                ...floatingStyles,
                zIndex: 10000,
                pointerEvents: isRootMenuOpen ? "auto" : "none",
              }}
              onMouseEnter={handleSubMenuMouseEnter}
              onMouseLeave={handleSubMenuMouseLeave}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
            >
              <ContextMenuContent
                className="zs-overflow-hidden"
                style={{ transformOrigin: "left", minWidth: 144 }}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                {children}
              </ContextMenuContent>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </motion.div>
  );
};
