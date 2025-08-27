import { css, cx } from "@emotion/css";
import { AnimatePresence } from "motion/react";
import Dialog from "rc-dialog";
import "rc-dialog/assets/index.css";
import { ReactNode, useEffect, useState } from "react";
import { useSortableConfig } from "../context/config/hooks";

export interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  width?: number;
  mousePosition?: { x: number; y: number } | null;
  destroyOnClose?: boolean;
  closable?: boolean;
  footer?: ReactNode;
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
  } = props;

  const { theme } = useSortableConfig();
  const modalTheme = theme.token.modal;

  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (externalVisible) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [externalVisible]);

  const handleClose = () => {
    setIsClosing(true);
    setVisible(false);
    // 延迟执行 onClose，让关闭动画有时间播放
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // 与动画时长保持一致
  };

  return (
    <AnimatePresence>
      {externalVisible && (
        <Dialog
          visible={visible}
          onClose={handleClose}
          animation="zoom"
          maskAnimation="fade"
          mousePosition={mousePosition}
          title={title}
          footer={footer}
          closable={closable}
          className={cx(
            "base-modal",
            { "modal-closing": isClosing },
            css`
              .rc-dialog-mask {
                background: ${modalTheme?.mask?.backgroundColor};
                backdrop-filter: ${modalTheme?.mask?.backdropFilter};
                animation: maskFadeIn 0.2s ease-out;
              }

              @keyframes maskFadeIn {
                from {
                  opacity: 0;
                  backdrop-filter: blur(0px);
                }
                to {
                  opacity: 1;
                  backdrop-filter: ${modalTheme?.mask?.backdropFilter};
                }
              }

              .rc-dialog-wrap {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px;
              }

              .rc-dialog-content {
                background: ${modalTheme?.content?.backgroundColor};
                backdrop-filter: ${modalTheme?.content?.backdropFilter};
                box-shadow: 0 20px 40px ${modalTheme?.content?.boxShadowColor},
                  0 0 0 0.75px ${modalTheme?.content?.boxShadowBorderColor};
                border: 0.75px solid ${modalTheme?.content?.borderColor};
                padding: 0;
                border-radius: ${modalTheme?.content?.borderRadius};
                overflow: hidden;
                animation: modalSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1);
                position: relative;
              }

              @keyframes modalSlideIn {
                0% {
                  opacity: 0;
                  transform: scale(0.85) translateY(12px);
                }
                100% {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }

              @keyframes modalSlideOut {
                0% {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
                100% {
                  opacity: 0;
                  transform: scale(0.85) translateY(12px);
                }
              }

              @keyframes maskFadeOut {
                from {
                  opacity: 1;
                  backdrop-filter: ${modalTheme?.mask?.backdropFilter};
                }
                to {
                  opacity: 0;
                  backdrop-filter: blur(0px);
                }
              }

              /* 关闭动画 */
              &.modal-closing {
                .rc-dialog-mask {
                  animation: maskFadeOut 0.3s ease-out forwards;
                }
                .rc-dialog-content {
                  animation: modalSlideOut 0.3s cubic-bezier(0.175, 0.885, 0.32, 1) forwards;
                }
              }

              .rc-dialog-header {
                text-align: center;
                background: transparent;
                margin-bottom: 0;
                border-bottom: none;
                padding: 20px 24px 0;
                border-radius: 16px 16px 0 0;
                position: relative;

                .ant-modal-name {
                  color: ${modalTheme?.header?.textColor};
                }
              }

              .rc-dialog-body {
                background: transparent;
                border-radius: 0 0 16px 16px;
                overflow: hidden;
                border: none;
                position: relative;
                padding: 20px;
              }

              /* 全局滚动条样式 - 应用于所有内部滚动元素 */
              * {
                /* Webkit 滚动条样式 */
                &::-webkit-scrollbar {
                  width: 8px;
                }

                &::-webkit-scrollbar-track {
                  background: ${modalTheme?.scrollbar?.trackColor};
                }

                &::-webkit-scrollbar-thumb {
                  background: ${modalTheme?.scrollbar?.thumbColor};
                  border-radius: ${modalTheme?.scrollbar?.borderRadius};
                  transition: background-color 0.2s ease;
                }

                &::-webkit-scrollbar-thumb:hover {
                  background: ${modalTheme?.scrollbar?.thumbHoverColor};
                }

                /* Firefox 滚动条样式 */
                scrollbar-width: thin;
                scrollbar-color: ${modalTheme?.scrollbar?.thumbColor} ${modalTheme?.scrollbar?.trackColor};
              }
            `
          )}
          width={width}
          destroyOnClose={destroyOnClose}
        >
          <div
            className={cx(
              "zs-overflow-y-auto zs-relative",
              css`
                max-height: 60vh;

                /* iOS 风格的滚动条 */
                &::-webkit-scrollbar {
                  width: ${modalTheme?.scrollbar?.width};
                }

                &::-webkit-scrollbar-track {
                  background: ${modalTheme?.scrollbar?.trackColor};
                }

                &::-webkit-scrollbar-thumb {
                  background: ${modalTheme?.scrollbar?.thumbColor};
                  border-radius: ${modalTheme?.scrollbar?.borderRadius};
                  transition: background 0.2s ease;
                }

                &::-webkit-scrollbar-thumb:hover {
                  background: ${modalTheme?.scrollbar?.thumbHoverColor};
                }
              `
            )}
          >
            {children}
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default BaseModal;
