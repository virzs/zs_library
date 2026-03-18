import { useContext } from "react";
import { SortableStateContext } from "./context";
import { DragStateContext } from "./drag-context";
import { ContextMenuStateContext } from "./context-menu-context";
import { ModalStateContext } from "./modal-context";

export const useDragState = () => {
  return useContext(DragStateContext);
};

export const useContextMenuState = () => {
  return useContext(ContextMenuStateContext);
};

export const useModalState = () => {
  return useContext(ModalStateContext);
};

export const useListData = () => {
  return useContext(SortableStateContext);
};

export const useSortableState = () => {
  const listData = useContext(SortableStateContext);
  const drag = useContext(DragStateContext);
  const contextMenu = useContext(ContextMenuStateContext);
  const modal = useContext(ModalStateContext);

  return {
    ...listData,
    ...drag,
    ...contextMenu,
    ...modal,
  };
};
