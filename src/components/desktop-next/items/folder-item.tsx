import { css, cx } from "@emotion/css";
import { motion } from "motion/react";
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
            fallbackRadiusClassName=""
          />
        );
      }

      if (iconData) return <>{iconData}</>;

      return (
        <div
          className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-text-white zs-text-[13px] zs-font-bold"
          style={{ background: fallbackBg }}
        >
          {(child.data?.name ?? "?").charAt(0)}
        </div>
      );
    };

    return (
      <motion.div
        layout="size"
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
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
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
            {renderChildIcon(child)}
          </div>
        ))}
      </motion.div>
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
