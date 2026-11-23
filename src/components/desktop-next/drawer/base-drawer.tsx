import { useSurfaceTheme } from "../contexts/config-context";
import Drawer, { DrawerProps } from "rc-drawer";
import "rc-drawer/assets/index.css";
import { css, cx } from "@emotion/css";
import { FC, ReactNode, useEffect, useState } from "react";
import { baseTokens } from "../themes/base";
import { fade, glassSurface, reducedTransparency } from "../themes/material";
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
    rootClassName,
    theme: explicitTheme,
    ...rest
  } = props;

  const theme = useSurfaceTheme(explicitTheme);
  const base = baseTokens(theme);
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

  const maskBg = modalTheme?.mask?.backgroundColor ?? base.shadowColor;
  const maskBdFilter = modalTheme?.mask?.backdropFilter ?? "blur(8px)";
  const bgColor = modalTheme?.content?.backgroundColor ?? base.backgroundColor;
  const bdFilter = modalTheme?.content?.backdropFilter ?? base.backdropFilter;
  const shadowColor = modalTheme?.content?.boxShadowColor ?? base.shadowColor;
  const shadowBorderColor =
    modalTheme?.content?.boxShadowBorderColor ?? base.boxShadowBorderColor;
  const borderColor =
    modalTheme?.content?.borderColor ?? base.borderColor;
  const borderRadius = modalTheme?.content?.borderRadius ?? "20px";
  const headerColor = modalTheme?.header?.textColor ?? base.textColor;
  const sbWidth = modalTheme?.scrollbar?.width ?? "4px";
  const sbTrack = modalTheme?.scrollbar?.trackColor ?? "transparent";
  const sbThumb = modalTheme?.scrollbar?.thumbColor ?? fade(base.textColor, 30);
  const sbThumbHover =
    modalTheme?.scrollbar?.thumbHoverColor ?? fade(base.textColor, 48);
  const sbRadius = modalTheme?.scrollbar?.borderRadius ?? "2px";

  return externalOpen ? (
    <Drawer
      open={open}
      onClose={handleClose}
      placement={placement}
      mask={mask}
      maskClosable={maskClosable}
      className={cx("base-drawer", className)}
      rootClassName={cx(
        rootClassName,
        { "drawer-closing": isClosing },
        css`
          .drawer-mask,
          .rc-drawer-mask {
            background: ${maskBg};
            ${reducedTransparency} { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
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
            ${glassSurface(bgColor, bdFilter, base.highlightColor)}
            color: ${base.textColor};
            font-family: ${base.fontFamily};
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
