import { useEffect, useState, useCallback, useLayoutEffect } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  FloatingPortal,
} from "@floating-ui/react";
import { useDesktopDnd } from "../context";
import ContextMenu from "./index";

const CONSTANTS = {
  GAP: 8,
  ESTIMATED_MENU_WIDTH: 220,
  ESTIMATED_MENU_HEIGHT: 200,
  ANIMATION_DELAY: 180,
  EVENT_LISTENER_DELAY: 80,
};

const getViewportBounds = () => ({
  left: 0,
  right: window.innerWidth,
  top: 0,
  bottom: window.innerHeight,
});

const GlobalContextMenu = () => {
  const { contextMenu, setContextMenu } = useDesktopDnd();
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const shouldActuallyRender = shouldRender || Boolean(contextMenu);
  const isActuallyOpen = isOpen || Boolean(contextMenu);
  const [isPositionReady, setIsPositionReady] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState({
    left: 0,
    top: 0,
  });
  const [animationOrigin, setAnimationOrigin] = useState("center");

  const calculateIconRect = useCallback(
    (rect: DOMRect) => ({
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    }),
    [],
  );

  const applyBoundaryConstraints = useCallback(
    (left: number, top: number, menuWidth: number, menuHeight: number) => {
      const viewport = getViewportBounds();
      const gap = CONSTANTS.GAP;

      return {
        left: Math.max(
          viewport.left + gap,
          Math.min(left, viewport.right - menuWidth - gap),
        ),
        top: Math.max(
          viewport.top + gap,
          Math.min(top, viewport.bottom - menuHeight - gap),
        ),
      };
    },
    [],
  );

  const calculateMenuPosition = useCallback(
    (
      iconRect: ReturnType<typeof calculateIconRect>,
      menuWidth: number,
      menuHeight: number,
    ) => {
      const gap = CONSTANTS.GAP;
      const viewport = getViewportBounds();
      const clickLeft = contextMenu?.pageX ?? iconRect.right;
      const clickTop = contextMenu?.pageY ?? iconRect.top;

      let left = clickLeft + gap;
      let top = clickTop;

      if (left + menuWidth > viewport.right) {
        left = clickLeft - menuWidth - gap;

        if (left < viewport.left) {
          left = iconRect.left;
          top = iconRect.bottom + gap;

          if (top + menuHeight > viewport.bottom) {
            top = iconRect.top - menuHeight - gap;
          }
        }
      } else if (top + menuHeight > viewport.bottom) {
        top = iconRect.bottom - menuHeight;
        if (top < viewport.top + gap) {
          top = viewport.top + gap;
        }
      }

      return applyBoundaryConstraints(left, top, menuWidth, menuHeight);
    },
    [
      applyBoundaryConstraints,
      calculateIconRect,
      contextMenu?.pageX,
      contextMenu?.pageY,
    ],
  );

  const virtualElement = contextMenu
    ? ({
        getBoundingClientRect() {
          const x = contextMenu.pageX || 0;
          const y = contextMenu.pageY || 0;
          return {
            width: 0,
            height: 0,
            x,
            y,
            top: y,
            left: x,
            right: x,
            bottom: y,
          };
        },
      } as Element)
    : null;

  const { refs } = useFloating({
    open: isOpen,
    strategy: "fixed",
    middleware: [
      offset(10),
      flip({ fallbackPlacements: ["bottom", "top", "right", "left"] }),
      shift({ padding: 10 }),
    ],
    whileElementsMounted: autoUpdate,
    elements: {
      reference: virtualElement,
    },
  });

  const calculateAnimationOrigin = useCallback(
    (
      menuLeft: number,
      menuTop: number,
      iconRect: { left: number; right: number; top: number; bottom: number },
    ) => {
      const isLeft = menuLeft < iconRect.left;
      const isRight = menuLeft > iconRect.right;
      const isTop = menuTop < iconRect.top;
      const isBottom = menuTop > iconRect.bottom;

      if (isRight) {
        if (isTop) return "bottom left";
        if (isBottom) return "top left";
        return "center left";
      }
      if (isLeft) {
        if (isTop) return "bottom right";
        if (isBottom) return "top right";
        return "center right";
      }
      if (isBottom) return "top center";
      if (isTop) return "bottom center";
      return "center";
    },
    [],
  );

  const getCurrentReferenceRect = useCallback(() => {
    const elementRect = contextMenu?.element?.getBoundingClientRect();
    return elementRect ?? contextMenu?.rect;
  }, [contextMenu]);

  const recalculatePosition = useCallback(
    (options?: { useEstimatedSize?: boolean }) => {
      if (!contextMenu) return;
      const rect = getCurrentReferenceRect();
      if (!rect) return;

      const iconRect = calculateIconRect(rect);
      const menuElement = refs.floating.current;

      const useEstimatedSize = options?.useEstimatedSize ?? false;
      const menuWidth = useEstimatedSize
        ? CONSTANTS.ESTIMATED_MENU_WIDTH
        : menuElement?.offsetWidth || CONSTANTS.ESTIMATED_MENU_WIDTH;
      const menuHeight = useEstimatedSize
        ? CONSTANTS.ESTIMATED_MENU_HEIGHT
        : menuElement?.offsetHeight || CONSTANTS.ESTIMATED_MENU_HEIGHT;

      const { left, top } = calculateMenuPosition(
        iconRect,
        menuWidth,
        menuHeight,
      );
      const origin = calculateAnimationOrigin(left, top, iconRect);
      setAnimationOrigin(origin);
      setCalculatedPosition({ left, top });
    },
    [
      calculateAnimationOrigin,
      calculateIconRect,
      calculateMenuPosition,
      contextMenu,
      getCurrentReferenceRect,
      refs.floating,
    ],
  );

  useEffect(() => {
    if (contextMenu) {
      setShouldRender(true);
      setIsOpen(true);
      return;
    }

    setIsOpen(false);
    setIsPositionReady(false);
    const timer = setTimeout(
      () => setShouldRender(false),
      CONSTANTS.ANIMATION_DELAY,
    );
    return () => clearTimeout(timer);
  }, [contextMenu]);

  useLayoutEffect(() => {
    if (!shouldActuallyRender || !contextMenu) return;

    const floatingEl = refs.floating.current;
    if (
      floatingEl &&
      floatingEl.offsetWidth > 0 &&
      floatingEl.offsetHeight > 0
    ) {
      recalculatePosition();
      setIsPositionReady(true);
      return;
    }

    setIsPositionReady(false);

    let rafId = 0;
    let frameCount = 0;
    const maxFrames = 12;

    const tryPosition = () => {
      const floatingEl = refs.floating.current;
      if (
        floatingEl &&
        floatingEl.offsetWidth > 0 &&
        floatingEl.offsetHeight > 0
      ) {
        recalculatePosition();
        setIsPositionReady(true);
        return;
      }

      if (frameCount >= maxFrames) {
        recalculatePosition({ useEstimatedSize: true });
        setIsPositionReady(true);
        return;
      }

      frameCount += 1;
      rafId = requestAnimationFrame(tryPosition);
    };

    tryPosition();

    return () => cancelAnimationFrame(rafId);
  }, [contextMenu, recalculatePosition, refs.floating, shouldActuallyRender]);

  useEffect(() => {
    if (!shouldActuallyRender || !contextMenu) return;
    const floatingEl = refs.floating.current;
    if (!floatingEl || typeof ResizeObserver === "undefined") return;

    let rafId = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => recalculatePosition());
    });

    observer.observe(floatingEl);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [contextMenu, recalculatePosition, refs.floating, shouldActuallyRender]);

  useEffect(() => {
    if (!contextMenu) return;
    const referenceEl = contextMenu.element;
    const floatingEl = refs.floating.current;
    if (!referenceEl || referenceEl === document.body || !floatingEl) return;

    recalculatePosition();
    return autoUpdate(referenceEl, floatingEl, () => recalculatePosition());
  }, [contextMenu, recalculatePosition, refs.floating]);

  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const floatingElement = refs.floating.current;
      if (floatingElement && !floatingElement.contains(target)) {
        setContextMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContextMenu(null);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, CONSTANTS.EVENT_LISTENER_DELAY);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu, setContextMenu, refs.floating]);

  if (!shouldActuallyRender) {
    return null;
  }

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={{
          position: "fixed",
          left: calculatedPosition.left,
          top: calculatedPosition.top,
          zIndex: 9999,
          transformOrigin: animationOrigin,
          visibility: isPositionReady ? "visible" : "hidden",
          pointerEvents: isPositionReady ? "auto" : "none",
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <ContextMenu
          animationOrigin={animationOrigin}
          isOpen={isActuallyOpen}
        />
      </div>
    </FloatingPortal>
  );
};

export default GlobalContextMenu;
