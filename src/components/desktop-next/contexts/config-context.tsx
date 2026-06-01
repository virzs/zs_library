import React, { createContext, useContext } from "react";
import type { DesktopDndConfigContextValue } from "./types";

const DesktopDndConfigContext = createContext<DesktopDndConfigContextValue | null>(null);

export const DesktopDndConfigProvider = ({
  value,
  children,
}: {
  value: DesktopDndConfigContextValue;
  children: React.ReactNode;
}) => (
  <DesktopDndConfigContext.Provider value={value}>
    {children}
  </DesktopDndConfigContext.Provider>
);

export const useDesktopDndConfig = () => {
  const ctx = useContext(DesktopDndConfigContext);
  if (!ctx) {
    throw new Error("useDesktopDndConfig must be used within DesktopDndProvider");
  }
  return ctx;
};
