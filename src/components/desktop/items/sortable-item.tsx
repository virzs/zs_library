import { css, cx } from "@emotion/css";
import { motion } from "framer-motion";
import RcTooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap_white.css";
import React from "react";
import ContextMenu, { ContextMenuProps } from "../context-menu";
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

export const SortableItemDefaultContent = <D, C>(
  props: SortableItemProps<D, C>
) => {
  const { data, noLetters = false, icon } = props;
  const { contextMenuFuns } = useSortableState();
  const {
    itemIconBuilder: configItemIconBuilder,
    theme,
    contextMenu,
  } = useSortableConfig();

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
        className={css`
          width: 4rem;
          height: 4rem;
          background-color: ${theme.token.itemIconBackgroundColor};
          border-radius: 0.75rem;
          box-shadow: 0 0 0.5rem ${theme.token.itemIconShadowColor};
          cursor: pointer;
          position: relative;
          overflow: hidden;
        `}
        whileTap={{ scale: 0.9 }}
      >
        {/* 遮罩 防止内部元素点击触发 */}
        <div
          className={css`
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            color: ${theme.token.itemNameColor};
          `}
          {...contextMenuFuns(data, contextMenu !== false)}
        >
          {renderIcon()}
        </div>
      </motion.div>
      <motion.p
        className={cx(
          "whitespace-nowrap text-ellipsis overflow-hidden text-center mt-1 mb-0 max-w-16",
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
  const {
    data,
    className,
    itemIndex,
    onClick,
    disabledDrag = false,
    children,
    parentIds,
    childrenLength,
    contextMenuProps,
  } = props;

  const { contextMenu, setContextMenu } = useSortableState();
  const { contextMenu: configContextMenu } = useSortableConfig();

  // 确定是否禁用上下文菜单
  const disableContextMenu =
    contextMenuProps === false ||
    (contextMenuProps === undefined && configContextMenu === false);

  // 合并配置中的contextMenu和props中的contextMenuProps
  const mergedContextMenuProps =
    contextMenuProps === false
      ? false
      : typeof contextMenuProps === "object"
      ? contextMenuProps
      : configContextMenu;

  // 渲染内容元素
  const renderContent = () => (
    <motion.div
      data-id={data.id}
      data-index={itemIndex}
      data-parent-ids={parentIds?.join(",")}
      data-children-length={childrenLength}
      onClick={() => onClick?.(data)}
      className={cx(disabledDrag && "drag-disabled", className)}
    >
      {children ?? <SortableItemDefaultContent {...props} />}
    </motion.div>
  );

  // 如果禁用上下文菜单，直接渲染内容而不使用RcTooltip
  if (disableContextMenu) {
    return renderContent();
  }

  return (
    <RcTooltip
      showArrow={false}
      placement="bottom"
      overlayClassName={css`
        background-color: transparent;
        padding: 0;
        .rc-tooltip-inner {
          background-color: transparent;
          padding: 0;
          border: none;
          box-shadow: none;
        }
      `}
      overlay={<ContextMenu {...mergedContextMenuProps} />}
      visible={contextMenu?.data.id === data.id}
      onVisibleChange={(visible) => {
        if (!visible) {
          setContextMenu(null);
        }
      }}
      destroyTooltipOnHide
    >
      {renderContent()}
    </RcTooltip>
  );
};

export default SortableItem;
