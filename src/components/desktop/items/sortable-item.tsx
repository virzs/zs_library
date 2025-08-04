import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import React from "react";
import { ContextMenuProps } from "../context-menu";
import { useSortableConfig } from "../context/config/hooks";
import { useSortableState } from "../context/state/hooks";
import { SortItem, SortItemBaseData } from "../types";
import { renderIcon } from "../utils/render-icon";
import ItemName from "./item-name";

export interface SortableItemProps<D, C> {
  data: SortItem<D, C>;
  className?: string;
  itemIndex: number;
  noLetters?: boolean;
  onClick?: (item: SortItem<D, C>) => void;
  disabledDrag?: boolean;
  children?: React.ReactNode;
  parentIds?: (string | number)[];
  childrenLength?: number;
  contextMenuProps?: false | Partial<ContextMenuProps<D, C>>;
  icon?: React.ReactNode;
  /**
   * 来源 当前仅支持 dock
   */
  from?: string;
}

export const SortableItemDefaultContent = <D, C>(props: SortableItemProps<D, C>) => {
  const { data, noLetters = false, icon, from } = props;
  const { contextMenuFuns } = useSortableState();
  const { itemIconBuilder: configItemIconBuilder, theme, contextMenu } = useSortableConfig();

  const { data: itemData = {} } = data;
  const { name } = itemData as D & SortItemBaseData;

  return (
    <>
      <motion.div
        className={cx(
          "zs-w-16 zs-h-16 zs-cursor-pointer zs-relative zs-overflow-hidden",
          css`
            background-color: ${theme.token.items?.iconBackgroundColor};
            border-radius: 0.75rem;
            box-shadow: 0 0 0.5rem ${theme.token.items?.iconShadowColor};
          `
        )}
        whileTap={{ scale: 0.9 }}
      >
        {/* 遮罩 防止内部元素点击触发 */}
        <div
          className={cx(
            "zs-absolute zs-left-0 zs-top-0 zs-w-full zs-h-full",
            css`
              color: ${theme.token.items?.textColor};
            `
          )}
          {...contextMenuFuns(
            { ...data, ...(from === "dock" ? { config: { allowResize: false } } : {}) },
            contextMenu !== false
          )}
        >
          {renderIcon(data, icon, configItemIconBuilder)}
        </div>
      </motion.div>
      <ItemName data={data} noLetters={noLetters} name={name} />
    </>
  );
};

const SortableItem = <D, C>(props: SortableItemProps<D, C>) => {
  const { data, className, itemIndex, onClick, disabledDrag = false, children, parentIds, childrenLength } = props;

  // 渲染内容元素
  const renderContent = () => (
    <motion.div
      data-id={data.id}
      data-index={itemIndex}
      data-parent-ids={parentIds?.join(",")}
      data-children-length={childrenLength}
      onClick={() => onClick?.(data)}
      className={cx(disabledDrag && "drag-disabled", "zs-relative", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key={data.id}
    >
      {children ?? <SortableItemDefaultContent {...props} />}
    </motion.div>
  );

  return renderContent();
};

export default SortableItem;
