import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import { ReactSortable } from "react-sortablejs";
import { getItemSize } from "../config";
import { useSortableConfig } from "../context/config/hooks";
import { useSortableState } from "../context/state/hooks";
import { SortItem } from "../types";
import { renderIcon } from "../utils/render-icon";
import ItemName from "./item-name";
import SortableItem, { SortableItemProps } from "./sortable-item";
import ItemContent from "./item-content";

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
    icon,
    iconSize = 64,
  } = props;
  const { setList, listStatus, longPressTriggered, setMoveTargetId, setOpenGroupItemData, contextMenuFuns } =
    useSortableState();

  const {
    itemIconBuilder: configItemIconBuilder,
    itemIconBuilderAllowNull: configItemIconBuilderAllowNull,
    theme,
    typeConfigMap,
    contextMenu,
  } = useSortableConfig();

  const { children } = data;

  const { row, col } = getItemSize(data.type, data.config?.sizeId, typeConfigMap);

  // 是否为空
  const childrenEmpty = (children?.length ?? 0) === 0;

  // 截取前 9 个
  const _children = !childrenEmpty ? [...(children ?? [])]?.slice(0, 9) : [data];

  const childrenIconCss = css`
    overflow: hidden;
    cursor: pointer;
    background-color: ${theme.token.items?.iconBackgroundColor};
    box-shadow: 0 0 0.5rem ${theme.token.items?.iconShadowColor};
  `;

  const sizedContent = () => {
    /** type app */
    if (childrenEmpty) {
      return (
        <motion.div
          className={cx(
            "sortable-group-item zs-cursor-pointer zs-w-full zs-h-full zs-absolute zs-left-0 zs-top-0 zs-bottom-0 zs-right-0 zs-overflow-hidden",
            css`
              background-color: ${theme.token.items?.iconBackgroundColor};
              border-radius: 0.75rem;
            `
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(data);
          }}
        >
          {renderIcon(data, icon, configItemIconBuilderAllowNull, configItemIconBuilder)}
        </motion.div>
      );
    }
    if ((row === 1 && col === 1) || (row === 2 && col === 2)) {
      return (
        <motion.div
          className={cx(
            "zs-grid zs-w-full zs-h-full zs-grid-cols-3 zs-grid-rows-3 zs-place-items-center",
            css`
              padding: ${col === 1 ? "0.125rem" : "0.25rem"};
              gap: ${col === 1 ? "0.125rem" : "0.5rem"};
            `
          )}
        >
          {_children?.slice(0, 9).map((i) => (
            <motion.div
              key={i.id}
              className={cx(
                childrenIconCss,
                "zs-w-full zs-h-full",
                css`
                  border-radius: ${col === 1 ? "0.25rem" : "0.5rem"};
                `
              )}
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(i);
              }}
            >
              {renderIcon(i, undefined, configItemIconBuilderAllowNull, configItemIconBuilder)}
            </motion.div>
          ))}
        </motion.div>
      );
    }
    if (row === 1 && col === 2) {
      return (
        <motion.div className="zs-grid zs-grid-cols-10 zs-grid-rows-4 zs-gap-x-2 zs-gap-y-1 zs-place-items-center zs-w-36 h-[52px]">
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
              {renderIcon(i, undefined, configItemIconBuilderAllowNull, configItemIconBuilder)}
            </motion.div>
          ))}
        </motion.div>
      );
    }
    if (row === 2 && col === 1) {
      return (
        <motion.div className="zs-grid zs-grid-cols-4 zs-grid-rows-10 zs-gap-x-1 zs-gap-y-2 w-[52px] zs-h-36 zs-place-items-center">
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
              {renderIcon(i, undefined, configItemIconBuilderAllowNull, configItemIconBuilder)}
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
      className={cx(className)}
    >
      <ItemContent
        data={data}
        iconSize={iconSize}
        className={css`
          background-color: ${theme.token.items?.groupIconBackgroundColor};
          box-shadow: 0 0 0.5rem ${theme.token.items?.groupIconShadowColor};
        `}
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
          className={cx(
            "zs-relative zs-w-full zs-h-full flex zs-items-center zs-justify-center",
            css`
              padding: 0.375rem;
            `
          )}
        >
          {sizedContent()}
          {/* 需要设置宽高小于父元素，否则在拖拽时会始终响应子列表 */}
          <ReactSortable
            className={cx(
              "sortable-group-item",
              "zs-absolute zs-cursor-pointer",
              css`
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
              if (!disabledDrag) setMoveTargetId(data.id);
            }}
          ></ReactSortable>
        </motion.div>
      </ItemContent>
      <ItemName data={data} noLetters={noLetters} defaultName="文件夹" />
    </SortableItem>
  );
};

export default SortableGroupItem;
