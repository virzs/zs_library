import { css, cx } from "@emotion/css";
import { AnimatePresence, motion } from "motion/react";
import { getDefaultConfig, getSizeConfig } from "../config";
import { useSortableState } from "../context/state/hooks";
import { useSortableConfig } from "../context/config/hooks";
import { SortItem, SortItemDefaultConfig, MenuItemConfig } from "../types";
import {
  RiApps2Line,
  RiIndeterminateCircleLine,
  RiInformationLine,
  RiShare2Line,
  RiArrowRightSLine,
  RiCheckLine,
} from "@remixicon/react";
import { useState, createContext, useContext, useRef, useEffect } from "react";

// 创建hover状态context
interface HoverContextType {
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

const HoverContext = createContext<HoverContextType>({
  hoveredIndex: null,
  setHoveredIndex: () => {},
});

interface MenuItemProps {
  icon?: React.ReactNode;
  text: string;
  color?: string;
  textColor?: string;
  onClick?: () => void;
  index: number;
  children?: React.ReactNode;
}

const MenuItem = ({
  icon,
  text,
  color = "black",
  textColor = "#1d1d1f",
  onClick,
  index,
  children,
  ...props
}: MenuItemProps) => {
  const { hoveredIndex, setHoveredIndex } = useContext(HoverContext);
  const isHovered = hoveredIndex === index;

  const content = (
    <motion.div
      className={cx(
        "zs-py-0 zs-px-5 zs-flex zs-items-center zs-gap-4 zs-cursor-pointer zs-relative zs-h-10 zs-outline-none",
        css`
          z-index: 1;
        `
      )}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      onClick={onClick}
      {...props}
    >
      {/* 胶囊背景 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            layoutId="menuHover"
            className={cx(
              "zs-absolute zs-top-0.5 zs-left-2 zs-right-2 zs-bottom-0.5 zs-bg-black zs-bg-opacity-5 zs-rounded-lg",
              css`
                z-index: -1;
              `
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
        )}
      </AnimatePresence>
      <motion.div
        className={cx(
          "zs-flex-1 zs-text-sm",
          css`
            font-weight: 400;
            line-height: 18px;
            color: ${textColor};
            letter-spacing: -0.28px;
          `
        )}
      >
        {text}
      </motion.div>
      {icon && (
        <motion.div
          className={cx(
            "zs-flex zs-items-center zs-justify-center zs-shrink-0",
            css`
              color: ${color};
              width: 18px;
              height: 18px;
            `
          )}
        >
          {icon}
        </motion.div>
      )}
      {children}
    </motion.div>
  );

  return content;
};

interface SubMenuItemProps {
  text: string;
  icon: React.ReactNode;
  index: number;
  children: React.ReactNode;
  color?: string;
  textColor?: string;
}

const SubMenuItem = ({
  text,
  icon,
  index,
  children,
  color = "black",
  textColor = "#1d1d1f",
  ...props
}: SubMenuItemProps) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [subMenuPosition, setSubMenuPosition] = useState({ x: 0, y: 0 });
  const menuItemRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { hoveredIndex, setHoveredIndex } = useContext(HoverContext);
  const isHovered = hoveredIndex === index;

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setHoveredIndex(index);
    setIsSubMenuOpen(true);

    if (menuItemRef.current) {
      const rect = menuItemRef.current.getBoundingClientRect();
      setSubMenuPosition({
        x: rect.width - 4,
        y: 0,
      });
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsSubMenuOpen(false);
    }, 150);
  };

  const handleSubMenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleSubMenuMouseLeave = () => {
    setIsSubMenuOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={menuItemRef}
      className={cx(
        "zs-py-0 zs-px-5 zs-flex zs-items-center zs-gap-4 zs-cursor-pointer zs-relative zs-h-10 zs-outline-none",
        css`
          z-index: 1;
        `
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* 胶囊背景 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            layoutId="menuHover"
            className={cx(
              "zs-absolute zs-top-0.5 zs-left-2 zs-right-2 zs-bottom-0.5 zs-bg-black zs-bg-opacity-5 zs-rounded-lg",
              css`
                z-index: -1;
              `
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
        )}
      </AnimatePresence>
      <motion.div
        className={cx(
          "zs-flex-1 zs-text-sm",
          css`
            font-weight: 400;
            line-height: 18px;
            color: ${textColor};
            letter-spacing: -0.28px;
          `
        )}
      >
        {text}
      </motion.div>
      <motion.div
        className={cx(
          "zs-flex zs-items-center zs-justify-center zs-shrink-0",
          css`
            color: ${color};
            width: 18px;
            height: 18px;
          `
        )}
      >
        <RiArrowRightSLine size={16} />
      </motion.div>

      <AnimatePresence>
        {isSubMenuOpen && (
          <motion.div
            className={cx(
              "zs-absolute zs-rounded-2xl zs-overflow-hidden zs-bg-white zs-bg-opacity-75 zs-backdrop-blur-xl zs-p-2 zs-z-50",
              css`
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 0.75px rgba(255, 255, 255, 0.25);
                min-width: 192px;
                border: 0.75px solid rgba(255, 255, 255, 0.3);
                left: ${subMenuPosition.x}px;
                top: ${subMenuPosition.y}px;
              `
            )}
            initial={{ opacity: 0, scale: 0.95, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -8 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
              duration: 0.12,
            }}
            onMouseEnter={handleSubMenuMouseEnter}
            onMouseLeave={handleSubMenuMouseLeave}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface SizeMenuItemProps {
  sizes: string[];
  currentSize: string;
  onSizeChange: (size: string) => void;
}

const SizeSubMenuContent = ({ sizes, currentSize, onSizeChange }: SizeMenuItemProps) => {
  const [hoveredSize, setHoveredSize] = useState<string | null>(null);

  return (
    <>
      {sizes.map((size) => {
        const isHovered = hoveredSize === size;
        const isSelected = currentSize === size;

        return (
          <motion.div
            key={size}
            className={cx(
              "zs-h-10 zs-py-0 zs-px-5 zs-flex zs-items-center zs-gap-4 zs-cursor-pointer zs-relative zs-outline-none",
              css`
                z-index: 1;
              `
            )}
            onMouseEnter={() => setHoveredSize(size)}
            onMouseLeave={() => setHoveredSize(null)}
            onClick={() => onSizeChange(size)}
            whileTap={{ scale: 0.98 }}
          >
            {/* 胶囊背景 */}
            <AnimatePresence>
              {(isHovered || isSelected) && (
                <motion.div
                  className={cx(
                    "zs-absolute zs-top-0.5 zs-left-2 zs-right-2 zs-bottom-0.5 zs-bg-black zs-bg-opacity-5 zs-rounded-lg",
                    css`
                      z-index: -1;
                    `
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </AnimatePresence>
            <motion.div
              className={cx(
                "zs-flex-1 zs-text-sm",
                css`
                  font-weight: 400;
                  line-height: 18px;
                  color: #1d1d1f;
                  letter-spacing: -0.28px;
                `
              )}
            >
              {size}
            </motion.div>
            {isSelected && (
              <motion.div
                className={cx(
                  "zs-flex zs-items-center zs-justify-center zs-shrink-0",
                  css`
                    color: black;
                    width: 18px;
                    height: 18px;
                  `
                )}
              >
                <RiCheckLine size={14} />
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </>
  );
};

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
  const { typeConfigMap, dataTypeMenuConfigMap } = useSortableConfig();

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
          <motion.div
            className={cx(
              "zs-rounded-2xl zs-bg-white zs-bg-opacity-75 zs-backdrop-blur-xl py-2 zs-w-max zs-z-50",
              css`
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 0.75px rgba(255, 255, 255, 0.25);
                min-width: 200px;
                border: 0.75px solid rgba(255, 255, 255, 0.3);
              `
            )}
            style={{
              transformOrigin: animationOrigin,
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              duration: 0.15,
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {/* 移除 - 第一个选项 */}
            {showRemoveButton && (
              <MenuItem
                text="移除"
                icon={<RiIndeterminateCircleLine />}
                color="#ff3b30"
                textColor="#ff3b30"
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
              config.allowResize !== false &&
              (() => {
                const typeConfig = getDefaultConfig(contextMenu?.data?.type || "app", typeConfigMap);
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
              if (showSizeButton && config.allowResize !== false) menuIndex++;
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
          </motion.div>
        </HoverContext.Provider>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;
