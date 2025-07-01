import { css } from "@emotion/css";
import { AnimatePresence, motion } from "framer-motion";
import { configMap } from "../config";
import { useSortableState } from "../context/state/hooks";
import { SortItem, SortItemBaseConfig } from "../types";
import {
  RiApps2Line,
  RiIndeterminateCircleLine,
  RiInformationLine,
  RiShare2Line,
} from "@remixicon/react";
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

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  text,
  color = "black",
  textColor = "#1d1d1f",
  onClick,
  index,
}) => {
  const { hoveredIndex, setHoveredIndex } = useContext(HoverContext);
  const isHovered = hoveredIndex === index;

  return (
    <motion.div
      className={css`
        height: 42px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        cursor: pointer;
        position: relative;
        z-index: 1;
      `}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      onClick={onClick}
    >
      {/* 胶囊背景 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            layoutId="menuHover"
            className={css`
              position: absolute;
              top: 2px;
              left: 8px;
              right: 8px;
              bottom: 2px;
              background: rgba(0, 0, 0, 0.06);
              border-radius: 8px;
              z-index: -1;
            `}
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
        className={css`
          flex: 1;
          font-size: 14px;
          font-weight: 400;
          line-height: 18px;
          color: ${textColor};
          letter-spacing: -0.28px;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
            sans-serif;
        `}
      >
        {text}
      </motion.div>
      {icon && (
        <motion.div
          className={css`
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: ${color};
            width: 18px;
            height: 18px;
          `}
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

const SizeMenuItem: React.FC<SizeMenuItemProps> = ({
  sizes,
  currentSize,
  onSizeChange,
}) => {
  return (
    <motion.div
      className={css`
        height: 42px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        cursor: default;
      `}
    >
      <RiApps2Line size={18} color="black" />
      <motion.div
        className={css`
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        `}
      >
        {sizes.map((size) => (
          <motion.div
            key={size}
            className={css`
              width: 20px;
              height: 20px;
              border-radius: 5px;
              font-size: 10px;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease-out;
              border: 1px solid transparent;
              font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
                sans-serif;
              ${currentSize === size
                ? `
                  background: linear-gradient(135deg, #007aff 0%, #0051d4 100%);
                  color: white;
                  font-weight: 600;
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
            `}
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
  const {
    contextMenu,
    setContextMenu,
    hideContextMenu,
    setShowInfoItemData,
    removeItem,
    updateItemConfig,
  } = useSortableState();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { data } = contextMenu ?? {};
  const { config = {} } = data ?? {};

  const getAllSizes = () => {
    const config: SortItemBaseConfig = configMap[contextMenu?.data?.type];
    const dimensions = [];
    for (let row = 1; row <= (config?.maxRow ?? 2); row++) {
      for (let col = 1; col <= (config?.maxCol ?? 2); col++) {
        dimensions.push(`${row}x${col}`);
      }
    }
    return dimensions;
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
                ease: "easeInOut"
              }
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
              className={css`
                border-radius: 16px;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.77);
                backdrop-filter: blur(20px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15),
                  0 0 0 0.75px rgba(255, 255, 255, 0.25);
                padding: 8px 0;
                width: max-content;
                min-width: 200px;
                border: 0.75px solid rgba(255, 255, 255, 0.3);
              `}
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
              {showSizeButton && config.allowResize !== false && (
                <SizeMenuItem
                  sizes={getAllSizes()}
                  currentSize={`${config.row}x${config.col}`}
                  onSizeChange={(size) => {
                    const [row, col] = size.split("x").map(Number);
                    updateItemConfig(contextMenu.data.id, {
                      row,
                      col,
                    });
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        </HoverContext.Provider>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;
