import { css, cx } from "@emotion/css";
import { AnimatePresence } from "motion/react";
import Dialog from "rc-dialog";
import "rc-dialog/assets/index.css";
import { ReactNode, useEffect, useState } from "react";
import { Theme } from "../themes";

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
  className?: string;
  rootClassName?: string;
  contentClassName?: string;
  disableMaxHeight?: boolean;
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
    className,
    rootClassName,
    contentClassName,
    disableMaxHeight = false,
    theme,
  } = props;

  const modalTheme = theme?.token?.modal;

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
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const bgColor =
    modalTheme?.content?.backgroundColor ?? "rgba(128, 128, 128, 0.3)";
  const bdFilter = modalTheme?.content?.backdropFilter ?? "blur(40px)";
  const shadowColor = modalTheme?.content?.boxShadowColor ?? "rgba(0,0,0,0.3)";
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
          rootClassName={cx(
            "base-modal",
            { "modal-closing": isClosing },
            css`
              .rc-dialog-mask {
                background: ${maskBg};
                backdrop-filter: ${maskBdFilter};
                -webkit-backdrop-filter: ${maskBdFilter};
                animation: maskFadeIn 0.2s ease-out;
              }

              .rc-dialog-wrap {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px;
              }

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
                .rc-dialog-mask {
                  animation: maskFadeOut 0.3s ease-out forwards;
                }
              }
            `,
            rootClassName,
          )}
          className={cx(
            css`
              .rc-dialog-section {
                background: ${bgColor};
                /* backdrop-filter causes a 1-frame flash on open due to browser rendering constraints —
                   blur is computed after the element is first painted, not fixable via CSS alone */
                backdrop-filter: ${bdFilter};
                -webkit-backdrop-filter: ${bdFilter};
                box-shadow: 0 20px 40px ${shadowColor};
                border: 0.75px solid ${borderColor};
                padding: 0;
                border-radius: ${borderRadius};
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

              .rc-dialog-content {
                animation: none;
              }

              .modal-closing & .rc-dialog-content {
                animation: modalSlideOut 0.3s
                  cubic-bezier(0.175, 0.885, 0.32, 1) forwards;
              }

              .rc-dialog-header {
                text-align: center;
                background: transparent;
                margin-bottom: 0;
                border-bottom: none;
                padding: 20px 24px 0;
                position: relative;
                color: ${headerColor};
              }

              .rc-dialog-body {
                background: transparent;
                border: none;
                position: relative;
                padding: 20px;
              }

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
            className,
          )}
          width={width}
          destroyOnClose={destroyOnClose}
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
              contentClassName,
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
