import { css } from "@emotion/css";
import { AnimatePresence, motion } from "framer-motion";
import { configMap } from "../config";
import { useSortableState } from "../context/state/hooks";
import { SortItem, SortItemBaseConfig } from "../types";
import HomeScreenQuickActionsSvg from "./Home Screen Quick Actions.svg";
import {
  RiIndeterminateCircleLine,
  RiInformationLine,
  RiShare2Line,
} from "@remixicon/react";

interface MenuItemProps {
  icon?: React.ReactNode;
  text: string;
  color?: string;
  textColor?: string;
  onClick?: () => void;
  hoverColor?: string;
  activeColor?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  text,
  color = "#007aff",
  textColor = "#000000",
  onClick,
  hoverColor = "rgba(0, 0, 0, 0.05)",
  activeColor = "rgba(0, 0, 0, 0.1)",
}) => {
  return (
    <motion.div
      className={css`
        height: 34px;
        padding: 0 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: background-color 0.15s ease-out;
        border-bottom: 0.5px solid rgba(128, 128, 128, 0.55);
        &:hover {
          background-color: ${hoverColor};
        }
        &:active {
          background-color: ${activeColor};
        }
      `}
      onClick={onClick}
    >
      <motion.div
        className={css`
          flex: 1;
          font-size: 14px;
          font-weight: 400;
          line-height: 18px;
          color: ${textColor};
          letter-spacing: -0.43px;
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
            width: 20px;
            height: 20px;
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
        height: 34px;
        padding: 0 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: default;
        border-bottom: 0.5px solid rgba(128, 128, 128, 0.55);
      `}
    >
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
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.15s ease-out;
              border: 1px solid transparent;
              ${currentSize === size
                ? `
                  background-color: #007aff;
                  color: white;
                  font-weight: 600;
                `
                : `
                  background-color: rgba(255, 255, 255, 0.2);
                  color: #000000;
                  &:hover {
                    background-color: rgba(255, 255, 255, 0.3);
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
      <motion.div
        className={css`
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #007aff;
          width: 20px;
          height: 20px;
        `}
      >
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="12"
            y="3"
            width="7"
            height="7"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="3"
            y="12"
            width="7"
            height="7"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="12"
            y="12"
            width="7"
            height="7"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
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
}

const ContextMenu = <D, C>(props: ContextMenuProps<D, C>) => {
  const {
    showInfoButton = true,
    showRemoveButton = true,
    showShareButton = true,
    showSizeButton = true,
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
      {contextMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 8 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className={css`
            position: relative;
          `}
        >
          <motion.div
            className={css`
              border-radius: 12px;
              overflow: hidden;
              background: rgba(179, 179, 179, 0.82);
              backdrop-filter: blur(20px);
              box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2),
                0 0 0 0.5px rgba(255, 255, 255, 0.2);
              padding: 0;
              width: max-content;
              min-width: 160px;
            `}
          >
            {/* 移除 - 第一个选项 */}
            {showRemoveButton && (
              <MenuItem
                text="移除"
                icon={<RiIndeterminateCircleLine />}
                color="#ff3b30"
                textColor="#ff3b30"
                hoverColor="rgba(255, 59, 48, 0.08)"
                activeColor="rgba(255, 59, 48, 0.15)"
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
            {/* 分隔线 */}
            <motion.div
              className={css`
                height: 0.5px;
                background-color: rgba(128, 128, 128, 0.55);
                margin: 0;
              `}
            />
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
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;
