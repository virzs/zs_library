import { css, cx } from "@emotion/css";
import React, { useMemo, useRef, useState } from "react";
import Slider, { Settings } from "react-slick";
import { ReactSortable } from "react-sortablejs";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { useSortableConfig } from "./context/config/hooks";
import { useSortableState } from "./context/state/hooks";
import DragTriggerPagination, {
  DragTriggerPaginationRef,
} from "./drag-trigger-pagination";
import { mainDragContainerStyle, mainDragConfig } from "./drag-styles";
import SortableGroupItem from "./items/group-item";
import GroupItemModal from "./items/modal/group-item-modal";
import ItemInfoModal from "./items/modal/info-modal";
import SortableItem from "./items/sortable-item";
import Pagination from "./pagination";
import { createCustomPagingDot } from "./pagination/utils";
import { ghostClass } from "./style";
import { SortItem } from "./types";
import SortableUtils from "./utils";
import Dock, { DockItem, DockProps } from "./dock";
import LaunchpadModal from "./launchpad-modal";

export interface Pagination {
  position?: "top" | "bottom" | "left" | "right";
}

export interface SortableProps<D, C> {
  /**
   * className
   */
  className?: string;
  /**
   * 分页
   */
  pagination?: Pagination | false;
  /**
   * slider ref
   */
  sliderRef?: React.RefObject<Slider>;
  /**
   * 自定义 slider 配置
   * @see https://react-slick.neostack.com/docs/api
   */
  sliderProps?: Omit<Settings, "appendDots" | "customPaging">;
  /**
   * 点击 item 事件
   */
  onItemClick?: (item: SortItem<D, C>) => void;
  /**
   * 自定义额外项目，将显示在子项列表末尾
   */
  extraItems?: (listItem: SortItem<D, C>) => React.ReactNode;
  /**
   * dock 配置
   */
  dock?: {
    /**
     * 是否显示 dock
     */
    enabled?: boolean;
    /**
     * dock 位置
     */
    position?: "top" | "bottom" | "left" | "right";
    /**
     * dock 项目列表
     */
    items?: DockItem[];
    /**
     * dock 样式类名
     */
    className?: string;
    /**
     * dock 项目点击事件
     */
    onItemClick?: (item: DockItem) => void;
    /**
     * 自定义 dock 项目渲染
     */
    itemBuilder?: DockProps["itemBuilder"];
    /**
     * 是否显示启动台按钮
     */
    showLaunchpad?: boolean;
  };
}

// 创建一个安全的渲染包装组件
const SafeExtraItems = <D, C>({
  renderFn,
  item,
}: {
  renderFn?: (item: SortItem<D, C>) => React.ReactNode;
  item: SortItem<D, C>;
}) => {
  if (!renderFn) return null;

  try {
    const content = renderFn(item);
    return <>{content}</>;
  } catch (error) {
    console.error("Error in SafeExtraItems:", error);
    return null;
  }
};

