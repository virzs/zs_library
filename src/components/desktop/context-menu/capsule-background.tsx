import { css, cx } from "@emotion/css";
import { AnimatePresence, motion } from "motion/react";
import { FC } from "react";
import { useSortableConfig } from "../context/config/hooks";

export interface CapsuleBackgroundProps {
  show: boolean;
  layoutId?: string;
  className?: string;
}

const CapsuleBackground: FC<CapsuleBackgroundProps> = ({ show, layoutId, className }) => {
  const { theme } = useSortableConfig();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          {...(layoutId ? { layoutId } : {})}
          className={cx(
            "zs-absolute zs-top-0.5 zs-left-2 zs-right-2 zs-bottom-0.5 zs-rounded-xl",
            css`
              z-index: -1;
              background-color: ${theme.token.contextMenu?.activeColor || "rgba(0, 0, 0, 0.05)"};
            `,
            className
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
  );
};

export default CapsuleBackground;

