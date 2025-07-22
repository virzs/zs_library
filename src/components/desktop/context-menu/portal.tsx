import { useEffect, useState, useCallback } from "react";
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
  left: 0,
  right: window.innerWidth,
  top: window.scrollY,
  bottom: window.innerHeight + window.scrollY,
});

const GlobalContextMenu = <D, C>(props: ContextMenuProps<D, C>) => {
  const { contextMenu, setContextMenu } = useSortableState();
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState({
    left: 0,
    top: 0,
  });
  const [animationOrigin, setAnimationOrigin] = useState("center");

  // 计算图标区域的工具函数
  const calculateIconRect = useCallback(
    (rect: DOMRect) => ({
      left: rect.left,
      right: rect.right,
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
      let left = iconRect.right + gap;
      let top = iconRect.top;

      // 检查右侧空间是否足够
      if (left + menuWidth > window.innerWidth) {
        left = iconRect.left - menuWidth - gap;

        if (left < 0) {
          left = iconRect.left;
          top = iconRect.bottom + gap;

          // 检查下方是否超出视窗
          const viewportBottom = window.innerHeight + window.scrollY;
          if (top + menuHeight > viewportBottom) {
            top = iconRect.top - menuHeight - gap;
          }
        }
      } else {
        // 右侧有空间，检查垂直方向
        const viewportBottom = window.innerHeight + window.scrollY;
        if (top + menuHeight > viewportBottom) {
          // 让菜单的底部与图标区域的底部对齐
          top = iconRect.bottom - menuHeight;

          // 如果还是超出视窗顶部，至少保证在视窗顶部
          const viewportTop = window.scrollY;
          if (top < viewportTop + gap) {
            top = viewportTop + gap;
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
  const calculateAnimationOrigin = (
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
  };

  // 监听 contextMenu 状态变化
  useEffect(() => {
    if (contextMenu) {
      setShouldRender(true);
      setIsOpen(true);
      // 初始计算位置（使用预估值）并进行基础边界检测
      const { rect } = contextMenu;
      const iconRect = calculateIconRect(rect);

      const { left, top } = calculateMenuPosition(
        iconRect,
        CONSTANTS.ESTIMATED_MENU_WIDTH,
        CONSTANTS.ESTIMATED_MENU_HEIGHT
      );

      // 计算动画原点
      const origin = calculateAnimationOrigin(left, top, iconRect);
      setAnimationOrigin(origin);

      setCalculatedPosition({ left, top });
    } else {
      // 开始关闭动画
      setIsOpen(false);
      // 延迟移除渲染，给动画时间完成
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, CONSTANTS.ANIMATION_DELAY);

      return () => clearTimeout(timer);
    }
  }, [contextMenu, calculateIconRect, calculateMenuPosition]);

  // 当菜单元素渲染完成后，重新计算精确位置
  useEffect(() => {
    if (isOpen && refs.floating.current && contextMenu && shouldRender) {
      // 等待下一帧，确保元素已经渲染
      requestAnimationFrame(() => {
        const { rect } = contextMenu;
        const iconRect = calculateIconRect(rect);

        // 获取菜单元素的实际尺寸
        const menuElement = refs.floating.current;
        const menuWidth = menuElement?.offsetWidth || CONSTANTS.ESTIMATED_MENU_WIDTH;
        const menuHeight = menuElement?.offsetHeight || CONSTANTS.ESTIMATED_MENU_HEIGHT;

        const { left, top } = calculateMenuPosition(iconRect, menuWidth, menuHeight);

        // 重新计算动画原点（使用实际尺寸）
        const preciseOrigin = calculateAnimationOrigin(left, top, iconRect);
        setAnimationOrigin(preciseOrigin);

        setCalculatedPosition({ left, top });
      });
    }
  }, [isOpen, contextMenu, refs, shouldRender, calculateIconRect, calculateMenuPosition]);

  // 添加点击外部关闭的逻辑
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, setContextMenu, refs.floating]);

  // ...existing code...

  if (!shouldRender) {
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
          // 只设置变换原点，让内部的 motion/react 处理动画
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <ContextMenu {...props} animationOrigin={animationOrigin} isOpen={isOpen} />
      </div>
    </FloatingPortal>
  );
};

export default GlobalContextMenu;
