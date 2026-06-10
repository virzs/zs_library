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
  transition: transform 0.38s cubic-bezier(0.2, 0.82, 0.2, 1);
`;

const paginationDotStyle = css`
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.34);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);

  &[data-active="true"] {
    background: rgba(255, 255, 255, 0.9);
    width: 18px;
    transform: scale(1);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.2),
      0 0 0 0.5px rgba(255, 255, 255, 0.24);
  }
`;

const paginationContainerStyle = css`
  padding: 6px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -1px 0 rgba(0, 0, 0, 0.08);
`;

const pageShellStyle = css`
  padding: clamp(18px, 4vw, 30px) clamp(16px, 5vw, 34px);
`;

const pageSwitchEdgeOverlayStyle = css`
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 0;
  width: min(28%, 220px);
  z-index: 60;
  opacity: 0;
  transform: scaleX(0.86);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
  will-change: opacity, transform;

  &[data-active="true"] {
    opacity: 1;
    transform: scaleX(1);
  }

  &[data-side="left"] {
    left: 0;
    transform-origin: left center;
  }

  &[data-side="right"] {
    right: 0;
    transform-origin: right center;
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
  showPagination?: boolean;
}

const DesktopDndInner = ({
  containerRef,
  onItemClick,
  iconBuilder,
  className,
  dockProps,
  onDockItemsChange,
  showPagination = true,
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

  const launchpadApps = useMemo(() => {
    const getApps = (items: DndSortItem[]): DndSortItem[] =>
      items.flatMap((item) => {
        if (item.type === "app") return [item];
        if (item.type === "group" && item.children) return getApps(item.children);
        return [];
      });

    return pages.flatMap((page) => getApps(page.children));
  }, [pages]);

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

  const pageSwitchEdgeTheme = theme.token.desktop?.pageSwitchEdge;
  const pageSwitchEdgeZone = dragState.isDragging ? dragState.pageSwitchZone : null;
  const pageSwitchEdgeGlow = pageSwitchEdgeTheme?.glowColor ?? theme.token.base?.hoverColor;
  const pageSwitchLeftGradient = pageSwitchEdgeTheme?.leftGradient ?? pageSwitchEdgeTheme?.rightGradient;
  const pageSwitchRightGradient = pageSwitchEdgeTheme?.rightGradient ?? pageSwitchEdgeTheme?.leftGradient;

  const renderPageSwitchEdgeOverlay = () => (
    <>
      {pageSwitchLeftGradient && (
        <div
          aria-hidden="true"
          className={pageSwitchEdgeOverlayStyle}
          data-active={pageSwitchEdgeZone === "left"}
          data-side="left"
          style={{
            background: pageSwitchLeftGradient,
            boxShadow: pageSwitchEdgeGlow
              ? `inset 28px 0 34px -26px ${pageSwitchEdgeGlow}`
              : undefined,
          }}
        />
      )}
      {pageSwitchRightGradient && (
        <div
          aria-hidden="true"
          className={pageSwitchEdgeOverlayStyle}
          data-active={pageSwitchEdgeZone === "right"}
          data-side="right"
          style={{
            background: pageSwitchRightGradient,
            boxShadow: pageSwitchEdgeGlow
              ? `inset -28px 0 34px -26px ${pageSwitchEdgeGlow}`
              : undefined,
          }}
        />
      )}
    </>
  );

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
                  "zs-absolute zs-inset-0 zs-flex zs-justify-center zs-box-border zs-overflow-x-hidden zs-overflow-y-auto",
                  pageShellStyle,
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
                  "zs-absolute zs-inset-0 zs-flex zs-justify-center zs-box-border zs-overflow-x-hidden zs-overflow-y-auto",
                  pageShellStyle,
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
                  "zs-absolute zs-inset-0 zs-flex zs-justify-center zs-box-border zs-overflow-x-hidden zs-overflow-y-auto zs-backface-hidden",
                  pageShellStyle,
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
            <div key={page.id} className={cx("zs-flex-none zs-basis-full zs-w-full zs-min-h-full zs-flex zs-justify-center zs-box-border zs-overflow-x-hidden zs-overflow-y-auto", pageShellStyle)}>
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
    if (!showPagination || totalPages <= 1) return null;

    const dotNodes = pages.map((page, index) => {
      if (pagingDotBuilder) {
        return <React.Fragment key={page.id}>{pagingDotBuilder(index, index === currentPage)}</React.Fragment>;
      }
      return (
        <div
          key={page.id}
          className={cx("zs-transition-all zs-duration-300 zs-ease-in-out zs-cursor-pointer", paginationDotStyle)}
          data-active={index === currentPage}
          onClick={() => goToPage(index)}
        />
      );
    });

    if (pagingDotsBuilder) {
      return <div className="zs-flex zs-justify-center zs-items-center zs-gap-1.5 zs-py-2">{pagingDotsBuilder(dotNodes)}</div>;
    }

    return <div className={cx("zs-flex zs-justify-center zs-items-center zs-gap-1.5", paginationContainerStyle)}>{dotNodes}</div>;
  }, [showPagination, totalPages, pages, currentPage, pagingDotBuilder, pagingDotsBuilder, goToPage]);

  return (
    <>
      <div
        ref={containerRef}
        className={cx("zs-relative zs-w-full zs-h-full zs-min-h-0 zs-overflow-hidden zs-select-none", className)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="zs-flex zs-flex-col zs-h-full zs-min-h-0">
          <div className="zs-flex-1 zs-min-h-0 zs-overflow-hidden">
            {renderPages()}
          </div>
          {renderPageSwitchEdgeOverlay()}

          {(dockProps || dots) && (
            <div className="zs-flex zs-flex-col zs-items-center zs-shrink-0 zs-pb-4 zs-px-4" style={{ zIndex: 100 }}>
              {dots}
              {dockProps && (
                <Dock
                  {...dockProps}
                  items={recentDockItems}
                  launchpadApps={launchpadApps}
                  onItemClick={handleDockItemClick}
                  theme={dockProps.theme ?? theme}
                />
              )}
            </div>
          )}
        </div>
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
  /** Dock 配置。 */
  dockProps?: DockProps;
  /** 是否显示 dock。优先使用 `dockProps` 提供具体配置。 */
  showDock?: boolean;
  theme?: Theme | "light" | "dark";
  /** @deprecated 请使用 `showLabels={false}` 代替。 */
  noLetters?: boolean;
  /** 是否显示项目名称。 */
  showLabels?: boolean;
  storageKey?: string;
  pageTransition?: import("./types").PageTransition;
  itemBuilder?: (item: DndSortItem, index: number) => React.ReactNode | null;
  /** @deprecated 请让 `itemBuilder` 返回 `null` 回退默认渲染；设置为 `false` 会保留旧版“null 也作为渲染结果”的行为。 */
  itemBuilderAllowNull?: boolean;
  /** @deprecated 请让 `itemIconBuilder` 返回 `null` 回退默认图标；设置为 `false` 会保留旧版“null 也作为渲染结果”的行为。 */
  itemIconBuilderAllowNull?: boolean;
  pagingDotBuilder?: (index: number, isActive: boolean) => React.ReactNode;
  pagingDotsBuilder?: (dots: React.ReactNode[]) => React.ReactNode;
  extraItems?: DndSortItem[];
  componentRegistry?: ComponentRegistry;
  /** 分页配置。`false` 表示隐藏分页指示器；不再支持旧版 react-slick 的位置配置。 */
  pagination?: false | { visible?: boolean };
  /** @deprecated 请使用 `maxPages` 代替。 */
  maxSlides?: number;
  /** @deprecated 请使用 `dockProps` 和 `showDock` 代替。 */
  dock?: ({ enabled?: boolean } & DockProps) | false;
  /** @deprecated desktop-next 不再基于 react-slick，使用 `pageTransition` 控制分页动画。 */
  sliderProps?: unknown;
  /** @deprecated desktop-next 不再暴露 react-slick ref，请使用组件 ref 读取 `currentPage` 和 `setCurrentPage`。 */
  sliderRef?: React.RefObject<unknown>;
}

interface DesktopDndLegacyCompatProps {
  noLetters?: boolean;
  itemBuilderAllowNull?: boolean;
  itemIconBuilderAllowNull?: boolean;
  maxSlides?: number;
  dock?: ({ enabled?: boolean } & DockProps) | false;
}

const DesktopDnd = forwardRef(
  <D = unknown,>(
    props: DesktopDndExtendedProps<D>,
    ref: React.ForwardedRef<DesktopHandle>,
  ) => {
    const {
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
      showDock,
      theme,
      showLabels,
      storageKey,
      pageTransition,
      itemBuilder,
      pagingDotBuilder,
      pagingDotsBuilder,
      extraItems,
      componentRegistry,
      pagination,
    } = props;
    const {
      noLetters,
      itemBuilderAllowNull,
      itemIconBuilderAllowNull,
      maxSlides,
      dock,
    } = props as DesktopDndLegacyCompatProps;
    const containerRef = useRef<HTMLDivElement>(null);
    const resolvedMaxPages = maxPages || maxSlides || 0;
    const resolvedNoLetters = showLabels === undefined ? noLetters : !showLabels;
    const { enabled: legacyDockEnabled = true, ...legacyDockProps } = dock && typeof dock === "object" ? dock : {};
    const resolvedDockProps = dockProps ?? (dock && legacyDockEnabled ? legacyDockProps : undefined);
    const shouldShowDock = showDock ?? Boolean(resolvedDockProps);
    const showPagination = pagination !== false && pagination?.visible !== false;

    return (
      <DesktopDndProvider
        pages={pages as DndPageItem[]}
        onChange={onChange as (pages: DndPageItem[]) => void}
        iconSize={iconSize}
        maxPages={resolvedMaxPages}
        mergeDwellTime={mergeDwellTime}
        containerRef={containerRef}
        typeConfigMap={typeConfigMap}
        dataTypeMenuConfigMap={dataTypeMenuConfigMap}
        onRemoveClick={onRemoveClick as ((item: DndSortItem) => void) | undefined}
        onContextMenuItemClick={onContextMenuItemClick as ((item: DndSortItem, payload: ContextMenuActionPayload) => void) | undefined}
        contextMenuProps={contextMenuProps}
        theme={theme}
        noLetters={resolvedNoLetters}
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
          dockProps={shouldShowDock ? resolvedDockProps : undefined}
          showPagination={showPagination}
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
