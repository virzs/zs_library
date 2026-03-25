import { css, cx } from "@emotion/css";
import { AnimatePresence, motion } from "motion/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDesktopDnd } from "../context";
import { Theme } from "../themes";
import { DndSortItem } from "../types";
import GridItem from "../items/grid-item";
import { useFolderSortEngine } from "../hooks/use-folder-sort-engine";
import BaseModal from "./base-modal";

const GRID_GAP = 16;

const makeEditableTitleStyle = (theme: Theme) => {
  const t = theme.token.items?.groupModal?.title;
  return css`
    border-style: none;
    color: ${t?.textColor ?? "rgba(255, 255, 255, 0.95)"};
    font-weight: 600;
    font-size: 18px;
    letter-spacing: -0.5px;
    transition: all 0.2s ease-out;
    background: ${t?.backgroundColor ?? "transparent"};
    padding: 4px 12px;
    border-radius: 8px;

    &:focus {
      outline: none;
      background: ${t?.focusBackgroundColor ?? "rgba(255, 255, 255, 0.1)"};
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 0 0 2px ${t?.shadowColor ?? "rgba(255, 255, 255, 0.2)"};
      transform: scale(1.02);
    }

    &:hover {
      background: ${t?.hoverBackgroundColor ?? "rgba(255, 255, 255, 0.06)"};
    }

    &::placeholder {
      color: ${t?.placeholderColor ?? "rgba(255, 255, 255, 0.4)"};
    }

    &::selection {
      background: ${t?.selectionBackgroundColor ?? "rgba(255, 255, 255, 0.2)"};
    }
  `;
};

/* ── Editable Title ────────────────────────────────────────────── */

interface EditableFolderTitleProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  theme: Theme;
}

const EditableFolderTitle: React.FC<EditableFolderTitleProps> = ({
  value,
  onChange,
  onBlur,
  theme,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const editableTitleStyle = makeEditableTitleStyle(theme);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <input
      className={cx("zs-text-center zs-w-full", editableTitleStyle)}
      value={localValue}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder="文件夹"
    />
  );
};

/* ── Folder Modal ──────────────────────────────────────────────── */

interface FolderModalProps {
  iconBuilder?: (item: DndSortItem) => React.ReactNode;
}

const FolderModal = ({ iconBuilder }: FolderModalProps) => {
  const {
    folderModal,
    setFolderModal,
    pages,
    currentPage,
    removeItemFromFolder,
    updateItemData,
    iconSize,
    setDragState,
    dragState,
    pointerPositionRef,
    theme,
  } = useDesktopDnd();

  const { openFolder, openPosition } = folderModal;
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [cols, setCols] = useState(4);
  const gridRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const cellSize = iconSize + GRID_GAP;
  const containerWidth = cols * cellSize;

  const liveFolder = useMemo(() => {
    if (!openFolder) return null;
    for (const page of pages) {
      for (const item of page.children) {
        if (item.id === openFolder.id && item.type === "group") {
          return item;
        }
      }
    }
    return openFolder;
  }, [openFolder, pages]);

  const liveFolderRef = useRef(liveFolder);
  liveFolderRef.current = liveFolder;

  const folderNameRef = useRef(folderName);
  folderNameRef.current = folderName;

  useEffect(() => {
    if (openFolder) {
      setVisible(true);
      setIsClosing(false);
      setFolderName(openFolder.data?.name ?? "文件夹");
    }
  }, [openFolder]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setVisible(false);
    setTimeout(() => {
      setIsClosing(false);
      setFolderModal({ openFolder: null, openPosition: null });
    }, 300);
  }, [setFolderModal, isClosing]);

  const handleTitleBlur = useCallback(() => {
    if (!liveFolder) return;
    updateItemData(liveFolder.id, { name: folderName });
  }, [liveFolder, folderName, updateItemData]);

  /* ── Drag-out-to-desktop ───────────────────────────────────── */

  const handleDragOutItem = useCallback(
    (item: DndSortItem, clientX: number, clientY: number) => {
      const folder = liveFolderRef.current;
      if (!folder) return;

      updateItemData(folder.id, { name: folderNameRef.current });
      removeItemFromFolder(folder.id, item.id, currentPage);

      const halfIcon = iconSize / 2;
      pointerPositionRef.current = { x: clientX, y: clientY };
      setDragState({
        activeId: item.id,
        isDragging: true,
        pointerPosition: { x: clientX, y: clientY },
        pointerOffset: { x: halfIcon, y: halfIcon },
        mergeTargetId: null,
        dragSource: "folder",
        draggedItem: item,
        gapIndex: pages[currentPage]?.children.length ?? 0,
        sourcePageIndex: currentPage,
      });

      setVisible(false);
      setIsClosing(false);
      setFolderModal({ openFolder: null, openPosition: null });
    },
    [
      currentPage,
      removeItemFromFolder,
      setDragState,
      iconSize,
      pages,
      setFolderModal,
      updateItemData,
    ],
  );

  /* ── Folder sort engine (reuses global dragState + GridItem) ── */

  const { handleDragStart } = useFolderSortEngine({
    gridRef,
    dialogRef,
    folderId: liveFolder?.id ?? null,
    cols,
    cellSize,
    onDragOut: handleDragOutItem,
  });

  /* ── Compute cols from grid container width ────────────────── */

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      const newCols = Math.max(1, Math.floor(w / cellSize));
      setCols(newCols);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [cellSize]);

  /* ── Compute display order (gap-based, same as PageGrid) ──── */

  const renderItems = useMemo(() => {
    const children = liveFolder?.children ?? [];
    const isFolderSorting =
      dragState.isDragging &&
      dragState.dragSource === "folder" &&
      dragState.sourcePageIndex === -1;

    if (!isFolderSorting) return children;

    const activeId = dragState.activeId;
    const draggedItem = children.find((c) => c.id === activeId);
    const others = children.filter((c) => c.id !== activeId);
    const gapIndex = Math.min(Math.max(0, dragState.gapIndex), others.length);

    const result = [...others];
    if (draggedItem) {
      result.splice(gapIndex, 0, draggedItem);
    }
    return result;
  }, [
    liveFolder,
    dragState.isDragging,
    dragState.dragSource,
    dragState.sourcePageIndex,
    dragState.gapIndex,
    dragState.activeId,
  ]);

  if (!openFolder) return null;

  return (
    <AnimatePresence>
      {openFolder && (
        <BaseModal
          visible={visible}
          onClose={handleClose}
          mousePosition={
            openPosition ? { x: openPosition.x, y: openPosition.y } : undefined
          }
          title={
            <EditableFolderTitle
              value={folderName}
              onChange={setFolderName}
              onBlur={handleTitleBlur}
              theme={theme}
            />
          }
          footer={null}
          closable={false}
          width={400}
          destroyOnClose
          theme={theme}
        >
          <div ref={dialogRef}>
            <div
              ref={gridRef}
              className={cx(
                "zs-grid zs-content-start",
                css`
                  width: ${containerWidth}px;
                  grid-template-columns: repeat(${cols}, ${cellSize}px);
                  grid-auto-rows: ${cellSize}px;
                  margin: 0 auto;
                `,
              )}
            >
              <AnimatePresence mode="popLayout">
                {renderItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="zs-flex zs-justify-center zs-items-start zs-pt-2"
                    layout="position"
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 380, damping: 38 }}
                  >
                    <GridItem
                      item={item}
                      onDragStart={handleDragStart}
                      iconBuilder={iconBuilder}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </BaseModal>
      )}
    </AnimatePresence>
  );
};

export default FolderModal;
