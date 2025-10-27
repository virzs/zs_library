import Drawer, { DrawerProps } from "rc-drawer";
import "rc-drawer/assets/index.css";
import { css, cx } from "@emotion/css";
import { FC, ReactNode, useEffect, useState } from "react";
import { useSortableConfig } from "../context/config/hooks";

export type BaseDrawerProps = DrawerProps & {
  title?: ReactNode;
  contentClassName?: string;
  destroyOnClose?: boolean;
  className?: string;
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
    ...rest
  } = props;

  const { theme } = useSortableConfig();
  const modalTheme = theme.token.modal;

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

  const contentWrapperSizeProps = placement === "left" || placement === "right" ? { width } : { height: height ?? 300 };

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
          /* Mask styling */
          .drawer-mask,
          .rc-drawer-mask {
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

          /* Drawer content wrapper styling */
          .drawer-content-wrapper,
          .rc-drawer-content-wrapper {
            background: ${modalTheme?.content?.backgroundColor};
            backdrop-filter: ${modalTheme?.content?.backdropFilter};
            box-shadow: 0 20px 40px ${modalTheme?.content?.boxShadowColor},
              0 0 0 0.75px ${modalTheme?.content?.boxShadowBorderColor};
            border: 0.75px solid ${modalTheme?.content?.borderColor};
            border-radius: ${modalTheme?.content?.borderRadius};
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

          /* Content area */
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
              animation: drawerFadeOut 0.3s cubic-bezier(0.175, 0.885, 0.32, 1) forwards;
            }
          }

          /* Global scrollbar styles inside drawer */
          * {
            &::-webkit-scrollbar {
              width: ${modalTheme?.scrollbar?.width ?? "8px"};
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
            scrollbar-width: thin;
            scrollbar-color: ${modalTheme?.scrollbar?.thumbColor} ${modalTheme?.scrollbar?.trackColor};
          }
        `,
        className
      )}
      {...contentWrapperSizeProps}
      {...rest}
    >
      <div
        className={cx(
          "zs-relative zs-overflow-y-auto",
          css`
            /* iOS-like scrollbar */
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
          `,
          contentClassName
        )}
      >
        {title && (
          <div
            className={cx(
              "base-drawer-title zs-px-4 zs-pt-4 zs-pb-0",
              css`
                color: ${modalTheme?.header?.textColor};
              `
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
