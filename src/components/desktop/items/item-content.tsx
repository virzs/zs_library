import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { ComponentProps, useMemo } from "react";
import { useSortableState } from "../context/state/hooks";
import { SortItem } from "../types";
import { getItemSize } from "../config";
import { useSortableConfig } from "../context/config/hooks";

interface ItemContentProps<D, C> extends ComponentProps<typeof motion.div> {
  data: SortItem<D, C>;
  iconSize?: number;
}

const ItemContent = <D, C>({ className, data, children, iconSize = 64, ...rest }: ItemContentProps<D, C>) => {
  const { moveTargetId, listStatus } = useSortableState();

  const { typeConfigMap, computeGap } = useSortableConfig();

  const { row, col } = getItemSize(data.type, data.config?.sizeId, typeConfigMap);

  const isMoveTarget = useMemo(() => {
    return moveTargetId === data.id;
  }, [data.id, moveTargetId]);

  const gap = computeGap(iconSize);

  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
      className={cx(
        isMoveTarget ? "!scale-110" : "",
        "zs-cursor-pointer zs-relative my-0",
        css`
          border-radius: 1rem;
          overflow: hidden;
          transition: all 0.3s;
          transform-origin: ${listStatus === null ? "center" : "top left"};
          width: ${col * iconSize + gap * (col - 1)}px;
          height: ${row * iconSize + gap * (row - 1)}px;
        `,
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default ItemContent;
