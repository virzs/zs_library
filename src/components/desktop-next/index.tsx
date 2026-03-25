import { css, cx } from "@emotion/css";
import React, { forwardRef, JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { DesktopDndProvider, useDesktopDnd } from "./context";
import {
  ContextMenuActionPayload,
  DesktopDndProps,
  DndSortItem,
  DndPageItem,
  ComponentRegistry,
} from "./types";

const pagesContainerStyle = css`
  transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

const paginationDotStyle = css`
  background: rgba(255, 255, 255, 0.3);

  &[data-active="true"] {
    background: rgba(255, 255, 255, 0.9);
    transform: scale(1.2);
  }
`;
import PageGrid from "./grid";
import FolderModal from "./modal/folder-modal";
import GlobalContextMenu from "./context-menu/portal";
import { Dock } from "./dock";
import type { DockProps } from "./dock";
import type { Theme } from "./themes";

interface DesktopDndInnerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onItemClick?: (item: DndSortItem) => void;
  iconBuilder?: (item: DndSortItem) => React.ReactNode;
  className?: string;
  dockProps?: DockProps;
  onDockItemsChange?: (items: DndSortItem[]) => void;
}

const DesktopDndInner = ({
  containerRef,
  onItemClick,
  iconBuilder,
  className,
  dockProps,
  onDockItemsChange,
}: DesktopDndInnerProps) => {
  const { pages, currentPage, setCurrentPage, dragState, hideContextMenu, theme, pagingDotBuilder, pagingDotsBuilder, pageTransition = "slide" } = useDesktopDnd();

  const [noTransition, setNoTransition] = useState(false);
  const prevPageTransitionRef = useRef(pageTransition);
  useEffect(() => {
    if (prevPageTransitionRef.current !== pageTransition) {
      prevPageTransitionRef.current = pageTransition;
      setNoTransition(true);
      const timer = setTimeout(() => setNoTransition(false), 50);
      return () => clearTimeout(timer);
    }
  }, [pageTransition]);

  const [recentDockItems, setRecentDockItems] = useState<DndSortItem[]>(
    () => dockProps?.items ?? [],
  );

  const dockPropsItemsRef = useRef(dockProps?.items);
  useEffect(() => {
    if (dockProps?.items !== dockPropsItemsRef.current) {
      dockPropsItemsRef.current = dockProps?.items;
      setRecentDockItems(dockProps?.items ?? []);
    }
  }, [dockProps?.items]);

  const handleItemClick = useCallback(
    (item: DndSortItem) => {
      if (item.type === "app") {
        const fixedIds = new Set((dockProps?.fixedItems ?? []).map((i) => String(i.id)));
        if (!fixedIds.has(String(item.id))) {
          const maxItems = dockProps?.maxItems ?? 3;
          const sourceId = String(item.id);

          setRecentDockItems((prev) => {
            const existingIdx = prev.findIndex(
              (i) => String(i.config?.sourceId) === sourceId,
            );
            const dockEntry: DndSortItem =
              existingIdx >= 0
                ? {
                    ...prev[existingIdx],
                    ...item,
                    id: prev[existingIdx].id,
                    config: {
                      ...(prev[existingIdx].config ?? {}),
                      ...(item.config ?? {}),
                      sourceId,
                    },
                  }
                : {
                    ...item,
                    id: uuidv4(),
                    config: { ...(item.config ?? {}), sourceId },
                  };

            const next = [
              dockEntry,
              ...prev.filter((_, i) => i !== existingIdx),
            ].slice(0, maxItems);

            onDockItemsChange?.(next);
            return next;
          });
        }
      }

      onItemClick?.(item);
    },
    [dockProps?.fixedItems, dockProps?.maxItems, onItemClick, onDockItemsChange],
  );

  const handleDockItemClick = useCallback(
    (item: DndSortItem) => {
      const sourceId = item.config?.sourceId;
      let original: DndSortItem | undefined;
      if (sourceId) {
        for (const page of pages) {
          const found = page.children.find((c) => String(c.id) === String(sourceId));
          if (found) {
            original = found;
            break;
          }
        }
      }
      onItemClick?.(original ?? item);
    },
    [pages, onItemClick],
  );

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const mouseStartRef = useRef<{ x: number; time: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const totalPages = pages.length;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (dragState.isDragging) return;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    },
    [dragState.isDragging],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || dragState.isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      setSwipeOffset(dx);
    },
    [dragState.isDragging],
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;

    const SWIPE_THRESHOLD = 50;
    const VELOCITY_THRESHOLD = 0.3;
    const elapsed = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(swipeOffset) / elapsed;

    if (Math.abs(swipeOffset) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      if (swipeOffset < 0 && currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1);
      } else if (swipeOffset > 0 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }

    setSwipeOffset(0);
    touchStartRef.current = null;
  }, [swipeOffset, currentPage, totalPages, setCurrentPage]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (dragState.isDragging) return;
      mouseStartRef.current = { x: e.clientX, time: Date.now() };
    },
    [dragState.isDragging],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!mouseStartRef.current || dragState.isDragging) return;
      const dx = e.clientX - mouseStartRef.current.x;
      setSwipeOffset(dx);
    },
    [dragState.isDragging],
  );

  const handleMouseUp = useCallback(() => {
    if (!mouseStartRef.current) return;

    const SWIPE_THRESHOLD = 50;
    const VELOCITY_THRESHOLD = 0.3;
    const elapsed = Date.now() - mouseStartRef.current.time;
    const velocity = Math.abs(swipeOffset) / elapsed;

    if (Math.abs(swipeOffset) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      if (swipeOffset < 0 && currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1);
      } else if (swipeOffset > 0 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }

    setSwipeOffset(0);
    mouseStartRef.current = null;
  }, [swipeOffset, currentPage, totalPages, setCurrentPage]);

  const goToPage = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalPages) {
        setCurrentPage(index);
      }
    },
    [totalPages, setCurrentPage],
  );

  const translateX = useMemo(() => {
    return -(currentPage * 100) + (swipeOffset / (containerRef.current?.clientWidth ?? 1)) * 100;
  }, [currentPage, swipeOffset, containerRef]);

  const swipeRatio = swipeOffset / (containerRef.current?.clientWidth ?? 1);

  const renderPages = () => {
    if (pageTransition === "fade") {
      return (
        <div className="zs-relative zs-w-full zs-h-full">
          {pages.map((page, index) => {
            const isActive = index === currentPage;
            const isNearby = Math.abs(index - currentPage) <= 1;
            return (
              <div
                key={page.id}
                className={cx(
                  "zs-absolute zs-inset-0 zs-flex zs-justify-center zs-p-7 zs-box-border zs-overflow-x-hidden zs-overflow-y-auto",
                  css`
                    opacity: ${isActive ? 1 : 0};
                    transition: ${noTransition ? "none" : "opacity 0.4s ease"};
                    pointer-events: ${isActive ? "auto" : "none"};
                  `,
                )}
              >
                {isNearby && (
                  <PageGrid pageIndex={index} onItemClick={handleItemClick} iconBuilder={iconBuilder} />
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (pageTransition === "zoom") {
      return (
        <div className="zs-relative zs-w-full zs-h-full">
          {pages.map((page, index) => {
            const isActive = index === currentPage;
            const isNearby = Math.abs(index - currentPage) <= 1;
            const direction = index < currentPage ? -1 : 1;
            return (
              <div
                key={page.id}
                className={cx(
                  "zs-absolute zs-inset-0 zs-flex zs-justify-center zs-p-7 zs-box-border zs-overflow-x-hidden zs-overflow-y-auto",
                  css`
                    opacity: ${isActive ? 1 : 0};
                    transform: ${isActive
                      ? "scale(1)"
                      : `scale(0.85) translateX(${direction * 60}px)`};
                    transition: ${noTransition ? "none" : "opacity 0.4s ease, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"};
                    pointer-events: ${isActive ? "auto" : "none"};
                  `,
                )}
              >
                {isNearby && (
                  <PageGrid pageIndex={index} onItemClick={handleItemClick} iconBuilder={iconBuilder} />
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (pageTransition === "cube") {
      return (
        <div
          className="zs-relative zs-w-full zs-h-full"
          style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}
        >
          {pages.map((page, index) => {
            const isNearby = Math.abs(index - currentPage) <= 1;
            const offset = index - currentPage - swipeRatio;
            const rotateY = offset * -90;
            const translateXCube = offset * 100;
            const isVisible = Math.abs(offset) < 1.5;
            return (
              <div
                key={page.id}
                className={cx(
                  "zs-absolute zs-inset-0 zs-flex zs-justify-center zs-p-7 zs-box-border zs-overflow-x-hidden zs-overflow-y-auto zs-backface-hidden",
                  css`
                    transform-origin: 50% 50%;
                    transform: translateX(${translateXCube}%) rotateY(${rotateY}deg);
                    transition: ${noTransition || swipeOffset !== 0
                      ? "none"
                      : "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.45s ease"};
                    opacity: ${isVisible ? 1 - Math.abs(offset) * 0.5 : 0};
                    pointer-events: ${index === currentPage ? "auto" : "none"};
                    backface-visibility: hidden;
                  `,
                )}
              >
                {isNearby && (
                  <PageGrid pageIndex={index} onItemClick={handleItemClick} iconBuilder={iconBuilder} />
                )}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div
        className={cx("zs-flex zs-w-full zs-h-full zs-will-change-transform", noTransition ? css`transition: none;` : pagesContainerStyle)}
        style={{ transform: `translateX(${translateX}%)` }}
      >
        {pages.map((page, index) => {
          const isNearby = Math.abs(index - currentPage) <= 1;
          return (
            <div key={page.id} className="zs-flex-none zs-basis-full zs-w-full zs-min-h-full zs-flex zs-justify-center zs-p-7 zs-box-border zs-overflow-x-hidden zs-overflow-y-auto">
              {isNearby && (
                <PageGrid pageIndex={index} onItemClick={handleItemClick} iconBuilder={iconBuilder} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (dragState.isDragging) {
      hideContextMenu();
    }
  }, [dragState.isDragging, hideContextMenu]);

  const dots = useMemo(() => {
    if (totalPages <= 1) return null;

    const dotNodes = pages.map((page, index) => {
      if (pagingDotBuilder) {
        return <React.Fragment key={page.id}>{pagingDotBuilder(index, index === currentPage)}</React.Fragment>;
      }
      return (
        <div
          key={page.id}
          className={cx("zs-w-[7px] zs-h-[7px] zs-rounded-full zs-transition-all zs-duration-300 zs-ease-in-out zs-cursor-pointer", paginationDotStyle)}
          data-active={index === currentPage}
          onClick={() => goToPage(index)}
        />
      );
    });

    if (pagingDotsBuilder) {
      return <div className="zs-flex zs-justify-center zs-items-center zs-gap-1.5 zs-py-2">{pagingDotsBuilder(dotNodes)}</div>;
    }

    return <div className="zs-flex zs-justify-center zs-items-center zs-gap-1.5 zs-py-2">{dotNodes}</div>;
  }, [totalPages, pages, currentPage, pagingDotBuilder, pagingDotsBuilder, goToPage]);

  return (
    <>
      <div
        ref={containerRef}
        className={cx("zs-relative zs-w-full zs-h-full zs-overflow-hidden zs-select-none", className)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="zs-flex zs-flex-col zs-h-full">
          <div className="zs-flex-1 zs-overflow-hidden">
            {renderPages()}
          </div>
        </div>

        {(dockProps || dots) && (
          <div className="zs-absolute zs-bottom-0 zs-left-0 zs-right-0 zs-flex zs-flex-col zs-items-center zs-pb-4 zs-px-4" style={{ zIndex: 100 }}>
            {dots}
            {dockProps && (
              <Dock
                {...dockProps}
                items={recentDockItems}
                onItemClick={handleDockItemClick}
                theme={dockProps.theme ?? theme}
              />
            )}
          </div>
        )}
      </div>

      <FolderModal iconBuilder={iconBuilder} />
      <GlobalContextMenu />
    </>
  );
};

export interface DesktopHandle {
  pages: DndPageItem[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const DesktopHandleAccessor = ({ handleRef }: { handleRef: React.ForwardedRef<DesktopHandle> }) => {
  const { pages, currentPage, setCurrentPage } = useDesktopDnd();

  useEffect(() => {
    if (!handleRef) return;
    const handle: DesktopHandle = { pages, currentPage, setCurrentPage };
    if (typeof handleRef === "function") {
      handleRef(handle);
    } else {
      handleRef.current = handle;
    }
  }, [handleRef, pages, currentPage, setCurrentPage]);

  return null;
};

export interface DesktopDndExtendedProps<D = unknown> extends DesktopDndProps<D> {
  dockProps?: DockProps;
  theme?: Theme | "light" | "dark";
  noLetters?: boolean;
  storageKey?: string;
  pageTransition?: import("./types").PageTransition;
  itemBuilder?: (item: DndSortItem, index: number) => React.ReactNode | null;
  itemBuilderAllowNull?: boolean;
  itemIconBuilderAllowNull?: boolean;
  pagingDotBuilder?: (index: number, isActive: boolean) => React.ReactNode;
  pagingDotsBuilder?: (dots: React.ReactNode[]) => React.ReactNode;
  extraItems?: DndSortItem[];
  componentRegistry?: ComponentRegistry;
}

const DesktopDnd = forwardRef(
  <D = unknown,>(
    {
      pages,
      onChange,
      iconSize = 64,
      onItemClick,
      itemIconBuilder,
      className,
      maxPages = 0,
      mergeDwellTime = 500,
      typeConfigMap,
      dataTypeMenuConfigMap,
      onRemoveClick,
      onContextMenuItemClick,
      contextMenuProps,
      dockProps,
      theme,
      noLetters,
      storageKey,
      pageTransition,
      itemBuilder,
      itemBuilderAllowNull,
      itemIconBuilderAllowNull,
      pagingDotBuilder,
      pagingDotsBuilder,
      extraItems,
      componentRegistry,
    }: DesktopDndExtendedProps<D>,
    ref: React.ForwardedRef<DesktopHandle>,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
      <DesktopDndProvider
        pages={pages as DndPageItem[]}
        onChange={onChange as (pages: DndPageItem[]) => void}
        iconSize={iconSize}
        maxPages={maxPages}
        mergeDwellTime={mergeDwellTime}
        containerRef={containerRef}
        typeConfigMap={typeConfigMap}
        dataTypeMenuConfigMap={dataTypeMenuConfigMap}
        onRemoveClick={onRemoveClick as ((item: DndSortItem) => void) | undefined}
        onContextMenuItemClick={onContextMenuItemClick as ((item: DndSortItem, payload: ContextMenuActionPayload) => void) | undefined}
        contextMenuProps={contextMenuProps}
        theme={theme}
        noLetters={noLetters}
        storageKey={storageKey}
        pageTransition={pageTransition}
        itemBuilder={itemBuilder as ((item: DndSortItem, index: number) => React.ReactNode | null) | undefined}
        itemBuilderAllowNull={itemBuilderAllowNull}
        itemIconBuilder={itemIconBuilder as ((item: DndSortItem) => React.ReactNode) | undefined}
        itemIconBuilderAllowNull={itemIconBuilderAllowNull}
        pagingDotBuilder={pagingDotBuilder}
        pagingDotsBuilder={pagingDotsBuilder}
        extraItems={extraItems as DndSortItem[] | undefined}
        componentRegistry={componentRegistry}
      >
        {ref && <DesktopHandleAccessor handleRef={ref} />}
        <DesktopDndInner
          containerRef={containerRef}
          onItemClick={onItemClick as ((item: DndSortItem) => void) | undefined}
          iconBuilder={itemIconBuilder as ((item: DndSortItem) => React.ReactNode) | undefined}
          className={className}
          dockProps={dockProps}
        />
      </DesktopDndProvider>
    );
  },
) as <D = unknown>(
  props: DesktopDndExtendedProps<D> & { ref?: React.ForwardedRef<DesktopHandle> },
) => JSX.Element;

export default DesktopDnd;

export type {
  DesktopDndProps,
  DndSortItem,
  DndPageItem,
  DndItemBaseData,
  SizeConfig,
  SortItemUserConfig,
  MenuItemConfig,
  DataTypeMenuConfigMap,
  SortItemDefaultConfig,
  TypeConfigMap,
  ContextMenuData,
  DesktopDndContextMenuProps,
  ContextMenuActionPayload,
  ContextMenuActionType,
  ListItem,
  SortItemBaseData,
  SortItemBaseConfig,
  ComponentRegistryEntry,
  ComponentRegistry,
  PageTransition,
} from "./types";

export { loadRemoteComponent, RemoteComponentErrorBoundary } from "./component-registry/remote-loader";

export {
  appDefaultConfig,
  groupDefaultConfig,
  builtinConfigMap,
  getDefaultConfig,
  commonSizeConfigs,
  commonSizeConfigsArray,
  getSizeConfig,
  getItemSize,
  getDataTypeMenuConfig,
} from "./config";

export type { Theme, ThemeType } from "./themes";
export {
  themeLight,
  themeDark,
  defaultTheme,
  themes,
} from "./themes";

export { mergeTheme } from "./themes/utils";

export { Dock, LaunchpadModal, LaunchpadButton, StackedIcon, SearchBox } from "./dock";
export type { DockProps, LaunchpadModalProps, LaunchpadButtonProps, StackedIconProps } from "./dock";

export { BaseModal } from "./modal";
export type { BaseModalProps } from "./modal";

export { BaseDrawer } from "./drawer";
export type { BaseDrawerProps } from "./drawer";
