import { ComponentRef, forwardRef, ReactNode } from "react";
import RcDropdown, { DropdownProps } from "rc-dropdown";
import RcMenu from "rc-menu";
import { css, cx } from "@emotion/css";
import { RiArrowRightSLine } from "@remixicon/react";

import "rc-dropdown/assets/index.css";
import "rc-menu/assets/index.css";

export interface MenuItem {
  key: string;
  icon?: ReactNode;
  label?: string;
  className?: string;
  type?: string;
  children?: MenuItem[];
}

interface DropdownMenuProps extends DropdownProps {
  items: MenuItem[];
}

const DropdownMenu = forwardRef<
  ComponentRef<typeof RcDropdown>,
  DropdownMenuProps
>(({ children, items, ...rest }, ref) => {
  const renderMenuItem = (item: MenuItem) => {
    return (
      <RcMenu.Item
        key={item.key}
        className={cx(
          "gap-2 !p-1.5 text-sm hover:bg-accent focus:ring-0 rounded-md cursor-pointer",
          item.className
        )}
      >
        {item.icon}
        {item.label}
      </RcMenu.Item>
    );
  };

  const renderSubMenu = (item: MenuItem) => {
    return (
      <RcMenu.SubMenu
        key={item.key}
        expandIcon={<RiArrowRightSLine size={16} />}
        popupClassName={cx(
          "!rounded-lg border border-muted bg-background shadow-xl !p-2 min-w-48 !m-0 z-[1080]",
          css`
            .rc-menu {
              border: none !important;
              box-shadow: none !important;
            }
          `
        )}
        popupOffset={[4, 0]}
        className={cx(
          "gap-2 !p-0 text-sm hover:bg-accent focus:ring-0 rounded-md cursor-pointer",
          css`
            .rc-menu-submenu-title {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.375rem 0 0.375rem 0.375rem !important;
              border-radius: calc(var(--radius) - 2px);

              &:hover {
                background-color: transparent !important;
              }
            }
          `
        )}
        title={
          <>
            {item.icon}
            {item.label}
            <div className="flex-1"></div>
          </>
        }
      >
        {item.children?.map(renderMenuItem)}
      </RcMenu.SubMenu>
    );
  };

  return (
    <RcDropdown
      ref={ref}
      trigger="click"
      overlay={
        <RcMenu
          className={cx(
            "!rounded-lg border border-muted bg-background shadow-xl !p-2 min-w-48 !m-0",
            css`
              .rc-menu-submenu-active {
                .rc-menu-submenu-title {
                  background-color: hsl(var(--accent)) !important;
                }
              }
            `
          )}
        >
          {items.map((item) => {
            if (item.type === "divider") {
              return <RcMenu.Divider key={item.key} className="!my-1" />;
            }

            if (item.type === "submenu") {
              return renderSubMenu(item);
            }

            return renderMenuItem(item);
          })}
        </RcMenu>
      }
      {...rest}
    >
      {children}
    </RcDropdown>
  );
});

DropdownMenu.displayName = "DropdownMenu";

export { DropdownMenu };
