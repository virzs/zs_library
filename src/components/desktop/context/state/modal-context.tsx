/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useMemo, useState } from "react";
import { SortItem } from "../../types";

export interface ModalState {
  openGroupItemData: SortItem | null;
  setOpenGroupItemData: (e: SortItem | null) => void;
}

export const ModalStateContext = createContext<ModalState>({
  openGroupItemData: null,
  setOpenGroupItemData: () => {},
});

export const ModalStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [openGroupItemData, setOpenGroupItemData] = useState<SortItem | null>(
    null,
  );

  const value = useMemo<ModalState>(
    () => ({
      openGroupItemData,
      setOpenGroupItemData,
    }),
    [openGroupItemData],
  );

  return (
    <ModalStateContext.Provider value={value}>
      {children}
    </ModalStateContext.Provider>
  );
};
