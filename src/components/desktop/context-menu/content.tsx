import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { FC } from "react";
import { useSortableConfig } from "../context/config/hooks";

export type ContentMenuContextProps = React.ComponentProps<typeof motion.div>;

const ContextMenuContent: FC<ContentMenuContextProps> = (props) => {
  const { className, children, ...rest } = props;
  const { theme } = useSortableConfig();

  return (
    <motion.div
      className={cx(
        "zs-rounded-2xl py-2 zs-w-max zs-z-50",
        css`
          background-color: ${theme.token.contextMenu?.backgroundColor};
          box-shadow: 0 20px 40px ${theme.token.contextMenu?.shadowColor},
            0 0 0 0.75px ${theme.token.contextMenu?.boxShadowBorderColor};
          min-width: 200px;
          border: 0.75px solid ${theme.token.contextMenu?.borderColor};
          backdrop-filter: ${theme.token.contextMenu?.backdropFilter};
        `,
        className
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
