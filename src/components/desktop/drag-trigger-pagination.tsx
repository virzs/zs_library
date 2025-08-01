import React, { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { css, cx } from "@emotion/css";
import Slider from "react-slick";

export interface DragTriggerPaginationRef {
  handleDragMove: (e: React.DragEvent) => void;
}

export interface DragTriggerPaginationProps {
  /**
   * Slider 实例引用
   */
  sliderRef: React.RefObject<Slider>;
  /**
   * 当前激活的幻灯片索引
   */
  activeSlide: number;
  /**
   * 总页数
   */
  totalSlides: number;
  /**
   * 是否正在拖拽
   */
  isDragging: boolean;
  /**
   * 拖拽触发延迟时间（毫秒）
   * @default 800
   */
  triggerDelay?: number;
  /**
   * 触发区域宽度（像素）
   * @default 80
   */
  triggerZoneWidth?: number;
  /**
   * 容器引用
   */
  containerRef: React.RefObject<HTMLDivElement>;
  /**
   * 创建新页面的回调函数
   */
  onCreateNewPage?: () => void;
}

const DragTriggerPagination = forwardRef<DragTriggerPaginationRef, DragTriggerPaginationProps>(
  (
    {
      sliderRef,
      activeSlide,
      totalSlides,
      isDragging,
      triggerDelay = 800,
      triggerZoneWidth = 80,
      containerRef,
      onCreateNewPage,
    },
    ref
  ) => {
    const dragTriggerTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [dragTriggerZone, setDragTriggerZone] = useState<"left" | "right" | null>(null);
    const lastTriggerTimeRef = useRef<number>(0);
    const triggerCooldownRef = useRef<boolean>(false);

    // 清除拖拽触发定时器
    const clearDragTriggerTimer = useCallback(() => {
      if (dragTriggerTimerRef.current) {
        clearTimeout(dragTriggerTimerRef.current);
        dragTriggerTimerRef.current = null;
      }
      // 重置冷却状态
      triggerCooldownRef.current = false;
    }, []);

    // 处理拖拽进入触发区域
    const handleDragEnterTriggerZone = useCallback(
      (zone: "left" | "right") => {
        if (!isDragging) return;

        // 检查冷却时间，防止连续触发
        const now = Date.now();
        if (triggerCooldownRef.current || now - lastTriggerTimeRef.current < triggerDelay + 200) {
          return;
        }

        // 避免重复设置定时器
        if (dragTriggerZone === zone) {
          return;
        }

        setDragTriggerZone(zone);
        clearDragTriggerTimer();

        // 设置延迟切换定时器
        dragTriggerTimerRef.current = setTimeout(() => {
          const slider = sliderRef.current;
          if (!slider) {
            setDragTriggerZone(null);
            return;
          }

          // 设置冷却状态
          triggerCooldownRef.current = true;
          lastTriggerTimeRef.current = Date.now();

          if (zone === "left" && activeSlide > 0) {
            slider.slickGoTo(activeSlide - 1);
          } else if (zone === "right") {
            if (activeSlide < totalSlides - 1) {
              slider.slickGoTo(activeSlide + 1);
            } else {
              // 在最后一页时创建新页面
              onCreateNewPage?.();
            }
          }

          setDragTriggerZone(null);

          // 延迟解除冷却状态
          setTimeout(() => {
            triggerCooldownRef.current = false;
          }, 300);
        }, triggerDelay);
      },
      [
        isDragging,
        activeSlide,
        totalSlides,
        clearDragTriggerTimer,
        sliderRef,
        dragTriggerZone,
        triggerDelay,
        onCreateNewPage,
      ]
    );

    // 处理拖拽离开触发区域
    const handleDragLeaveTriggerZone = useCallback(() => {
      setDragTriggerZone(null);
      clearDragTriggerTimer();
    }, [clearDragTriggerTimer]);

    // 处理拖拽在容器内移动
    const handleDragMove = useCallback(
      (e: React.DragEvent) => {
        if (!isDragging || !containerRef.current) {
          return;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const rightTriggerStart = rect.width - triggerZoneWidth;

        // 检查是否在左侧触发区域
        if (x < triggerZoneWidth && activeSlide > 0) {
          handleDragEnterTriggerZone("left");
        }
        // 检查是否在右侧触发区域（包括最后一页）
        else if (x > rightTriggerStart) {
          handleDragEnterTriggerZone("right");
        }
        // 不在任何触发区域
        else {
          if (dragTriggerZone) {
            handleDragLeaveTriggerZone();
          }
        }
      },
      [
        isDragging,
        containerRef,
        triggerZoneWidth,
        activeSlide,
        totalSlides,
        handleDragEnterTriggerZone,
        dragTriggerZone,
        handleDragLeaveTriggerZone,
      ]
    );

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        handleDragMove,
      }),
      [handleDragMove]
    );

    // 清理定时器
    useEffect(() => {
      return () => {
        clearDragTriggerTimer();
      };
    }, [clearDragTriggerTimer]);

    // 监听拖拽状态变化，拖拽结束时清理状态
    useEffect(() => {
      if (!isDragging) {
        clearDragTriggerTimer();
        setDragTriggerZone(null);
        triggerCooldownRef.current = false;
        lastTriggerTimeRef.current = 0;
      }
    }, [isDragging, clearDragTriggerTimer]);

    // 拖拽触发区域样式
    const dragTriggerZoneStyle = css`
      position: absolute;
      top: 0;
      bottom: 0;
      width: ${triggerZoneWidth}px;
      z-index: 10;
      pointer-events: auto;
      cursor: pointer;
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;

      &.left {
        left: 0;
        background: linear-gradient(
          to right,
          rgba(0, 150, 255, 0.08) 0%,
          rgba(0, 150, 255, 0.03) 60%,
          rgba(0, 150, 255, 0.01) 80%,
          transparent 100%
        );
      }

      &.right {
        right: 0;
        background: linear-gradient(
          to left,
          rgba(0, 150, 255, 0.08) 0%,
          rgba(0, 150, 255, 0.03) 60%,
          rgba(0, 150, 255, 0.01) 80%,
          transparent 100%
        );
      }

      /* 鼠标悬停时显示渐变背景 */
      &:hover {
        opacity: 1;
      }

      /* 激活状态样式 */
      &.active {
        opacity: 1;

        &.left {
          background: linear-gradient(
            to right,
            rgba(0, 150, 255, 0.25) 0%,
            rgba(0, 150, 255, 0.08) 50%,
            rgba(0, 150, 255, 0.03) 75%,
            transparent 100%
          );
        }

        &.right {
          background: linear-gradient(
            to left,
            rgba(0, 150, 255, 0.25) 0%,
            rgba(0, 150, 255, 0.08) 50%,
            rgba(0, 150, 255, 0.03) 75%,
            transparent 100%
          );
        }
      }
    `;

    if (!isDragging) {
      return null;
    }

    return (
      <>
        {/* 左侧拖拽触发区域 */}
        {activeSlide > 0 && (
          <div
            className={cx(dragTriggerZoneStyle, "left", dragTriggerZone === "left" && "active")}
            onMouseEnter={() => {
              if (isDragging) {
                handleDragEnterTriggerZone("left");
              }
            }}
            onMouseLeave={() => {
              handleDragLeaveTriggerZone();
            }}
          />
        )}

        {/* 右侧拖拽触发区域（包括最后一页创建新页面） */}
        <div
          className={cx(dragTriggerZoneStyle, "right", dragTriggerZone === "right" && "active")}
          onMouseEnter={() => {
            if (isDragging) {
              handleDragEnterTriggerZone("right");
            }
          }}
          onMouseLeave={() => {
            handleDragLeaveTriggerZone();
          }}
        />
      </>
    );
  }
);

DragTriggerPagination.displayName = "DragTriggerPagination";

export default DragTriggerPagination;
export { DragTriggerPagination };
