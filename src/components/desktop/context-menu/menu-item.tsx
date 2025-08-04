import { css, cx } from "@emotion/css";
import { AnimatePresence, motion } from "motion/react";
import { useContext } from "react";
import { HoverContext } from "./hover-context";

export interface MenuItemProps {
  icon?: React.ReactNode;
  text: string;
  color?: string;
  textColor?: string;
  onClick?: () => void;
  index: number;
  children?: React.ReactNode;
}

export const MenuItem = ({
  icon,
  text,
  color = "black",
  textColor = "#1d1d1f",
  onClick,
  index,
  children,
  ...props
}: MenuItemProps) => {
  const { hoveredIndex, setHoveredIndex } = useContext(HoverContext);
  const isHovered = hoveredIndex === index;

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
      <AnimatePresence>
        {isHovered && (
          <motion.div
            layoutId="menuHover"
            className={cx(
              "zs-absolute zs-top-0.5 zs-left-2 zs-right-2 zs-bottom-0.5 zs-bg-black zs-bg-opacity-5 zs-rounded-lg",
              css`
                z-index: -1;
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
            color: ${textColor};
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
              color: ${color};
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
