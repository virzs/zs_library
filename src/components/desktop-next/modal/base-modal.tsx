import { css, cx } from "@emotion/css";
import * as Dialog from "@radix-ui/react-dialog";
import {
  RiCloseLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
} from "@remixicon/react";
import { AnimatePresence } from "motion/react";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Theme } from "../themes";

type BaseModalSlot =
  | "overlay"
  | "content"
  | "panel"
  | "header"
  | "body"
  | "inner"
  | "footer"
  | "close"
  | "floatingControls"
  | "floatingClose"
  | "floatingFullscreen";

type BaseModalClassNames = Partial<Record<BaseModalSlot, string>>;
type BaseModalStyles = Partial<Record<BaseModalSlot, CSSProperties>>;

export interface BaseModalFloatingControlsConfig {
  /** 是否显示浮动关闭按钮 */
  close?: boolean;
  /** 是否显示浮动全屏按钮 */
  fullscreen?: boolean;
}

export interface BaseModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 关闭弹窗时触发 */
  onClose: () => void;
  /** 弹窗标题 */
  title?: ReactNode;
  /** 弹窗内容 */
  children?: ReactNode;
  /** 弹窗宽度 */
  width?: number;
  /** 弹窗展开动画的鼠标位置 */
  mousePosition?: { x: number; y: number } | null;
  /** 关闭后是否销毁内容 */
  destroyOnClose?: boolean;
  /** 是否显示关闭按钮 */
  closable?: boolean;
  /** 是否显示 iPadOS 风格的浮动关闭/全屏控制，默认关闭 */
  floatingControls?: boolean | BaseModalFloatingControlsConfig;
  /** 弹窗底部内容 */
  footer?: ReactNode;
  /** 各区域 className 配置 */
  classNames?: BaseModalClassNames;
  /** 各区域内联样式配置 */
  styles?: BaseModalStyles;
  /** 是否禁用默认最大高度限制 */
  disableMaxHeight?: boolean;
  /** 主题配置 */
  theme?: Theme;
}

