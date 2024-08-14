import { css, cx } from '@emotion/css';
import React, { useMemo, useRef } from 'react';
import Slider, { Settings } from 'react-slick';
import { ReactSortable } from 'react-sortablejs';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import SortableGroupItem from './Items/GroupItem';
import GroupItemModal from './Items/Modal/GroupItemModal';
import ItemInfoModal from './Items/Modal/InfoModal';
import SortableItem from './Items/SortableItem';
import { useSortable } from './hook';
import { ghostClass } from './style';
import { SortItem } from './types';

export interface SortableProps<D, C> {
  className?: string;
  pagingLocation?: 'top' | 'bottom' | 'left' | 'right';
  pagingDotsBuilder?: (dots: React.ReactNode) => React.JSX.Element;
  pagingDotBuilder?: (item: SortItem<D, C>, index: number) => React.JSX.Element;
  sliderRef?: React.RefObject<Slider>;
  sliderProps?: Omit<Settings, 'appendDots' | 'customPaging'>;
  onItemClick?: (item: SortItem<D, C>) => void;
  noLetters?: boolean;
  itemBuilder?: (item: SortItem<D, C>) => React.ReactNode;
  itemIconBuilder?: (item: SortItem<D, C>) => React.ReactNode;
}

const Sortable = <D, C>(props: SortableProps<D, C>) => {
  const {
    pagingLocation = 'bottom',
    className,
    pagingDotBuilder,
    pagingDotsBuilder,
    sliderProps,
    sliderRef: _sliderRef,
    onItemClick,
    noLetters,
  } = props;

  const sliderRef = useRef<Slider>(null);
  const sliderDotsRef = useRef<HTMLUListElement>(null);

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

  const paginingLocationCss = useMemo(() => {
    return {
      top: css`
        display: flex;
        flex-direction: column;
        .slick-list {
          order: 1;
        }
        .slick-dots {
          position: static;
        }
      `,
      bottom: css`
        .slick-dots {
          position: static;
        }
      `,
      left: css`
        .slick-dots {
          position: absolute;
          width: auto;
          left: 0;
          top: 0;
          bottom: 0;
          transform: translateX(-100%);
          display: flex;
          justify-content: center;
          align-items: center;
          .slick-dots-default {
            flex-direction: column;
          }
        }
      `,
      right: css`
        .slick-dots {
          position: absolute;
          width: auto;
          right: 0;
          top: 0;
          bottom: 0;
          transform: translateX(100%);
          display: flex;
          justify-content: center;
          align-items: center;
          .slick-dots-default {
            flex-direction: column;
          }
        }
      `,
    }[pagingLocation];
  }, [pagingLocation]);

  return (
    <div>
      <Slider
        arrows={false}
        ref={_sliderRef ?? sliderRef}
        infinite={false}
        dots
        touchMove={false}
        lazyLoad="anticipated"
        className={cx(paginingLocationCss, className)}
        customPaging={(i) => {
          if (pagingDotBuilder) {
            return pagingDotBuilder(list[i], i);
          }
          return (
            <div
              onDragEnter={() => {
                (_sliderRef ?? sliderRef).current?.slickGoTo(i);
              }}
            >
              {list[i]?.data?.name}
            </div>
          );
        }}
        appendDots={(dots) => {
          if (pagingDotsBuilder) {
            return pagingDotsBuilder(dots);
          }
          return (
            <div>
              <ul
                ref={sliderDotsRef}
                className={cx(
                  'slick-dots-default',
                  css`
                    padding: 0.5rem;
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.5rem;
                    background-color: rgba(0, 0, 0, 0.1);
                    border-radius: 0.5rem;
                    .slick-active {
                      background-color: rgba(0, 0, 0, 0.3);
                      color: white;
                      padding: 0.25rem;
                      border-radius: 0.25rem;
                    }
                    li {
                      margin: 0;
                      width: auto;
                      height: auto;
                    }
                  `,
                )}
              >
                {dots}
              </ul>
            </div>
          );
        }}
        {...sliderProps}
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
                    justify-content: center;
                    align-items: center;
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
                          onClick={onItemClick}
                          noLetters={noLetters}
                        />
                      );
                      break;
                    default:
                      el = (
                        <SortableItem
                          key={item.id}
                          data={item}
                          itemIndex={index}
                          onClick={onItemClick}
                          noLetters={noLetters}
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
        onItemClick={onItemClick}
      />
    </div>
  );
};

export default Sortable;
