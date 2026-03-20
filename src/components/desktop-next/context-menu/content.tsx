import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { FC } from "react";

export type ContentMenuContextProps = React.ComponentProps<typeof motion.div>;

const ContextMenuContent: FC<ContentMenuContextProps> = (props) => {
  const { className, children, ...rest } = props;

  return (
    <motion.div
      className={cx(
        "zs-rounded-2xl zs-py-2 zs-w-max zs-z-50",
        css`
          background: rgba(30, 30, 30, 0.85);
          backdrop-filter: blur(50px);
          -webkit-backdrop-filter: blur(50px);
          border: 0.75px solid rgba(255, 255, 255, 0.18);
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.5),
            0 0 0 0.75px rgba(255, 255, 255, 0.05);
          min-width: 200px;
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
