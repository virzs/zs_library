import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { RiApps2Line, RiIndeterminateCircleLine } from "@remixicon/react";
import { getDefaultConfig, getSizeConfig } from "../config";
import { useDesktopDnd } from "../context";
import { MenuItemConfig, SortItemDefaultConfig } from "../types";
import { playShatterEffect } from "../utils/shatter-effect";
import ContextMenuContent from "./content";
import { HoverContext } from "./hover-context";
import { MenuItem } from "./menu-item";
import { SubMenuItem } from "./sub-menu-item";
import { SizeSubMenuContent } from "./size-sub-menu-content";

export interface ContextMenuProps {
  animationOrigin?: string;
  isOpen?: boolean;
}

const ContextMenu = ({
  animationOrigin = "center",
  isOpen = true,
}: ContextMenuProps) => {
  const {
    contextMenu,
    setContextMenu,
    hideContextMenu,
    removeItem,
    updateItemConfig,
    typeConfigMap,
    dataTypeMenuConfigMap,
    onRemoveClick,
    onContextMenuItemClick,
    contextMenuProps,
  } = useDesktopDnd();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const data = contextMenu?.data;

  const typeConfig: SortItemDefaultConfig = useMemo(
    () => getDefaultConfig(data?.type || "app", typeConfigMap),
    [data?.type, typeConfigMap],
  );

  const {
    sizeConfigs = [],
    defaultSizeId,
    allowResize,
    allowContextMenu,
    allowDelete,
  } = typeConfig;

  const showRemove =
    (allowDelete ?? true) && (contextMenuProps?.showRemoveButton ?? true);
  const showSize =
    (allowResize ?? false) && (contextMenuProps?.showSizeButton ?? true);
  const canShowMenu = allowContextMenu ?? true;

  const customMenuItems: MenuItemConfig[] = useMemo(() => {
    const dataType = data?.dataType;
    if (!dataType || !dataTypeMenuConfigMap) return [];
    return dataTypeMenuConfigMap[dataType] || [];
  }, [data?.dataType, dataTypeMenuConfigMap]);

  if (!contextMenu || !isOpen || !data || !canShowMenu) {
    return null;
  }

  const currentSizeConfig = getSizeConfig(
    data.config?.sizeId,
    sizeConfigs,
    defaultSizeId,
  );
  const contextActions = {
    setContextMenu,
    hideContextMenu,
    removeItem,
    updateItemConfig,
  };

  let currentMenuIndex = 0;

  return (
    <AnimatePresence>
      <HoverContext.Provider value={{ hoveredIndex, setHoveredIndex }}>
        <ContextMenuContent style={{ transformOrigin: animationOrigin }}>
          {showRemove && (
            <MenuItem
              text="移除"
              icon={<RiIndeterminateCircleLine />}
              color="#ff453a"
              textColor="#ff453a"
              index={currentMenuIndex++}
              onClick={() => {
                hideContextMenu();

                const targetElement = contextMenu?.element;
                const doRemove = () => {
                  if (onRemoveClick) {
                    onRemoveClick(data);
                  } else {
                    removeItem(data.id);
                  }
                  onContextMenuItemClick?.(data, { actionType: "remove" });
                };

                if (targetElement) {
                  playShatterEffect(targetElement).then(doRemove);
                } else {
                  doRemove();
                }
              }}
            />
          )}

          {showSize && sizeConfigs.length > 1 && (
            <SubMenuItem
              text="尺寸"
              icon={<RiApps2Line size={18} />}
              index={currentMenuIndex++}
            >
              <SizeSubMenuContent
                sizes={sizeConfigs}
                currentSizeId={currentSizeConfig.id ?? currentSizeConfig.name}
                onSizeChange={(size) => {
                  updateItemConfig(data.id, { sizeId: size.id ?? size.name });
                  onContextMenuItemClick?.(data, {
                    actionType: "resize",
                    sizeConfig: size,
                  });
                  hideContextMenu();
                }}
              />
            </SubMenuItem>
          )}

          {customMenuItems.map((menuItem) => {
            const index = currentMenuIndex++;
            return (
              <MenuItem
                key={`${menuItem.text}-${index}`}
                text={menuItem.text}
                icon={menuItem.icon}
                color={menuItem.color}
                textColor={menuItem.textColor}
                index={index}
                onClick={() => {
                  menuItem.onClick?.(data, contextActions);
                  onContextMenuItemClick?.(data, {
                    actionType: "custom",
                    menuItem,
                  });
                  hideContextMenu();
                }}
              />
            );
          })}
        </ContextMenuContent>
      </HoverContext.Provider>
    </AnimatePresence>
  );
};

export default ContextMenu;
export { MenuItem } from "./menu-item";
export { SubMenuItem } from "./sub-menu-item";
export { SizeSubMenuContent } from "./size-sub-menu-content";
export { HoverContext } from "./hover-context";
export type { MenuItemProps } from "./menu-item";
export type { SubMenuItemProps } from "./sub-menu-item";
export type { SizeMenuItemProps } from "./size-sub-menu-content";
export type { HoverContextType } from "./hover-context";
