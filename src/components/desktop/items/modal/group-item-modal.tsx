import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { useSortableState } from "../../context/state/hooks";
import { dragContainerStyle, modalDragConfig } from "../../drag-styles";
import { ghostClass } from "../../style";
import { SortItem } from "../../types";
import SortableItem from "../sortable-item";
import EditableTitle from "./editable-title";
import { BaseModal } from "../../modal";
import { AnimatePresence } from "motion/react";

interface GroupItemModalProps<D, C> {
  data: SortItem | null;
  onClose: () => void;
  onItemClick?: (item: SortItem<D, C>) => void;
}

const GroupItemModal = <D, C>(props: GroupItemModalProps<D, C>) => {
  const { data, onClose, onItemClick } = props;
  const { list, setList, setListStatus, setMoveItemId, setMoveTargetId, updateItem } = useSortableState();

  const [name, setName] = useState("文件夹");

  const _children = [...(data?.children ?? [])];

  useEffect(() => {
    if (!data) return;
    setName(data.data?.name);
  }, [data]);

  const handleTitleChange = (newName: string) => {
    setName(newName);
  };

  const handleTitleBlur = () => {
    if (!data) return;
    updateItem(data.id!, {
      ...data.data,
      name,
    });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // 获取鼠标指针进入的元素
    const relatedTarget = e.relatedTarget;
    if (!relatedTarget) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!e.currentTarget.contains(relatedTarget as any)) {
      // 鼠标确实离开了当前元素
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  return (
    <BaseModal
      visible={!!data}
      onClose={onClose}
      title={<EditableTitle value={name} onChange={handleTitleChange} onBlur={handleTitleBlur} placeholder="文件夹" />}
      mousePosition={
        data?.pageX && data?.pageY
          ? {
              x: data?.pageX,
              y: data?.pageY,
            }
          : null
      }
    >
      <div className="zs-min-h-96" onDragLeave={handleDragLeave}>
        <ReactSortable
          className={dragContainerStyle}
          {...modalDragConfig}
          list={data?.children ?? []}
          setList={(x) => {
            const xIds = x.map((item) => item.id);
            const parentChildrenIds = list.find((item) => item.id === data?.id)?.children?.map((item) => item.id);
            // ! 如果ids个数相同，顺序相同 return，优化性能
            if (
              xIds.length === parentChildrenIds?.length &&
              xIds.every((id, index) => id === parentChildrenIds[index])
            ) {
              return;
            }

            // ! 解决文件夹中移出再移入会触发setList导致元素丢失bug
            if (xIds.length < (parentChildrenIds?.length ?? 0)) {
              return;
            }

            setList(x, [...(data?.parentIds ?? []), data?.id]);
          }}
          onMove={() => {
            setMoveTargetId(null);
            setListStatus("onMove");
            return true;
          }}
          onStart={(e) => {
            const dataset = e.item.dataset;
            if (dataset?.id) {
              setMoveItemId(dataset.id);
            }
            setListStatus("onMove");
          }}
          onEnd={() => {
            setMoveItemId(null);
            setMoveTargetId(null);
            setListStatus(null);
          }}
          ghostClass={ghostClass}
        >
          <AnimatePresence mode="popLayout">
            {_children.map((item, index) => {
              return <SortableItem key={item.id} data={item} itemIndex={index} onClick={onItemClick} />;
            })}
          </AnimatePresence>
        </ReactSortable>
      </div>
    </BaseModal>
  );
};

export default GroupItemModal;
