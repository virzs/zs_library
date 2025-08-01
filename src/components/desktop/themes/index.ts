import { themeDark } from "./dark";
import { themeLight } from "./light";

export interface BaseModalTheme {
  mask?: {
    backgroundColor?: string;
    backdropFilter?: string;
  };
  content?: {
    backgroundColor?: string;
    backdropFilter?: string;
    boxShadowColor?: string;
    boxShadowBorderColor?: string;
    borderColor?: string;
    borderRadius?: string;
  };
  header?: {
    backgroundColor?: string;
    textColor?: string;
  };
  body?: {
    backgroundColor?: string;
  };
  scrollbar?: {
    width?: string;
    trackColor?: string;
    thumbColor?: string;
    thumbHoverColor?: string;
    borderRadius?: string;
  };
}

export interface DockTheme {
  backgroundColor?: string;
  borderColor?: string;
  boxShadowColor?: string;
  divider?: {
    color?: string;
  };
}

export interface LaunchpadTheme {
  button?: {
    backgroundColor?: string;
    subBackgroundColor?: string;
    thirdBackgroundColor?: string;
    borderColor?: string;
    hoverBackgroundColor?: string;
  };
  modal?: BaseModalTheme;
}

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
    dock?: DockTheme;
    modal?: BaseModalTheme;
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

export { themeLight, themeDark };