const Sortable = <D, C>(props: SortableProps<D, C>) => {
  const {
    pagination = { position: "bottom" },
    className,
    sliderProps,
    sliderRef: _sliderRef,
    onItemClick,
    extraItems,
    dock = {
      enabled: true,
      position: "bottom",
      items: [],
      showLaunchpad: true,
    },
  } = props;

  const sliderRef = useRef<Slider>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragTriggerPaginationRef = useRef<DragTriggerPaginationRef>(null);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);

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
    addItem,
  } = useSortableState();

  const { pagingDotBuilder, pagingDotsBuilder, itemBuilder } =
    useSortableConfig();

  const paginingLocationCss = useMemo(() => {
    if (pagination === false) {
      return {};
    }

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
    }[pagination.position ?? "bottom"];
  }, [pagination]);

  // Dock 布局样式
  const dockLayoutCss = useMemo(() => {
    if (!dock.enabled) {
      return {};
    }

    const position = dock.position ?? "bottom";

    return {
      top: css`
        display: flex;
        flex-direction: column;
        .dock-container {
          order: 0;
          padding: 16px;
        }
        .sortable-container {
          order: 1;
          flex: 1;
        }
      `,
      bottom: css`
        display: flex;
        flex-direction: column;
        .sortable-container {
          order: 0;
          flex: 1;
        }
        .dock-container {
          order: 1;
          padding: 16px;
        }
      `,
      left: css`
        display: flex;
        flex-direction: row;
        .dock-container {
          order: 0;
          padding: 16px;
          display: flex;
          align-items: center;
        }
        .sortable-container {
          order: 1;
          flex: 1;
        }
      `,
      right: css`
        display: flex;
        flex-direction: row;
        .sortable-container {
          order: 0;
          flex: 1;
        }
        .dock-container {
          order: 1;
          padding: 16px;
          display: flex;
          align-items: center;
        }
      `,
    }[position];
  }, [dock]);

  return (
    <>
      <div
        ref={containerRef}
        className={cx(
          css`
            position: relative;
            width: 100%;
            height: 100%;
          `,
          dockLayoutCss
        )}
        onDragOver={(e) => {
          e.preventDefault();
          // 触发拖拽移动处理
          if (dragTriggerPaginationRef.current) {
            dragTriggerPaginationRef.current.handleDragMove(e);
          }
        }}
      >
        {/* Dock 组件 */}
        {dock.enabled && (
          <div className="dock-container">
            <Dock
              items={dock.items}
              position={dock.position}
              className={dock.className}
              onItemClick={dock.onItemClick}
              itemBuilder={dock.itemBuilder}
              showLaunchpad={dock.showLaunchpad}
              onLaunchpadClick={() => setShowLaunchpad(true)}
            />
          </div>
        )}

        {/* Sortable 容器 */}
        <div className="sortable-container">
          {/* 拖拽触发分页组件 */}
          <DragTriggerPagination
            ref={dragTriggerPaginationRef}
            isDragging={isDragging}
            activeSlide={activeSlide}
            totalSlides={list.length}
            sliderRef={(_sliderRef ?? sliderRef) as React.RefObject<Slider>}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
          />

          <Slider
            useCSS
            useTransform
            arrows={false}
            ref={_sliderRef ?? sliderRef}
            infinite={false}
            dots
            touchMove={false}
            lazyLoad="anticipated"
            className={cx(
              paginingLocationCss,
              css`
                .slick-track {
                  display: flex;
                  align-items: stretch;
                }
                .slick-slide {
                  display: flex;
                  align-self: stretch;
                  height: unset;
                  > div {
                    display: flex;
                    align-self: stretch;
                    width: 100%;
                  }
                }
              `,
              className
            )}
            customPaging={createCustomPagingDot(
              list,
              activeSlide,
              pagingDotBuilder
            )}
            appendDots={(dots: React.ReactNode[]) => {
              return (
                <Pagination
                  activeSlide={activeSlide}
                  onDragEnter={(index) => {
                    (_sliderRef ?? sliderRef).current?.slickGoTo(index);
                  }}
                  onClick={(index) => {
                    (_sliderRef ?? sliderRef).current?.slickGoTo(index);
                  }}
                  pagingDotsBuilder={pagingDotsBuilder}
                  slickDots={dots}
                  disabled={pagination === false}
                  className={cx(
                    "slick-dots-default",
                    css`
                      .slick-dots-default {
                        flex-direction: ${pagination &&
                        typeof pagination === "object" &&
                        (pagination.position === "left" ||
                          pagination.position === "right")
                          ? "column"
                          : "row"};
                      }
                    `
                  )}
                />
              );
            }}
            beforeChange={(_, next) => {
              setActiveSlide(next);
            }}
            {...sliderProps}
          >
            {list.map((l) => {
              return (
                <div
                  key={l.id}
                  onDrop={(e) => {
                    e.preventDefault();
                    const data = e.dataTransfer.getData("text/plain");
                    const quickCheckJsonResult =
                      SortableUtils.quickJSONCheck(data);

                    if (quickCheckJsonResult) {
                      try {
                        addItem(JSON.parse(data), [l.id]);
                      } catch (e) {
                        console.log("drag error", e);
                      }
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                >
                  <ReactSortable
                    className={cx(mainDragContainerStyle)}
                    {...mainDragConfig}
                    list={l.children ?? []}
                    setList={(e) => setList(e, [l.id])}
                    onMove={(e) => {
                      setListStatus("onMove");
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
                        related.classList.contains("sortable-group-item")
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
                      setListStatus("onMove");
                      setIsDragging(true);
                    }}
                    onEnd={() => {
                      setMoveItemId(null);
                      setMoveTargetId(null);
                      setListStatus(null);
                      setIsDragging(false);
                    }}
                    ghostClass={ghostClass}
                  >
                    {(l.children ?? []).map((item, index) => {
                      let el;

                      if (itemBuilder) {
                        return itemBuilder(item);
                      }

                      switch (item.type) {
                        case "group":
                        case "app":
                          el = (
                            <SortableGroupItem
                              key={item.id}
                              data={item}
                              itemIndex={index}
                              parentIds={[l.id, item.id]}
                              onClick={onItemClick}
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
                            />
                          );
                          break;
                      }

                      return el;
                    })}
                    <SafeExtraItems<D, C> renderFn={extraItems} item={l} />
                  </ReactSortable>
                </div>
              );
            })}
            <div></div>
          </Slider>
        </div>
      </div>

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

      {/* 启动台模态框 */}
      {showLaunchpad && (
        <LaunchpadModal
          visible={showLaunchpad}
          onClose={() => setShowLaunchpad(false)}
          onItemClick={onItemClick}
        />
      )}
    </>
  );
};

export default Sortable;
