import Drawer, { DrawerProps } from "rc-drawer";
import "rc-drawer/assets/index.css";
import { css, cx } from "@emotion/css";
import { FC, ReactNode, useEffect, useState } from "react";
import { Theme } from "../themes";

export type BaseDrawerProps = DrawerProps & {
  title?: ReactNode;
  contentClassName?: string;
  destroyOnClose?: boolean;
  className?: string;
  theme?: Theme;
};

const BaseDrawer: FC<BaseDrawerProps> = (props) => {
  const {
    open: externalOpen = false,
    onClose,
    children,
    title,
    placement = "right",
    width = 320,
    height,
    mask = true,
    maskClosable = true,
    className,
    contentClassName,
    theme,
    ...rest
  } = props;

  const modalTheme = theme?.token?.modal;

  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (externalOpen) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [externalOpen]);

  const handleClose = (e: React.MouseEvent | React.KeyboardEvent) => {
    setIsClosing(true);
    setOpen(false);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.(e);
    }, 300);
  };

  const contentWrapperSizeProps =
    placement === "left" || placement === "right"
      ? { width }
      : { height: height ?? 300 };

  const maskBg = modalTheme?.mask?.backgroundColor ?? "rgba(0,0,0,0.5)";
  const maskBdFilter = modalTheme?.mask?.backdropFilter ?? "blur(8px)";
  const bgColor = modalTheme?.content?.backgroundColor ?? "rgba(30,30,30,0.85)";
  const bdFilter = modalTheme?.content?.backdropFilter ?? "blur(40px)";
  const shadowColor = modalTheme?.content?.boxShadowColor ?? "rgba(0,0,0,0.4)";
  const shadowBorderColor =
    modalTheme?.content?.boxShadowBorderColor ?? "rgba(255,255,255,0.08)";
  const borderColor =
    modalTheme?.content?.borderColor ?? "rgba(255,255,255,0.1)";
  const borderRadius = modalTheme?.content?.borderRadius ?? "20px";
  const headerColor = modalTheme?.header?.textColor ?? "rgba(255,255,255,0.9)";
  const sbWidth = modalTheme?.scrollbar?.width ?? "4px";
  const sbTrack = modalTheme?.scrollbar?.trackColor ?? "transparent";
  const sbThumb = modalTheme?.scrollbar?.thumbColor ?? "rgba(255,255,255,0.15)";
  const sbThumbHover =
    modalTheme?.scrollbar?.thumbHoverColor ?? "rgba(255,255,255,0.25)";
  const sbRadius = modalTheme?.scrollbar?.borderRadius ?? "2px";

  return externalOpen ? (
    <Drawer
      open={open}
      onClose={handleClose}
      placement={placement}
      mask={mask}
      maskClosable={maskClosable}
      className={cx(
        "base-drawer",
        { "drawer-closing": isClosing },
        css`
          .drawer-mask,
          .rc-drawer-mask {
            background: ${maskBg};
            backdrop-filter: ${maskBdFilter};
            animation: maskFadeIn 0.2s ease-out;
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

          .drawer-content-wrapper,
          .rc-drawer-content-wrapper {
            background: ${bgColor};
            backdrop-filter: ${bdFilter};
            -webkit-backdrop-filter: ${bdFilter};
            box-shadow:
              0 20px 40px ${shadowColor},
              0 0 0 0.75px ${shadowBorderColor};
            border: 0.75px solid ${borderColor};
            border-radius: ${borderRadius};
            overflow: hidden;
            animation: drawerFadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1);
          }

          @keyframes drawerFadeIn {
            0% {
              opacity: 0;
              filter: blur(4px);
            }
            100% {
              opacity: 1;
              filter: blur(0px);
            }
          }

          @keyframes drawerFadeOut {
            0% {
              opacity: 1;
              filter: blur(0px);
            }
            100% {
              opacity: 0;
              filter: blur(4px);
            }
          }

          .drawer-content,
          .rc-drawer-content {
            background: transparent;
            padding: 0;
          }

          &.drawer-closing {
            .drawer-mask,
            .rc-drawer-mask {
              animation: maskFadeOut 0.3s ease-out forwards;
            }
            .drawer-content-wrapper,
            .rc-drawer-content-wrapper {
              animation: drawerFadeOut 0.3s cubic-bezier(0.175, 0.885, 0.32, 1)
                forwards;
            }
          }

          * {
            &::-webkit-scrollbar {
              width: ${sbWidth};
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
      {...contentWrapperSizeProps}
      {...rest}
    >
      <div
        className={cx(
          "zs-relative zs-overflow-y-auto",
          css`
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
        {title && (
          <div
            className={cx(
              "base-drawer-title zs-px-4 zs-pt-4 zs-pb-0",
              css`
                color: ${headerColor};
              `,
            )}
          >
            {title}
          </div>
        )}
        <div className="base-drawer-content zs-p-4">{children}</div>
      </div>
    </Drawer>
  ) : null;
};

export default BaseDrawer;
