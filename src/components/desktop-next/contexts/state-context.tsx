import React, { createContext, useContext } from "react";
import type { DesktopDndStateContextValue } from "./types";

const DesktopDndStateContext = createContext<DesktopDndStateContextValue | null>(null);

export const DesktopDndStateProvider = ({
  value,
  children,
}: {
  value: DesktopDndStateContextValue;
  children: React.ReactNode;
}) => (
  <DesktopDndStateContext.Provider value={value}>
    {children}
  </DesktopDndStateContext.Provider>
);

export const useDesktopDndState = () => {
  const ctx = useContext(DesktopDndStateContext);
  if (!ctx) {
    throw new Error("useDesktopDndState must be used within DesktopDndProvider");
  }
  return ctx;
};
