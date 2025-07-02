import { css, cx } from "@emotion/css";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useSortableConfig } from "../context/config/hooks";
import { useSortableState } from "../context/state/hooks";
import { SortItem, SortItemBaseData } from "../types";

export interface ItemNameProps<D, C> {
  data: SortItem<D, C>;
  noLetters?: boolean;
  name?: string;
  defaultName?: string;
  className?: string;
}

const ItemName = <D, C>(props: ItemNameProps<D, C>) => {
  const { data, noLetters = false, name, defaultName, className } = props;
  const { moveItemId } = useSortableState();
  const { theme } = useSortableConfig();

  const variants = {
    visible: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0.95 },
  };

  const isMove = useMemo(() => {
    return moveItemId === data.id.toString();
  }, [data.id, moveItemId]);

  // 获取显示名称
  const displayName = name || (data.data as D & SortItemBaseData)?.name || defaultName || "";

  return (
    <motion.p
      className={cx(
        "zs-whitespace-nowrap zs-text-ellipsis zs-overflow-hidden zs-text-center zs-mt-1 zs-mb-0 zs-absolute zs-left-0 zs-right-0",
        css`
          color: ${theme.token.itemNameColor};
        `,
        noLetters &&
          css`
            color: transparent;
          `,
        className
      )}
      variants={variants}
      animate={isMove ? "hidden" : "visible"}
    >
      {displayName}
    </motion.p>
  );
};

export default ItemName;
