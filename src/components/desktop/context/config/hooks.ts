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
    // 计算图标之间的间距，按 64:48 比例缩放并取整像素
    computeGap: (iconSize: number) => Math.round((iconSize / 64) * 48),
    // 计算网格单元尺寸：图标尺寸 + 间距
    computeCellSize: (iconSize: number) => {
      const gap = Math.round((iconSize / 64) * 48);
      return iconSize + gap;
    },
  };
};
