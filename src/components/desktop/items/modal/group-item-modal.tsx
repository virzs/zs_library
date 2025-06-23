import { css, cx } from "@emotion/css";
import { AnimatePresence } from "framer-motion";
import Dialog from "rc-dialog";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { useSortableState } from "../../context/state/hooks";
import { dragContainerStyle, modalDragConfig } from "../../drag-styles";
import { ghostClass } from "../../style";
import { SortItem } from "../../types";
import SortableItem from "../sortable-item";

interface GroupItemModalProps<D, C> {
  data: SortItem | null;
  onClose: () => void;
  onItemClick?: (item: SortItem<D, C>) => void;
}

const GroupItemModal = <D, C>(props: GroupItemModalProps<D, C>) => {
  const { data, onClose, onItemClick } = props;
  const {
    list,
    setList,
    setListStatus,
    setMoveItemId,
    setMoveTargetId,
    updateItem,
  } = useSortableState();

  const [name, setName] = useState("文件夹");
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const _children = [...(data?.children ?? [])];

  useEffect(() => {
    if (!data) return;
    setName(data.data?.name);
    setVisible(true);
  }, [data]);

  useEffect(() => {
    if (!data) {
      setVisible(false);
    }
  }, [data]);

  const handleClose = () => {
    setIsClosing(true);
    setVisible(false);
    // 延迟执行 onClose，让关闭动画有时间播放
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // 与动画时长保持一致
  };

  return (
    <AnimatePresence>
      {data && (
        <Dialog
          visible={visible}
          onClose={handleClose}
          animation="zoom"
          maskAnimation="fade"
          mousePosition={
            data?.pageX && data?.pageY
              ? {
                  x: data?.pageX,
                  y: data?.pageY,
                }
              : null
          }
          title={
            <input
              className={css`
                background-color: transparent;
                border-style: none;
                text-align: center;
                font-size: 1.25rem;
                line-height: 1.75rem;
                color: #1d1d1f;
                font-weight: 600;
                letter-spacing: -0.5px;
                width: 100%;
                padding: 8px 16px;
                border-radius: 8px;
                transition: all 0.2s ease-out;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
                  sans-serif;

                &:focus {
                  outline: none;
                  background: rgba(0, 0, 0, 0.06);
                  backdrop-filter: blur(8px);
                  -webkit-backdrop-filter: blur(8px);
                  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
                  transform: scale(1.02);
                }

                &:hover {
                  background: rgba(0, 0, 0, 0.03);
                }

                &::placeholder {
                  color: rgba(29, 29, 31, 0.6);
                }

                &::selection {
                  background: rgba(0, 122, 255, 0.3);
                }
              `}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              onBlur={() => {
                if (!data) return;
                updateItem(data.id!, {
                  ...data.data,
                  name,
                });
              }}
            />
          }
          footer={null}
          closable={false}
          className={cx(
            "group-item-modal",
            { "modal-closing": isClosing },
            css`
              .rc-dialog-mask {
                background: rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                animation: maskFadeIn 0.2s ease-out;
              }

              @keyframes maskFadeIn {
                from {
                  opacity: 0;
                  backdrop-filter: blur(0px);
                  -webkit-backdrop-filter: blur(0px);
                }
                to {
                  opacity: 1;
                  backdrop-filter: blur(20px);
                  -webkit-backdrop-filter: blur(20px);
                }
              }

              .rc-dialog-wrap {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px;
              }
              .rc-dialog-content {
                background: rgba(255, 255, 255, 0.77);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15),
                  0 0 0 0.75px rgba(255, 255, 255, 0.25);
                border: 0.75px solid rgba(255, 255, 255, 0.3);
                padding: 0;
                border-radius: 16px;
                overflow: hidden;
                animation: modalSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1);
                position: relative;
              }
              @keyframes modalSlideIn {
                0% {
                  opacity: 0;
                  transform: scale(0.85) translateY(12px);
                }
                100% {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }

              @keyframes modalSlideOut {
                0% {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
                100% {
                  opacity: 0;
                  transform: scale(0.85) translateY(12px);
                }
              }

              @keyframes maskFadeOut {
                from {
                  opacity: 1;
                  backdrop-filter: blur(20px);
                  -webkit-backdrop-filter: blur(20px);
                }
                to {
                  opacity: 0;
                  backdrop-filter: blur(0px);
                  -webkit-backdrop-filter: blur(0px);
                }
              }

              /* 关闭动画 */
              &.modal-closing {
                .rc-dialog-mask {
                  animation: maskFadeOut 0.3s ease-out forwards;
                }
                .rc-dialog-content {
                  animation: modalSlideOut 0.3s
                    cubic-bezier(0.175, 0.885, 0.32, 1) forwards;
                }
              }

              .rc-dialog-header {
                text-align: center;
                background: transparent;
                margin-bottom: 0;
                border-bottom: none;
                padding: 20px 24px 0;
                border-radius: 16px 16px 0 0;
                position: relative;

                .ant-modal-name {
                  color: #fff;
                }
              }

              .rc-dialog-body {
                background: transparent;
                border-radius: 0 0 16px 16px;
                overflow: hidden;
                border: none;
                position: relative;
                padding: 20px;
              }
            `
          )}
          width={600}
          destroyOnClose
        >
          <div
            className={css`
              overflow-y: auto;
              max-height: 60vh;
              position: relative;

              /* iOS 26风格的滚动条 */
              &::-webkit-scrollbar {
                width: 4px;
              }

              &::-webkit-scrollbar-track {
                background: transparent;
              }

              &::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 2px;
                transition: background 0.2s ease;
              }

              &::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 0, 0, 0.3);
              }
            `}
            onDragLeave={(e) => {
              // 获取鼠标指针进入的元素
              const relatedTarget = e.relatedTarget;
              if (!relatedTarget) return;

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (!e.currentTarget.contains(relatedTarget as any)) {
                // 鼠标确实离开了当前元素
                setTimeout(() => {
                  handleClose();
                }, 500);
              }
            }}
          >
            <ReactSortable
              className={dragContainerStyle}
              {...modalDragConfig}
              list={data?.children ?? []}
              setList={(x) => {
                const xIds = x.map((item) => item.id);
                const parentChildrenIds = list
                  .find((item) => item.id === data?.id)
                  ?.children?.map((item) => item.id);
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
              {_children.map((item, index) => {
                return (
                  <SortableItem
                    key={item.id}
                    data={item}
                    itemIndex={index}
                    onClick={onItemClick}
                  />
                );
              })}
            </ReactSortable>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default GroupItemModal;
