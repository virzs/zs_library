import { css } from "@emotion/css";

/**
 * 统一的拖拽容器样式
 * iOS风格的拖拽区域样式，包含毛玻璃效果和过渡动画
 */
export const dragContainerStyle = css`
  display: grid;
  gap: 16px;
  place-items: center;
  grid-template-columns: repeat(auto-fill, 96px);
  grid-auto-flow: dense;
  grid-auto-rows: 96px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* 拖拽时的视觉反馈 */
  &.sortable-drag {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* 拖拽悬停状态 */
  &.sortable-hover {
    background: rgba(255, 255, 255, 0.03);
    transform: scale(1.01);
  }
`;

/**
 * 主要拖拽容器样式（用于sortable组件）
 * 针对主界面的拖拽区域优化
 */
export const mainDragContainerStyle = css`
  display: grid;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  grid-template-columns: repeat(auto-fill, 96px);
  grid-auto-flow: dense;
  grid-auto-rows: 96px;
  place-items: center;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;

  /* 拖拽进入时的视觉反馈 */
  &.drag-over {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 4px 16px rgba(0, 0, 0, 0.1);
    transform: scale(1.01);
  }

  /* 拖拽活动状态 */
  &.sortable-drag {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  /* 平滑的拖拽过渡 */
  &.sortable-chosen {
    transform: scale(0.98);
    opacity: 0.8;
  }

  /* 拖拽释放动画 */
  &.sortable-fallback {
    opacity: 0;
    transform: scale(1.1);
  }
`;

/**
 * 拖拽幽灵元素样式
 * 增强版的ghostClass，提供更好的iOS风格视觉反馈
 */
export const enhancedGhostClass = css`
  padding: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: scale(1.05) rotate(2deg);

  > div {
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    border: 2px solid rgba(255, 255, 255, 0.6);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);

    > div {
      opacity: 0.8;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      transform: scale(0.95);
      filter: blur(1px);
    }
  }
`;

/**
 * 拖拽区域悬停效果
 * 当拖拽元素进入可放置区域时的样式
 */
export const dragDropZoneStyle = css`
  position: relative;

  &.drag-enter {
    &::before {
      content: "";
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(
        135deg,
        rgba(0, 150, 255, 0.3) 0%,
        rgba(0, 150, 255, 0.1) 100%
      );
      border-radius: 16px;
      pointer-events: none;
      animation: dragEnterPulse 1s ease-in-out infinite alternate;
    }
  }

  @keyframes dragEnterPulse {
    from {
      opacity: 0.5;
      transform: scale(1);
    }
    to {
      opacity: 1;
      transform: scale(1.02);
    }
  }
`;

/**
 * 拖拽状态指示器样式
 * 显示当前拖拽状态的视觉指示器
 */
export const dragStatusIndicatorStyle = css`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &.drag-active {
    transform: translateY(0);
    opacity: 1;
  }

  &.drag-inactive {
    transform: translateY(-100%);
    opacity: 0;
  }
`;

/**
 * 通用拖拽配置
 * 统一的拖拽配置选项，确保一致的交互体验
 */
export const commonDragConfig = {
  animation: 200,
  easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  fallbackOnBody: true,
  swapThreshold: 0.65,
  ghostClass: "sortable-ghost",
  chosenClass: "sortable-chosen",
  dragClass: "sortable-drag",
  fallbackClass: "sortable-fallback",
};

/**
 * 模态框特定的拖拽配置
 * 针对模态框内的拖拽操作优化的配置
 */
export const modalDragConfig = {
  ...commonDragConfig,
  group: { name: "nested", pull: true, put: false },
  animation: 150,
};

/**
 * 主界面拖拽配置
 * 针对主界面拖拽操作优化的配置
 */
export const mainDragConfig = {
  group: "desktop",
  ...commonDragConfig,
  swapThreshold: 0.65,
  filter: ".drag-disabled",
};
