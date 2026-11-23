import React, { createContext, useContext } from "react";
import { defaultTheme, type Theme } from "../themes";
import { mergeTheme } from "../themes/utils";
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

// 公开的浮层和 Dock 也可单独使用。优先使用显式主题，其余情况继承桌面主题。
export function useSurfaceTheme(explicit?: Theme) {
  const inherited = useContext(DesktopDndConfigContext)?.theme ?? defaultTheme;
  return React.useMemo(() => explicit && explicit !== inherited ? mergeTheme(explicit) : inherited, [explicit, inherited]);
}
