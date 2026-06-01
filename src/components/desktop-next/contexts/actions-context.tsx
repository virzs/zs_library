import React, { createContext, useContext } from "react";
import type { DesktopDndActionsContextValue } from "./types";

const DesktopDndActionsContext = createContext<DesktopDndActionsContextValue | null>(null);

export const DesktopDndActionsProvider = ({
  value,
  children,
}: {
  value: DesktopDndActionsContextValue;
  children: React.ReactNode;
}) => (
  <DesktopDndActionsContext.Provider value={value}>
    {children}
  </DesktopDndActionsContext.Provider>
);

export const useDesktopDndActions = () => {
  const ctx = useContext(DesktopDndActionsContext);
  if (!ctx) {
    throw new Error("useDesktopDndActions must be used within DesktopDndProvider");
  }
  return ctx;
};
