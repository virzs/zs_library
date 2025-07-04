import { css, cx } from "@emotion/css";
import { motion } from "framer-motion";
import React, { useMemo } from "react";
import { ReactSortable } from "react-sortablejs";
import { useSortableConfig } from "../context/config/hooks";
import { useSortableState } from "../context/state/hooks";
import { SortItem, SortItemBaseConfig, SortItemBaseData } from "../types";
import SortableItem, { SortableItemProps } from "./sortable-item";

export interface SortableGroupItemProps<D, C> extends SortableItemProps<D, C> {
  data: SortItem<D, C>;
}

const SortableGroupItem = <D, C>(props: SortableGroupItemProps<D, C>) => {
  const {
    data,
    className,
    parentIds,
    itemIndex,
    onClick,
    noLetters = false,
    disabledDrag = false,
  } = props;
  const {
    contextMenuFuns,
    setList,
    setOpenGroupItemData,
    longPressTriggered,
    moveItemId,
    moveTargetId,
    setMoveTargetId,
    listStatus,
  } = useSortableState();

  const { itemIconBuilder, theme, contextMenu } = useSortableConfig();

  const { children, data: itemData, config: itemConfig } = data;

  const { row = 1, col = 1 } = (itemConfig ?? {}) as SortItemBaseConfig;

  const variants = {
    visible: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0.95 },
  };

  // 是否为空
  const childrenEmpty = (children?.length ?? 0) === 0;

  // 截取前 9 个
  const _children = !childrenEmpty
    ? [...(children ?? [])]?.slice(0, 9)
    : [data];

  const isMove = useMemo(() => {
    return moveItemId === data.id.toString();
  }, [data.id, moveItemId]);

  const isMoveTarget = useMemo(() => {
    return moveTargetId === data.id;
  }, [data.id, moveTargetId]);

  const childrenIconCss = css`
    overflow: hidden;
    cursor: pointer;
    background-color: ${theme.token.itemIconBackgroundColor};
    box-shadow: 0 0 0.5rem ${theme.token.itemIconShadowColor};
  `;

  const sizedContent = () => {
    /** type app */
    if (childrenEmpty) {
      return (
        <motion.div
          className={cx(
            "sortable-group-item",
            css`
              overflow: hidden;
              cursor: pointer;
              width: 100%;
              height: 100%;
              background-color: ${theme.token.itemIconBackgroundColor};
              position: absolute;
              left: 0;
              top: 0;
              border-radius: 0.75rem;
            `
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(data);
          }}
        >
          {itemIconBuilder?.(data)}
        </motion.div>
      );
    }
    if ((row === 1 && col === 1) || (row === 2 && col === 2)) {
      return (
        <motion.div
          className={css`
            display: grid;
            width: 100%;
            height: 100%;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            grid-template-rows: repeat(3, minmax(0, 1fr));
            padding: ${col === 1 ? "0.125rem" : "0.25rem"};
            gap: ${col === 1 ? "0.125rem" : "0.5rem"};
            place-items: center;
          `}
        >
          {_children?.slice(0, 9).map((i) => (
            <motion.div
              key={i.id}
              className={cx(
                childrenIconCss,
                css`
                  border-radius: ${col === 1 ? "0.25rem" : "0.5rem"};
                  width: 100%;
                  height: 100%;
                `
              )}
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(i);
              }}
            >
              {itemIconBuilder?.(i)}
            </motion.div>
          ))}
        </motion.div>
      );
    }
    if (row === 1 && col === 2) {
      return (
        <motion.div
          className={css`
            display: grid;
            grid-template-columns: repeat(10, minmax(0, 1fr));
            grid-template-rows: repeat(4, minmax(0, 1fr));
            column-gap: 0.5rem;
            row-gap: 0.25rem;
            width: 144px;
            height: 52px;
            place-items: center;
          `}
        >
          {_children?.slice(0, 4).map((i, j) => (
            <motion.div
              key={i.id}
              className={cx(
                childrenIconCss,
                j < 2
                  ? css`
                      width: 52px;
                      height: 52px;
                      border-radius: 0.5rem;
                      grid-column: span 4 / span 4;
                      grid-row: span 4 / span 4;
                    `
                  : css`
                      width: 1.5rem;
                      height: 1.5rem;
                      border-radius: 0.375rem;
                      grid-column: span 2 / span 2;
                      grid-row: span 2 / span 2;
                    `
              )}
              onClick={(e) => {
                if (j > 2) return;
                e.stopPropagation();
                onClick?.(i);
              }}
            >
              {itemIconBuilder?.(i)}
            </motion.div>
          ))}
        </motion.div>
      );
    }
    if (row === 2 && col === 1) {
      return (
        <motion.div
          className={css`
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            grid-template-rows: repeat(10, minmax(0, 1fr));
            column-gap: 0.25rem;
            row-gap: 0.5rem;
            width: 52px;
            height: 144px;
            place-items: center;
          `}
        >
          {_children?.slice(0, 4).map((i, j) => (
            <motion.div
              key={i.id}
              className={cx(
                childrenIconCss,
                j < 2
                  ? css`
                      width: 52px;
                      height: 52px;
                      border-radius: 0.5rem;
                      grid-column: span 4 / span 4;
                      grid-row: span 4 / span 4;
                    `
                  : css`
                      width: 1.5rem;
                      height: 1.5rem;
                      grid-column: span 2 / span 2;
                      grid-row: span 2 / span 2;
                    `
              )}
              onClick={(e) => {
                if (j > 2) return;
                e.stopPropagation();
                onClick?.(i);
              }}
            >
              {itemIconBuilder?.(i)}
            </motion.div>
          ))}
        </motion.div>
      );
    }
  };

  return (
    <SortableItem
      data={data}
      itemIndex={itemIndex}
      parentIds={parentIds}
      childrenLength={children?.length}
      className={cx(
        css`
          grid-row: span ${row};
          grid-column: span ${col};
        `,
        className
      )}
    >
      <motion.div
        whileTap={{ scale: 0.9 }}
        className={cx(
          isMoveTarget ? "!scale-110" : "",
          css`
            cursor: pointer;
            position: relative;
            border-radius: 0.75rem;
            background-color: ${theme.token.groupItemIconBackgroundColor};
            box-shadow: 0 0 0.5rem ${theme.token.groupItemIconShadowColor};
            /* overflow: hidden; */
            transition: all 0.3s;
            margin: 0 auto;
            width: ${col * 64 + 32 * (col - 1)}px;
            height: ${row * 64 + 32 * (row - 1)}px;
          `
        )}
        onClick={(e: React.MouseEvent) => {
          if (!childrenEmpty && !longPressTriggered) {
            data.parentIds = parentIds;
            data.pageX = e.pageX;
            data.pageY = e.pageY;
            setOpenGroupItemData(data);
          }
        }}
        {...contextMenuFuns(data, contextMenu !== false)}
      >
        <motion.div
          className={css`
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0.375rem;
          `}
        >
          {sizedContent()}
          {/* 需要设置宽高小于父元素，否则在拖拽时会始终响应子列表 */}
          <ReactSortable
            className={cx(
              "sortable-group-item",
              css`
                position: absolute;
                cursor: pointer;
                left: 0.375rem;
                top: 0.375rem;
                width: calc(100% - 0.75rem);
                height: calc(100% - 0.75rem);
                pointer-events: ${listStatus === null ? "none" : "auto"};
                > * {
                  opacity: 0;
                }
              `
            )}
            group={{ name: "nested", pull: false, put: true }}
            animation={150}
            fallbackOnBody
            list={children ?? []}
            setList={(x) => !disabledDrag && setList(x, parentIds)}
            // 只能移入，文件夹中的不能响应拖拽事件
            filter={() => true}
            disabled={disabledDrag}
            data-id={data.id}
            onChange={() => {
              !disabledDrag && setMoveTargetId(data.id);
            }}
          ></ReactSortable>
        </motion.div>
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
        variants={variants}
        animate={isMove ? "hidden" : "visible"}
      >
        {(itemData as SortItemBaseData)?.name ?? "文件夹"}
      </motion.p>
    </SortableItem>
  );
};

export default SortableGroupItem;
