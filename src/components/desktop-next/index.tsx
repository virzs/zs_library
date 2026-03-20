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

const desktopContainerStyle = css`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
`;

const pagesContainerStyle = css`
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
`;

const pageStyle = css`
  flex: 0 0 100%;
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  padding: 28px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
`;

const paginationDotsStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
`;

const paginationDotStyle = css`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;

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
  const { pages, currentPage, setCurrentPage, dragState, hideContextMenu, theme, pagingDotBuilder, pagingDotsBuilder } = useDesktopDnd();

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
          className={paginationDotStyle}
          data-active={index === currentPage}
          onClick={() => goToPage(index)}
        />
      );
    });

    if (pagingDotsBuilder) {
      return <div className={paginationDotsStyle}>{pagingDotsBuilder(dotNodes)}</div>;
    }

    return <div className={paginationDotsStyle}>{dotNodes}</div>;
  }, [totalPages, pages, currentPage, pagingDotBuilder, pagingDotsBuilder, goToPage]);

  return (
    <>
      <div
        ref={containerRef}
        className={cx(desktopContainerStyle, className)}
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
            <div
              className={pagesContainerStyle}
              style={{ transform: `translateX(${translateX}%)` }}
            >
              {pages.map((page, index) => {
                const isNearby = Math.abs(index - currentPage) <= 1;
                return (
                  <div key={page.id} className={pageStyle}>
                    {isNearby && (
                      <PageGrid
                        pageIndex={index}
                        onItemClick={handleItemClick}
                        iconBuilder={iconBuilder}
                      />
                    )}
                  </div>
                );
              })}
            </div>
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
