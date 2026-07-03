import { useEffect, useMemo, useRef, useState } from "react";
import { css, cx } from "@emotion/css";
import { motion, AnimatePresence } from "motion/react";
import { RiCloseLine } from "@remixicon/react";

import { DndSortItem } from "../types";
import { useDesktopDnd } from "../context";
import SearchBox from "./search-box";
import BaseModal from "../modal/base-modal";
import BaseDrawer from "../drawer/base-drawer";
import GridItem from "../items/grid-item";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { Theme } from "../themes";
import { getGroupLetter } from "../utils/pinyin";

export interface LaunchpadModalProps {
  visible: boolean;
  onClose: () => void;
  onItemClick?: (item: DndSortItem) => void;
  theme?: Theme;
}

const noop = () => {};
const GRID_GAP = 16;
const GRID_PADDING_X = 26;
const DESKTOP_TARGET_COLS = 7;
const MOBILE_TARGET_COLS = 4;
const MIN_DYNAMIC_ICON_SIZE = 40;

const getGridItemVisualWidth = (iconSize: number) => {
  const gap = Math.round((iconSize / 64) * 48);
  return Math.max(iconSize, iconSize + Math.round(gap * 0.58));
};

const getColumnsForWidth = (availableWidth: number, columnWidth: number) =>
  Math.max(1, Math.floor((availableWidth + GRID_GAP) / (columnWidth + GRID_GAP)));

const getIconSizeForColumn = (
  columnWidth: number,
  preferredIconSize: number,
) => {
  for (let size = preferredIconSize; size >= MIN_DYNAMIC_ICON_SIZE; size -= 1) {
    if (getGridItemVisualWidth(size) <= columnWidth) return size;
  }
  return Math.min(preferredIconSize, MIN_DYNAMIC_ICON_SIZE);
};

const getLaunchpadGridLayout = (
  availableWidth: number,
  preferredIconSize: number,
  isMobile: boolean,
) => {
  const preferredItemWidth = getGridItemVisualWidth(preferredIconSize);
  const minIconSize = Math.max(
    MIN_DYNAMIC_ICON_SIZE,
    Math.round(preferredIconSize * 0.72),
  );
  const minItemWidth = getGridItemVisualWidth(minIconSize);
  const preferredCols = getColumnsForWidth(availableWidth, preferredItemWidth);
  const compactCols = getColumnsForWidth(availableWidth, minItemWidth);
  const targetCols = isMobile ? MOBILE_TARGET_COLS : DESKTOP_TARGET_COLS;
  const cols = Math.max(preferredCols, Math.min(targetCols, compactCols));
  const columnWidth = Math.max(
    1,
    Math.floor((availableWidth - GRID_GAP * (cols - 1)) / cols),
  );
  const itemIconSize = getIconSizeForColumn(columnWidth, preferredIconSize);

  return { cols, columnWidth, iconSize: itemIconSize };
};

