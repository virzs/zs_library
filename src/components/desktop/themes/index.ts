import { themeDark } from "./dark";
import { themeLight } from "./light";

export interface Theme {
  token: {
    itemNameColor?: string;
    itemIconBackgroundColor?: string;
    itemIconShadowColor?: string;
    groupItemIconBackgroundColor?: string;
    groupItemIconShadowColor?: string;
    groupItemModalBackgroundColor?: string;
    contextMenuTextColor?: string;
    contextMenuActiveColor?: string;
    contextMenuBackgroundColor?: string;
    contextMenuShadowColor?: string;
  };
}

// 默认主题为浅色主题
export const defaultTheme = themeLight;

// 导出所有主题
export const themes = {
  light: themeLight,
  dark: themeDark,
};

// 主题类型
export type ThemeType = keyof typeof themes;
