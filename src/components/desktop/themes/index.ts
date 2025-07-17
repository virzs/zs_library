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

export const themeLight: Theme = {
  token: {
    itemNameColor: '#1a1a1a',
    itemIconBackgroundColor: 'white',
    itemIconShadowColor: 'rgba(0, 0, 0, 0.1)',
    groupItemIconBackgroundColor: 'rgba(255, 255, 255, 0.1)',
    groupItemIconShadowColor: 'rgba(0, 0, 0, 0.1)',
    groupItemModalBackgroundColor: 'rgba(255, 255, 255, 0.8)',
    contextMenuTextColor: 'black',
    contextMenuActiveColor: '#f3f4f6',
    contextMenuBackgroundColor: 'white',
    contextMenuShadowColor: 'rgba(0, 0, 0, 0.1)',
  },
};

export const themeDark: Theme = {
  token: {
    itemNameColor: 'white',
    itemIconBackgroundColor: '#1f2937',
    itemIconShadowColor: 'rgba(0, 0, 0, 0.1)',
    groupItemIconBackgroundColor: 'rgba(0, 0, 0, 0.1)',
    groupItemIconShadowColor: 'rgba(0, 0, 0, 0.1)',
    groupItemModalBackgroundColor: 'rgba(0, 0, 0, 0.1)',
    contextMenuTextColor: 'white',
    contextMenuActiveColor: '#1a1a1a',
    contextMenuBackgroundColor: '#1a1a1a',
    contextMenuShadowColor: 'rgba(255, 255, 255, 0.1)',
  },
};

// 默认主题为浅色主题
export const defaultTheme = themeLight;

// 导出所有主题
export const themes = {
  light: themeLight,
  dark: themeDark,
};

// 主题类型
export type ThemeType = keyof typeof themes;