import { useMemo, useState } from "react";
import { css, cx } from "@emotion/css";
import { motion, AnimatePresence } from "motion/react";

import { SortItem } from "../types";
import SortableItem from "../items/sortable-item";
import { useListData } from "../context/state/hooks";
import SearchBox from "./search-box";
import { BaseModal } from "../modal";
import { BaseDrawer } from "../drawer";
import { RiCloseLine } from "@remixicon/react";
import { useIsMobile } from "../../../hooks/useIsMobile";

export interface LaunchpadModalProps<D, C> {
  /**
   * 是否显示启动台
   */
  visible: boolean;
  /**
   * 关闭启动台
   */
  onClose: () => void;
  /**
   * 项目点击事件
   */
  onItemClick?: (item: SortItem<D, C>) => void;
}

const LaunchpadModal = <D, C>({ visible, onClose, onItemClick }: LaunchpadModalProps<D, C>) => {
  const { list } = useListData();
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  // 移动端判断逻辑已抽离到 useIsMobile Hook

  const { allApps, groups } = useMemo(() => {
    if (!list || list.length === 0) {
      return { allApps: [], groupedData: [], groups: [], groupCounts: [] };
    }

    // 递归获取所有app类型的item
    const getApps = (items: SortItem<D, C>[]): SortItem<D, C>[] => {
      return items.flatMap((item) => {
        if (item.type === "app") {
          return [{ ...item }];
        }
        if (item.type === "group" && item.children) {
          return getApps(item.children);
        }
        return [];
      });
    };

    const apps = list.flatMap((page: SortItem<D, C>) => {
      if (!page.children) return [];
      return getApps(page.children);
    });

    // 搜索过滤
    const filteredApps = searchQuery.trim()
      ? apps.filter((app) => {
          const name = (app.data?.name || app.id || "").toString().toLowerCase();
          return name.includes(searchQuery.toLowerCase());
        })
      : apps;

    // 按名称排序
    const sortedApps = filteredApps.sort((a, b) => {
      const nameA = (a.data?.name || a.id || "").toString();
      const nameB = (b.data?.name || b.id || "").toString();
      return nameA.localeCompare(nameB);
    });

    // 按首字母分组
    const groupMap = new Map<string, SortItem<D, C>[]>();
    sortedApps.forEach((app) => {
      const name = (app.data?.name || app.id || "").toString();
      const firstLetter = name.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(firstLetter) ? firstLetter : "#";

      if (!groupMap.has(letter)) {
        groupMap.set(letter, []);
      }
      groupMap.get(letter)!.push(app);
    });

    // 生成分组数据
    const letters = Array.from(groupMap.keys()).sort((a, b) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    });

    const groupedApps: SortItem<D, C>[] = [];
    const counts: number[] = [];

    letters.forEach((letter) => {
      const appsInGroup = groupMap.get(letter) || [];
      groupedApps.push(...appsInGroup);
      counts.push(appsInGroup.length);
    });

    return {
      allApps: sortedApps,
      groupedData: groupedApps,
      groups: letters,
      groupCounts: counts,
    };
  }, [list, searchQuery]);

  const scrollToLetter = (letterIndex: number) => {
    const letter = groups[letterIndex];
    const element = document.getElementById(`group-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const titleNode = (
    <div className="zs-py-4 zs-flex zs-items-center zs-gap-2">
      <SearchBox className="zs-grow" value={searchQuery} onChange={setSearchQuery} placeholder="搜索应用" />
      {isMobile && <RiCloseLine onClick={onClose} aria-label="关闭" className="zs-shrink-0" />}
    </div>
  );

  const contentNode = (
    <div className={cx("zs-flex-1 zs-overflow-y-auto zs-h-full zs-p-1")}>
      {allApps.length === 0 ? (
        <div className="zs-flex zs-items-center zs-justify-center zs-flex-col zs-text-[#8e8e93] zs-text-xl zs-font-medium zs-text-center zs-h-full">
          <div className="zs-text-6xl zs-mb-4 zs-opacity-60">{searchQuery.trim() ? "🔍" : "📱"}</div>
          <div className="zs-mb-2">{searchQuery.trim() ? "未找到相关应用" : "暂无应用"}</div>
          <div className="zs-text-base zs-text-[#c7c7cc] zs-font-normal">
            {searchQuery.trim() ? "尝试使用其他关键词搜索" : "请添加应用到启动台"}
          </div>
        </div>
      ) : (
        <div className="zs-flex zs-gap-3 md:zs-gap-6 lg:zs-gap-8 zs-flex-wrap">
          <AnimatePresence mode="popLayout">
            {allApps.map((item, itemIndex) => (
              <div key={item.id} className="zs-mb-6">
                <SortableItem
                  data={item}
                  itemIndex={itemIndex}
                  parentIds={[]}
                  onClick={onItemClick}
                  disabledDrag={true}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  const lettersNav = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="zs-shrink-0 zs-w-12 zs-rounded-xl zs-py-2 zs-h-full zs-overflow-y-auto"
      >
        {groups.map((letter, index) => (
          <motion.button
            key={letter}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.04, ease: "easeOut" }}
            whileHover={{
              scale: 1.08,
              backgroundColor: "rgba(0,122,255,0.1)",
              color: "#007aff",
              boxShadow: "0 4px 15px rgba(0,122,255,0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            className="zs-text-sm zs-p-2 zs-cursor-pointer zs-rounded-xl zs-w-8 zs-h-8 zs-flex zs-items-center zs-justify-center zs-bg-transparent zs-border-none zs-font-semibold zs-my-1 zs-text-[#666] zs-leading-none"
            onClick={() => scrollToLetter(index)}
            title={`跳转到 ${letter}`}
          >
            {letter}
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  );

  if (isMobile) {
    return (
      <BaseDrawer
        open={visible}
        onClose={onClose}
        placement="bottom"
        width="100vw"
        height="100vh"
        title={titleNode}
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
      >
        <div className="zs-relative zs-h-full zs-flex">
          {lettersNav}
          {contentNode}
        </div>
      </BaseDrawer>
    );
  }

  return (
    <BaseModal visible={visible} onClose={onClose} title={titleNode} width={900}>
      <div className="zs-relative zs-flex zs-h-[60vh] zs-max-h-[600px] zs-overflow-hidden">
        {lettersNav}
        {contentNode}
      </div>
    </BaseModal>
  );
};

export default LaunchpadModal;
