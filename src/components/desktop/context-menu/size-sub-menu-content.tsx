import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { useState } from "react";
import { RiCheckLine } from "@remixicon/react";
import { useSortableConfig } from "../context/config/hooks";
import CapsuleBackground from "./capsule-background";

export interface SizeMenuItemProps {
  sizes: string[];
  currentSize: string;
  onSizeChange: (size: string) => void;
}

export const SizeSubMenuContent = ({ sizes, currentSize, onSizeChange }: SizeMenuItemProps) => {
  const [hoveredSize, setHoveredSize] = useState<string | null>(null);
  const { theme } = useSortableConfig();

  return (
    <>
      {sizes.map((size) => {
        const isHovered = hoveredSize === size;
        const isSelected = currentSize === size;

        return (
          <motion.div
            key={size}
            className={cx(
              "zs-h-10 zs-py-0 zs-px-5 zs-flex zs-items-center zs-gap-4 zs-cursor-pointer zs-relative zs-outline-none",
              css`
                z-index: 1;
              `
            )}
            onMouseEnter={() => setHoveredSize(size)}
            onMouseLeave={() => setHoveredSize(null)}
            onClick={() => onSizeChange(size)}
            whileTap={{ scale: 0.98 }}
          >
            {/* 胶囊背景 */}
            <CapsuleBackground show={isHovered || isSelected} />
            <motion.div
              className={cx(
                "zs-flex-1 zs-text-sm",
                css`
                  font-weight: 400;
                  line-height: 18px;
                  color: ${theme.token.contextMenu?.textColor || "#1d1d1f"};
                  letter-spacing: -0.28px;
                `
              )}
            >
              {size}
            </motion.div>
            {isSelected && (
              <motion.div
                className={cx(
                  "zs-flex zs-items-center zs-justify-center zs-shrink-0",
                  css`
                    color: ${theme.token.contextMenu?.textColor || "#1d1d1f"};
                    width: 18px;
                    height: 18px;
                  `
                )}
              >
                <RiCheckLine size={14} />
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </>
  );
};
