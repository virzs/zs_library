import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { useListData, useDragState } from "../../context/state/hooks";
import { dragContainerStyle, modalDragConfig } from "../../drag-styles";
import { ghostClass } from "../../style";
import { SortItem } from "../../types";
import SortableItem from "../sortable-item";
import EditableTitle from "./editable-title";
import { BaseModal } from "../../modal";
import { AnimatePresence } from "motion/react";
import { css, cx } from "@emotion/css";
import SortableUtils from "../../utils";

interface GroupItemModalProps<D, C> {
  data: SortItem | null;
  onClose: () => void;
  onItemClick?: (item: SortItem<D, C>) => void;
}

const GroupItemModal = <D, C>(props: GroupItemModalProps<D, C>) => {
  const { data, onClose, onItemClick } = props;
  const { list, setList, updateItem } = useListData();
  const { setListStatus, setMoveItemId, setMoveTargetId } = useDragState();

  const [name, setName] = useState("文件夹");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [rowWidth, setRowWidth] = useState<number>();
  const [rowMarginLeft, setRowMarginLeft] = useState<number>();

  const liveChildren = useMemo(() => {
    if (!data) return [];
    const findChildren = (items: SortItem[]): SortItem[] | undefined => {
      for (const item of items) {
        if (item.id === data.id) return item.children;
        if (item.children) {
          const found = findChildren(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    for (const root of list) {
      if (root.id === data.id) return root.children ?? [];
      if (root.children) {
        const found = findChildren(root.children);
        if (found) return found;
      }
    }
    return data?.children ?? [];
  }, [data, list]);
  const _children = [...liveChildren];

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

  // 计算宽度的函数（传入节点，避免 ref 为空），使用封装工具函数
  const calcWidthFromNode = useCallback((el: HTMLDivElement) => {
    const { width, marginLeft } = SortableUtils.computeRowWidth(el, 112);
    setRowWidth(width);
    setRowMarginLeft(marginLeft);
  }, []);

  // 回调 ref：在节点首次赋值时立即计算，并绑定 ResizeObserver
  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      // 断开旧的观察者
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      containerRef.current = node;
      if (!node) return;

      // 下一帧进行首次计算，确保节点已完成渲染
      window.requestAnimationFrame(() => {
        calcWidthFromNode(node);
      });

      // 监听尺寸变化
      if ("ResizeObserver" in window) {
        const ro = new ResizeObserver(() => {
          calcWidthFromNode(node);
        });
        ro.observe(node);
        resizeObserverRef.current = ro;
      } else {
        const onResize = () => {
          calcWidthFromNode(node);
        };
        globalThis.addEventListener("resize", onResize);
        resizeObserverRef.current = {
          disconnect: () => globalThis.removeEventListener("resize", onResize),
        } as unknown as ResizeObserver;
      }
    },
    [calcWidthFromNode]
  );

  // 当 data 变化（modal 可见）且已有节点时，重新计算一次
  useEffect(() => {
    if (data && containerRef.current) {
      calcWidthFromNode(containerRef.current);
    }
  }, [data, calcWidthFromNode]);

  return (
    <BaseModal
      className={css`
        .rc-dialog-body {
          padding: 0;
        }
      `}
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
      <div ref={setContainerRef} className="zs-min-h-96 zs-px-4" onDragLeave={handleDragLeave}>
        <ReactSortable
          className={cx("zs-grid zs-place-items-center zs-grid-flow-row-dense zs-mx-auto", dragContainerStyle)}
          style={{ width: rowWidth, marginLeft: rowMarginLeft }}
          {...modalDragConfig}
          list={liveChildren}
          setList={(x) => {
            const xIds = x.map((item) => item.id);
            const parentChildrenIds = liveChildren.map((item) => item.id);
            if (
              xIds.length === parentChildrenIds?.length &&
              xIds.every((id, index) => id === parentChildrenIds[index])
            ) {
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
              return (
                <div className="zs-w-28 zs-h-28 zs-flex zs-items-center zs-justify-center" key={item.id}>
                  <SortableItem key={item.id} data={item} itemIndex={index} onClick={onItemClick} />
                </div>
              );
            })}
          </AnimatePresence>
        </ReactSortable>
      </div>
    </BaseModal>
  );
};

export default GroupItemModal;
