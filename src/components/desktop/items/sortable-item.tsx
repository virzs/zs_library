import { css, cx } from "@emotion/css";
import { motion } from "framer-motion";
import React from "react";
import { ContextMenuProps } from "../context-menu";
import { useSortableConfig } from "../context/config/hooks";
import { useSortableState } from "../context/state/hooks";
import { SortItem, SortItemBaseData } from "../types";

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
}

export const SortableItemDefaultContent = <D, C>(props: SortableItemProps<D, C>) => {
  const { data, noLetters = false, icon } = props;
  const { contextMenuFuns } = useSortableState();
  const { itemIconBuilder: configItemIconBuilder, theme, contextMenu } = useSortableConfig();

  // 优先使用props中传递的icon，如果没有则使用配置中的itemIconBuilder
  const { data: itemData = {} } = data;

  const { name } = itemData as D & SortItemBaseData;

  // 渲染图标内容
  const renderIcon = () => {
    if (icon) return icon;
    if (!configItemIconBuilder) return null;
    if (typeof configItemIconBuilder === "function") {
      return configItemIconBuilder(data);
    }
    return configItemIconBuilder;
  };

  return (
    <>
      <motion.div
        className={cx(
          "zs-w-16 zs-h-16 zs-cursor-pointer zs-relative zs-overflow-hidden",
          css`
            background-color: ${theme.token.itemIconBackgroundColor};
            border-radius: 0.75rem;
            box-shadow: 0 0 0.5rem ${theme.token.itemIconShadowColor};
          `
        )}
        whileTap={{ scale: 0.9 }}
      >
        {/* 遮罩 防止内部元素点击触发 */}
        <div
          className={cx(
            "zs-absolute zs-left-0 zs-top-0 zs-w-full zs-h-full",
            css`
              color: ${theme.token.itemNameColor};
            `
          )}
          {...contextMenuFuns(data, contextMenu !== false)}
        >
          {renderIcon()}
        </div>
      </motion.div>
      <motion.p
        className={cx(
          "zs-whitespace-nowrap zs-text-ellipsis zs-overflow-hidden zs-text-center zs-mt-1 zs-mb-0 zs-max-w-16 zs-absolute zs-left-0 zs-right-0",
          css`
            color: ${theme.token.itemNameColor};
          `,
          noLetters &&
            css`
              color: transparent;
            `
        )}
      >
        {name}
      </motion.p>
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
    >
      {children ?? <SortableItemDefaultContent {...props} />}
    </motion.div>
  );

  return renderContent();
};

export default SortableItem;
