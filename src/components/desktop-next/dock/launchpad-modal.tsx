import { useSurfaceTheme } from "../contexts/config-context";
import { useEffect, useLayoutEffect, useMemo, useState, useSyncExternalStore } from "react";
import { css, cx, keyframes } from "@emotion/css";
import { motion, AnimatePresence } from "motion/react";
import { RiCloseLine } from "@remixicon/react";

import { DndSortItem } from "../types";
import { useDesktopDnd } from "../context";
import SearchBox from "./search-box";
import BaseModal from "../modal/base-modal";
import BaseDrawer from "../drawer/base-drawer";
import GridItem from "../items/grid-item";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { baseTokens } from "../themes/base";
import { fade } from "../themes/material";
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
const indexLetters = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ#");
const LETTER_HINT_MS = 2000;
const indexedApp = css`
  [data-grid-item-id] { transition: filter 240ms ease-in-out; }
  @media (prefers-reduced-motion: reduce) {
    [data-grid-item-id] { transition: none; }
  }
  &[data-muted="true"] [data-grid-item-id] { filter: grayscale(1) opacity(.48); }
`;
const compactQuery = "(max-width: 600px), (max-width: 960px) and (max-height: 500px)";
function subscribeCompact(change: () => void) {
  const media = window.matchMedia?.(compactQuery);
  media?.addEventListener("change", change);
  return () => media?.removeEventListener("change", change);
}
const matchesCompact = () => window.matchMedia?.(compactQuery).matches ?? false;
const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;
const fullscreenDrawer = css`
  &.rc-drawer-bottom {
    height: 100vh;
    height: 100dvh;
  }
  &.rc-drawer-bottom .rc-drawer-content-wrapper {
    inset: 0;
    width: 100%;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    animation: ${slideUp} 230ms cubic-bezier(.2,.8,.2,1);
    @media (prefers-reduced-motion: reduce) { animation: none; }
  }
`;
const drawerContent = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding-inline: env(safe-area-inset-left, 0px) env(safe-area-inset-right, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  .base-drawer-title {
    flex: none;
    padding: calc(12px + env(safe-area-inset-top, 0px)) 16px 10px;
  }
  .base-drawer-content { flex: 1; min-height: 0; padding: 0 8px 0 0; }
`;
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
  theme: explicitTheme,
}: LaunchpadModalProps) => {
  const theme = useSurfaceTheme(explicitTheme);
  const { pages, iconSize, t } = useDesktopDnd();
  const [searchQuery, setSearchQuery] = useState("");
  const [letterHint, setLetterHint] = useState<{ letter: string } | null>(null);
  const phone = useIsMobile();
  const compact = useSyncExternalStore(subscribeCompact, matchesCompact, () => false);
  const isMobile = phone || compact;
  const preferredIconSize = isMobile ? Math.max(52, Math.min(56, iconSize)) : iconSize;
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const [gridLayout, setGridLayout] = useState(() => ({
    cols: isMobile ? MOBILE_TARGET_COLS : DESKTOP_TARGET_COLS,
    columnWidth: getGridItemVisualWidth(preferredIconSize),
    iconSize: preferredIconSize,
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

    return { groupMap: map, groups: indexLetters.filter(letter => map.has(letter)) };
  }, [pages, searchQuery]);

  const totalApps = useMemo(
    () => Array.from(groupMap.values()).reduce((s, v) => s + v.length, 0),
    [groupMap],
  );

  const hasHintResults = letterHint !== null && groupMap.has(letterHint.letter);
  useEffect(() => {
    if (!letterHint) return;
    if (!visible || !hasHintResults) {
      setLetterHint(null);
      return;
    }
    const timer = window.setTimeout(() => {
      setLetterHint(current => current === letterHint ? null : current);
    }, LETTER_HINT_MS);
    return () => window.clearTimeout(timer);
  }, [letterHint, visible, hasHintResults]);

  const jumpToLetter = (letter: string) => {
    if (!groupMap.has(letter)) return;
    setLetterHint({ letter });
    const anchor = scrollElement?.querySelector<HTMLElement>(`[data-letter="${CSS.escape(letter)}"]`);
    if (anchor && scrollElement) {
      const top = anchor.getBoundingClientRect().top - scrollElement.getBoundingClientRect().top + scrollElement.scrollTop;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      scrollElement.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  const base = baseTokens(theme);
  const modalTheme = theme?.token?.modal;
  const launchpadModalTheme = theme?.token?.dock?.launchpad?.modal;
  const sbThumb = modalTheme?.scrollbar?.thumbColor ?? fade(base.textColor, 30);
  const sbTrack = modalTheme?.scrollbar?.trackColor ?? "transparent";
  const sbRadius = modalTheme?.scrollbar?.borderRadius ?? "2px";
  const letterIndexColor =
    launchpadModalTheme?.letterIndexColor ??
    theme?.token?.items?.textColor ??
    base.textColor;

  useLayoutEffect(() => {
    const el = scrollElement;
    if (!el) return;

    const computeGridLayout = () => {
      const style = getComputedStyle(el);
      // clientWidth 已扣除滚动条，再扣除滚动区内边距及网格两侧各 2px。
      const availableWidth = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 4;
      if (availableWidth <= 0) return;
      setGridLayout(getLaunchpadGridLayout(availableWidth, preferredIconSize, isMobile));
    };

    computeGridLayout();

    if ("ResizeObserver" in globalThis) {
      const ro = new ResizeObserver(computeGridLayout);
      ro.observe(el);
      return () => ro.disconnect();
    }

    globalThis.addEventListener("resize", computeGridLayout);
    return () => globalThis.removeEventListener("resize", computeGridLayout);
  }, [scrollElement, preferredIconSize, isMobile]);

  const letterIndexSpacer = !isMobile && (
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

  const letterIndex = (
    <div
      data-launchpad-index=""
      className={css`
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        align-items: center;
        align-self: center;
        width: ${isMobile ? 24 : 20}px;
        max-height: 100%;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: none;
        &::-webkit-scrollbar { display: none; }
      `}
    >
      {indexLetters.map(letter => {
        return (
          <motion.button
            key={letter}
            type="button"
            disabled={!groupMap.has(letter)}
            whileHover={groupMap.has(letter) ? { scale: 1.1 } : undefined}
            whileTap={groupMap.has(letter) ? { scale: 0.9 } : undefined}
            className={css`
              display: grid;
              place-items: center;
              flex: 0 1 21px;
              min-height: 14px;
              width: 100%;
              padding: 0;
              border: 0;
              border-radius: 6px;
              background: transparent;
              color: ${letterIndexColor};
              font: 600 10px/1 ${base.fontFamily};
              cursor: pointer;
              @media (hover: hover) {
                &:enabled:hover { color: ${base.primaryColor}; }
              }
              &:focus-visible { outline: 1px solid ${base.primaryColor}; outline-offset: -1px; }
              &:disabled { opacity: .46; cursor: default; }
            `}
            onClick={() => jumpToLetter(letter)}
          >
            {letter}
          </motion.button>
        );
      })}
    </div>
  );

  const appGrid = (
    <div
      ref={setScrollElement}
      data-launchpad-scroll=""
      className={cx(
        "zs-flex-1 zs-overflow-y-auto zs-overflow-x-hidden zs-min-w-0",
        css`
          box-sizing: border-box;
          padding: ${isMobile ? "8px 4px 0 16px" : "0 10px 0 16px"};
          overscroll-behavior-y: contain;
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
        <div className="zs-flex zs-items-center zs-justify-center zs-flex-col zs-text-xl zs-font-medium zs-text-center zs-h-full zs-py-20" style={{ color: base.textColor }}>
          <div className="zs-text-6xl zs-mb-4 zs-opacity-60">
            {searchQuery.trim() ? "🔍" : "📱"}
          </div>
          <div className="zs-mb-2">
            {searchQuery.trim()
              ? t("launchpad.noSearchResults")
              : t("launchpad.noApps")}
          </div>
          <div className="zs-text-base zs-font-normal" style={{ color: fade(base.textColor, 74) }}>
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
                  className={indexedApp}
                  data-muted={hasHintResults && letterHint?.letter !== letter}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18, delay: index * 0.015 }}
                  style={{ position: "relative" }}
                >
                  {index === 0 && (
                    <span
                      data-letter={letter}
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
                    theme={theme}
                    scrollable={isMobile}
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
          max-width: ${isMobile ? "none" : "480px"};
          ${isMobile && "padding-block: 0;"}
          width: 100%;
          margin: 0 auto;
        `,
      )}
    >
      <SearchBox
        className="zs-grow"
        variant={isMobile ? "drawer" : "default"}
        value={searchQuery}
        onChange={query => {
          setSearchQuery(query);
          setLetterHint(null);
        }}
        placeholder={t("launchpad.searchPlaceholder")}
        theme={theme}
      />
      {isMobile && (
        <button
          type="button" onClick={onClose} aria-label={t("launchpad.close")}
          className={css`
            display: grid; place-items: center; flex: none;
            width: 44px; height: 44px; padding: 0; border: 0; border-radius: 50%;
            background: ${base.hoverColor}; color: ${base.textColor}; cursor: pointer;
            &:focus-visible { outline: 2px solid ${base.primaryColor}; }
          `}
        >
          <RiCloseLine aria-hidden="true" size={20} />
        </button>
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
        height="100%"
        rootClassName={fullscreenDrawer}
        title={searchBar}
        maskClosable
        contentClassName={drawerContent}
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
