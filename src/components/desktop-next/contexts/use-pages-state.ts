import { useCallback, useEffect, useRef, useState } from "react";
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
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) return JSON.parse(stored) as DndPageItem[];
      } catch (error) {
        console.warn("Failed to restore desktop-next pages from localStorage", error);
      }
    }
    return externalPages;
  });

  const pages = storageKey ? internalPages : externalPages;
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  useEffect(() => {
    if (!storageKey) {
      pagesRef.current = externalPages;
    }
  }, [externalPages, storageKey]);

  const setPages = useCallback(
    (newPages: DndPageItem[]) => {
      pagesRef.current = newPages;
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

  return { pages, pagesRef, setPages };
};
