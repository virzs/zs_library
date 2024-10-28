import { FC, ReactNode } from "react";
import DockDesktop from "./dock-desktop";
import DockMobile, { DockMobileProps } from "./dock-mobile";

export interface DockItem {
  icon: ReactNode;
  title: string;
  href?: string;
}

export interface DockProps extends Omit<DockMobileProps, "className"> {
  desktopClassName?: string;
  mobileClassName?: string;
}

const PrivDock: FC<DockProps> = (props) => {
  const { items, desktopClassName, mobileClassName, ...rest } = props;

  return (
    <>
      <DockDesktop items={items} className={desktopClassName} {...rest} />
      <DockMobile
        items={items}
        className={mobileClassName}
        autoHidden
        {...rest}
      />
    </>
  );
};

export interface Dock extends FC<DockProps> {
  Desktop: typeof DockDesktop;
  Mobile: typeof DockMobile;
}

const Dock = PrivDock as Dock;

Dock.Desktop = DockDesktop;
Dock.Mobile = DockMobile;

export default Dock;
