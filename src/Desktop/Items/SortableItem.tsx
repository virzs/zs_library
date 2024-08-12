import { css, cx } from '@emotion/css';
import { motion } from 'framer-motion';
import React from 'react';
import { useSortable } from '../hook';
import { SortItem, SortItemBaseData } from '../types';

export interface SortableItemProps<D, C> {
  data: SortItem<D, C>;
  className?: string;
  itemIndex: number;
  showTitle?: boolean;
  onClick?: () => void;
  disabledDrag?: boolean;
  children?: React.ReactNode;
  parentIds?: string;
  childrenLength?: number;
}

export const SortableItemDefaultContent = <D, C>(
  props: SortableItemProps<D, C>,
) => {
  const { data, showTitle } = props;

  const { contextMenuFuns } = useSortable();

  const { data: itemData = {} } = data;

  const { name } = itemData as D & SortItemBaseData;

  return (
    <>
      <motion.div
        className={css`
          width: 4rem;
          height: 4rem;
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
          cursor: pointer;
          position: relative;
          @media (prefers-color-scheme: dark) {
            background-color: #1a1a1a;
            box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.5);
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
          `}
          {...contextMenuFuns(data)}
        ></div>
      </motion.div>
      <motion.p
        className={cx(
          css`
            text-align: center;
            margin-top: 0.25rem;
            margin-bottom: 0;
          `,
          showTitle
            ? ''
            : css`
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

  return (
    <motion.div
      data-id={data.id}
      data-index={itemIndex}
      data-parent-ids={parentIds}
      data-children-length={childrenLength}
      onClick={onClick}
      className={cx(disabledDrag && 'drag-disabled', className)}
    >
      {children ?? <SortableItemDefaultContent {...props} />}
    </motion.div>
  );
};

export default SortableItem;
