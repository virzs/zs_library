/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDebounceEffect, useLocalStorageState } from "ahooks";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { SortItem, ListItem } from "../../types";
import SortableUtils from "../../utils/index";

/** @deprecated 请使用 DesktopNext 代替 */
export interface SortableState {
  list: ListItem[];
  setList: any;
  updateItem: (id: string | number, data: any) => void;
  updateItemConfig: (id: string | number, config: any) => void;
  removeItem: (id: string) => void;
  addItem: (data: SortItem, parentIds: (string | number)[]) => void;
  addRootItem: (data: ListItem) => void;
  updateRootItem: (id: string | number, data: any) => void;
  removeRootItem: (id: string | number) => void;
  /** 当前滑块索引 */
  currentSliderIndex: number;
  setCurrentSliderIndex: (e: number) => void;
  /** 当前页面数据（排除 dock） */
  currentSliderPage: ListItem | null;
}

export const SortableStateContext = createContext<SortableState>({
  list: [],
  setList: () => {},
  updateItem: () => {},
  updateItemConfig: () => {},
  removeItem: () => {},
  addItem: () => {},
  addRootItem: () => {},
  updateRootItem: () => {},
  removeRootItem: () => {},
  currentSliderIndex: 0,
  setCurrentSliderIndex: () => {},
  currentSliderPage: null,
});

/** @deprecated 请使用 DesktopNext 代替 */
export interface SortableStateProviderProps<D, C> {
  /**
   * 列表数据
   */
  list?: ListItem<D, C>[];
  /**
   * 列表数据变更事件
   */
  onChange?: (list: ListItem<D, C>[]) => void;
  /**
   * 本地存储 key
   */
  readonly storageKey?: string;
  /**
   * 是否启用缓存
   */
  enableCaching?: boolean;
  children: React.ReactNode;
}

