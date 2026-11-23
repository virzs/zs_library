import { css, cx } from "@emotion/css";
import { AnimatePresence, motion } from "motion/react";
import { FC } from "react";
import { useMenuTheme } from "./styles";
import { fade } from "../themes/material";

export interface CapsuleBackgroundProps {
  show: boolean;
  layoutId?: string;
  className?: string;
}

const CapsuleBackground: FC<CapsuleBackgroundProps> = ({
  show,
  layoutId,
  className,
}) => {
  const menu = useMenuTheme();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          {...(layoutId ? { layoutId } : {})}
          className={cx(
            "zs-absolute zs-inset-x-0 zs-inset-y-[1px]",
            css`
              border-radius: var(--zs-menu-row-radius, 12px);
              background-color: ${menu.activeColor};
              box-shadow: inset 0 1px 0 ${fade(menu.highlightColor, 22)};
              pointer-events: none;
            `,
            className,
          )}
          style={{ zIndex: -1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </AnimatePresence>
  );
};

export default CapsuleBackground;
