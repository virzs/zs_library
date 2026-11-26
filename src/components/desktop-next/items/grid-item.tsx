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
import type { Theme } from "../themes";
import { baseTokens } from "../themes/base";
import { desktopSurface, fade } from "../themes/material";
import IconImage from "./icon-image";

const mergeTargetHighlightStyle = css`
  outline: 3px solid var(--zs-merge-ring);
  outline-offset: 3px;
  filter: drop-shadow(0 0 12px ${fade("var(--zs-merge-ring)", 50)});
  animation: mergeTargetPulse 1s ease-in-out infinite alternate;

  @keyframes mergeTargetPulse {
    from {
      outline-color: ${fade("var(--zs-merge-ring)", 75)};
      filter: drop-shadow(0 0 8px ${fade("var(--zs-merge-ring)", 30)});
    }
    to {
      outline-color: ${fade("var(--zs-merge-ring)", 100)};
      filter: drop-shadow(0 0 16px ${fade("var(--zs-merge-ring)", 60)});
    }
  }
`;

interface GridItemProps {
  theme?: Theme;
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
  floating?: boolean;
  folderPreview?: boolean;
  scrollable?: boolean;
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
  theme: explicitTheme,
  floating = true,
  folderPreview = false,
  scrollable = false,
}: GridItemProps) => {
  const {
    dragState,
    iconSize: contextIconSize,
    setContextMenu,
    hideContextMenu,
    pointerPositionRef,
    componentRegistry,
    theme: desktopTheme,
    itemIconBuilderAllowNull,
  } = useDesktopDnd();
  const iconSize = iconSizeProp ?? contextIconSize;
  const [isPressed, setIsPressed] = useState(false);

  const theme = explicitTheme ?? desktopTheme;
  const itemsTheme = theme.token.items;
  const base = baseTokens(theme);
  const foreground = itemsTheme?.textColor ?? base.textColor;
  const textShadowColor =
    itemsTheme?.textShadowColor ??
    itemsTheme?.iconShadowColor ??
    base.shadowColor;
  const itemNameStyle = css`
    color: ${foreground};
    font-family: ${base.fontFamily};
    font-size: ${itemsTheme?.labelFontSize ?? "12px"};
    font-weight: 500;
    line-height: 1.18;
    letter-spacing: 0.005em;
    text-shadow:
      0 1px 2px ${textShadowColor},
      0 1px 4px ${textShadowColor};
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
  const iconRadius = Math.min(28, Math.round(Math.min(itemWidth, itemHeight) * 0.235));
  const iconShellShadow = itemsTheme?.iconShadowColor ?? base.shadowColor;
  const surface = folderPreview ? desktopSurface(theme, {
    backgroundColor: itemsTheme?.groupIconBackgroundColor,
    borderColor: itemsTheme?.groupIconBorderColor,
    shadowColor: itemsTheme?.groupIconShadowColor,
  }) : `
    &::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      box-shadow: inset 0 1px 0 ${fade(base.highlightColor, 45)}, inset 0 0 0 1px ${base.borderColor};
    }
    background: ${fade(base.highlightColor, 8)};
    box-shadow: 0 2px 4px -1px ${iconShellShadow},
      0 ${Math.round(iconSize * 0.08)}px ${Math.round(iconSize * 0.20)}px -3px ${iconShellShadow};
  `;
  const iconShellStyle = css`
    --zs-merge-ring: ${base.primaryColor};
    position: relative;
    border-radius: ${itemsTheme?.iconBorderRadius ?? `${iconRadius}px`};
    ${surface}
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

  const cancelPress = useCallback(() => {
    clearPressTimer();
    setIsPressed(false);
    startPosRef.current = null;
    isDraggingRef.current = false;
    longPressReadyRef.current = false;
  }, [clearPressTimer]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startPosRef.current || isDraggingRef.current) return;

      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > DRAG_DISTANCE_THRESHOLD) {
        if (scrollable) {
          cancelPress();
          return;
        }
        longPressReadyRef.current = false;
        clearPressTimer();
        startDrag(e.clientX, e.clientY, e.pointerId);
      }
    },
    [clearPressTimer, startDrag, scrollable, cancelPress],
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
            fallbackColor={foreground}
            fallbackText={item.data?.name ?? "?"}
            fallbackBackground={item.data?.iconColor ?? itemsTheme?.iconBackgroundColor}
          />
        ) : (
          <div
            className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-text-lg zs-font-bold"
            style={{
              background:
                item.data?.iconColor ??
                itemsTheme?.iconBackgroundColor ??
                base.primaryColor,
              color: foreground,
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
            fallbackColor={foreground}
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
          fallbackColor={foreground}
          fallbackBackground={item.data?.iconColor ?? itemsTheme?.iconBackgroundColor}
        />
      );
    }
    if (iconData && typeof iconData !== "string") return <>{iconData}</>;

    const tint = item.data?.iconColor ?? itemsTheme?.iconBackgroundColor ?? base.primaryColor;
    return (
      <div
        className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center"
        style={{
          background: `linear-gradient(155deg, ${fade(base.highlightColor, 26)}, transparent 55%, ${fade(iconShellShadow, 25)}), ${tint}`,
          fontFamily: base.fontFamily,
          color: foreground,
          fontSize: Math.round(iconSize * 0.44),
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {iconData || (item.data?.name ?? "?").charAt(0)}
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
    if (!floating || !isBeingDragged || !dragState.pointerOffset) return;
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
  }, [floating, isBeingDragged, dragState.pointerOffset, pointerPositionRef]);

  const floatingOverlay =
    floating && isBeingDragged && dragState.pointerOffset
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
              filter: `drop-shadow(0 8px 24px ${iconShellShadow})`,
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
          "zs-relative zs-cursor-pointer zs-flex zs-flex-col zs-items-center",
          scrollable ? "zs-touch-pan-y" : "zs-touch-none",
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
        onPointerCancel={scrollable ? cancelPress : handlePointerUp}
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
