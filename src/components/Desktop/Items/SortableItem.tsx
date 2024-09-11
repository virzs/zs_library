import { css, cx } from '@emotion/css';
import { motion } from 'framer-motion';
import RcTooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap_white.css';
import React from 'react';
import ContextMenu from '../ContextMenu';
import { useSortableConfig } from '../context/config/hooks';
import { useSortableState } from '../context/state/hooks';
import { SortItem, SortItemBaseData } from '../types';
import SortableUtils from '../utils';

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
}

export const SortableItemDefaultContent = <D, C>(
  props: SortableItemProps<D, C>,
) => {
  const { data, noLetters = false } = props;

  const { contextMenuFuns } = useSortableState();
  const { itemIconBuilder, theme, contextMenu } = useSortableConfig();

  const { light, dark } = SortableUtils.getTheme(theme);

  const { data: itemData = {} } = data;

  const { name } = itemData as D & SortItemBaseData;

  return (
    <>
      <motion.div
        className={css`
          width: 4rem;
          height: 4rem;
          background-color: ${light.itemIconBackgroundColor};
          border-radius: 0.75rem;
          box-shadow: 0 0 0.5rem ${light.itemIconShadowColor};
          cursor: pointer;
          position: relative;
          overflow: hidden;
          @media (prefers-color-scheme: dark) {
            background-color: ${dark.itemIconBackgroundColor};
            box-shadow: 0 0 0.5rem ${dark.itemIconShadowColor};
          }
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
            color: ${light.itemNameColor};
            @media (prefers-color-scheme: dark) {
              color: ${dark.itemNameColor};
            }
          `}
          {...contextMenuFuns(data, contextMenu !== false)}
        >
          {itemIconBuilder?.(data)}
        </div>
      </motion.div>
      <motion.p
        className={cx(
          css`
            text-align: center;
            margin-top: 0.25rem;
            margin-bottom: 0;
            color: ${light.itemNameColor};
            @media (prefers-color-scheme: dark) {
              color: ${dark.itemNameColor};
            }
          `,
          noLetters &&
            css`
              color: transparent;
            `,
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
  } = props;

  const { contextMenu, setContextMenu } = useSortableState();
  const { contextMenu: configContextMenu } = useSortableConfig();

  return (
    <RcTooltip
      placement="bottom"
      overlayClassName={css`
        background-color: transparent;
        .rc-tooltip-inner {
          background-color: transparent;
          padding: 0;
          border: none;
        }
      `}
      overlay={<ContextMenu {...configContextMenu} />}
      visible={contextMenu?.data.id === data.id}
      onVisibleChange={(visible) => {
        if (!visible) {
          setContextMenu(null);
        }
      }}
      destroyTooltipOnHide
    >
      <motion.div
        data-id={data.id}
        data-index={itemIndex}
        data-parent-ids={parentIds?.join(',')}
        data-children-length={childrenLength}
        onClick={() => onClick?.(data)}
        className={cx(disabledDrag && 'drag-disabled', className)}
      >
        {children ?? <SortableItemDefaultContent {...props} />}
      </motion.div>
    </RcTooltip>
  );
};

export default SortableItem;
