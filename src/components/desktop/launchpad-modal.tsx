import { useMemo } from "react";
import { css, cx } from "@emotion/css";

import { SortItem } from "./types";
import SortableItem from "./items/sortable-item";
import SortableGroupItem from "./items/group-item";
import BaseModal from "./items/modal/base-modal";
import { useSortableState } from "./context/state/hooks";

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
  const { list } = useSortableState();

  const { allApps, groupedData, groups, groupCounts } = useMemo(() => {
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

    // 按名称排序
    const sortedApps = apps.sort((a, b) => {
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
  }, [list]);

  const scrollToLetter = (letterIndex: number) => {
    const letter = groups[letterIndex];
    const element = document.getElementById(`group-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <BaseModal visible={visible} onClose={onClose} title="启动台" width={900}>
      <div className={cx("zs-relative zs-overflow-hidden zs-h-[60vh] zs-max-h-[600px]")}>
        {allApps.length === 0 ? (
          <div
            className={cx(
              "flex-1 flex items-center justify-center flex-col",
              css`
                color: #8e8e93;
                font-size: 20px;
                font-weight: 500;
                text-align: center;

                &::before {
                  content: "📱";
                  font-size: 64px;
                  margin-bottom: 16px;
                  opacity: 0.6;
                }
              `
            )}
          >
            <div>暂无应用</div>
            <div
              className={css`
                font-size: 16px;
                color: #c7c7cc;
                margin-top: 8px;
                font-weight: 400;
              `}
            >
              请添加应用到启动台
            </div>
          </div>
        ) : (
          <>
            <div className="zs-overflow-y-auto zs-h-full zs-ml-14">
              {/* 字母分组标题和网格 */}
              <div>
                {groups.map((letter, groupIndex) => {
                  const groupStartIndex = groupCounts.slice(0, groupIndex).reduce((sum, count) => sum + count, 0);
                  const groupItems = groupedData.slice(groupStartIndex, groupStartIndex + groupCounts[groupIndex]);

                  return (
                    <div key={letter} id={`group-${letter}`}>
                      <div
                        className={cx(
                          "zs-text-lg zs-sticky zs-top-0 zs-z-10 zs-bg-white zs-bg-opacity-50 zs-px-4 zs-py-2 zs-rounded-xl zs-font-bold zs-mb-2",
                          css`
                            color: #1d1d1f;
                            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                            letter-spacing: 0.5px;
                          `
                        )}
                      >
                        {letter}
                      </div>
                      <div className="zs-flex zs-gap-16 zs-p-6 zs-flex-wrap">
                        {groupItems.map((item, itemIndex) => {
                          const ItemComponent =
                            item.type === "group" || item.type === "app" ? SortableGroupItem : SortableItem;

                          return (
                            <div className="zs-mb-6">
                              <ItemComponent
                                key={item.id}
                                data={item}
                                itemIndex={groupStartIndex + itemIndex}
                                parentIds={[]}
                                onClick={onItemClick}
                                disabledDrag={true}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      {/* 侧边栏字母导航 */}
      <div
        className={cx(
          "zs-absolute zs-top-0 zs-left-0 zs-bottom-0 zs-flex zs-flex-col zs-items-center zs-z-50 zs-w-12 zs-bg-white zs-bg-opacity-50 zs-rounded-xl zs-py-2"
        )}
      >
        {groups.map((letter, index) => (
          <button
            key={letter}
            className={cx(
              "zs-text-sm zs-p-2 zs-cursor-pointer zs-rounded-xl zs-w-8 zs-h-8 zs-flex zs-items-center zs-justify-center zs-bg-none zs-border-none zs-font-semibold my-1",
              css`
                color: #666;
                line-height: 1;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

                &:hover {
                  color: #007aff;
                  background: rgba(0, 122, 255, 0.1);
                  transform: scale(1.1);
                  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.2);
                }

                &:active {
                  transform: scale(0.95);
                }
              `
            )}
            onClick={() => scrollToLetter(index)}
            title={`跳转到 ${letter}`}
          >
            {letter}
          </button>
        ))}
      </div>
    </BaseModal>
  );
};

export default LaunchpadModal;
