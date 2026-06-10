import { css, cx } from "@emotion/css";
import React, { useCallback } from "react";
import { useDesktopDnd } from "../context";
import { DndSortItem } from "../types";
import GridItem from "./grid-item";
import IconImage from "./icon-image";

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
  noLabel?: boolean;
}

const FolderItem = ({
  item,
  onDragStart,
  iconBuilder,
  size,
  noLabel,
}: FolderItemProps) => {
  const { iconSize, setFolderModal, dragState, theme } = useDesktopDnd();

  const preview = (item.children ?? []).slice(0, 9);
  const previewSlots = Array.from({ length: 9 }, (_, index) => preview[index]);

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
    const slotRadius = Math.max(5, Math.round(4 * scale));
    const totalWidth = iconSize * col + gap * (col - 1);
    const totalHeight = iconSize * row + gap * (row - 1);
    const folderRadius = Math.max(16, Math.round(Math.min(totalWidth, totalHeight) * 0.12));

    const itemsTheme = theme.token.items;
    const groupBg =
      itemsTheme?.groupIconBackgroundColor ?? "rgba(128, 128, 128, 0.3)";
    const groupShadow =
      itemsTheme?.groupIconShadowColor ?? "rgba(0, 0, 0, 0.15)";
    const slotBg =
      itemsTheme?.iconBackgroundColor ?? "rgba(255, 255, 255, 0.15)";
    const emptySlotBg = "rgba(255, 255, 255, 0.025)";
    const fallbackBg = itemsTheme?.iconBackgroundColor ?? "rgba(64, 148, 229, 0.9)";

    const renderChildIcon = (child: DndSortItem) => {
      const builtIcon = iconBuilder?.(child);
      if (builtIcon) return builtIcon;

      const iconData = child.data?.icon;
      if (
        iconData &&
        typeof iconData === "string" &&
        (iconData.startsWith("http") || iconData.startsWith("https"))
      ) {
        return (
          <IconImage
            src={iconData}
            fallbackText={child.data?.name ?? "?"}
            fallbackBackground={child.data?.iconColor ?? fallbackBg}
            fallbackClassName="zs-text-[13px] zs-font-bold"
          />
        );
      }

      if (iconData) return <>{iconData}</>;

      return (
        <div
          className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-text-white zs-text-[13px] zs-font-bold"
          style={{ background: child.data?.iconColor ?? fallbackBg }}
        >
          {(child.data?.name ?? "?").charAt(0)}
        </div>
      );
    };

    return (
      <div
        className={cx(
          "zs-grid zs-overflow-hidden",
          css`
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: ${innerGap}px;
            padding: ${padding}px;
            width: ${totalWidth}px;
            height: ${totalHeight}px;
            border-radius: ${folderRadius}px;
            background: ${groupBg};
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            box-shadow:
              0 ${Math.round(iconSize * 0.1)}px ${Math.round(iconSize * 0.26)}px ${groupShadow},
              inset 0 0 0 0.5px rgba(255, 255, 255, 0.12);
          `,
        )}
      >
        {previewSlots.map((child, index) => (
          <div
            key={child?.id ?? `empty-${index}`}
            className={cx(
              "zs-overflow-hidden",
              css`
                border-radius: ${slotRadius}px;
                background: ${child ? slotBg : emptySlotBg};
                box-shadow: ${child
                  ? "none"
                  : "inset 0 0 0 0.5px rgba(255, 255, 255, 0.035)"};
              `,
            )}
          >
            {child ? renderChildIcon(child) : null}
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
      noLabel={noLabel}
    >
      {renderFolderPreview()}
    </GridItem>
  );
};

export default FolderItem;
