/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDebounceEffect, useLocalStorageState } from "ahooks";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { configMap } from "../../config";
import { SortItem } from "../../types";
import SortableUtils from "../../utils";

interface ContextMenu {
  rect: DOMRect;
  data: any;
  pageX?: number;
  pageY?: number;
}

type ListStatus = "onMove";

export interface SortableState {
  list: SortItem[];
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
  addRootItem: (data: SortItem) => void;
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
});

export interface SortableStateProviderProps<D, C> {
  /**
   * 列表数据
   */
  list?: SortItem<D, C>[];
  /**
   * 列表数据变更事件
   */
  onChange?: (list: SortItem<D, C>[]) => void;
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
  props: SortableStateProviderProps<D, C>
) => {
  const {
    children,
    list: propList = [],
    onChange: propOnChange,
    storageKey = "ZS_LIBRARY_DESKTOP_SORTABLE_CONFIG",
    enableCaching = true,
  } = props;

  const [contextMenuTimer, setContextMenuTimer] = useState<NodeJS.Timeout>();
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout>();
  const [listStatus, setListStatus] = useState<ListStatus | null>(null);
  const listStatusRef = useRef(listStatus);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [list, setList] = useState<any[]>([]);
  const [showInfoItemData, setShowInfoItemData] = useState<SortItem | null>(
    null
  );
  const [openGroupItemData, setOpenGroupItemData] = useState<SortItem | null>(
    null
  );
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const [moveItemId, setMoveItemId] = useState<string | null>(null);
  const [moveTargetId, setMoveTargetId] = useState<string | number | null>(
    null
  );
  const [dragItem, setDragItem] = useState<SortItem | null>(null);

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

  const getItemRectAndSetContextMenu = (e: any, data: any) => {
    setContextMenu({ ...e, pageX: e.pageX, pageY: e.pageY, data });
    clearTimeout(contextMenuTimer);
  };

  const contextMenuFuns = (data: any, enable = true) => {
    const { config = {} } = data;

    if (config.allowContextMenu === false) {
      return {};
    }
    return {
      onMouseDown: (e: any) => {
        setContextMenuTimer(
          setTimeout(() => {
            if (!enable) return;
            // 解决闭包导致拖拽时右键菜单不消失的问题
            if (listStatusRef.current !== null) return;
            getItemRectAndSetContextMenu(e, data);
          }, 800)
        );
        setLongPressTriggered(false);
        setPressTimer(
          setTimeout(() => {
            setLongPressTriggered(true);
            // 这里处理长按事件
          }, 800)
        );
      },
      onMouseUp: () => {
        clearTimeout(pressTimer);
        setPressTimer(undefined);
        clearTimeout(contextMenuTimer);
        setContextMenuTimer(undefined);
      },
      onContextMenu: (e: any) => {
        if (!enable) return;
        e.preventDefault();
        getItemRectAndSetContextMenu(e, data);
      },
    };
  };

  const _setList = useCallback(
    (newList: SortItem[], parentIds?: string[]) => {
      const _parentIds = [...(parentIds || [])];

      if (_parentIds.length > 0) {
        setList((oldList: SortItem[]) => {
          const _items = [...oldList];

          const updateChild = (_list: SortItem[]): SortItem[] => {
            const parentId = _parentIds.shift();
            const parent = _list.find((item) => item.id === parentId);
            const parentIndex = _list.findIndex((item) => item.id === parentId);

            /** 当第一个 parentId 匹配到，但剩余 parentIds > 0 表明需要继续向下匹配 */
            if (_parentIds.length && parent) {
              /** 如果当前数据实际只有一个子数据，则取消 group 状态 */
              if (
                parent.children?.filter(
                  (i) => !newList.some((k) => k.id === i.id)
                ).length === 1 &&
                newList.length === 1
              ) {
                const current = { ...newList[0] };

                _list.splice(parentIndex, 1, current);

                propOnChange?.(_list);
                return _list;
              }
              parent.children = updateChild(parent.children || []);

              _list.splice(parentIndex, 1, parent);

              propOnChange?.(_list);
              return _list;
            }

            /** 当 parentIds = 0 且匹配到，表明当前为实际需要更新的数据 */
            if (parent) {
              /** 没有子数据，且有新增数据，则将当前数据更改为 group 类型 */
              if (!parent.children?.length && newList.length) {
                const current = { ...parent };
                parent.data = { name: "文件夹" };
                parent.type = "group";
                parent.children = [current, ...newList];
                parent.id = uuidv4();

                _list.splice(parentIndex, 1, parent);

                propOnChange?.(_list);
                return _list;
              }

              // ! 当前已经是 group 时，直接将 children 更改为最新的 list
              parent.children = SortableUtils.uniqueArray(newList);

              _list.splice(parentIndex, 1, parent);

              propOnChange?.(_list);
              return _list;
            }

            return SortableUtils.uniqueArray(newList);
          };

          return SortableUtils.uniqueArray(updateChild(_items));
        });
      } else {
        const _newList = SortableUtils.uniqueArray(newList);

        // ! 根节点直接排序
        propOnChange?.(_newList);
        setList(_newList);
      }
    },
    [propOnChange]
  );

  const updateItemConfig = (id: string | number, config: any) => {
    setList((prevList) => {
      const _list = [...prevList];
      const updateItem = (list: SortItem[]) => {
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

      propOnChange?.(_list);
      return _list;
    });
  };

  const updateItem = (id: string | number, data: any) => {
    setList((prevList) => {
      const _list = [...prevList];
      const updateItem = (list: SortItem[]) => {
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

      propOnChange?.(_list);
      return _list;
    });
  };

  const removeItem = (id: string) => {
    setList((prevList) => {
      const _list = [...prevList];
      const removeItem = (list: SortItem[]) => {
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

      propOnChange?.(_list);
      return _list;
    });
  };

  const addItem = (data: SortItem, parentIds: (string | number)[]) => {
    const _list = [...list];

    // 根据 parentIds 递归查找，放置到对应的父级下
    const addToChild = (list: SortItem[], parentIds: (string | number)[]) => {
      const parentId = parentIds.shift();
      const parent = list.find((item) => item.id === parentId);
      const parentIndex = list.findIndex((item) => item.id === parentId);

      if (!parent) {
        return list;
      } else {
        if (parentIds.length) {
          parent.children = addToChild(parent.children || [], parentIds);
        } else {
          const type = data?.type ?? "app";

          parent.children = [
            ...(parent.children ?? []),
            {
              ...data,
              id: uuidv4(),
              config: data?.config ?? configMap[type],
              dataType: data?.dataType ?? 'page',
            },
          ];
        }

        list.splice(parentIndex, 1, parent);

        return list;
      }
    };

    setList(addToChild(_list, parentIds));
  };

  /**
   * 添加根级别的项目
   * @param data SortItem数据
   */
  const addRootItem = (data: SortItem) => {
    setList((prevList) => {
      const type = data?.type ?? "app";
      const newItem = {
        ...data,
        id: uuidv4(),
        config: data?.config ?? configMap[type],
        dataType: data?.dataType ?? 'page',
      };

      const newList = [...prevList, newItem];
      propOnChange?.(newList);
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
        propOnChange?.(newList);
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
      propOnChange?.(newList);
      return newList;
    });
  };

  useEffect(() => {
    if (propList?.length > 0 && list.length === 0) {
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
    }
  );

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
      }}
    >
      {children}
    </SortableStateContext.Provider>
  );
};
