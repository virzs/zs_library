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
import { useSortableConfig } from "../config/hooks";

interface ContextMenu {
  rect: DOMRect;
  data: any;
  pageX?: number;
  pageY?: number;
  element?: Element | null;
}

type ListStatus = "onMove";

export interface SortableState {
  list: ListItem[];
  setList: any;
  contextMenu: ContextMenu | null;
  setContextMenu: (e: ContextMenu | null) => void;
  listStatus: ListStatus | null;
  setListStatus: (e: ListStatus | null) => void;
  contextMenuFuns: (data: any, enable: boolean) => any;
  hideContextMenu: () => void;
  /** 点击右键菜单信息数据 */
  showInfoItemData: SortItem | null;
  setShowInfoItemData: (e: SortItem | null) => void;
  /** group item 点击打开弹窗数据 */
  openGroupItemData: SortItem | null;
  setOpenGroupItemData: (e: SortItem | null) => void;
  /** 长按事件状态 */
  longPressTriggered: boolean;
  updateItem: (id: string | number, data: any) => void;
  updateItemConfig: (id: string | number, config: any) => void;
  removeItem: (id: string) => void;
  addItem: (data: SortItem, parentIds: (string | number)[]) => void;
  addRootItem: (data: ListItem) => void;
  updateRootItem: (id: string | number, data: any) => void;
  removeRootItem: (id: string | number) => void;
  /** 当前移动的元素id */
  moveItemId: string | null;
  setMoveItemId: (e: string | null) => void;
  /** 当前元素将要移动到的元素id */
  moveTargetId: string | number | null;
  setMoveTargetId: (e: string | number | null) => void;
  /** 当前拖拽的元素 */
  dragItem: SortItem | null;
  setDragItem: (e: SortItem | null) => void;
  /** 当前滑块索引 */
  currentSliderIndex: number;
  setCurrentSliderIndex: (e: number) => void;
  /** 当前页面数据（排除 dock） */
  currentSliderPage: ListItem | null;
}

