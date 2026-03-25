import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { FC } from "react";
import { useDesktopDnd } from "../context";

export type ContentMenuContextProps = React.ComponentProps<typeof motion.div>;

const ContextMenuContent: FC<ContentMenuContextProps> = (props) => {
  const { className, children, ...rest } = props;
  const { theme } = useDesktopDnd();
  const cm = theme.token.contextMenu;

  return (
    <motion.div
      className={cx(
        "zs-rounded-2xl zs-py-2 zs-w-max zs-z-50 zs-min-w-[200px]",
        css`
          background: ${cm?.backgroundColor ?? "rgba(30, 30, 30, 0.85)"};
          backdrop-filter: ${cm?.backdropFilter ?? "blur(50px)"};
          -webkit-backdrop-filter: ${cm?.backdropFilter ?? "blur(50px)"};
          border: 0.75px solid ${cm?.borderColor ?? "rgba(255, 255, 255, 0.18)"};
          box-shadow:
            0 20px 40px ${cm?.shadowColor ?? "rgba(0, 0, 0, 0.5)"},
            0 0 0 0.75px ${cm?.boxShadowBorderColor ?? "rgba(255, 255, 255, 0.05)"};
        `,
        className,
      )}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
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
