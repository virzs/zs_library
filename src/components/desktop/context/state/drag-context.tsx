/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useMemo, useState } from "react";
import { SortItem } from "../../types";

type ListStatus = "onMove";

export interface DragState {
  listStatus: ListStatus | null;
  setListStatus: (e: ListStatus | null) => void;
  longPressTriggered: boolean;
  setLongPressTriggered: (e: boolean) => void;
  moveItemId: string | null;
  setMoveItemId: (e: string | null) => void;
  moveTargetId: string | number | null;
  setMoveTargetId: (e: string | number | null) => void;
  dragItem: SortItem | null;
  setDragItem: (e: SortItem | null) => void;
}

export const DragStateContext = createContext<DragState>({
  listStatus: null,
  setListStatus: () => {},
  longPressTriggered: false,
  setLongPressTriggered: () => {},
  moveItemId: null,
  setMoveItemId: () => {},
  moveTargetId: null,
  setMoveTargetId: () => {},
  dragItem: null,
  setDragItem: () => {},
});

export const DragStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [listStatus, setListStatus] = useState<ListStatus | null>(null);
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const [moveItemId, setMoveItemId] = useState<string | null>(null);
  const [moveTargetId, setMoveTargetId] = useState<string | number | null>(
    null,
  );
  const [dragItem, setDragItem] = useState<SortItem | null>(null);

  const value = useMemo<DragState>(
    () => ({
      listStatus,
      setListStatus,
      longPressTriggered,
      setLongPressTriggered,
      moveItemId,
      setMoveItemId,
      moveTargetId,
      setMoveTargetId,
      dragItem,
      setDragItem,
    }),
    [listStatus, longPressTriggered, moveItemId, moveTargetId, dragItem],
  );

  return (
    <DragStateContext.Provider value={value}>
      {children}
    </DragStateContext.Provider>
  );
};
