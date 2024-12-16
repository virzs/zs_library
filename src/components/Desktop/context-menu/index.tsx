import { css, cx } from "@emotion/css";
import {
  RiCloseCircleLine,
  RiInformationLine,
  RiPencilRuler2Line,
  RiShareLine,
} from "@remixicon/react";
import { AnimatePresence, Variants, motion } from "framer-motion";
import { FC, ReactNode } from "react";
import { configMap } from "../config";
import { useSortableConfig } from "../context/config/hooks";
import { useSortableState } from "../context/state/hooks";
import SortableUtils from "../utils";
import { SortItem, SortItemBaseConfig } from "../types";

const itemVariants: Variants = {
  menuShow: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  menuHide: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

interface ContextButtonProps {
  icon: ReactNode;
  title: string;
  onClick?: () => void;
}

const ContextButton: FC<ContextButtonProps> = (props) => {
  const { icon, title, onClick } = props;
  const { theme } = useSortableConfig();

  const { light, dark } = SortableUtils.getTheme(theme);

  return (
    <motion.div
      className={css`
        &:hover {
          background-color: ${light.contextMenuActiveColor};
          @media (prefers-color-scheme: dark) {
            background-color: ${dark.contextMenuActiveColor};
          }
        }
        @media (prefers-color-scheme: dark) {
          color: black;
        }
        font-size: 0.75rem;
        line-height: 1rem;
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;
        border-radius: 0.5rem;
      `}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      variants={itemVariants}
    >
      <motion.div
        className={cx(
          "py-1.5 px-3 rounded-lg",
          css`
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            border-radius: 0.5rem;
          `
        )}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          className={cx(
            css`
              margin-bottom: 0.375rem;
              display: flex;
              justify-content: center;
            `
          )}
        >
          {icon}
        </motion.div>
        <motion.div>{title}</motion.div>
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

  const { theme } = useSortableConfig();

  const { light, dark } = SortableUtils.getTheme(theme);

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <motion.div
            className={cx(
              css`
                border-radius: 0.5rem;
                overflow: hidden;
                background-color: ${light.contextMenuBackgroundColor};
                box-shadow: 0 0 0.5rem ${light.contextMenuShadowColor};
                @media (prefers-color-scheme: dark) {
                  background-color: ${dark.contextMenuBackgroundColor};
                  box-shadow: 0 0 0.5rem ${dark.contextMenuShadowColor};
                }
              `
            )}
          >
            {showSizeButton && config.allowResize !== false && (
              <motion.ul
                className={css`
                  background-color: white;
                  padding: 0.25rem;
                  margin: 0;
                `}
              >
                {[
                  {
                    label: "修改大小",
                    key: "size",
                    icon: <RiPencilRuler2Line size={14} />,
                    items: getAllSizes().map((size) => ({
                      label: size,
                      key: size,
                      onClick: () => {
                        const [row, col] = size.split("x").map(Number);
                        updateItemConfig(contextMenu.data.id, {
                          row,
                          col,
                        });
                      },
                    })),
                  },
                ].map((i) => (
                  <motion.li
                    className={css`
                      padding-top: 0.5rem;
                      padding-bottom: 0.5rem;
                      padding-left: 0.75rem;
                      padding-right: 0.75rem;
                    `}
                    key={i.key}
                  >
                    <motion.p
                      className={css`
                        display: flex;
                        align-items: center;
                        font-size: 0.875rem;
                        line-height: 1.25rem;
                        gap: 0.5rem;
                        padding-bottom: 0.5rem;
                        margin: 0;
                      `}
                    >
                      {i.icon} {i.label}
                    </motion.p>
                    <motion.div
                      className={css`
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 0.25rem;
                      `}
                    >
                      {i.items.map((it) => (
                        <motion.div
                          className={cx(
                            "py-1 px-2 hover:bg-gray-100 rounded transition-all cursor-pointer text-center text-sm",
                            css`
                              padding-top: 0.25rem;
                              padding-bottom: 0.25rem;
                              padding-left: 0.5rem;
                              padding-right: 0.5rem;
                              border-radius: 0.25rem;
                              transition: all 0.3s;
                              font-size: 0.875rem;
                              line-height: 1.25rem;
                              cursor: pointer;
                              text-align: center;
                              color: ${light.contextMenuTextColor};
                              @media (prefers-color-scheme: dark) {
                                color: ${dark.contextMenuTextColor};
                              }
                              &:hover {
                                background-color: ${light.contextMenuActiveColor};
                                @media (prefers-color-scheme: dark) {
                                  background-color: ${dark.contextMenuActiveColor};
                                }
                              }
                            `,
                            `${config.row}x${config.col}` === it.key &&
                              css`
                                background-color: ${light.contextMenuActiveColor};
                                @media (prefers-color-scheme: dark) {
                                  background-color: ${dark.contextMenuActiveColor};
                                }
                              `
                          )}
                          key={it.key}
                          onClick={it.onClick}
                        >
                          {it.label}
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </motion.div>
          <motion.div
            className={cx(
              css`
                background-color: ${light.contextMenuBackgroundColor};
                box-shadow: 0 0 0.5rem ${light.contextMenuShadowColor};
                @media (prefers-color-scheme: dark) {
                  background-color: ${dark.contextMenuBackgroundColor};
                  box-shadow: 0 0 0.5rem ${dark.contextMenuShadowColor};
                }
                display: flex;
                justify-content: space-around;
                align-items: center;
                margin-top: 0.5rem;
                border-radius: 0.5rem;
                overflow: hidden;
                padding: 0.25rem;
              `
            )}
          >
            {showShareButton && (
              <ContextButton
                icon={<RiShareLine size={20} />}
                title="分享"
                onClick={() => {
                  if (onShareClick) {
                    onShareClick(contextMenu.data);
                    return;
                  }
                }}
              />
            )}
            {showInfoButton && (
              <ContextButton
                icon={<RiInformationLine size={20} />}
                title="信息"
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
            {showRemoveButton && (
              <ContextButton
                icon={<RiCloseCircleLine size={20} />}
                title="移除"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;
