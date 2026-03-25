import { css, cx } from "@emotion/css";
import React, { useCallback } from "react";
import { useDesktopDnd } from "../context";
import { DndSortItem } from "../types";
import GridItem from "./grid-item";

interface FolderItemProps {
  item: DndSortItem;
  onDragStart: (
    item: DndSortItem,
    clientX: number,
    clientY: number,
    pointerId: number,
    el: HTMLElement,
  ) => void;
  onItemClick?: (item: DndSortItem) => void;
  iconBuilder?: (item: DndSortItem) => React.ReactNode;
  size?: { col: number; row: number };
}

const FolderItem = ({
  item,
  onDragStart,
  iconBuilder,
  size,
}: FolderItemProps) => {
  const { iconSize, setFolderModal, dragState, theme } = useDesktopDnd();

  const preview = (item.children ?? []).slice(0, 9);

  const handleFolderClick = useCallback(
    (clickedItem: DndSortItem) => {
      if (dragState.isDragging) return;
      setFolderModal({
        openFolder: clickedItem,
        openPosition: null,
      });
    },
    [setFolderModal, dragState.isDragging],
  );

  const renderFolderPreview = () => {
    const col = size?.col ?? 1;
    const row = size?.row ?? 1;
    const gap = Math.round((iconSize / 64) * 48);
    const scale = Math.min(col, row);
    const padding = Math.round(8 * scale);
    const innerGap = Math.round(3 * scale);
    const borderRadius = Math.round(4 * scale);
    const totalWidth = iconSize * col + gap * (col - 1);
    const totalHeight = iconSize * row + gap * (row - 1);

    const itemsTheme = theme.token.items;
    const groupBg =
      itemsTheme?.groupIconBackgroundColor ?? "rgba(128, 128, 128, 0.3)";
    const groupShadow =
      itemsTheme?.groupIconShadowColor ?? "rgba(0, 0, 0, 0.15)";
    const slotBg =
      itemsTheme?.iconBackgroundColor ?? "rgba(255, 255, 255, 0.15)";
    const fallbackBg = itemsTheme?.iconBackgroundColor ?? "rgba(64, 148, 229, 0.9)";

    return (
      <div
        className={cx(
          "zs-grid zs-rounded-2xl zs-overflow-hidden",
          css`
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: ${innerGap}px;
            padding: ${padding}px;
            width: ${totalWidth}px;
            height: ${totalHeight}px;
            background: ${groupBg};
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 0 0.5rem ${groupShadow};
          `,
        )}
      >
        {preview.map((child) => (
          <div
            key={child.id}
            className={cx(
              "zs-overflow-hidden",
              css`
                border-radius: ${borderRadius}px;
                background: ${slotBg};
              `,
            )}
          >
            {iconBuilder ? (
              iconBuilder(child)
            ) : child.data?.icon &&
              typeof child.data.icon === "string" &&
              (child.data.icon.startsWith("http") ||
                child.data.icon.startsWith("https")) ? (
              <img
                src={child.data.icon}
                alt=""
                className="zs-w-full zs-h-full zs-object-cover"
              />
            ) : (
              <div
                className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-text-white zs-text-xs"
                style={{ background: fallbackBg }}
              >
                {(child.data?.name ?? "?").charAt(0)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <GridItem
      item={item}
      onDragStart={onDragStart}
      onItemClick={handleFolderClick}
      iconBuilder={iconBuilder}
      size={size}
    >
      {renderFolderPreview()}
    </GridItem>
  );
};

export default FolderItem;
