import { css, cx } from "@emotion/css";
import { AnimatePresence, motion } from "motion/react";
import { FC } from "react";
import { useDesktopDnd } from "../context";

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
  const { theme } = useDesktopDnd();
  const activeColor =
    theme.token.contextMenu?.activeColor ?? "rgba(255, 255, 255, 0.08)";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          {...(layoutId ? { layoutId } : {})}
          className={cx(
            "zs-absolute zs-top-[3px] zs-left-1.5 zs-right-1.5 zs-bottom-[3px] zs-rounded-[10px]",
            css`
              background-color: ${activeColor};
              box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
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
