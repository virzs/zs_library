import { css } from "@emotion/css";
import { motion } from "motion/react";
import { useState } from "react";
import { RiCheckLine } from "@remixicon/react";
import { SizeConfig } from "../types";
import CapsuleBackground from "./capsule-background";
import { menuIcon, menuRow, useMenuTheme } from "./styles";

const footprint = css`
  display: block;
  border: 1px solid currentColor;
  border-radius: 3px;
  background-image: linear-gradient(90deg, currentColor 1px, transparent 1px),
    linear-gradient(currentColor 1px, transparent 1px);
  background-position: -1px -1px;
`;

export interface SizeMenuItemProps {
  sizes: SizeConfig[];
  currentSizeId?: string;
  onSizeChange: (size: SizeConfig) => void;
}

export const SizeSubMenuContent = ({
  sizes,
  currentSizeId,
  onSizeChange,
}: SizeMenuItemProps) => {
  const menu = useMenuTheme();
  const [hoveredSizeId, setHoveredSizeId] = useState<string | undefined>(
    undefined,
  );

  return (
    <>
      {sizes.map((size) => {
        const optionId = size.id ?? size.name;
        const isHovered = hoveredSizeId === optionId;
        const isSelected = currentSizeId === optionId;

        return (
          <motion.div
            key={optionId}
            className={menuRow}
            data-selected={isSelected}
            onMouseEnter={() => setHoveredSizeId(optionId)}
            onMouseLeave={() => setHoveredSizeId(undefined)}
            onClick={() => onSizeChange(size)}
            whileTap={{ scale: 0.98 }}
          >
            <CapsuleBackground show={isHovered || isSelected} />
            <span aria-hidden="true" className={menuIcon} style={{ color: isSelected ? menu.selectedColor : menu.iconColor }}>
              <span className={footprint} style={{
                width: 16 * size.col / Math.max(size.col, size.row, 1),
                height: 16 * size.row / Math.max(size.col, size.row, 1),
                backgroundImage: size.col === 1 && size.row === 1 ? "none" : undefined,
                backgroundSize: `${100 / size.col}% ${100 / size.row}%`,
              }} />
            </span>
            <span style={{ flex: 1, color: menu.textColor, fontWeight: isSelected ? 600 : 500 }}>{size.name}</span>
            {isSelected && <RiCheckLine aria-hidden="true" size={17} color={menu.selectedColor} />}
          </motion.div>
        );
      })}
    </>
  );
};
