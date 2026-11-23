import { css, cx } from "@emotion/css";
import React, { useCallback } from "react";
import { useDesktopDnd } from "../context";
import { DndSortItem } from "../types";
import { baseTokens } from "../themes/base";
import { fade } from "../themes/material";
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
  floating?: boolean;
}

const FolderItem = ({
  item,
  onDragStart,
  iconBuilder,
  size,
  noLabel,
  floating,
}: FolderItemProps) => {
  const { setFolderModal, dragState, theme } = useDesktopDnd();

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
    const scale = Math.min(col, row);
    const padding = Math.round(8 * scale);
    const innerGap = Math.round(3 * scale);
    const slotRadius = Math.max(5, Math.round(4 * scale));
    const itemsTheme = theme.token.items;
    const base = baseTokens(theme);
    const groupShadow =
      itemsTheme?.groupIconShadowColor ?? base.shadowColor;
    const slotBg =
      itemsTheme?.iconBackgroundColor ?? base.backgroundColor;
    const fallbackBg = itemsTheme?.iconBackgroundColor ?? base.primaryColor;

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
            fallbackColor={itemsTheme?.textColor ?? base.textColor}
            fallbackText={child.data?.name ?? "?"}
            fallbackBackground={child.data?.iconColor ?? fallbackBg}
            fallbackClassName="zs-text-[13px] zs-font-bold"
          />
        );
      }

      if (iconData) return <>{iconData}</>;

      return (
        <div
          className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-text-[13px] zs-font-bold"
          style={{ background: child.data?.iconColor ?? fallbackBg, color: itemsTheme?.textColor ?? base.textColor }}
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
            width: 100%;
            height: 100%;
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
                background: ${child ? slotBg : "transparent"};
                box-shadow: ${child ? `0 1px 2px ${fade(groupShadow, 55)}` : "none"};
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
      floating={floating}
      folderPreview
    >
      {renderFolderPreview()}
    </GridItem>
  );
};

export default FolderItem;
