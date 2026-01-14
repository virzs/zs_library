import { useEffect, useState, useCallback, useLayoutEffect } from "react";
import { useFloating, autoUpdate, offset, flip, shift, FloatingPortal } from "@floating-ui/react";
import { useSortableState } from "../context/state/hooks";
import ContextMenu, { ContextMenuProps } from "./index";

// 常量定义
const CONSTANTS = {
  GAP: 8,
  ESTIMATED_MENU_WIDTH: 200,
  ESTIMATED_MENU_HEIGHT: 200,
  ANIMATION_DELAY: 200,
  EVENT_LISTENER_DELAY: 100,
};

// 计算视窗边界的工具函数
const getViewportBounds = () => ({
  left: window.scrollX,
  right: window.scrollX + window.innerWidth,
  top: window.scrollY,
  bottom: window.scrollY + window.innerHeight,
});

const GlobalContextMenu = <D, C>(props: ContextMenuProps<D, C>) => {
  const { contextMenu, setContextMenu } = useSortableState();
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

  // 计算图标区域的工具函数
  const calculateIconRect = useCallback(
    (rect: DOMRect) => ({
      left: rect.left + window.scrollX,
      right: rect.right + window.scrollX,
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
      width: rect.width,
      height: rect.height,
    }),
    []
  );

  // 应用边界约束的工具函数
  const applyBoundaryConstraints = useCallback((left: number, top: number, menuWidth: number, menuHeight: number) => {
    const viewport = getViewportBounds();
    const gap = CONSTANTS.GAP;

    return {
      left: Math.max(viewport.left + gap, Math.min(left, viewport.right - menuWidth - gap)),
      top: Math.max(viewport.top + gap, Math.min(top, viewport.bottom - menuHeight - gap)),
    };
  }, []);

  // 计算菜单位置的核心逻辑
  const calculateMenuPosition = useCallback(
    (iconRect: ReturnType<typeof calculateIconRect>, menuWidth: number, menuHeight: number) => {
      const gap = CONSTANTS.GAP;
      const viewport = getViewportBounds();
      let left = iconRect.right + gap;
      let top = iconRect.top;

      // 检查右侧空间是否足够
      if (left + menuWidth > viewport.right) {
        left = iconRect.left - menuWidth - gap;

        if (left < viewport.left) {
          left = iconRect.left;
          top = iconRect.bottom + gap;

          // 检查下方是否超出视窗
          if (top + menuHeight > viewport.bottom) {
            top = iconRect.top - menuHeight - gap;
          }
        }
      } else {
        // 右侧有空间，检查垂直方向
        if (top + menuHeight > viewport.bottom) {
          // 让菜单的底部与图标区域的底部对齐
          top = iconRect.bottom - menuHeight;

          // 如果还是超出视窗顶部，至少保证在视窗顶部
          if (top < viewport.top + gap) {
            top = viewport.top + gap;
          }
        }
      }

      return applyBoundaryConstraints(left, top, menuWidth, menuHeight);
    },
    [applyBoundaryConstraints]
  );

  // 创建虚拟元素作为定位参考
  const virtualElement = contextMenu
    ? ({
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: contextMenu.pageX || 0,
            y: contextMenu.pageY || 0,
            top: contextMenu.pageY || 0,
            left: contextMenu.pageX || 0,
            right: contextMenu.pageX || 0,
            bottom: contextMenu.pageY || 0,
          };
        },
      } as Element)
    : null;

  const { refs } = useFloating({
    open: isOpen,
    strategy: "absolute", // 改为绝对定位策略
    middleware: [
      offset(10), // 距离鼠标位置 10px
      flip({
        fallbackPlacements: ["bottom", "top", "right", "left"],
      }),
      shift({ padding: 10 }), // 距离视窗边缘至少 10px
    ],
    whileElementsMounted: autoUpdate,
    elements: {
      reference: virtualElement,
    },
  });

  // 计算动画原点
  const calculateAnimationOrigin = useCallback((
    menuLeft: number,
    menuTop: number,
    iconRect: { left: number; right: number; top: number; bottom: number }
  ) => {
    // 确定菜单相对于图标的方向
    const isLeft = menuLeft < iconRect.left;
    const isRight = menuLeft > iconRect.right;
    const isTop = menuTop < iconRect.top;
    const isBottom = menuTop > iconRect.bottom;

    // 根据位置关系确定动画原点
    if (isRight) {
      if (isTop) return "bottom left";
      if (isBottom) return "top left";
      return "center left";
    } else if (isLeft) {
      if (isTop) return "bottom right";
      if (isBottom) return "top right";
      return "center right";
    } else if (isBottom) {
      return "top center";
    } else if (isTop) {
      return "bottom center";
    }

    return "center";
  }, []);

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

      const { left, top } = calculateMenuPosition(iconRect, menuWidth, menuHeight);

      const origin = calculateAnimationOrigin(left, top, iconRect);
      setAnimationOrigin(origin);
      setCalculatedPosition({ left, top });
    },
    [calculateAnimationOrigin, calculateIconRect, calculateMenuPosition, contextMenu, getCurrentReferenceRect, refs.floating]
  );

  // 监听 contextMenu 状态变化
  useEffect(() => {
    if (contextMenu) {
      setShouldRender(true);
      setIsOpen(true);
    } else {
      // 开始关闭动画
      setIsOpen(false);
      setIsPositionReady(false);
      // 延迟移除渲染，给动画时间完成
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, CONSTANTS.ANIMATION_DELAY);

      return () => clearTimeout(timer);
    }
  }, [contextMenu]);

  // 首次打开时等待 portal 节点可测量，再进行定位（避免 dock 首次用估算高度导致偏移）
  useLayoutEffect(() => {
    if (!shouldActuallyRender || !contextMenu) return;

    const floatingEl = refs.floating.current;
    if (floatingEl && floatingEl.offsetWidth > 0 && floatingEl.offsetHeight > 0) {
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
      if (floatingEl && floatingEl.offsetWidth > 0 && floatingEl.offsetHeight > 0) {
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

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [contextMenu, recalculatePosition, refs.floating, shouldActuallyRender]);

  useEffect(() => {
    if (!shouldActuallyRender || !contextMenu) return;
    const floatingEl = refs.floating.current;
    if (!floatingEl) return;
    if (typeof ResizeObserver === "undefined") return;

    let rafId = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        recalculatePosition();
      });
    });

    observer.observe(floatingEl);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [contextMenu, recalculatePosition, refs.floating, shouldActuallyRender]);

  // 打开期间持续追踪 reference/floating 的变化，自动修正位置
  useEffect(() => {
    if (!contextMenu) return;
    const referenceEl = contextMenu.element;
    const floatingEl = refs.floating.current;
    if (!referenceEl || referenceEl === document.body || !floatingEl) return;

    recalculatePosition();
    return autoUpdate(referenceEl, floatingEl, () => {
      recalculatePosition();
    });
  }, [contextMenu, recalculatePosition, refs.floating]);

  // 添加点击外部关闭的逻辑
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

    // 延迟添加事件监听，避免立即触发
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

  // ...existing code...

  if (!shouldActuallyRender) {
    return null;
  }

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={{
          position: "absolute",
          left: calculatedPosition.left,
          top: calculatedPosition.top,
          zIndex: 9999,
          transformOrigin: animationOrigin,
          visibility: isPositionReady ? "visible" : "hidden",
          pointerEvents: isPositionReady ? "auto" : "none",
          // 只设置变换原点，让内部的 motion/react 处理动画
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <ContextMenu {...props} animationOrigin={animationOrigin} isOpen={isActuallyOpen} />
      </div>
    </FloatingPortal>
  );
};

export default GlobalContextMenu;
