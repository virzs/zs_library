import { AnimatePresence } from "motion/react";
import { getDefaultConfig, getSizeConfig } from "../config";
import { useSortableState } from "../context/state/hooks";
import { useSortableConfig } from "../context/config/hooks";
import { SortItem, SortItemDefaultConfig, MenuItemConfig } from "../types";
import { RiApps2Line, RiIndeterminateCircleLine, RiInformationLine, RiShare2Line } from "@remixicon/react";
import { useState } from "react";
import ContextMenuContent from "./content";
import { HoverContext } from "./hover-context";
import { MenuItem } from "./menu-item";
import { SubMenuItem } from "./sub-menu-item";
import { SizeSubMenuContent } from "./size-sub-menu-content";

export interface ContextMenuProps<D, C> {
  showShareButton?: boolean;
  showInfoButton?: boolean;
  showRemoveButton?: boolean;
  showSizeButton?: boolean;
  onShareClick?: (item: SortItem<D, C>) => void;
  onInfoClick?: (item: SortItem<D, C>) => void;
  onRemoveClick?: (item: SortItem<D, C>, remove: (id: string) => void) => void;
  animationOrigin?: string;
  isOpen?: boolean;
}

const ContextMenu = <D, C>(props: ContextMenuProps<D, C>) => {
  const {
    showInfoButton = true,
    showRemoveButton = true,
    showShareButton = true,
    showSizeButton = true,
    animationOrigin = "center",
    isOpen = true,
    onInfoClick,
    onShareClick,
    onRemoveClick,
  } = props;
  const { contextMenu, setContextMenu, hideContextMenu, setShowInfoItemData, removeItem, updateItemConfig } =
    useSortableState();
  const { typeConfigMap, dataTypeMenuConfigMap, theme } = useSortableConfig();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { data } = contextMenu ?? {};
  const { config = {} } = data ?? {};

  const getAllSizes = () => {
    const config: SortItemDefaultConfig = getDefaultConfig(contextMenu?.data?.type || "app", typeConfigMap);
    return config.sizeConfigs.map((sizeConfig) => sizeConfig.name);
  };

  // 获取当前item的dataType对应的自定义菜单项
  const getCustomMenuItems = (): MenuItemConfig[] => {
    const dataType = contextMenu?.data?.dataType;
    if (!dataType || !dataTypeMenuConfigMap) {
      return [];
    }
    return dataTypeMenuConfigMap[dataType] || [];
  };

  // 创建上下文操作对象，供自定义菜单项使用
  const contextActions = {
    setContextMenu,
    hideContextMenu,
    setShowInfoItemData,
    removeItem,
    updateItemConfig,
  };
  return (
    <AnimatePresence>
      {contextMenu && isOpen && (
        <HoverContext.Provider value={{ hoveredIndex, setHoveredIndex }}>
          <ContextMenuContent
            style={{
              transformOrigin: animationOrigin,
            }}
          >
            {/* 移除 - 第一个选项 */}
            {showRemoveButton && (
              <MenuItem
                text="移除"
                icon={<RiIndeterminateCircleLine />}
                color={theme.token.contextMenu?.dangerColor || "#ff3b30"}
                textColor={theme.token.contextMenu?.dangerColor || "#ff3b30"}
                index={0}
                onClick={() => {
                  if (onRemoveClick) {
                    onRemoveClick(contextMenu.data, removeItem);
                    return;
                  }
                  setContextMenu(null);
                  removeItem(contextMenu.data.id);
                }}
              />
            )}
            {/* 分享 - 第二个选项 */}
            {showShareButton && (
              <MenuItem
                text="分享"
                icon={<RiShare2Line />}
                index={1}
                onClick={() => {
                  if (onShareClick) {
                    onShareClick(contextMenu.data);
                    return;
                  }
                }}
              />
            )}
            {/* 信息 - 第三个选项 */}
            {showInfoButton && (
              <MenuItem
                text="信息"
                icon={<RiInformationLine />}
                index={2}
                onClick={() => {
                  if (onInfoClick) {
                    onInfoClick(contextMenu.data);
                    return;
                  }
                  setShowInfoItemData({
                    ...contextMenu.data,
                    pageX: contextMenu.pageX,
                    pageY: contextMenu.pageY,
                  });
                  hideContextMenu();
                }}
              />
            )}
            {/* 修改尺寸 - 第四个选项 */}
            {showSizeButton &&
              config?.allowResize !== false &&
              (() => {
                const typeConfig = getDefaultConfig(contextMenu?.data?.type || "app", typeConfigMap);

                if (typeConfig.sizeConfigs.length <= 1) return null;

                const currentSizeConfig = getSizeConfig(
                  data?.config?.sizeId,
                  typeConfig.sizeConfigs,
                  typeConfig.defaultSizeId
                );

                // 计算当前菜单项的索引
                let sizeMenuIndex = 0;
                if (showRemoveButton) sizeMenuIndex++;
                if (showShareButton) sizeMenuIndex++;
                if (showInfoButton) sizeMenuIndex++;

                return (
                  <SubMenuItem text="尺寸" icon={<RiApps2Line size={18} />} index={sizeMenuIndex}>
                    <SizeSubMenuContent
                      sizes={getAllSizes()}
                      currentSize={currentSizeConfig.name}
                      onSizeChange={(sizeName) => {
                        const selectedSizeConfig = typeConfig.sizeConfigs.find((sc) => sc.name === sizeName);
                        if (selectedSizeConfig) {
                          updateItemConfig(contextMenu.data.id, {
                            sizeId: selectedSizeConfig.id || sizeName,
                          });
                        }
                      }}
                    />
                  </SubMenuItem>
                );
              })()}
            {/* 根据dataType显示的自定义菜单项 */}
            {getCustomMenuItems().map((menuItem, index) => {
              // 计算菜单项索引，需要考虑前面已有的默认菜单项数量
              let menuIndex = 0;
              if (showRemoveButton) menuIndex++;
              if (showShareButton) menuIndex++;
              if (showInfoButton) menuIndex++;
              if (showSizeButton && config?.allowResize !== false) menuIndex++;
              menuIndex += index;

              return (
                <MenuItem
                  key={`custom-${index}`}
                  text={menuItem.text}
                  icon={menuItem.icon}
                  color={menuItem.color}
                  textColor={menuItem.textColor}
                  index={menuIndex}
                  onClick={() => {
                    if (menuItem.onClick) {
                      menuItem.onClick(contextMenu.data, contextActions);
                    }
                  }}
                />
              );
            })}
          </ContextMenuContent>
        </HoverContext.Provider>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;

// 导出子组件供外部使用
export { MenuItem } from "./menu-item";
export { SubMenuItem } from "./sub-menu-item";
export { SizeSubMenuContent } from "./size-sub-menu-content";
export { HoverContext } from "./hover-context";
export type { MenuItemProps } from "./menu-item";
export type { SubMenuItemProps } from "./sub-menu-item";
export type { SizeMenuItemProps } from "./size-sub-menu-content";
export type { HoverContextType } from "./hover-context";
