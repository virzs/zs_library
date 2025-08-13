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
    textColor?: string;
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
  launchpad?: {
    modal?: {
      searchBox?: {
        iconColor?: string;
        iconFocusColor?: string;
        backgroundColor?: string;
        focusBackgroundColor?: string;
        textColor?: string;
        placeholderColor?: string;
        shadowColor?: string;
        clearButton?: {
          backgroundColor?: string;
          hoverBackgroundColor?: string;
          textColor?: string;
        };
      };
    };
    icon?: {
      textColor?: string;
      backgroundColor?: string;
      borderColor?: string;
      shadowColor?: string;
      hoverGlowColor?: string;
    };
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

export interface ContextMenuTheme {
  textColor?: string;
  activeColor?: string;
  dangerColor?: string;
  backgroundColor?: string;
  shadowColor?: string;
  boxShadowBorderColor?: string;
  borderColor?: string;
  backdropFilter?: string;
}

export interface ItemsTheme {
  textColor?: string;
  iconBackgroundColor?: string;
  iconShadowColor?: string;
  groupIconBackgroundColor?: string;
  groupIconShadowColor?: string;
  infoModalBackgroundColor?: string;
  groupModal?: {
    backgroundColor?: string;
    title?: {
      textColor?: string;
      backgroundColor?: string;
      hoverBackgroundColor?: string;
      focusBackgroundColor?: string;
      shadowColor?: string;
      placeholderColor?: string;
      selectionBackgroundColor?: string;
    };
  };
}

export interface BaseTheme {
  hoverColor?: string;
  dangerColor?: string;
  backgroundColor?: string;
  textColor?: string;
  shadowColor?: string;
  boxShadowBorderColor?: string;
  borderColor?: string;
  backdropFilter?: string;
}

export interface Theme {
  token: {
    base?: BaseTheme;
    dock?: DockTheme;
    modal?: BaseModalTheme;
    contextMenu?: ContextMenuTheme;
    items?: ItemsTheme;
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
