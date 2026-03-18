/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useEffect, useRef, useState } from "react";
import { SortItem } from "../../types";
import { useSortableConfig } from "../config/hooks";
import { useDragState } from "./hooks";

export interface ContextMenu {
  rect: DOMRect;
  data: any;
  pageX?: number;
  pageY?: number;
  element?: Element | null;
}

export interface ContextMenuState {
  contextMenu: ContextMenu | null;
  setContextMenu: (e: ContextMenu | null) => void;
  contextMenuFuns: (data: any, enable: boolean) => any;
  hideContextMenu: () => void;
  showInfoItemData: SortItem | null;
  setShowInfoItemData: (e: SortItem | null) => void;
}

export const ContextMenuStateContext = createContext<ContextMenuState>({
  contextMenu: null,
  setContextMenu: () => {},
  contextMenuFuns: () => {},
  hideContextMenu: () => {},
  showInfoItemData: null,
  setShowInfoItemData: () => {},
});

export const ContextMenuStateProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { typeConfigMap } = useSortableConfig();
  const { listStatus, setLongPressTriggered } = useDragState();

  const [contextMenuTimer, setContextMenuTimer] = useState<NodeJS.Timeout>();
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout>();
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [showInfoItemData, setShowInfoItemData] = useState<SortItem | null>(
    null,
  );

  const listStatusRef = useRef(listStatus);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    listStatusRef.current = listStatus;
    if (listStatus !== null) {
      hideContextMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listStatus]);

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
            if (listStatusRef.current !== null) return;
            getItemRectAndSetContextMenu(e, data);
          }, 800),
        );
        setLongPressTriggered(false);
        setPressTimer(
          setTimeout(() => {
            setLongPressTriggered(true);
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

  return (
    <ContextMenuStateContext.Provider
      value={{
        contextMenu,
        setContextMenu,
        contextMenuFuns,
        hideContextMenu,
        showInfoItemData,
        setShowInfoItemData,
      }}
    >
      {children}
    </ContextMenuStateContext.Provider>
  );
};
