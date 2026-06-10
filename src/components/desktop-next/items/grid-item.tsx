import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useDesktopDnd } from "../context";
import { DndSortItem } from "../types";
import {
  loadRemoteComponent,
  RemoteComponentErrorBoundary,
} from "../component-registry/remote-loader";
import IconImage from "./icon-image";

const mergeTargetHighlightStyle = css`
  outline: 3px solid rgba(255, 255, 255, 0.5);
  outline-offset: 3px;
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.25));
  animation: mergeTargetPulse 1s ease-in-out infinite alternate;

  @keyframes mergeTargetPulse {
    from {
      outline-color: rgba(255, 255, 255, 0.4);
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.15));
    }
    to {
      outline-color: rgba(255, 255, 255, 0.62);
      filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.3));
    }
  }
`;

interface GridItemProps {
  item: DndSortItem;
  onDragStart: (
    item: DndSortItem,
    clientX: number,
    clientY: number,
    pointerId: number,
    el: HTMLElement,
  ) => void;
  onItemClick?: (item: DndSortItem) => void;
  iconBuilder?: (item: DndSortItem) => React.ReactNode;
  size?: { col: number; row: number };
  children?: React.ReactNode;
  noLabel?: boolean;
  iconSize?: number;
}

const LONG_PRESS_THRESHOLD = 300;
const DRAG_DISTANCE_THRESHOLD = 8;
const GridItem = ({
  item,
  onDragStart,
  onItemClick,
  iconBuilder,
  size,
  children,
  noLabel,
  iconSize: iconSizeProp,
}: GridItemProps) => {
  const {
    dragState,
    iconSize: contextIconSize,
    setContextMenu,
    hideContextMenu,
    pointerPositionRef,
    componentRegistry,
    theme,
    itemIconBuilderAllowNull,
  } = useDesktopDnd();
  const iconSize = iconSizeProp ?? contextIconSize;
  const [isPressed, setIsPressed] = useState(false);

  const itemsTheme = theme.token.items;
  const itemNameStyle = css`
    color: ${itemsTheme?.textColor ?? "rgba(255, 255, 255, 0.9)"};
    font-size: 11.5px;
    font-weight: 500;
    line-height: 1.18;
    letter-spacing: 0;
    text-shadow:
      0 1px 2px ${itemsTheme?.iconShadowColor ?? "rgba(0, 0, 0, 0.5)"},
      0 0 8px ${itemsTheme?.iconShadowColor ?? "rgba(0, 0, 0, 0.35)"};
  `;
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);
  const longPressReadyRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const elRef = useRef<HTMLDivElement>(null);

  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;
  const onItemClickRef = useRef(onItemClick);
  onItemClickRef.current = onItemClick;
  const itemRef = useRef(item);
  itemRef.current = item;

  const isBeingDragged = dragState.activeId === item.id && dragState.isDragging;
  const isMergeTarget = dragState.mergeTargetId === item.id;
  const gap = Math.round((iconSize / 64) * 48);
  const col = size?.col ?? 1;
  const row = size?.row ?? 1;
  const itemWidth = iconSize * col + gap * (col - 1);
  const itemHeight = iconSize * row + gap * (row - 1);
  const itemVisualWidth = noLabel
    ? itemWidth
    : Math.max(itemWidth, iconSize + Math.round(gap * 0.58));
  const iconRadius = Math.max(16, Math.round(Math.min(itemWidth, itemHeight) * 0.12));
  const iconShellShadow = itemsTheme?.iconShadowColor ?? "rgba(0, 0, 0, 0.35)";
  const iconShellStyle = css`
    border-radius: ${iconRadius}px;
    background: rgba(255, 255, 255, 0.05);
    box-shadow:
      0 ${Math.round(iconSize * 0.14)}px ${Math.round(iconSize * 0.34)}px ${iconShellShadow},
      inset 0 1px 0 rgba(255, 255, 255, 0.18),
      inset 0 0 0 0.5px rgba(255, 255, 255, 0.16);
    transform: translateZ(0);
  `;

  const clearPressTimer = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  const openContextMenuAt = useCallback(
    (pageX: number, pageY: number) => {
      const el = elRef.current;
      if (!el) return;
      hideContextMenu();
      setContextMenu({
        rect: el.getBoundingClientRect(),
        data: itemRef.current,
        pageX,
        pageY,
        element: el,
      });
    },
    [hideContextMenu, setContextMenu],
  );

  const startDrag = useCallback(
    (clientX: number, clientY: number, pointerId: number) => {
      isDraggingRef.current = true;
      longPressReadyRef.current = false;
      setIsPressed(false);
      const el = elRef.current;
      if (!el) return;
      onDragStartRef.current(itemRef.current, clientX, clientY, pointerId, el);
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (dragState.isDragging) return;
      if (e.button === 2) return;
      e.preventDefault();
      e.stopPropagation();
      startPosRef.current = { x: e.clientX, y: e.clientY };
      isDraggingRef.current = false;
      longPressReadyRef.current = false;
      setIsPressed(true);

      pressTimerRef.current = setTimeout(() => {
        longPressReadyRef.current = true;
      }, LONG_PRESS_THRESHOLD);
    },
    [dragState.isDragging],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startPosRef.current || isDraggingRef.current) return;

      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > DRAG_DISTANCE_THRESHOLD) {
        longPressReadyRef.current = false;
        clearPressTimer();
        startDrag(e.clientX, e.clientY, e.pointerId);
      }
    },
    [clearPressTimer, startDrag],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!startPosRef.current) return;
      clearPressTimer();
      setIsPressed(false);

      if (!isDraggingRef.current && longPressReadyRef.current) {
        openContextMenuAt(e.clientX, e.clientY);
      } else if (!isDraggingRef.current) {
        onItemClickRef.current?.(itemRef.current);
      }

      isDraggingRef.current = false;
      longPressReadyRef.current = false;
      startPosRef.current = null;
    },
    [clearPressTimer, openContextMenuAt],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      openContextMenuAt(e.clientX, e.clientY);
    },
    [openContextMenuAt],
  );

  const renderIcon = () => {
    if (children) return children;
    if (iconBuilder) {
      const builtIcon = iconBuilder(item);
      if (builtIcon || itemIconBuilderAllowNull === false) return builtIcon;
    }

    const registryEntry = componentRegistry?.[item.type];
    if (registryEntry) {
      if (registryEntry.component) {
        const RegistryComponent = registryEntry.component;
        return <RegistryComponent item={item} />;
      }
      if (registryEntry.remoteUrl) {
        const RemoteComponent = loadRemoteComponent(registryEntry.remoteUrl);
        const fallback = registryEntry.iconUrl ? (
          <IconImage
            src={registryEntry.iconUrl}
            fallbackText={item.data?.name ?? "?"}
            fallbackBackground={item.data?.iconColor ?? itemsTheme?.iconBackgroundColor}
          />
        ) : (
          <div
            className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-text-white zs-text-lg zs-font-bold"
            style={{
              background:
                item.data?.iconColor ??
                itemsTheme?.iconBackgroundColor ??
                "rgba(64, 148, 229, 0.9)",
            }}
          >
            {(item.data?.name ?? "?").charAt(0)}
          </div>
        );
        return (
          <RemoteComponentErrorBoundary>
            <Suspense fallback={fallback}>
              <RemoteComponent item={item} />
            </Suspense>
          </RemoteComponentErrorBoundary>
        );
      }
      if (registryEntry.iconUrl) {
        return (
          <IconImage
            src={registryEntry.iconUrl}
            fallbackText={item.data?.name ?? "?"}
            fallbackBackground={item.data?.iconColor ?? itemsTheme?.iconBackgroundColor}
          />
        );
      }
    }

    const iconData = item.data?.icon;
    if (
      iconData &&
      typeof iconData === "string" &&
      (iconData.startsWith("http") || iconData.startsWith("https"))
    ) {
      return (
        <IconImage
          src={iconData}
          fallbackText={item.data?.name ?? "?"}
          fallbackBackground={item.data?.iconColor ?? itemsTheme?.iconBackgroundColor}
        />
      );
    }
    if (iconData) return <>{iconData}</>;

    return (
      <div
        className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-text-white zs-text-lg zs-font-bold"
        style={{
          background:
            item.data?.iconColor ??
            itemsTheme?.iconBackgroundColor ??
            "rgba(64, 148, 229, 0.9)",
        }}
      >
        {(item.data?.name ?? "?").charAt(0)}
      </div>
    );
  };

  const iconContent = (
    <div
      className={cx(
        "zs-overflow-hidden",
        iconShellStyle,
        isMergeTarget && mergeTargetHighlightStyle,
        css`
          width: ${itemWidth}px;
          height: ${itemHeight}px;
        `,
      )}
    >
      {renderIcon()}
    </div>
  );

  const floatingRef = useRef<HTMLDivElement>(null);

  const renderLabel = () => !noLabel && (
    <div
      className={cx(
        "zs-text-center zs-overflow-hidden zs-text-ellipsis zs-whitespace-nowrap zs-px-1 zs-mt-1.5",
        itemNameStyle,
      )}
      style={{ width: itemVisualWidth }}
    >
      {item.data?.name ?? ""}
    </div>
  );

  useEffect(() => {
    if (!isBeingDragged || !dragState.pointerOffset) return;
    let rafId: number;
    const loop = () => {
      const pos = pointerPositionRef.current;
      const el = floatingRef.current;
      if (pos && el) {
        el.style.left = `${pos.x - dragState.pointerOffset!.x}px`;
        el.style.top = `${pos.y - dragState.pointerOffset!.y}px`;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isBeingDragged, dragState.pointerOffset, pointerPositionRef]);

  const floatingOverlay =
    isBeingDragged && dragState.pointerOffset
      ? createPortal(
          <div
            ref={floatingRef}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: itemVisualWidth,
              zIndex: 9999,
              pointerEvents: "none",
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))",
              transform: "scale(1.05)",
              cursor: "grabbing",
            }}
            className="zs-flex zs-flex-col zs-items-center"
          >
            {iconContent}
            {renderLabel()}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <motion.div
        ref={elRef}
        data-grid-item-id={String(item.id)}
        className={cx(
          "zs-relative zs-cursor-pointer zs-flex zs-flex-col zs-items-center zs-touch-none",
          css`
            width: ${itemVisualWidth}px;
            min-height: ${itemHeight}px;
          `,
        )}
        animate={{
          scale: isPressed ? 0.94 : isMergeTarget ? 0.96 : 1,
          opacity: isBeingDragged ? 0.3 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={handleContextMenu}
      >
        {iconContent}
        {renderLabel()}
      </motion.div>
      {floatingOverlay}
    </>
  );
};

export default React.memo(GridItem);