const BaseModal = (props: BaseModalProps) => {
  const {
    visible: externalVisible,
    onClose,
    title,
    children,
    width = 600,
    mousePosition,
    destroyOnClose = true,
    closable = false,
    floatingControls = false,
    footer = null,
    classNames,
    styles,
    disableMaxHeight = false,
    theme,
  } = props;

  const modalTheme = theme?.token?.modal;

  const titleId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeFromRectRef = useRef<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsAwake, setControlsAwake] = useState(false);

  const floatingControlsConfig =
    typeof floatingControls === "object" ? floatingControls : undefined;
  const floatingControlsEnabled = Boolean(floatingControls);
  const showFloatingClose =
    floatingControlsEnabled && (floatingControlsConfig?.close ?? true);
  const showFloatingFullscreen =
    floatingControlsEnabled && (floatingControlsConfig?.fullscreen ?? true);
  const showFloatingControls = showFloatingClose || showFloatingFullscreen;

  useEffect(() => {
    if (externalVisible) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setIsClosing(false);
      setVisible(true);
    } else {
      setVisible(false);
      setIsFullscreen(false);
      setControlsAwake(false);
    }
  }, [externalVisible]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const previousRect = resizeFromRectRef.current;
    const content = contentRef.current;

    if (!previousRect || !content) return;

    resizeFromRectRef.current = null;
    const nextRect = content.getBoundingClientRect();
    if (!nextRect.width || !nextRect.height) return;

    const scaleX = previousRect.width / nextRect.width;
    const scaleY = previousRect.height / nextRect.height;
    const previousTransformOrigin = content.style.transformOrigin;

    content.style.transformOrigin = "center";
    content.style.setProperty("--base-modal-resize-duration", "0ms");
    content.style.setProperty("--base-modal-resize-scale-x", `${scaleX}`);
    content.style.setProperty("--base-modal-resize-scale-y", `${scaleY}`);

    requestAnimationFrame(() => {
      content.style.setProperty("--base-modal-resize-duration", "360ms");
      content.style.setProperty("--base-modal-resize-scale-x", "1");
      content.style.setProperty("--base-modal-resize-scale-y", "1");
    });

    if (resizeTimerRef.current) {
      clearTimeout(resizeTimerRef.current);
    }

    resizeTimerRef.current = setTimeout(() => {
      content.style.removeProperty("--base-modal-resize-duration");
      content.style.removeProperty("--base-modal-resize-scale-x");
      content.style.removeProperty("--base-modal-resize-scale-y");
      content.style.transformOrigin = previousTransformOrigin;
      resizeTimerRef.current = null;
    }, 420);
  }, [isFullscreen]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setVisible(false);
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      closeTimerRef.current = null;
      onClose();
    }, 300);
  };

  const handleFullscreenToggle = () => {
    resizeFromRectRef.current =
      contentRef.current?.getBoundingClientRect() ?? null;
    setIsFullscreen((current) => !current);
    setControlsAwake(true);
  };

  const bgColor =
    modalTheme?.content?.backgroundColor ?? "rgba(128, 128, 128, 0.3)";
  const bdFilter = modalTheme?.content?.backdropFilter ?? "blur(40px)";
  const shadowColor = modalTheme?.content?.boxShadowColor ?? "rgba(0,0,0,0.3)";
  const shadowBorderColor =
    modalTheme?.content?.boxShadowBorderColor ?? "rgba(255,255,255,0.08)";
  const borderColor =
    modalTheme?.content?.borderColor ?? "rgba(255,255,255,0.15)";
  const borderRadius = modalTheme?.content?.borderRadius ?? "20px";
  const maskBg = modalTheme?.mask?.backgroundColor ?? "rgba(0,0,0,0.4)";
  const maskBdFilter = modalTheme?.mask?.backdropFilter ?? "blur(20px)";
  const headerColor = modalTheme?.header?.textColor ?? "rgba(255,255,255,0.9)";
  const floatingControlsTheme = modalTheme?.floatingControls;
  const fcGap = floatingControlsTheme?.gap ?? "7px";
  const fcPadding = floatingControlsTheme?.padding ?? "7px 8px";
  const fcBg =
    floatingControlsTheme?.backgroundColor ?? "rgba(20, 24, 31, 0.14)";
  const fcBorder =
    floatingControlsTheme?.borderColor ?? "rgba(255, 255, 255, 0.18)";
  const fcBackdropFilter =
    floatingControlsTheme?.backdropFilter ?? "blur(18px)";
  const fcOpacity = floatingControlsTheme?.opacity ?? 1;
  const fcInactiveOpacity = floatingControlsTheme?.inactiveOpacity ?? 0.42;
  const fcInactiveScale = floatingControlsTheme?.inactiveScale ?? 0.82;
  const fcButtonSize = floatingControlsTheme?.buttonSize ?? "16px";
  const fcInactiveButtonSize =
    floatingControlsTheme?.inactiveButtonSize ?? "12px";
  const fcCloseBg =
    floatingControlsTheme?.closeButton?.backgroundColor ??
    "rgba(255, 95, 86, 0.96)";
  const fcCloseColor =
    floatingControlsTheme?.closeButton?.textColor ??
    "rgba(85, 20, 14, 0.85)";
  const fcCloseIconSize = floatingControlsTheme?.closeButton?.iconSize ?? 9;
  const fcFullscreenBg =
    floatingControlsTheme?.fullscreenButton?.backgroundColor ??
    "rgba(48, 209, 88, 0.96)";
  const fcFullscreenColor =
    floatingControlsTheme?.fullscreenButton?.textColor ??
    "rgba(4, 58, 26, 0.9)";
  const fcFullscreenIconSize =
    floatingControlsTheme?.fullscreenButton?.iconSize ?? 9;
  const sbWidth = modalTheme?.scrollbar?.width ?? "4px";
  const sbTrack = modalTheme?.scrollbar?.trackColor ?? "transparent";
  const sbThumb = modalTheme?.scrollbar?.thumbColor ?? "rgba(255,255,255,0.15)";
  const sbThumbHover =
    modalTheme?.scrollbar?.thumbHoverColor ?? "rgba(255,255,255,0.25)";
  const sbRadius = modalTheme?.scrollbar?.borderRadius ?? "2px";
  const shouldRender = destroyOnClose
    ? externalVisible || isClosing
    : externalVisible || visible || isClosing;
  const transformOrigin = mousePosition
    ? `${mousePosition.x}px ${mousePosition.y}px`
    : "center";
  const parsedBorderRadius = Number.parseFloat(borderRadius);
  const floatingControlsInset =
    isFullscreen
      ? (floatingControlsTheme?.fullscreenInset ?? "12px")
      : (floatingControlsTheme?.inset ??
        (borderRadius.trim().endsWith("px") &&
        Number.isFinite(parsedBorderRadius)
          ? `${Math.max(12, Math.round(parsedBorderRadius * 0.8))}px`
          : "12px"));

  return (
    <AnimatePresence>
      {shouldRender && (
        <Dialog.Root
          open={visible}
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
        >
          <Dialog.Portal forceMount>
            <Dialog.Overlay
              className={cx(
                "base-modal",
                { "modal-closing": isClosing },
                css`
                  position: fixed;
                  inset: 0;
                  z-index: 1000;
                  background: ${maskBg};
                  backdrop-filter: ${maskBdFilter};
                  -webkit-backdrop-filter: ${maskBdFilter};
                  animation: maskFadeIn 0.2s ease-out;

                  @keyframes maskFadeIn {
                    from {
                      opacity: 0;
                      backdrop-filter: blur(0px);
                    }
                    to {
                      opacity: 1;
                      backdrop-filter: ${maskBdFilter};
                    }
                  }

                  @keyframes maskFadeOut {
                    from {
                      opacity: 1;
                      backdrop-filter: ${maskBdFilter};
                    }
                    to {
                      opacity: 0;
                      backdrop-filter: blur(0px);
                    }
                  }

                  &.modal-closing {
                    animation: maskFadeOut 0.3s ease-out forwards;
                  }
                `,
                classNames?.overlay,
              )}
              style={styles?.overlay}
            />
            <Dialog.Content
              ref={contentRef}
              aria-labelledby={title ? titleId : undefined}
              onOpenAutoFocus={(event) => event.preventDefault()}
              className={cx(
                css`
                  position: fixed;
                  left: 50%;
                  top: 50%;
                  z-index: 1001;
                  width: ${isFullscreen
                    ? "100vw"
                    : typeof width === "number"
                      ? `${width}px`
                      : width};
                  max-width: ${isFullscreen
                    ? "100vw"
                    : "calc(100vw - 80px)"};
                  ${isFullscreen
                    ? `
                  height: 100vh;
                  height: 100dvh;
                  max-height: 100vh;
                  max-height: 100dvh;
                  `
                    : ""}
                  outline: none;
                  transform-origin: ${transformOrigin};
                  transform: translate(-50%, -50%)
                    scale(
                      var(--base-modal-resize-scale-x, 1),
                      var(--base-modal-resize-scale-y, 1)
                    );
                  transition:
                    transform var(--base-modal-resize-duration, 0ms)
                      cubic-bezier(0.2, 0.8, 0.2, 1),
                    width 0.36s cubic-bezier(0.2, 0.8, 0.2, 1),
                    max-width 0.36s cubic-bezier(0.2, 0.8, 0.2, 1),
                    height 0.36s cubic-bezier(0.2, 0.8, 0.2, 1),
                    max-height 0.36s cubic-bezier(0.2, 0.8, 0.2, 1);
                  will-change: transform, width, height;
                  animation: modalSlideIn 0.3s
                    cubic-bezier(0.175, 0.885, 0.32, 1);

                  @keyframes modalSlideIn {
                    0% {
                      opacity: 0;
                      transform: translate(-50%, -50%) scale(0.85)
                        translateY(12px);
                    }
                    100% {
                      opacity: 1;
                      transform: translate(-50%, -50%) scale(1) translateY(0);
                    }
                  }

                  @keyframes modalSlideOut {
                    0% {
                      opacity: 1;
                      transform: translate(-50%, -50%) scale(1) translateY(0);
                    }
                    100% {
                      opacity: 0;
                      transform: translate(-50%, -50%) scale(0.85)
                        translateY(12px);
                    }
                  }

                  .modal-closing + & {
                    animation: modalSlideOut 0.3s
                      cubic-bezier(0.175, 0.885, 0.32, 1) forwards;
                  }
                `,
                classNames?.content,
              )}
              style={styles?.content}
            >
              <div
                data-base-modal-panel
                data-fullscreen={isFullscreen || undefined}
                className={cx(
                  "base-modal-panel",
                  css`
                    background: ${bgColor};
                    backdrop-filter: ${bdFilter};
                    -webkit-backdrop-filter: ${bdFilter};
                    box-shadow:
                      0 24px 60px ${shadowColor},
                      0 0 0 0.75px ${shadowBorderColor},
                      inset 0 1px 0 rgba(255, 255, 255, 0.12);
                    border: 0.75px solid ${borderColor};
                    padding: 0;
                    border-radius: ${isFullscreen ? "0" : borderRadius};
                    overflow: hidden;
                    position: relative;
                    transition:
                      border-radius 0.36s cubic-bezier(0.2, 0.8, 0.2, 1),
                      box-shadow 0.36s cubic-bezier(0.2, 0.8, 0.2, 1);
                    ${isFullscreen
                      ? `
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    `
                      : ""}

                    * {
                      &::-webkit-scrollbar {
                        width: 8px;
                      }
                      &::-webkit-scrollbar-track {
                        background: ${sbTrack};
                      }
                      &::-webkit-scrollbar-thumb {
                        background: ${sbThumb};
                        border-radius: ${sbRadius};
                        transition: background-color 0.2s ease;
                      }
                      &::-webkit-scrollbar-thumb:hover {
                        background: ${sbThumbHover};
                      }
                      scrollbar-width: thin;
                      scrollbar-color: ${sbThumb} ${sbTrack};
                    }
                  `,
                  classNames?.panel,
                )}
                style={styles?.panel}
              >
                {showFloatingControls && (
                  <div
                    className={cx(
                      "base-modal-floating-controls",
                      css`
                        position: absolute;
                        top: ${floatingControlsInset};
                        left: ${floatingControlsInset};
                        z-index: 4;
                        display: inline-flex;
                        align-items: center;
                        gap: ${fcGap};
                        padding: ${fcPadding};
                        border-radius: 999px;
                        background: ${fcBg};
                        border: 1px solid ${fcBorder};
                        box-shadow: none;
                        backdrop-filter: ${fcBackdropFilter};
                        -webkit-backdrop-filter: ${fcBackdropFilter};
                        opacity: ${controlsAwake
                          ? fcOpacity
                          : fcInactiveOpacity};
                        transform: scale(${controlsAwake
                          ? 1
                          : fcInactiveScale});
                        transform-origin: top left;
                        transition:
                          opacity 0.2s ease,
                          transform 0.2s ease,
                          background-color 0.2s ease,
                          border-color 0.2s ease,
                          box-shadow 0.2s ease;

                        &:hover,
                        &:focus-within {
                          opacity: 1;
                          transform: scale(1);
                        }
                      `,
                      classNames?.floatingControls,
                    )}
                    style={styles?.floatingControls}
                    onMouseEnter={() => setControlsAwake(true)}
                    onMouseLeave={() => setControlsAwake(false)}
                    onFocusCapture={() => setControlsAwake(true)}
                    onBlurCapture={() => setControlsAwake(false)}
                  >
                    {showFloatingClose && (
                      <Dialog.Close
                        aria-label="关闭"
                        className={cx(
                          css`
                            width: ${controlsAwake
                              ? fcButtonSize
                              : fcInactiveButtonSize};
                            min-width: ${controlsAwake
                              ? fcButtonSize
                              : fcInactiveButtonSize};
                            height: ${controlsAwake
                              ? fcButtonSize
                              : fcInactiveButtonSize};
                            border: none;
                            border-radius: 999px;
                            background: ${fcCloseBg};
                            color: ${controlsAwake ? fcCloseColor : "transparent"};
                            cursor: pointer;
                            padding: 0;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            overflow: hidden;
                            box-shadow: none;
                            transition:
                              width 0.2s ease,
                              min-width 0.2s ease,
                              height 0.2s ease,
                              color 0.14s ease,
                              transform 0.16s ease,
                              filter 0.16s ease,
                              box-shadow 0.16s ease;

                            &:hover {
                              filter: brightness(1.08);
                              transform: scale(1.05);
                            }

                            &:active {
                              transform: scale(0.94);
                            }

                            &:focus-visible {
                              outline: 2px solid rgba(255, 255, 255, 0.75);
                              outline-offset: 2px;
                            }

                            svg {
                              opacity: ${controlsAwake ? 1 : 0};
                              transform: scale(${controlsAwake ? 1 : 0.6});
                              transition:
                                opacity 0.14s ease,
                                transform 0.14s ease;
                            }
                          `,
                          classNames?.floatingClose,
                        )}
                        style={styles?.floatingClose}
                      >
                        <RiCloseLine size={fcCloseIconSize} />
                      </Dialog.Close>
                    )}
                    {showFloatingFullscreen && (
                      <button
                        type="button"
                        aria-label={isFullscreen ? "退出全屏" : "全屏"}
                        onClick={handleFullscreenToggle}
                        className={cx(
                          css`
                            width: ${controlsAwake
                              ? fcButtonSize
                              : fcInactiveButtonSize};
                            min-width: ${controlsAwake
                              ? fcButtonSize
                              : fcInactiveButtonSize};
                            height: ${controlsAwake
                              ? fcButtonSize
                              : fcInactiveButtonSize};
                            border: none;
                            border-radius: 999px;
                            background: ${fcFullscreenBg};
                            color: ${controlsAwake ? fcFullscreenColor : "transparent"};
                            cursor: pointer;
                            padding: 0;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            overflow: hidden;
                            box-shadow: none;
                            transition:
                              width 0.2s ease,
                              min-width 0.2s ease,
                              height 0.2s ease,
                              color 0.14s ease,
                              transform 0.16s ease,
                              filter 0.16s ease,
                              box-shadow 0.16s ease;

                            &:hover {
                              filter: brightness(1.08);
                              transform: scale(1.05);
                            }

                            &:active {
                              transform: scale(0.94);
                            }

                            &:focus-visible {
                              outline: 2px solid rgba(255, 255, 255, 0.75);
                              outline-offset: 2px;
                            }

                            svg {
                              opacity: ${controlsAwake ? 1 : 0};
                              transform: scale(${controlsAwake ? 1 : 0.6});
                              transition:
                                opacity 0.14s ease,
                                transform 0.14s ease;
                            }
                          `,
                          classNames?.floatingFullscreen,
                        )}
                        style={styles?.floatingFullscreen}
                      >
                        <span
                          key={isFullscreen ? "fullscreen-exit" : "fullscreen"}
                          className={css`
                            display: inline-flex;
                            animation: modalControlIconPop 0.18s ease;

                            @keyframes modalControlIconPop {
                              from {
                                opacity: 0;
                                transform: scale(0.72) rotate(-8deg);
                              }
                              to {
                                opacity: 1;
                                transform: scale(1) rotate(0deg);
                              }
                            }
                          `}
                        >
                          {isFullscreen ? (
                            <RiFullscreenExitLine
                              size={fcFullscreenIconSize}
                            />
                          ) : (
                            <RiFullscreenLine size={fcFullscreenIconSize} />
                          )}
                        </span>
                      </button>
                    )}
                  </div>
                )}
                {closable && !showFloatingClose && (
                  <Dialog.Close
                    className={cx(
                      css`
                        position: absolute;
                        top: 12px;
                        right: 12px;
                        z-index: 1;
                        border: none;
                        background: transparent;
                        color: ${headerColor};
                        cursor: pointer;
                        padding: 0;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                      `,
                      classNames?.close,
                    )}
                    style={styles?.close}
                  >
                    <RiCloseLine size={18} />
                  </Dialog.Close>
                )}
                {title && (
                  <div
                    className={cx(
                      css`
                        text-align: center;
                        background: transparent;
                        margin-bottom: 0;
                        border-bottom: none;
                        padding: 18px 24px 0;
                        position: relative;
                        color: ${headerColor};
                      `,
                      classNames?.header,
                    )}
                    style={styles?.header}
                  >
                    <Dialog.Title asChild>
                      <div id={titleId}>{title}</div>
                    </Dialog.Title>
                  </div>
                )}
                <div
                  className={cx(
                    css`
                      background: transparent;
                      border: none;
                      position: relative;
                      padding: 18px 20px 22px;
                      ${isFullscreen
                        ? `
                      flex: 1 1 auto;
                      min-height: 0;
                      display: flex;
                      flex-direction: column;
                      overflow: hidden;
                      `
                        : ""}
                    `,
                    classNames?.body,
                  )}
                  style={styles?.body}
                >
                  <div
                    className={cx(
                      "zs-relative",
                      css`
                        ${isFullscreen
                          ? `
                        flex: 1 1 auto;
                        min-height: 0;
                        height: 100%;
                        overflow: auto;
                        max-height: none;
                        `
                          : disableMaxHeight
                          ? ""
                          : `
                        max-height: calc(100vh - 160px);
                        max-height: calc(100dvh - 160px);
                        `}

                        &::-webkit-scrollbar {
                          width: ${sbWidth};
                        }
                        &::-webkit-scrollbar-track {
                          background: ${sbTrack};
                        }
                        &::-webkit-scrollbar-thumb {
                          background: ${sbThumb};
                          border-radius: ${sbRadius};
                          transition: background 0.2s ease;
                        }
                        &::-webkit-scrollbar-thumb:hover {
                          background: ${sbThumbHover};
                        }
                      `,
                      classNames?.inner,
                    )}
                    style={styles?.inner}
                  >
                    {children}
                  </div>
                </div>
                {footer && (
                  <div className={classNames?.footer} style={styles?.footer}>
                    {footer}
                  </div>
                )}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
};

export default BaseModal;
