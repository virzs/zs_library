import { css, cx } from "@emotion/css";
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

  const _children = [...(data?.children ?? [])];

  useEffect(() => {
    if (!data) return;
    setName(data.data?.name);
  }, [data]);
  return (
    <Dialog
      visible={!!data}
      onClose={() => {
        onClose();
      }}
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
            color: white;
            font-weight: 600;
            letter-spacing: 0.025em;
            width: 100%;
            padding: 8px 16px;
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

            &:focus {
              outline: none;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
              transform: scale(1.02);
            }

            &:hover {
              background: rgba(255, 255, 255, 0.05);
            }

            &::placeholder {
              color: rgba(255, 255, 255, 0.6);
            }

            &::selection {
              background: rgba(255, 255, 255, 0.3);
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
        css`
          .rc-dialog-mask {
            background: radial-gradient(
              circle at center,
              rgba(0, 0, 0, 0.4) 0%,
              rgba(0, 0, 0, 0.2) 100%
            );
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            animation: maskFadeIn 0.3s ease-out;
          }

          @keyframes maskFadeIn {
            from {
              opacity: 0;
              backdrop-filter: blur(0px);
              -webkit-backdrop-filter: blur(0px);
            }
            to {
              opacity: 1;
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            }
          }

          .rc-dialog-wrap {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }
          .rc-dialog-content {
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.18) 0%,
              rgba(255, 255, 255, 0.12) 50%,
              rgba(255, 255, 255, 0.08) 100%
            );
            box-shadow: none;
            padding: 0;
            border-radius: 24px;
            overflow: hidden;
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
            position: relative;
            border: 1px solid rgba(255, 255, 255, 0.15);

            /* 多层阴影效果，更贴近iOS */
            box-shadow: 0 32px 64px rgba(0, 0, 0, 0.25),
              0 16px 32px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1),
              0 4px 8px rgba(0, 0, 0, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.15),
              inset 0 -1px 0 rgba(0, 0, 0, 0.05);

            /* 添加外层光晕效果 */
            &::before {
              content: "";
              position: absolute;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.3) 0%,
                rgba(255, 255, 255, 0.1) 50%,
                rgba(255, 255, 255, 0.3) 100%
              );
              border-radius: 26px;
              z-index: -1;
              opacity: 0.5;
            }

            /* 添加内部纹理效果 */
            &::after {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: radial-gradient(
                  circle at 20% 20%,
                  rgba(255, 255, 255, 0.1) 0%,
                  transparent 50%
                ),
                radial-gradient(
                  circle at 80% 80%,
                  rgba(255, 255, 255, 0.05) 0%,
                  transparent 50%
                ),
                linear-gradient(
                  135deg,
                  transparent 40%,
                  rgba(255, 255, 255, 0.02) 50%,
                  transparent 60%
                );
              pointer-events: none;
              border-radius: 24px;
            }

            @keyframes modalSlideIn {
              0% {
                opacity: 0;
                transform: scale(0.7) translateY(40px) rotateX(-15deg);
                filter: blur(8px);
              }
              50% {
                opacity: 0.8;
                transform: scale(1.02) translateY(-5px) rotateX(0deg);
                filter: blur(2px);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateY(0) rotateX(0deg);
                filter: blur(0px);
              }
            }
            .rc-dialog-header {
              text-align: center;
              background: transparent;
              backdrop-filter: blur(24px);
              -webkit-backdrop-filter: blur(24px);
              margin-bottom: 0;
              border-bottom: none;
              padding: 20px 28px 0;
              border-radius: 24px 24px 0 0;
              position: relative;
              z-index: 1;

              /* 添加内部高光效果 */
              &::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(
                  90deg,
                  transparent 0%,
                  rgba(255, 255, 255, 0.3) 50%,
                  transparent 100%
                );
              }

              .ant-modal-name {
                color: #fff;
              }
            }

            .rc-dialog-body {
              background: transparent;
              backdrop-filter: blur(24px);
              -webkit-backdrop-filter: blur(24px);
              border-radius: 0 0 24px 24px;
              overflow: hidden;
              border: none;
              position: relative;
              padding: 24px;
              z-index: 1;
            }
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

          /* iOS风格的滚动条 */
          &::-webkit-scrollbar {
            width: 6px;
          }

          &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }

          &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
            transition: background 0.2s ease;
          }

          &::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
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
              onClose();
            }, 500);
          }
        }}
      >        <ReactSortable
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
  );
};

export default GroupItemModal;
