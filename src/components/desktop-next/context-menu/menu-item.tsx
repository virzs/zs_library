import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { useContext } from "react";
import { HoverContext } from "./hover-context";
import CapsuleBackground from "./capsule-background";
import { useDesktopDnd } from "../context";

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
  color,
  textColor,
  onClick,
  index,
  children,
  ...props
}: MenuItemProps) => {
  const { hoveredIndex, setHoveredIndex } = useContext(HoverContext);
  const isHovered = hoveredIndex === index;
  const { theme } = useDesktopDnd();
  const cmTheme = theme.token.contextMenu;

  const finalTextColor = textColor || cmTheme?.textColor || "rgba(255, 255, 255, 0.9)";
  const finalIconColor = color || cmTheme?.textColor || "rgba(255, 255, 255, 0.9)";

  return (
    <motion.div
      className="zs-py-0 zs-px-5 zs-flex zs-items-center zs-gap-4 zs-cursor-pointer zs-relative zs-h-10 zs-outline-none zs-z-[1]"
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      onClick={onClick}
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
      {icon && (
        <motion.div
          className={cx(
            "zs-flex zs-items-center zs-justify-center zs-shrink-0 zs-w-[18px] zs-h-[18px]",
            css`
              color: ${finalIconColor};
            `,
          )}
        >
          {icon}
        </motion.div>
      )}
      {children}
    </motion.div>
  );
};
