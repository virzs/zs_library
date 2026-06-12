import { css, cx } from "@emotion/css";
import * as Dialog from "@radix-ui/react-dialog";
import { RiCloseLine } from "@remixicon/react";
import { AnimatePresence } from "motion/react";
import {
  CSSProperties,
  ReactNode,
  useEffect,
  useId,
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
  | "close";

type BaseModalClassNames = Partial<Record<BaseModalSlot, string>>;
type BaseModalStyles = Partial<Record<BaseModalSlot, CSSProperties>>;

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
    footer = null,
    classNames,
    styles,
    disableMaxHeight = false,
    theme,
  } = props;

  const modalTheme = theme?.token?.modal;

  const titleId = useId();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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
    }
  }, [externalVisible]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

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
              aria-labelledby={title ? titleId : undefined}
              onOpenAutoFocus={(event) => event.preventDefault()}
              className={cx(
                css`
                  position: fixed;
                  left: 50%;
                  top: 50%;
                  z-index: 1001;
                  width: ${typeof width === "number" ? `${width}px` : width};
                  max-width: calc(100vw - 80px);
                  outline: none;
                  transform-origin: ${transformOrigin};
                  transform: translate(-50%, -50%);
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
                    border-radius: ${borderRadius};
                    overflow: hidden;
                    position: relative;

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
                {closable && (
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
                    `,
                    classNames?.body,
                  )}
                  style={styles?.body}
                >
                  <div
                    className={cx(
                      "zs-relative",
                      css`
                        ${disableMaxHeight
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
