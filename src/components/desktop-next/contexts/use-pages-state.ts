import { useCallback, useState } from "react";
import { isDesktopPages } from "../layout";
import type { DndPageItem } from "../types";

/** usePagesState 的入参。 */
interface UsePagesStateOptions {
  /** 外部传入的受控分页数据。 */
  externalPages: DndPageItem[];
  /** 分页数据变化回调。 */
  onChange: (pages: DndPageItem[]) => void;
  /** 本地缓存 key；提供后优先使用 localStorage 中的分页数据。 */
  storageKey?: string;
}

/**
 * 管理桌面分页数据。
 *
 * 未提供 storageKey 时保持完全受控；提供 storageKey 时使用内部状态承载缓存数据，
 * setPages 会同时写入 localStorage 并触发 onChange。
 */
export const usePagesState = ({
  externalPages,
  onChange,
  storageKey,
}: UsePagesStateOptions) => {
  const [internalPages, setInternalPages] = useState<DndPageItem[]>(() => {
    if (storageKey) {
      let storedPages: unknown;
      try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return externalPages;
        storedPages = JSON.parse(stored);
      } catch (error) {
        console.warn("Failed to restore desktop-next pages from localStorage", error);
        return externalPages;
      }
      if (isDesktopPages(storedPages)) return storedPages;
      throw new TypeError(`DesktopNext 缓存 ${storageKey} 的格式无效。旧版布局请先使用 convertLegacyDesktopPages 转换后再载入。`);
    }
    return externalPages;
  });

  const pages = storageKey ? internalPages : externalPages;

  const setPages = useCallback(
    (newPages: DndPageItem[]) => {
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newPages));
        } catch (error) {
          console.warn("Failed to save desktop-next pages to localStorage", error);
        }
        setInternalPages(newPages);
      }
      onChange(newPages);
    },
    [onChange, storageKey],
  );

  return { pages, setPages };
};
