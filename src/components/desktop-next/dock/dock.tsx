import React, { useState } from "react";
import { css, cx } from "@emotion/css";
import { AnimatePresence, motion } from "motion/react";
import { DndSortItem } from "../types";
import LaunchpadButton from "./launchpad-button";
import LaunchpadModal from "./launchpad-modal";
import GridItem from "../items/grid-item";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { Theme } from "../themes";

export interface DockProps {
  items?: DndSortItem[];
  fixedItems?: DndSortItem[];
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  onItemClick?: (item: DndSortItem) => void;
  itemBuilder?: (item: DndSortItem, index: number) => React.ReactNode;
  fixedItemBuilder?: (item: DndSortItem, index: number) => React.ReactNode;
  showLaunchpad?: boolean;
  onLaunchpadClick?: () => void;
  onLaunchpadItemClick?: (item: DndSortItem) => void;
  maxItems?: number;
  itemSize?: number;
  theme?: Theme;
}

const Dock: React.FC<DockProps> = ({
  items = [],
  fixedItems = [],
  position = "bottom",
  className,
  onItemClick,
  itemBuilder,
  fixedItemBuilder,
  showLaunchpad = true,
  onLaunchpadClick,
  onLaunchpadItemClick,
  maxItems = 3,
  itemSize = 56,
  theme,
}) => {
  const dockTheme = theme?.token?.dock;
  const baseTheme = theme?.token?.base;
  const isMobile = useIsMobile();

  const [launchpadVisible, setLaunchpadVisible] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaY, setTouchDeltaY] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const swipeThreshold = 60;

  const openLaunchpad = () => {
    onLaunchpadClick?.();
    setLaunchpadVisible(true);
  };

  const noop = () => {};

  const renderDockItem = (item: DndSortItem, index: number) => {
    if (itemBuilder) {
      return (
        <div onClick={() => onItemClick?.(item)}>
          {itemBuilder(item, index)}
        </div>
      );
    }
    return (
      <GridItem
        item={item}
        onDragStart={noop}
        onItemClick={onItemClick}
        size={{ col: 1, row: 1 }}
        noLabel
        iconSize={itemSize}
        iconBuilder={theme?.token?.items ? undefined : undefined}
      />
    );
  };

  const renderFixedItem = (item: DndSortItem, index: number) => {
    if (fixedItemBuilder) {
      return fixedItemBuilder(item, index);
    }
    return (
      <GridItem
        item={item}
        onDragStart={noop}
        onItemClick={onItemClick}
        size={{ col: 1, row: 1 }}
        noLabel
        iconSize={itemSize}
      />
    );
  };

  const limitedItems = items.slice(0, Math.max(0, maxItems));
  const hasMainContent = fixedItems.length > 0 || limitedItems.length > 0;

  if (!limitedItems.length && !fixedItems.length && !showLaunchpad) {
    return null;
  }

  const isHorizontal = position === "top" || position === "bottom";

  const divider = (
    <div
      className={cx(
        "zs-flex zs-transition-colors",
        isHorizontal
          ? "zs-w-[1px] zs-h-8 zs-mx-1"
          : "zs-w-8 zs-h-[1px] zs-my-1",
        css`
          background-color: ${dockTheme?.divider?.color ??
          "rgba(255, 255, 255, 0.12)"};
        `,
      )}
    />
  );

  return (
    <>
      <motion.div
        className={cx(
          "zs-flex zs-items-center zs-rounded-2xl zs-py-3 zs-px-4 zs-backdrop-blur-xl zs-gap-1 zs-border zs-transition-colors zs-max-w-full",
          hasMainContent ? "zs-justify-between" : "zs-justify-center",
          isHorizontal ? "zs-flex-row" : "zs-flex-col",
          position === "top" && "zs-mb-4",
          position === "bottom" && "zs-mt-4",
          css`
            background-color: ${dockTheme?.backgroundColor ??
            "rgba(30, 30, 30, 0.7)"};
            border-color: ${dockTheme?.borderColor ??
            "rgba(255, 255, 255, 0.1)"};
            box-shadow: 0 8px 32px
              ${dockTheme?.boxShadowColor ?? "rgba(0, 0, 0, 0.4)"};
          `,
          className,
        )}
        layout
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
      >
        {fixedItems.length > 0 && (
          <div
            className={cx(
              "zs-flex zs-gap-3",
              css`
                ${isHorizontal
                  ? "flex-direction: row;"
                  : "flex-direction: column;"}
              `,
            )}
          >
            <AnimatePresence mode="popLayout" presenceAffectsLayout={false}>
              {fixedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout="position"
                  transition={{ type: "spring", stiffness: 380, damping: 38 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {renderFixedItem(item, index)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {fixedItems.length > 0 && limitedItems.length > 0 && divider}

        {limitedItems.length > 0 && (
          <div
            className={cx(
              "zs-flex zs-gap-3 zs-flex-1 zs-relative",
              css`
                min-height: ${itemSize}px;
                ${isHorizontal
                  ? "flex-direction: row; overflow-x: auto; overflow-y: hidden;"
                  : "flex-direction: column; overflow-y: auto; overflow-x: hidden;"}
                scrollbar-width: none;
                -ms-overflow-style: none;
                &::-webkit-scrollbar {
                  display: none;
                }
                & > * {
                  flex-shrink: 0;
                }
              `,
            )}
          >
            <AnimatePresence mode="popLayout" presenceAffectsLayout={false}>
              {limitedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout="position"
                  transition={{ type: "spring", stiffness: 380, damping: 38 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {renderDockItem(item, index)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {showLaunchpad && !isMobile && hasMainContent && divider}

        {showLaunchpad && (!isMobile || position !== "bottom") && (
          <LaunchpadButton
            onClick={openLaunchpad}
            position={position}
            theme={theme}
            apps={[...fixedItems, ...limitedItems].slice(0, 4)}
          />
        )}
      </motion.div>

      {showLaunchpad && isMobile && (
        <motion.div
          className={cx(
            "zs-absolute zs-left-1/2 -zs-bottom-3 zs--translate-x-1/2 zs-rounded-full zs-cursor-pointer",
            css`
              width: 50vw;
              height: 8px;
              background-color: ${baseTheme?.backgroundColor ?? "#ffffff"};
              box-shadow: 0 6px 18px
                ${baseTheme?.shadowColor ?? "rgba(0, 0, 0, 0.18)"};
              z-index: 50;
              touch-action: none;
              overscroll-behavior-y: contain;
            `,
          )}
          style={{
            transform: `translateX(-50%) translateY(0) scale(${1 + Math.min(Math.max(-touchDeltaY, 0), 80) / 800})`,
          }}
          onTouchStart={(e) => {
            setTouchStartY(e.touches[0].clientY);
            setTouchStartX(e.touches[0].clientX);
            setTouchDeltaY(0);
            setIsSwiping(false);
          }}
          onTouchMove={(e) => {
            if (touchStartY === null || touchStartX === null) return;
            const dy = e.touches[0].clientY - touchStartY;
            const dx = e.touches[0].clientX - touchStartX;
            if (!isSwiping) {
              if (Math.abs(dy) > Math.abs(dx) && dy < 0) {
                setIsSwiping(true);
              } else {
                return;
              }
            }
            e.preventDefault();
            e.stopPropagation();
            setTouchDeltaY(dy);
          }}
          onTouchEnd={() => {
            if (
              isSwiping &&
              touchStartY !== null &&
              touchDeltaY < -swipeThreshold
            ) {
              openLaunchpad();
            }
            setTouchStartY(null);
            setTouchStartX(null);
            setTouchDeltaY(0);
            setIsSwiping(false);
          }}
          onTouchCancel={() => {
            setTouchStartY(null);
            setTouchStartX(null);
            setTouchDeltaY(0);
            setIsSwiping(false);
          }}
        />
      )}

      <LaunchpadModal
        visible={launchpadVisible}
        onClose={() => setLaunchpadVisible(false)}
        onItemClick={onLaunchpadItemClick ?? onItemClick}
        theme={theme}
      />
    </>
  );
};

export default Dock;
