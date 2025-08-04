import { useContext, useMemo } from "react";
import { SortableConfigContext } from "./context";
import { mergeTheme } from "../../themes/utils";
import { Theme } from "../../themes";

export const useSortableConfig = () => {
  const state = useContext(SortableConfigContext);

  // 合成完整主题配置
  const mergedTheme = useMemo(() => {
    return mergeTheme(state.theme as Theme | "light" | "dark");
  }, [state.theme]);

  return {
    ...state,
    theme: mergedTheme,
  };
};
