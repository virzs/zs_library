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

const itemNameStyle = css`
  text-align: center;
  font-size: 11px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  padding: 0 2px;
  margin-top: 4px;
`;

const mergeTargetHighlightStyle = css`
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.5),
    0 0 12px 2px rgba(255, 255, 255, 0.25);
  animation: mergeTargetPulse 1s ease-in-out infinite alternate;

  @keyframes mergeTargetPulse {
    from {
      box-shadow:
        0 0 0 3px rgba(255, 255, 255, 0.4),
        0 0 8px 2px rgba(255, 255, 255, 0.15);
    }
    to {
      box-shadow:
        0 0 0 3px rgba(255, 255, 255, 0.6),
        0 0 16px 4px rgba(255, 255, 255, 0.3);
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
  } = useDesktopDnd();
  const iconSize = iconSizeProp ?? contextIconSize;
  const [isPressed, setIsPressed] = useState(false);
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
  const itemWidth = iconSize * (size?.col ?? 1);
  const itemHeight = iconSize * (size?.row ?? 1);

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
    if (iconBuilder) return iconBuilder(item);

    const registryEntry = componentRegistry?.[item.type];
    if (registryEntry) {
      if (registryEntry.component) {
        const RegistryComponent = registryEntry.component;
        return <RegistryComponent item={item} />;
      }
      if (registryEntry.remoteUrl) {
        const RemoteComponent = loadRemoteComponent(registryEntry.remoteUrl);
        const fallback = registryEntry.iconUrl ? (
          <img
            src={registryEntry.iconUrl}
            alt=""
            crossOrigin="anonymous"
            className="zs-w-full zs-h-full zs-object-cover"
          />
        ) : (
          <div className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-bg-blue-500 zs-rounded-xl zs-text-white zs-text-lg zs-font-bold">
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
          <img
            src={registryEntry.iconUrl}
            alt=""
            crossOrigin="anonymous"
            className="zs-w-full zs-h-full zs-object-cover"
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
        <img
          src={iconData}
          alt=""
          crossOrigin="anonymous"
          className="zs-w-full zs-h-full zs-object-cover"
        />
      );
    }
    if (iconData) return <>{iconData}</>;

    return (
      <div className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-bg-blue-500 zs-rounded-xl zs-text-white zs-text-lg zs-font-bold">
        {(item.data?.name ?? "?").charAt(0)}
      </div>
    );
  };

  const iconContent = (
    <div
      className={cx(
        "zs-overflow-hidden",
        isMergeTarget && mergeTargetHighlightStyle,
        css`
          width: ${itemWidth}px;
          height: ${itemHeight}px;
          border-radius: 1rem;
        `,
      )}
    >
      {renderIcon()}
    </div>
  );

  const floatingRef = useRef<HTMLDivElement>(null);

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
              width: itemWidth,
              zIndex: 9999,
              pointerEvents: "none",
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))",
              transform: "scale(1.05)",
              cursor: "grabbing",
            }}
            className="zs-flex zs-flex-col zs-items-center"
          >
            {iconContent}
            {!noLabel && (
              <div className={itemNameStyle}>{item.data?.name ?? ""}</div>
            )}
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
          "zs-relative zs-cursor-pointer zs-flex zs-flex-col zs-items-center",
          css`
            width: ${itemWidth}px;
            min-height: ${itemHeight}px;
            touch-action: none;
          `,
        )}
        animate={{
          scale: isPressed ? 0.9 : isMergeTarget ? 0.92 : 1,
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
        {!noLabel && (
          <div className={itemNameStyle}>{item.data?.name ?? ""}</div>
        )}
      </motion.div>
      {floatingOverlay}
    </>
  );
};

export default React.memo(GridItem);
