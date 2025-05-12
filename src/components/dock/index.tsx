import { FC, ReactNode } from "react";
import DockDesktop, { DesktopIconContainer } from "./dock-desktop";
import DockMobile, {
  DockMobileProps,
  MobileIconContainer,
} from "./dock-mobile";
import { MotionValue } from "framer-motion";

export interface DockItem {
  icon?: ReactNode;
  title?: string;
  href?: string;
  componentClassName?: string;
  titleClassName?: string;
  childrenClassName?: string;
}

// Desktop item builder 类型
type DesktopItemBuilder = (item: DockItem, mouseX: MotionValue) => ReactNode;

// Mobile item builder 类型
type MobileItemBuilder = (
  item: DockItem,
  index: number,
  items: DockItem[]
) => ReactNode;

export interface DockProps
  extends Omit<DockMobileProps, "className" | "itemBuilder"> {
  desktopClassName?: string;
  mobileClassName?: string;
  desktopItemBuilder?: DesktopItemBuilder;
  mobileItemBuilder?: MobileItemBuilder;
  desktopChildren?: ReactNode;
  mobileChildren?: ReactNode;
  desktopMouseX?: MotionValue;
}

const PrivDock: FC<DockProps> = (props) => {
  const {
    items,
    desktopClassName,
    mobileClassName,
    desktopItemBuilder,
    mobileItemBuilder,
    desktopChildren,
    mobileChildren,
    desktopMouseX,
    ...rest
  } = props;

  return (
    <>
      <DockDesktop
        items={items}
        className={desktopClassName}
        itemBuilder={desktopItemBuilder}
        children={desktopChildren}
        mouseX={desktopMouseX}
        {...rest}
      />
      <DockMobile
        items={items}
        className={mobileClassName}
        itemBuilder={mobileItemBuilder}
        children={mobileChildren}
        autoHidden
        {...rest}
      />
    </>
  );
};

export interface Dock extends FC<DockProps> {
  Desktop: typeof DockDesktop;
  DesktopItem: typeof DesktopIconContainer;
  Mobile: typeof DockMobile;
  MobileItem: typeof MobileIconContainer;
}

const Dock = PrivDock as Dock;

Dock.Desktop = DockDesktop;
Dock.DesktopItem = DesktopIconContainer;
Dock.Mobile = DockMobile;
Dock.MobileItem = MobileIconContainer;

export default Dock;
