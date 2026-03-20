import { css, cx } from "@emotion/css";
import React, { useCallback } from "react";
import { useDesktopDnd } from "../context";
import { DndSortItem } from "../types";
import GridItem from "./grid-item";

const folderIconStyle = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 3px;
  padding: 8px;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
`;

const folderMiniIconStyle = css`
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.15);
`;

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
  const { iconSize, setFolderModal, dragState } = useDesktopDnd();

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

  const renderFolderPreview = () => (
    <div
      className={cx(
        folderIconStyle,
        css`
          width: ${iconSize}px;
          width: ${(size?.col ?? 1) * iconSize}px;
          height: ${(size?.row ?? 1) * iconSize}px;
          background: rgba(128, 128, 128, 0.3);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.15);
        `,
      )}
    >
      {preview.map((child) => (
        <div key={child.id} className={folderMiniIconStyle}>
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
            <div className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-bg-blue-400 zs-text-white zs-text-xs">
              {(child.data?.name ?? "?").charAt(0)}
            </div>
          )}
        </div>
      ))}
    </div>
  );

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
