import { motion } from "motion/react";
import { useContext } from "react";
import { HoverContext } from "./hover-context";
import CapsuleBackground from "./capsule-background";
import { menuIcon, menuRow, useMenuTheme } from "./styles";

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
  const cmTheme = useMenuTheme();

  const finalTextColor = textColor ?? cmTheme.textColor;
  const finalIconColor = color ?? cmTheme.iconColor;

  return (
    <motion.div
      className={menuRow}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      onClick={onClick}
      {...props}
    >
      <CapsuleBackground show={isHovered} layoutId="menuHover" />
      {icon && <span aria-hidden="true" className={menuIcon} style={{ color: finalIconColor }}>{icon}</span>}
      <span style={{ flex: 1, color: finalTextColor }}>{text}</span>
      {children}
    </motion.div>
  );
};
