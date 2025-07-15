import { css, cx } from "@emotion/css";
import { AnimatePresence, motion } from "framer-motion";
import { getDefaultConfig, getSizeConfig } from "../config";
import { useSortableState } from "../context/state/hooks";
import { useSortableConfig } from "../context/config/hooks";
import { SortItem, SortItemDefaultConfig } from "../types";
import { RiApps2Line, RiIndeterminateCircleLine, RiInformationLine, RiShare2Line } from "@remixicon/react";
import { useState, createContext, useContext } from "react";

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
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, color = "black", textColor = "#1d1d1f", onClick, index }) => {
  const { hoveredIndex, setHoveredIndex } = useContext(HoverContext);
  const isHovered = hoveredIndex === index;

  return (
    <motion.div
      className={cx(
        "zs-py-0 zs-px-5 zs-flex zs-items-center zs-gap-4 zs-cursor-pointer zs-relative zs-h-10",
        css`
          z-index: 1;
        `
      )}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      onClick={onClick}
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
    </motion.div>
  );
};

interface SizeMenuItemProps {
  sizes: string[];
  currentSize: string;
  onSizeChange: (size: string) => void;
}

const SizeMenuItem: React.FC<SizeMenuItemProps> = ({ sizes, currentSize, onSizeChange }) => {
  return (
    <motion.div className="zs-h-10 zs-py-0 zs-px-5 zs-flex zs-items-center zs-gap-4 zs-cursor-default">
      <RiApps2Line size={18} color="black" />
      <motion.div className="zs-flex-1 zs-flex zs-items-center zs-gap-2">
        {sizes.map((size) => (
          <motion.div
            key={size}
            className={cx(
              "zs-w-5 h-5 zs-rounded-sm zs-cursor-pointer flex zs-items-center zs-justify-center zs-border zs-border-transparent",
              currentSize === size ? "zs-text-white zs-font-semibold" : "",
              css`
                font-size: 10px;
                font-weight: 500;
                transition: all 0.2s ease-out;
                ${currentSize === size
                  ? `
                  background: linear-gradient(135deg, #007aff 0%, #0051d4 100%);
                  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
                `
                  : `
                  background: rgba(60, 60, 67, 0.06);
                  color: #1d1d1f;
                  &:hover {
                    background: rgba(60, 60, 67, 0.12);
                    transform: scale(1.05);
                  }
                `}
                &:active {
                  transform: scale(0.95);
                }
              `
            )}
            onClick={() => onSizeChange(size)}
            whileTap={{ scale: 0.95 }}
          >
            {size}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
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
  const { typeConfigMap } = useSortableConfig();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { data } = contextMenu ?? {};
  const { config = {} } = data ?? {};

  const getAllSizes = () => {
    const config: SortItemDefaultConfig = getDefaultConfig(contextMenu?.data?.type || "app", typeConfigMap);
    return config.sizeConfigs.map((sizeConfig) => sizeConfig.name);
  };
  return (
    <AnimatePresence>
      {contextMenu && isOpen && (
        <HoverContext.Provider value={{ hoveredIndex, setHoveredIndex }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
              mass: 0.6,
              // 关闭动画更快
              exit: {
                duration: 0.15,
                ease: "easeInOut",
              },
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className={css`
              position: relative;
            `}
            style={{
              transformOrigin: animationOrigin,
            }}
          >
            <motion.div
              className={cx(
                "zs-rounded-2xl zs-overflow-hidden zs-bg-white zs-bg-opacity-75 zs-backdrop-blur-xl py-2 zs-w-max",
                css`
                  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 0.75px rgba(255, 255, 255, 0.25);
                  min-width: 200px;
                  border: 0.75px solid rgba(255, 255, 255, 0.3);
                `
              )}
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

                  return (
                    <SizeMenuItem
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
                  );
                })()}
            </motion.div>
          </motion.div>
        </HoverContext.Provider>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;
