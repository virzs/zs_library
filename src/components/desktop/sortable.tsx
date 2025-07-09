import { css, cx } from "@emotion/css";
import React, { useMemo, useRef, useState } from "react";
import Slider, { Settings } from "react-slick";
import { ReactSortable } from "react-sortablejs";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { useSortableConfig } from "./context/config/hooks";
import { useSortableState } from "./context/state/hooks";
import DragTriggerPagination, { DragTriggerPaginationRef } from "./drag-trigger-pagination";
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
import Dock, { DockProps } from "./dock";
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
     * dock 样式类名
     */
    className?: string;
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
    dragItem,
    setDragItem,
  } = useSortableState();

  const { pagingDotBuilder, pagingDotsBuilder, itemBuilder } = useSortableConfig();

  // 从list中过滤出dock数据和分页数据
  const dockItems = useMemo(() => {
    const dockData = list.find((item) => item.dataType === "dock");
    return dockData?.children ?? [];
  }, [list]);

  const pageItems = useMemo(() => {
    return list.filter((item) => item.dataType !== "dock");
  }, [list]);

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
        className={cx("zs-relative zs-w-full zs-h-full", dockLayoutCss)}
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
              items={dockItems}
              position={dock.position}
              className={dock.className}
              onItemClick={onItemClick}
              itemBuilder={dock.itemBuilder}
              showLaunchpad={dock.showLaunchpad}
              onLaunchpadClick={() => setShowLaunchpad(true)}
              onDockItemsChange={(newDockItems) => {
                // 更新dock数据到list中
                const updatedList = list.map((item) => {
                  if (item.dataType === "dock") {
                    return {
                      ...item,
                      children: newDockItems,
                    };
                  }
                  return item;
                });
                setList(updatedList);
              }}
              onDrop={() => {
                if (dragItem) {
                  // 添加到 dock
                  if (dockItems.every((i) => i.id !== dragItem.id)) {
                    // 将拖拽项添加到dock容器的children中
                    const updatedList = list.map((item) => {
                      if (item.dataType === "dock") {
                        return {
                          ...item,
                          children: [...(item.children ?? []), dragItem],
                        };
                      }
                      return item;
                    });
                    // 从原位置移除该项目
                    const finalList = updatedList.map((item) => {
                      if (item.dataType !== "dock" && item.children) {
                        return {
                          ...item,
                          children: item.children.filter((child) => child.id !== dragItem.id),
                        };
                      }
                      return item;
                    });
                    setList(finalList);
                  }
                }
                setDragItem(null);
              }}
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
            totalSlides={pageItems.length}
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
                height: 100%;
                .slick-list {
                  height: 100%;
                }
                .slick-track {
                  height: 100%;
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
            customPaging={createCustomPagingDot(pageItems, activeSlide, pagingDotBuilder)}
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
                        (pagination.position === "left" || pagination.position === "right")
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
            {pageItems.map((l) => {
              return (
                <div
                  key={l.id}
                  onDrop={(e) => {
                    e.preventDefault();
                    const data = e.dataTransfer.getData("text/plain");
                    const quickCheckJsonResult = SortableUtils.quickJSONCheck(data);

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
                        (Object.keys(relatedData).length === 0 || relatedData.parentIds) &&
                        Number(draggedData.childrenLength) > 0 &&
                        related.classList.contains("sortable-group-item")
                      ) {
                        return false;
                      }
                      // 限制文件夹不能放入dock
                      // related.classList 判断 dock 为空时
                      // related.parentElement?.classList 判断 dock 内有内容时
                      if (
                        (related.classList.contains("desktop-dock-sortable") ||
                          related.parentElement?.classList.contains("desktop-dock-sortable")) &&
                        Number(draggedData.childrenLength) > 0
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

                      // 设置拖拽数据
                      const item = l.children?.find((i) => i.id === dataset.id);
                      if (item) {
                        setDragItem(item);
                      }
                    }}
                    onEnd={() => {
                      setMoveItemId(null);
                      setMoveTargetId(null);
                      setListStatus(null);
                      setIsDragging(false);
                      setDragItem(null);
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
                          el = <SortableItem key={item.id} data={item} itemIndex={index} onClick={onItemClick} />;
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
        <LaunchpadModal visible={showLaunchpad} onClose={() => setShowLaunchpad(false)} onItemClick={onItemClick} />
      )}
    </>
  );
};

export default Sortable;