const LaunchpadModal = ({
  visible,
  onClose,
  onItemClick,
  theme,
}: LaunchpadModalProps) => {
  const { pages, iconSize, t } = useDesktopDnd();
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [gridLayout, setGridLayout] = useState(() => ({
    cols: isMobile ? MOBILE_TARGET_COLS : DESKTOP_TARGET_COLS,
    columnWidth: getGridItemVisualWidth(iconSize),
    iconSize,
  }));

  const { groupMap, groups } = useMemo(() => {
    const getApps = (items: DndSortItem[]): DndSortItem[] =>
      items.flatMap((item) => {
        if (item.type === "app") return [item];
        if (item.type === "group" && item.children)
          return getApps(item.children);
        return [];
      });

    const apps = pages.flatMap((page) => getApps(page.children));

    const filteredApps = searchQuery.trim()
      ? apps.filter((app) =>
          (app.data?.name ?? String(app.id))
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        )
      : apps;

    const sortedApps = [...filteredApps].sort((a, b) => {
      const nameA = (a.data?.name ?? String(a.id)).toString();
      const nameB = (b.data?.name ?? String(b.id)).toString();
      return nameA.localeCompare(nameB);
    });

    const map = new Map<string, DndSortItem[]>();
    sortedApps.forEach((app) => {
      const name = (app.data?.name ?? String(app.id)).toString();
      const letter = getGroupLetter(name);
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(app);
    });

    const letters = Array.from(map.keys()).sort((a, b) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    });

    return { groupMap: map, groups: letters };
  }, [pages, searchQuery]);

  const totalApps = useMemo(
    () => Array.from(groupMap.values()).reduce((s, v) => s + v.length, 0),
    [groupMap],
  );

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`launchpad-group-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const modalTheme = theme?.token?.modal;
  const launchpadModalTheme = theme?.token?.dock?.launchpad?.modal;
  const sbThumb = modalTheme?.scrollbar?.thumbColor ?? "rgba(255,255,255,0.15)";
  const sbTrack = modalTheme?.scrollbar?.trackColor ?? "transparent";
  const sbRadius = modalTheme?.scrollbar?.borderRadius ?? "2px";
  const letterIndexColor =
    launchpadModalTheme?.letterIndexColor ??
    theme?.token?.items?.textColor ??
    "rgba(255, 255, 255, 0.45)";
  const showLetterIndex = groups.length > 1;

  useEffect(() => {
    const el = contentScrollRef.current;
    if (!el) return;

    const computeGridLayout = () => {
      const availableWidth = Math.max(0, el.clientWidth - GRID_PADDING_X);
      if (availableWidth <= 0) return;
      setGridLayout(getLaunchpadGridLayout(availableWidth, iconSize, isMobile));
    };

    computeGridLayout();

    if ("ResizeObserver" in globalThis) {
      const ro = new ResizeObserver(computeGridLayout);
      ro.observe(el);
      return () => ro.disconnect();
    }

    globalThis.addEventListener("resize", computeGridLayout);
    return () => globalThis.removeEventListener("resize", computeGridLayout);
  }, [iconSize, isMobile, showLetterIndex]);

  const letterIndexSpacer = showLetterIndex && (
    <div
      aria-hidden
      className={cx(
        "zs-shrink-0",
        css`
          width: 20px;
        `,
      )}
    />
  );

  const letterIndex = showLetterIndex && (
    <div
      className={cx(
        "zs-flex zs-flex-col zs-items-center zs-justify-start zs-shrink-0 zs-py-2",
        css`
          width: 20px;
          gap: 2px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          &::-webkit-scrollbar {
            display: none;
          }
        `,
      )}
    >
      <AnimatePresence>
        {groups.map((letter, index) => (
          <motion.button
            key={letter}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.15,
              delay: index * 0.02,
              ease: "easeOut",
            }}
            whileHover={{ scale: 1.15, color: "#007aff" }}
            whileTap={{ scale: 0.9 }}
            className={cx(
              "zs-text-xs zs-cursor-pointer zs-rounded-md zs-w-5 zs-h-5 zs-flex zs-items-center zs-justify-center zs-bg-transparent zs-border-none zs-font-semibold zs-leading-none",
              css`
                color: ${letterIndexColor};
                font-size: 10px;
                transition: color 0.15s ease;
              `,
            )}
            onClick={() => scrollToLetter(letter)}
          >
            {letter}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );

  const appGrid = (
    <div
      ref={contentScrollRef}
      className={cx(
        "zs-flex-1 zs-overflow-y-auto zs-overflow-x-hidden zs-min-w-0",
        css`
          box-sizing: border-box;
          padding: 0 10px 0 16px;
          scrollbar-width: thin;
          scrollbar-color: ${sbThumb} ${sbTrack};
          scrollbar-gutter: stable;
          &::-webkit-scrollbar {
            width: 4px;
          }
          &::-webkit-scrollbar-track {
            background: ${sbTrack};
          }
          &::-webkit-scrollbar-thumb {
            background: ${sbThumb};
            border-radius: ${sbRadius};
          }
        `,
      )}
    >
      {totalApps === 0 ? (
        <div className="zs-flex zs-items-center zs-justify-center zs-flex-col zs-text-[#8e8e93] zs-text-xl zs-font-medium zs-text-center zs-h-full zs-py-20">
          <div className="zs-text-6xl zs-mb-4 zs-opacity-60">
            {searchQuery.trim() ? "🔍" : "📱"}
          </div>
          <div className="zs-mb-2">
            {searchQuery.trim()
              ? t("launchpad.noSearchResults")
              : t("launchpad.noApps")}
          </div>
          <div className="zs-text-base zs-text-[#c7c7cc] zs-font-normal">
            {searchQuery.trim()
              ? t("launchpad.searchHint")
              : t("launchpad.emptyHint")}
          </div>
        </div>
      ) : (
        <div
          className={css`
            box-sizing: border-box;
            display: grid;
            grid-template-columns: repeat(${gridLayout.cols}, minmax(0, ${gridLayout.columnWidth}px));
            gap: ${GRID_GAP}px;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow-x: hidden;
            padding: 4px 2px 16px;
            justify-content: center;
            justify-items: center;
          `}
        >
          <AnimatePresence mode="popLayout">
            {groups.flatMap((letter) => {
              const items = groupMap.get(letter) ?? [];
              return items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18, delay: index * 0.015 }}
                  style={{ position: "relative" }}
                >
                  {index === 0 && (
                    <span
                      id={`launchpad-group-${letter}`}
                      style={{
                        position: "absolute",
                        top: -8,
                        left: 0,
                        width: 0,
                        height: 0,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <GridItem
                    item={item}
                    onDragStart={noop}
                    onItemClick={onItemClick}
                    iconSize={gridLayout.iconSize}
                  />
                </motion.div>
              ));
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  const searchBar = (
    <div
      className={cx(
        "zs-flex zs-items-center zs-gap-2 zs-py-3",
        css`
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
        `,
      )}
    >
      <SearchBox
        className="zs-grow"
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t("launchpad.searchPlaceholder")}
        theme={theme}
      />
      {isMobile && (
        <RiCloseLine
          onClick={onClose}
          aria-label={t("launchpad.close")}
          className={cx(
            "zs-shrink-0 zs-cursor-pointer",
            css`
              color: rgba(255, 255, 255, 0.7);
            `,
          )}
        />
      )}
    </div>
  );

  const bodyContent = (
    <div className="zs-flex zs-gap-2 zs-h-full zs-overflow-hidden">
      {letterIndexSpacer}
      {appGrid}
      {letterIndex}
    </div>
  );

  if (isMobile) {
    return (
      <BaseDrawer
        open={visible}
        onClose={onClose}
        placement="bottom"
        width="100vw"
        height="100vh"
        title={searchBar}
        maskClosable
        className="!zs-w-screen"
        contentClassName={css`
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          .base-drawer-content {
            flex: 1;
            min-height: 0;
          }
        `}
        theme={theme}
      >
        {bodyContent}
      </BaseDrawer>
    );
  }

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={searchBar}
      width={780}
      theme={theme}
      classNames={{
        inner: css`
          height: 60vh;
          max-height: 600px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        `,
      }}
    >
      {bodyContent}
    </BaseModal>
  );
};

export default LaunchpadModal;
