import { css, cx } from '@emotion/css';
import React from 'react';
import Slider from 'react-slick';
import { ReactSortable } from 'react-sortablejs';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import ContextMenu from './ContextMenu';
import SortableGroupItem from './Items/GroupItem';
import GroupItemModal from './Items/Modal/GroupItemModal';
import ItemInfoModal from './Items/Modal/InfoModal';
import SortableItem from './Items/SortableItem';
import { useSortable } from './hook';
import { ghostClass } from './style';

const Sortable = () => {
  const {
    list,
    setList,
    setListStatus,
    showInfoItemData,
    setShowInfoItemData,
    openGroupItemData,
    setOpenGroupItemData,
    setMoveItemId,
    setMoveTargetId,
  } = useSortable();

  return (
    <>
      <Slider
        dots
        touchMove={false}
        lazyLoad="anticipated"
        className={css`
          .slick-dots {
            position: static;
          }
        `}
        customPaging={(i) => {
          return <div>{list[i].data?.name}</div>;
        }}
        appendDots={(dots) => {
          return (
            <div>
              <ul
                className={css`
                  padding: 0.5rem;
                  display: inline-flex;
                  justify-content: center;
                  align-items: center;
                  gap: 0.5rem;
                  background-color: rgba(0, 0, 0, 0.1);
                  border-radius: 0.5rem;
                  li {
                    width: auto;
                    height: auto;
                  }
                `}
              >
                {dots}
              </ul>
            </div>
          );
        }}
      >
        {list.map((l) => {
          return (
            <div key={l.id}>
              <ReactSortable
                className={cx(
                  css`
                    display: grid;
                    transition: all 0.3s;
                    grid-template-columns: repeat(auto-fill, 96px);
                    grid-auto-flow: dense;
                    grid-auto-rows: 96px;
                    place-items: center;
                  `,
                )}
                animation={150}
                fallbackOnBody
                swapThreshold={0.65}
                group="nested"
                list={l.children ?? []}
                setList={(e) => setList(e, [l.id])}
                filter=".drag-disabled"
                onMove={(e) => {
                  setListStatus('onMove');
                  const { dragged, related } = e;
                  const draggedData = dragged.dataset;
                  const relatedData = related.dataset;
                  setMoveTargetId(null);
                  // 限制只有一层
                  // sortable-group-item 标记为文件夹
                  if (
                    (Object.keys(relatedData).length === 0 ||
                      relatedData.parentIds) &&
                    Number(draggedData.childrenLength) > 0 &&
                    related.classList.contains('sortable-group-item')
                  ) {
                    return false;
                  }
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
                {(l.children ?? []).map((item, index) => {
                  let el;

                  switch (item.type) {
                    case 'group':
                    case 'app':
                      el = (
                        <SortableGroupItem
                          key={item.id}
                          data={item}
                          itemIndex={index}
                          parentIds={[l.id, item.id]}
                        />
                      );
                      break;
                    default:
                      el = (
                        <SortableItem
                          key={item.id}
                          data={item}
                          itemIndex={index}
                        />
                      );
                      break;
                  }

                  return el;
                })}
              </ReactSortable>
            </div>
          );
        })}
      </Slider>

      {/* 右键菜单 */}
      <ContextMenu />

      {/* 单个item信息弹窗 */}
      <ItemInfoModal
        data={showInfoItemData}
        onClose={() => {
          setShowInfoItemData(null);
        }}
      />

      {/* GroupModal 点击展开弹窗 */}
      <GroupItemModal
        data={openGroupItemData}
        onClose={() => {
          setOpenGroupItemData(null);
        }}
      />
    </>
  );
};

export default Sortable;
