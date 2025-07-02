import { useMemo } from "react";
import { css, cx } from "@emotion/css";
import { SortItem } from "./types";
import SortableItem from "./items/sortable-item";
import SortableGroupItem from "./items/group-item";
import BaseModal from "./items/modal/base-modal";
import { useSortableState } from "./context/state/hooks";
import { mainDragContainerStyle } from "./drag-styles";

export interface LaunchpadModalProps<D, C> {
  /**
   * 是否显示启动台
   */
  visible: boolean;
  /**
   * 关闭启动台
   */
  onClose: () => void;
  /**
   * 项目点击事件
   */
  onItemClick?: (item: SortItem<D, C>) => void;
}

const LaunchpadModal = <D, C>({ visible, onClose, onItemClick }: LaunchpadModalProps<D, C>) => {
  const { list } = useSortableState();
  const allApps = useMemo(() => {
    if (!list || list.length === 0) {
      return [];
    }

    return list.flatMap((page: SortItem<D, C>) => (page.children ? page.children.map((child) => ({ ...child })) : []));
  }, [list]);

  const contentStyle = css`
    display: flex;
    flex-direction: column;
    height: 80vh;
    max-height: 800px;
  `;

  return (
    <BaseModal visible={visible} onClose={onClose} title="启动台" width={1000}>
      <div className={contentStyle}>
        <div className={cx(mainDragContainerStyle)}>
          {allApps.map((item, index) => {
            const ItemComponent = item.type === "group" || item.type === "app" ? SortableGroupItem : SortableItem;

            return (
              <ItemComponent
                key={item.id}
                data={item}
                itemIndex={index}
                parentIds={[]}
                onClick={onItemClick}
                disabledDrag={true}
              />
            );
          })}
        </div>
      </div>

      {allApps.length === 0 && (
        <div
          className={cx(
            "zs-flex-1 flex zs-items-center zs-justify-center",
            css`
              color: #999;
              font-size: 18px;
            `
          )}
        >
          暂无应用
        </div>
      )}
    </BaseModal>
  );
};

export default LaunchpadModal;
