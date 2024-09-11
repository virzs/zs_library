import { css, cx } from '@emotion/css';
import Dialog from 'rc-dialog';
import { useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { useSortableConfig } from '../../context/config/hooks';
import { useSortableState } from '../../context/state/hooks';
import { ghostClass } from '../../style';
import { SortItem } from '../../types';
import SortableUtils from '../../utils';
import SortableItem from '../SortableItem';

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

  const { theme } = useSortableConfig();

  const { light, dark } = SortableUtils.getTheme(theme);

  const [name, setName] = useState('文件夹');

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
            @media (prefers-color-scheme: dark) {
              color: black;
            }
            &:focus {
              outline: none;
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
        'group-item-modal',
        css`
          .rc-dialog-content {
            background-color: transparent;
            box-shadow: none;
            padding: 0;
            .rc-dialog-header {
              text-align: center;
              background-color: transparent;
              margin-bottom: 1rem;
              border-bottom: none;
              .ant-modal-name {
                color: #fff;
              }
            }
            .rc-dialog-body {
              background-color: ${light.groupItemModalBackgroundColor};
              @media (prefers-color-scheme: dark) {
                background-color: ${dark.groupItemModalBackgroundColor};
              }
              border-radius: 0.5rem;
              overflow: hidden;
            }
          }
        `,
      )}
      width={600}
      destroyOnClose
    >
      <div
        className={css`
          overflow-y: auto;
          max-height: 60vh;
          padding: 1.25rem 0;
        `}
        onDragLeave={(e) => {
          // 获取鼠标指针进入的元素
          const relatedTarget = e.relatedTarget;
          if (!relatedTarget) return;

          if (!e.currentTarget.contains(relatedTarget as any)) {
            // 鼠标确实离开了当前元素
            setTimeout(() => {
              onClose();
            }, 500);
          }
        }}
      >
        <ReactSortable
          className={css`
            display: grid;
            gap: 1rem;
            place-items: center;
            grid-template-columns: repeat(auto-fill, 96px);
            grid-auto-flow: dense;
            grid-auto-rows: 96px;
          `}
          group={{ name: 'nested', pull: true, put: false }}
          animation={150}
          fallbackOnBody
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
            setListStatus('onMove');
            return true;
          }}
          onStart={(e) => {
            const dataset = e.item.dataset;
            if (dataset?.id) {
              setMoveItemId(dataset.id);
            }
            setListStatus('onMove');
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
