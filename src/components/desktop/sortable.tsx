import { css, cx } from "@emotion/css";
import React, { useCallback, useMemo, useRef, useState } from "react";
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
import SortableUtils from "./utils/index";
import Dock, { DockProps } from "./dock/dock";
import LaunchpadModal from "./dock/launchpad-modal";
import { AnimatePresence } from "motion/react";
import { getItemSize } from "./config";

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
   * 最大页数限制，达到后不再显示拖拽触发分页组件，也不创建新页面
   */
  maxSlides?: number;
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
  } & Omit<DockProps<D, C>, "onDrop" | "onDockItemsChange">;
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
    maxSlides,
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
  const [touchMoveEnabled, setTouchMoveEnabled] = useState(true);

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
    addRootItem,
    removeRootItem,
    setCurrentSliderIndex,
  } = useSortableState();

  const { pagingDotBuilder, pagingDotsBuilder, itemBuilder, typeConfigMap } = useSortableConfig();

  // 从list中过滤出dock数据和分页数据
  const dockItems = useMemo(() => {
    const dockData = list.find((item) => item.type === "dock");
    return dockData?.children ?? [];
  }, [list]);

  const pageItems = useMemo(() => {
    return list.filter((item) => item.type !== "dock");
  }, [list]);

  // 创建新页面
  const createNewPage = useCallback(() => {
    // 达到最大页数时不创建新页面
    if (typeof maxSlides === "number" && pageItems.length >= maxSlides) {
      return;
    }
    const newPage = {
      id: `page_${Date.now()}`,
      type: "page" as const,
      children: [],
    };
    addRootItem(newPage);

    // 延迟跳转到新页面
    setTimeout(() => {
      (_sliderRef ?? sliderRef).current?.slickGoTo(pageItems.length);
    }, 100);
  }, [maxSlides, pageItems.length, addRootItem, _sliderRef]);

  // 删除空白页面
  const removeEmptyPages = useCallback(() => {
    const emptyPages = pageItems.filter((page) => !page.children || page.children.length === 0);

    // 保留至少一个页面
    if (emptyPages.length === pageItems.length && pageItems.length > 1) {
      // 删除除第一个页面外的所有空白页面
      emptyPages.slice(1).forEach((page) => {
        removeRootItem(page.id);
      });
    } else if (emptyPages.length > 0 && pageItems.length > 1) {
      // 删除所有空白页面，但保留至少一个页面
      emptyPages.forEach((page) => {
        if (pageItems.length - emptyPages.length > 0 || pageItems.indexOf(page) > 0) {
          removeRootItem(page.id);
        }
      });
    }
  }, [pageItems, removeRootItem]);

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

  // 统一计算每页一致的行宽，并监听容器尺寸变化
  const [pageRowWidth, setPageRowWidth] = useState<number | undefined>(undefined);
  const [pageRowMarginLeft, setPageRowMarginLeft] = useState<number | undefined>(undefined);
  const sortableContainerNodeRef = useRef<HTMLDivElement | null>(null);
  const sortableContainerObserverRef = useRef<ResizeObserver | null>(null);
  const sortableContainerResizeHandlerRef = useRef<(() => void) | null>(null);

  const applyContainerWidth = useCallback((node: HTMLDivElement) => {
    const { width, marginLeft } = SortableUtils.computeRowWidth(node, 112);
    setPageRowWidth(width);
    setPageRowMarginLeft(marginLeft);
  }, []);

  const setSortableContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      const lastNode = sortableContainerNodeRef.current;
      const observer = sortableContainerObserverRef.current;
      const onResize = sortableContainerResizeHandlerRef.current;

      // 清理逻辑：节点移除或切换
      if (!node && lastNode) {
        if (observer) {
          observer.disconnect();
          sortableContainerObserverRef.current = null;
        }
        if (onResize) {
          globalThis.removeEventListener("resize", onResize);
          sortableContainerResizeHandlerRef.current = null;
        }
        sortableContainerNodeRef.current = null;
        return;
      }

      if (node && lastNode && node !== lastNode) {
        if (observer) {
          observer.disconnect();
          sortableContainerObserverRef.current = null;
        }
        if (onResize) {
          globalThis.removeEventListener("resize", onResize);
          sortableContainerResizeHandlerRef.current = null;
        }
        sortableContainerNodeRef.current = null;
      }

      // 绑定新节点与监听
      if (node) {
        sortableContainerNodeRef.current = node;
        requestAnimationFrame(() => applyContainerWidth(node));

        if ("ResizeObserver" in globalThis) {
          const ro = new ResizeObserver(() => applyContainerWidth(node));
          sortableContainerObserverRef.current = ro;
          ro.observe(node);
        } else {
          const handler = () => applyContainerWidth(node);
          sortableContainerResizeHandlerRef.current = handler;
          globalThis.addEventListener("resize", handler);
        }
      }
    },
    [applyContainerWidth]
  );

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
          <div className="zs-flex zs-items-center zs-justify-center dock-container">
            <Dock
              items={dockItems}
              fixedItems={dock.fixedItems}
              position={dock.position}
              className={dock.className}
              onItemClick={onItemClick}
              itemBuilder={dock.itemBuilder}
              fixedItemBuilder={dock.fixedItemBuilder}
              showLaunchpad={dock.showLaunchpad}
              onLaunchpadClick={() => setShowLaunchpad(true)}
              onDockItemsChange={(newDockItems) => {
                // 更新dock数据到list中
                const updatedList = list.map((item) => {
                  if (item.type === "dock") {
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
                      if (item.type === "dock") {
                        return {
                          ...item,
                          children: [...(item.children ?? []), dragItem],
                        };
                      }
                      return item;
                    });
                    // 从原位置移除该项目
                    const finalList = updatedList.map((item) => {
                      if (item.type !== "dock" && item.children) {
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
        <div className="sortable-container" ref={setSortableContainerRef}>
          {/* 拖拽触发分页组件 */}
          <DragTriggerPagination
            ref={dragTriggerPaginationRef}
            isDragging={isDragging}
            activeSlide={activeSlide}
            totalSlides={pageItems.length}
            maxSlides={maxSlides}
            sliderRef={(_sliderRef ?? sliderRef) as React.RefObject<Slider>}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
            onCreateNewPage={createNewPage}
          />

          <Slider
            useCSS
            useTransform
            arrows={false}
            ref={_sliderRef ?? sliderRef}
            infinite={false}
            dots
            lazyLoad="anticipated"
            touchMove={touchMoveEnabled}
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
              setCurrentSliderIndex(next);
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
                    className={cx("zs-grid zs-h-full", mainDragContainerStyle)}
                    style={{ width: pageRowWidth, marginLeft: pageRowMarginLeft, transform: `translate(28px, 28px)` }}
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

                      // 拖拽结束后检查并删除空白页面
                      setTimeout(() => {
                        removeEmptyPages();
                      }, 100);
                    }}
                    ghostClass={ghostClass}
                  >
                    <AnimatePresence mode="popLayout">
                      {(l.children ?? []).map((item, index) => {
                        let el;

                        if (itemBuilder) {
                          return itemBuilder(item);
                        }

                        const { row, col } = getItemSize(item.type, item.config?.sizeId, typeConfigMap);

                        switch (item.type) {
                          case "group":
                          case "app":
                            el = (
                              <div
                                className={cx(
                                  "zs-flex zs-justify-start zs-items-start",
                                  css`
                                    grid-row: span ${row};
                                    grid-column: span ${col};
                                  `
                                )}
                                key={item.id}
                                onMouseEnter={() => setTouchMoveEnabled(false)}
                                onMouseLeave={() => setTouchMoveEnabled(true)}
                              >
                                <SortableGroupItem
                                  data={item}
                                  itemIndex={index}
                                  parentIds={[l.id, item.id]}
                                  onClick={onItemClick}
                                />
                              </div>
                            );
                            break;
                          default:
                            el = (
                              <div
                                className={cx(
                                  "zs-flex zs-justify-center zs-items-center",
                                  css`
                                    grid-row: span ${row};
                                    grid-column: span ${col};
                                  `
                                )}
                                key={item.id}
                                onMouseEnter={() => setTouchMoveEnabled(false)}
                                onMouseLeave={() => setTouchMoveEnabled(true)}
                              >
                                <SortableItem data={item} itemIndex={index} onClick={onItemClick} />
                              </div>
                            );
                            break;
                        }

                        return el;
                      })}
                    </AnimatePresence>

                    <SafeExtraItems<D, C> renderFn={extraItems} item={l} />
                  </ReactSortable>
                </div>
              );
            })}
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
