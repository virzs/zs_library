import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { FC } from "react";
import { fade, glassSurface } from "../themes/material";
import { useMenuTheme } from "./styles";

export type ContentMenuContextProps = React.ComponentProps<typeof motion.div>;

const ContextMenuContent: FC<ContentMenuContextProps> = (props) => {
  const { className, children, ...rest } = props;
  const cm = useMenuTheme();

  return (
    <motion.div
      className={cx(
        "zs-w-max zs-z-50 zs-min-w-[208px] zs-overflow-hidden",
        css`
          padding: 5px;
          font-family: ${cm.fontFamily};
          color: ${cm.textColor};
          border-radius: ${cm.borderRadius};
          --zs-menu-divider: ${cm.borderColor};
          --zs-menu-row-radius: max(0px, calc(${cm.borderRadius} - 6px));
          ${glassSurface(cm.backgroundColor, cm.backdropFilter, cm.highlightColor)}
          border: 1px solid ${cm.borderColor};
          box-shadow: 0 12px 30px -9px ${cm.shadowColor}, 0 2px 6px -2px ${cm.shadowColor},
            0 0 0 .5px ${cm.boxShadowBorderColor}, inset 0 1px 0 ${fade(cm.highlightColor, 50)};
        `,
        className,
      )}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.15,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default ContextMenuContent;
