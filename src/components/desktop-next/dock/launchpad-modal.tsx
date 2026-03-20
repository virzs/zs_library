import { useMemo, useRef, useState } from "react";
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

const LaunchpadModal = ({
  visible,
  onClose,
  onItemClick,
  theme,
}: LaunchpadModalProps) => {
  const { pages, iconSize } = useDesktopDnd();
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const contentScrollRef = useRef<HTMLDivElement>(null);

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
    if (el)
      el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const modalTheme = theme?.token?.modal;
  const sbThumb =
    modalTheme?.scrollbar?.thumbColor ?? "rgba(255,255,255,0.15)";
  const sbTrack = modalTheme?.scrollbar?.trackColor ?? "transparent";
  const sbRadius = modalTheme?.scrollbar?.borderRadius ?? "2px";

  const letterIndex = groups.length > 1 && (
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
            transition={{ duration: 0.15, delay: index * 0.02, ease: "easeOut" }}
            whileHover={{ scale: 1.15, color: "#007aff" }}
            whileTap={{ scale: 0.9 }}
            className={cx(
              "zs-text-xs zs-cursor-pointer zs-rounded-md zs-w-5 zs-h-5 zs-flex zs-items-center zs-justify-center zs-bg-transparent zs-border-none zs-font-semibold zs-leading-none",
              css`
                color: rgba(255, 255, 255, 0.45);
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
        "zs-flex-1 zs-overflow-y-auto zs-min-w-0",
        css`
          padding-left: 16px;
          scrollbar-width: thin;
          scrollbar-color: ${sbThumb} ${sbTrack};
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
            {searchQuery.trim() ? "未找到相关应用" : "暂无应用"}
          </div>
          <div className="zs-text-base zs-text-[#c7c7cc] zs-font-normal">
            {searchQuery.trim()
              ? "尝试使用其他关键词搜索"
              : "请添加应用到启动台"}
          </div>
        </div>
      ) : (
        <div
          className={css`
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            padding: 4px 2px 16px;
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
                    iconSize={iconSize}
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
        placeholder="搜索应用"
        theme={theme}
      />
      {isMobile && (
        <RiCloseLine
          onClick={onClose}
          aria-label="关闭"
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
      contentClassName={css`
        height: 60vh;
        max-height: 600px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      `}
    >
      {bodyContent}
    </BaseModal>
  );
};

export default LaunchpadModal;
