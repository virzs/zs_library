import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { useState } from "react";
import { RiCheckLine } from "@remixicon/react";
import { SizeConfig } from "../types";
import CapsuleBackground from "./capsule-background";

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
            className="zs-h-10 zs-py-0 zs-px-5 zs-flex zs-items-center zs-gap-4 zs-cursor-pointer zs-relative zs-outline-none zs-z-[1]"
            onMouseEnter={() => setHoveredSizeId(optionId)}
            onMouseLeave={() => setHoveredSizeId(undefined)}
            onClick={() => onSizeChange(size)}
            whileTap={{ scale: 0.98 }}
          >
            <CapsuleBackground show={isHovered || isSelected} />
            <motion.div
              className={cx(
                "zs-flex-1 zs-text-sm",
                css`
                  font-weight: 400;
                  line-height: 18px;
                  color: rgba(255, 255, 255, 0.9);
                  letter-spacing: -0.28px;
                `,
              )}
            >
              {size.name}
            </motion.div>
            {isSelected && (
              <motion.div
                className="zs-flex zs-items-center zs-justify-center zs-shrink-0 zs-w-[18px] zs-h-[18px] zs-text-white/90"
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