export const SortableStateContext = createContext<SortableState>({
  list: [],
  setList: () => {},
  contextMenu: null,
  setContextMenu: () => {},
  listStatus: null,
  setListStatus: () => {},
  contextMenuFuns: () => {},
  hideContextMenu: () => {},
  showInfoItemData: null,
  setShowInfoItemData: () => {},
  openGroupItemData: null,
  setOpenGroupItemData: () => {},
  longPressTriggered: false,
  updateItem: () => {},
  updateItemConfig: () => {},
  removeItem: () => {},
  addItem: () => {},
  addRootItem: () => {},
  updateRootItem: () => {},
  removeRootItem: () => {},
  moveItemId: null,
  setMoveItemId: () => {},
  moveTargetId: null,
  setMoveTargetId: () => {},
  dragItem: null,
  setDragItem: () => {},
  currentSliderIndex: 0,
  setCurrentSliderIndex: () => {},
  currentSliderPage: null,
});

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
  const { typeConfigMap } = useSortableConfig();

  const [contextMenuTimer, setContextMenuTimer] = useState<NodeJS.Timeout>();
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout>();
  const [listStatus, setListStatus] = useState<ListStatus | null>(null);
  const listStatusRef = useRef(listStatus);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [list, setList] = useState<any[]>([]);
  const [showInfoItemData, setShowInfoItemData] = useState<SortItem | null>(
    null,
  );
  const [openGroupItemData, setOpenGroupItemData] = useState<SortItem | null>(
    null,
  );
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const [moveItemId, setMoveItemId] = useState<string | null>(null);
  const [moveTargetId, setMoveTargetId] = useState<string | number | null>(
    null,
  );
  const [dragItem, setDragItem] = useState<SortItem | null>(null);
  const [currentSliderIndex, setCurrentSliderIndex] = useState<number>(0);

  const listSignatureRef = useRef("");
  const objectIdMapRef = useRef(new WeakMap<object, number>());
  const nextObjectIdRef = useRef(1);
  const suppressNextNotifyRef = useRef(false);

  const getValueToken = useCallback((value: any) => {
    if (value && typeof value === "object") {
      const map = objectIdMapRef.current;
      let id = map.get(value);
      if (!id) {
        id = nextObjectIdRef.current++;
        map.set(value, id);
      }
      return `o${id}`;
    }
    return `p${String(value)}`;
  }, []);

  const buildListSignature = useCallback(
    (items: any[]) => {
      const parts: string[] = [];
      const walk = (list: any[]) => {
        parts.push("[");
        for (const item of list) {
          if (!item) continue;
          parts.push(
            `${String(item.id)}|${String(item.type)}|${getValueToken(item.data)}|${getValueToken(
              item.config,
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
    [getValueToken],
  );

  const notifyListChange = useCallback(
    (nextList: any[]) => {
      const signature = buildListSignature(nextList);
      if (suppressNextNotifyRef.current) {
        suppressNextNotifyRef.current = false;
        listSignatureRef.current = signature;
        return;
      }
      if (signature !== listSignatureRef.current) {
        listSignatureRef.current = signature;
        propOnChange?.(nextList);
      }
    },
    [buildListSignature, propOnChange],
  );

  const [init, setInit] = useState(false);
  const [localList, setLocalList] = useLocalStorageState<any[]>(storageKey, {
    defaultValue: [],
    listenStorageChange: true,
  });

  const hideContextMenu = () => {
    setContextMenu(null);
    clearTimeout(contextMenuTimer);
    setContextMenuTimer(undefined);
    listStatusRef.current = null;
  };

  /**
   * 检查类型是否允许上下文菜单
   */
  const checkTypeAllowContextMenu = (data: any) => {
    const typeConfig = typeConfigMap?.[data.type];
    return typeConfig?.allowContextMenu !== false;
  };

  const getItemRectAndSetContextMenu = (e: any, data: any) => {
    let targetElement = e.target;

    while (targetElement && !targetElement.getAttribute("data-id")) {
      targetElement = targetElement.parentElement;
    }

    if (
      !targetElement ||
      typeof targetElement.getBoundingClientRect !== "function"
    ) {
      const currentTarget = e.currentTarget;
      if (
        currentTarget &&
        typeof currentTarget.getBoundingClientRect === "function"
      ) {
        targetElement = currentTarget;
      }
    }

    const rect =
      targetElement && typeof targetElement.getBoundingClientRect === "function"
        ? targetElement.getBoundingClientRect()
        : new DOMRect(e.clientX ?? 0, e.clientY ?? 0, 0, 0);

    setContextMenu({
      rect,
      pageX: e.pageX,
      pageY: e.pageY,
      data,
      element:
        targetElement &&
        typeof targetElement.getBoundingClientRect === "function"
          ? targetElement
          : null,
    });
    clearTimeout(contextMenuTimer);
  };

  const contextMenuFuns = (data: any, enable = true) => {
    const { config = {} } = data;

    if (config?.allowContextMenu === false) {
      return {};
    }
    return {
      onMouseDown: (e: any) => {
        if (!checkTypeAllowContextMenu(data)) return;
        setContextMenuTimer(
          setTimeout(() => {
            if (!enable) return;
            // 解决闭包导致拖拽时右键菜单不消失的问题
            if (listStatusRef.current !== null) return;
            getItemRectAndSetContextMenu(e, data);
          }, 800),
        );
        setLongPressTriggered(false);
        setPressTimer(
          setTimeout(() => {
            setLongPressTriggered(true);
            // 这里处理长按事件
          }, 800),
        );
      },
      onMouseUp: () => {
        clearTimeout(pressTimer);
        setPressTimer(undefined);
        clearTimeout(contextMenuTimer);
        setContextMenuTimer(undefined);
      },
      onContextMenu: (e: any) => {
        if (!checkTypeAllowContextMenu(data)) return;
        if (!enable) return;
        e.preventDefault();
        getItemRectAndSetContextMenu(e, data);
      },
    };
  };

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
    listStatusRef.current = listStatus;
    if (listStatus !== null) {
      hideContextMenu();
    }
    // eslint-disable-next-line
  }, [listStatus]);
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

  return (
    <SortableStateContext.Provider
      value={{
        list,
        setList: _setList,
        contextMenu,
        setContextMenu,
        listStatus,
        setListStatus,
        contextMenuFuns,
        hideContextMenu,
        showInfoItemData,
        setShowInfoItemData,
        openGroupItemData,
        setOpenGroupItemData,
        longPressTriggered,
        updateItemConfig,
        updateItem,
        removeItem,
        addItem,
        addRootItem,
        updateRootItem,
        removeRootItem,
        moveItemId,
        setMoveItemId,
        moveTargetId,
        setMoveTargetId,
        dragItem,
        setDragItem,
        currentSliderIndex,
        setCurrentSliderIndex,
        currentSliderPage,
      }}
    >
      {children}
    </SortableStateContext.Provider>
  );
};