export const SortableStateProvider = <D, C>(
  props: SortableStateProviderProps<D, C>,
) => {
  const {
    children,
    list: propList = [],
    onChange: propOnChange,
    storageKey = "ZS_LIBRARY_DESKTOP_SORTABLE_CONFIG",
    enableCaching = true,
  } = props;
  const [list, setList] = useState<any[]>([]);
  const [currentSliderIndex, setCurrentSliderIndex] = useState<number>(0);

  // 当前列表结构签名，用于判断是否需要通知外部变更
  const listSignatureRef = useRef("");
  // 记录对象引用到稳定 id 的映射（用于序列化中保留引用特征）
  const objectIdMapRef = useRef(new WeakMap<object, number>());
  const nextObjectIdRef = useRef(1);
  // 初始化时抑制一次通知（避免首次传入 list 触发 onChange）
  const suppressNextNotifyRef = useRef(false);
  // 合并同一轮事件循环内的多次通知
  const pendingNotifyRef = useRef<{ signature: string; list: any[] } | null>(
    null,
  );
  const notifyScheduledRef = useRef(false);

  // 为对象分配稳定 token，避免仅因引用不同导致误判
  const getObjectToken = useCallback((value: object) => {
    const map = objectIdMapRef.current;
    let id = map.get(value);
    if (!id) {
      id = nextObjectIdRef.current++;
      map.set(value, id);
    }
    return `o${id}`;
  }, []);

  // 将 data/config 序列化为稳定字符串，用于结构签名比较
  // 说明：仅对 plain object 做结构序列化，其他对象保留引用 token
  const serializeValue = useCallback(
    (value: any, seen: WeakSet<object>): string => {
      if (value === null) return "null";
      const type = typeof value;
      if (type === "string") return `s:${value}`;
      if (type === "number" || type === "boolean" || type === "bigint") {
        return `p:${String(value)}`;
      }
      if (type === "undefined") return "u";
      if (type === "function" || type === "symbol") {
        return `r:${getObjectToken(value as object)}`;
      }
      if (Array.isArray(value)) {
        if (seen.has(value)) return `c:${getObjectToken(value)}`;
        seen.add(value);
        return `[${value.map((item) => serializeValue(item, seen)).join(",")}]`;
      }
      if (type === "object") {
        const plain =
          Object.prototype.toString.call(value) === "[object Object]";
        if (!plain) {
          return `r:${getObjectToken(value as object)}`;
        }
        if (seen.has(value)) return `c:${getObjectToken(value)}`;
        seen.add(value);
        const keys = Object.keys(value).sort();
        const entries: string[] = keys.map(
          (key) => `${key}:${serializeValue(value[key], seen)}`,
        );
        return `{${entries.join(",")}}`;
      }
      return `p:${String(value)}`;
    },
    [getObjectToken],
  );

  // 生成列表结构签名：包含 id/type 以及 data/config 的稳定序列化
  const buildListSignature = useCallback(
    (items: any[]) => {
      const parts: string[] = [];
      const seen = new WeakSet<object>();
      const walk = (list: any[]) => {
        parts.push("[");
        for (const item of list) {
          if (!item) continue;
          parts.push(
            `${String(item.id)}|${String(item.type)}|${serializeValue(item.data, seen)}|${serializeValue(
              item.config,
              seen,
            )}|`,
          );
          if (Array.isArray(item.children) && item.children.length) {
            walk(item.children);
          } else {
            parts.push("[]");
          }
          parts.push(";");
        }
        parts.push("]");
      };
      walk(items);
      return parts.join("");
    },
    [serializeValue],
  );

  // 通知外部列表变化：合并同一轮多次触发，并在真正变化时调用 onChange
  const notifyListChange = useCallback(
    (nextList: any[]) => {
      const signature = buildListSignature(nextList);
      pendingNotifyRef.current = { signature, list: nextList };
      if (notifyScheduledRef.current) return;
      notifyScheduledRef.current = true;
      Promise.resolve().then(() => {
        notifyScheduledRef.current = false;
        const pending = pendingNotifyRef.current;
        pendingNotifyRef.current = null;
        if (!pending) return;
        if (suppressNextNotifyRef.current) {
          suppressNextNotifyRef.current = false;
          listSignatureRef.current = pending.signature;
          return;
        }
        if (pending.signature !== listSignatureRef.current) {
          listSignatureRef.current = pending.signature;
          propOnChange?.(pending.list);
        }
      });
    },
    [buildListSignature, propOnChange],
  );

  const [init, setInit] = useState(false);
  const [localList, setLocalList] = useLocalStorageState<any[]>(storageKey, {
    defaultValue: [],
    listenStorageChange: true,
  });

  const _setList = useCallback(
    (newList: any[], parentIds?: (string | number)[]) => {
      const _parentIds = parentIds || [];

      if (_parentIds.length > 0) {
        const newListIdSet = new Set(newList.map((item) => item.id));
        setList((oldList: any[]) => {
          const _items = [...oldList];

          const updateChild = (_list: any[], depth: number): any[] => {
            const parentId = _parentIds[depth];
            if (parentId === undefined) {
              return SortableUtils.uniqueArray<SortItem>(newList);
            }

            let parentIndex = -1;
            for (let i = 0; i < _list.length; i++) {
              if (_list[i].id === parentId) {
                parentIndex = i;
                break;
              }
            }

            if (parentIndex === -1) {
              return SortableUtils.uniqueArray<SortItem>(newList);
            }

            const parent = _list[parentIndex];

            if (depth < _parentIds.length - 1) {
              if (parent.children?.length && newList.length === 1) {
                let remainingCount = 0;
                for (const child of parent.children) {
                  if (!newListIdSet.has(child.id)) {
                    remainingCount += 1;
                    if (remainingCount > 1) break;
                  }
                }
                if (remainingCount === 1) {
                  const current = { ...newList[0] };
                  _list.splice(parentIndex, 1, current);
                  return _list;
                }
              }

              parent.children = updateChild(parent.children || [], depth + 1);
              _list.splice(parentIndex, 1, parent);
              return _list;
            }

            if (
              !parent.children?.length &&
              newList.length &&
              parent.type !== "page"
            ) {
              const current = { ...parent };
              parent.data = { name: "文件夹" };
              parent.type = "group";
              parent.children = [current, ...newList];
              parent.id = uuidv4();
              _list.splice(parentIndex, 1, parent);
              return _list;
            }

            parent.children = SortableUtils.uniqueArray<SortItem>(newList);
            _list.splice(parentIndex, 1, parent);
            return _list;
          };

          const updatedList = SortableUtils.uniqueArray<ListItem<D, C>>(
            updateChild(_items, 0),
          );
          notifyListChange(updatedList);
          return updatedList;
        });
      } else {
        const _newList = SortableUtils.uniqueArray<ListItem<D, C>>(newList);

        notifyListChange(_newList);
        setList(_newList);
      }
    },
    [notifyListChange],
  );

  const updateItemConfig = (id: string | number, config: any) => {
    setList((prevList) => {
      const _list = [...prevList];
      const updateItem = (list: any[]) => {
        for (let i = 0; i < list.length; i++) {
          if (list[i].id === id) {
            list[i].config = config;
            break;
          } else if (list[i].children?.length !== undefined) {
            updateItem(list[i].children!);
          }
        }
      };

      updateItem(_list);

      notifyListChange(_list);
      return _list;
    });
  };

  const updateItem = (id: string | number, data: any) => {
    setList((prevList) => {
      const _list = [...prevList];
      const updateItem = (list: any[]) => {
        for (let i = 0; i < list.length; i++) {
          if (list[i].id === id) {
            list[i].data = data;
            break;
          } else if (list[i].children?.length !== undefined) {
            updateItem(list[i].children!);
          }
        }
      };

      updateItem(_list);

      notifyListChange(_list);
      return _list;
    });
  };

  const removeItem = (id: string) => {
    setList((prevList) => {
      const _list = [...prevList];
      const removeItem = (list: any[]) => {
        for (let i = 0; i < list.length; i++) {
          if (list[i].id === id) {
            list.splice(i, 1);
            break;
          } else if (list[i].children?.length !== undefined) {
            removeItem(list[i].children!);
          }
        }
      };

      removeItem(_list);

      notifyListChange(_list);
      return _list;
    });
  };

  const addItem = (data: SortItem, parentIds?: (string | number)[]) => {
    const _list = [...list];

    // 目标父级路径：未传入或为空则指向当前滑块页面
    const targetParentIds = (() => {
      if (!parentIds || parentIds.length === 0) {
        return currentSliderPage?.id !== undefined
          ? [currentSliderPage.id]
          : [];
      }
      return parentIds;
    })();

    // 如果无法确定父级（例如没有当前页面），则不进行添加
    if (targetParentIds.length === 0) {
      return;
    }

    // 根据 parentIds 递归查找，放置到对应的父级下
    const addToChild = (list: any[], ids: (string | number)[]) => {
      const parentId = ids.shift();
      const parent = list.find((item) => item.id === parentId);
      const parentIndex = list.findIndex((item) => item.id === parentId);

      if (!parent) {
        return list;
      } else {
        if (ids.length) {
          parent.children = addToChild(parent.children || [], ids);
        } else {
          parent.children = [
            ...(parent.children ?? []),
            {
              ...data,
              id: uuidv4(),
              config: data?.config ?? {},
            },
          ];
        }

        list.splice(parentIndex, 1, parent);

        return list;
      }
    };

    setList(addToChild(_list, [...targetParentIds]));
  };

  /**
   * 添加根级别的项目
   * @param data ListItem数据
   */
  const addRootItem = (data: any) => {
    setList((prevList) => {
      const newItem = {
        ...data,
        id: uuidv4(),
      };

      const newList = [...prevList, newItem];
      notifyListChange(newList);
      return newList;
    });
  };

  /**
   * 修改根级别的项目
   * @param id 项目ID
   * @param data 新的数据
   */
  const updateRootItem = (id: string | number, data: any) => {
    setList((prevList) => {
      const newList = [...prevList];
      const index = newList.findIndex((item) => item.id === id);

      if (index !== -1) {
        newList[index] = { ...newList[index], ...data };
        notifyListChange(newList);
      }

      return newList;
    });
  };

  /**
   * 删除根级别的项目
   * @param id 项目ID
   */
  const removeRootItem = (id: string | number) => {
    setList((prevList) => {
      const newList = prevList.filter((item) => item.id !== id);
      notifyListChange(newList);
      return newList;
    });
  };

  useEffect(() => {
    if (propList?.length > 0 && list.length === 0) {
      suppressNextNotifyRef.current = true;
      _setList(propList);
    }
    // eslint-disable-next-line
  }, [propList]);

  useEffect(() => {
    if (!enableCaching) return;
    if (localList?.length && !init) {
      suppressNextNotifyRef.current = true;
      _setList(localList as any);
      setInit(true);
    }
  }, [localList, init, enableCaching, _setList]);

  useDebounceEffect(
    () => {
      if (!enableCaching) return;
      setLocalList(list);
    },
    [list, enableCaching],
    {
      wait: 1000,
    },
  );

  const pageItems = useMemo(() => {
    return list.filter((item) => item.type !== "dock");
  }, [list]);

  const currentSliderPage = useMemo(() => {
    return pageItems[currentSliderIndex] ?? null;
  }, [pageItems, currentSliderIndex]);

  useEffect(() => {
    if (currentSliderIndex >= pageItems.length) {
      setCurrentSliderIndex(pageItems.length > 0 ? pageItems.length - 1 : 0);
    }
  }, [currentSliderIndex, pageItems.length]);

  const value = useMemo<SortableState>(
    () => ({
      list,
      setList: _setList,
      updateItemConfig,
      updateItem,
      removeItem,
      addItem,
      addRootItem,
      updateRootItem,
      removeRootItem,
      currentSliderIndex,
      setCurrentSliderIndex,
      currentSliderPage,
    }),
    [
      list,
      _setList,
      updateItemConfig,
      updateItem,
      removeItem,
      addItem,
      addRootItem,
      updateRootItem,
      removeRootItem,
      currentSliderIndex,
      currentSliderPage,
    ],
  );

  return (
    <SortableStateContext.Provider value={value}>
      {children}
    </SortableStateContext.Provider>
  );
};
