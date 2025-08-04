import { Theme, BaseTheme } from "./index";
import { themeLight } from "./light";
import { themeDark } from "./dark";

/**
 * 基于 base 配置生成完整主题配置
 */
function generateThemeFromBase(base: BaseTheme): Theme["token"] {
  // 使用 light 主题作为基础模板进行合并
  const lightToken = themeLight.token;

  return deepMerge(lightToken, {
    contextMenu: {
      textColor: base.textColor,
      activeColor: base.primaryColor,
      dangerColor: base.dangerColor,
      backgroundColor: base.backgroundColor,
      shadowColor: base.shadowColor,
      borderColor: base.borderColor,
    },
    items: {
      textColor: base.textColor,
      iconBackgroundColor: base.backgroundColor,
      iconShadowColor: base.shadowColor,
      groupIconBackgroundColor: base.backgroundColor,
      groupIconShadowColor: base.shadowColor,
      groupModalBackgroundColor: base.backgroundColor,
      infoModalBackgroundColor: base.backgroundColor,
    },
    dock: {
      backgroundColor: base.backgroundColor,
      borderColor: base.borderColor,
      boxShadowColor: base.shadowColor,
      divider: {
        color: base.borderColor,
      },
    },
    modal: {
      mask: {
        backgroundColor: base.backgroundColor,
      },
      content: {
        backgroundColor: base.backgroundColor,
        boxShadowColor: base.shadowColor,
        boxShadowBorderColor: base.borderColor,
        borderColor: base.borderColor,
      },
      header: {
        textColor: base.textColor,
      },
      body: {},
      scrollbar: {
        thumbColor: base.shadowColor,
        thumbHoverColor: base.borderColor,
      },
    },
  });
}

/**
 * 深度合并对象
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined) {
      if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || ({} as any), source[key] as any);
      } else {
        result[key] = source[key] as any;
      }
    }
  }

  return result;
}

/**
 * 合成完整主题配置
 * 优先级：base外配置 > base配置 > 内置base配置
 */
export function mergeTheme(theme: Theme | "light" | "dark"): Theme {
  // 如果传入的是字符串主题名，直接返回对应的内置主题
  if (typeof theme === "string") {
    return theme === "dark" ? themeDark : themeLight;
  }

  // 确定使用的 base 配置
  let baseConfig: BaseTheme;
  if (theme.token.base) {
    baseConfig = theme.token.base;
  } else {
    // 根据现有配置推断使用哪个内置 base
    const isDark = theme.token.contextMenu?.textColor === "white" || theme.token.items?.textColor === "white";
    baseConfig = isDark ? themeDark.token.base! : themeLight.token.base!;
  }

  // 基于 base 配置生成完整主题
  const generatedToken = generateThemeFromBase(baseConfig);

  // 将用户提供的配置覆盖到生成的配置上
  const mergedToken = deepMerge(generatedToken, {
    contextMenu: theme.token.contextMenu,
    items: theme.token.items,
    dock: theme.token.dock,
    modal: theme.token.modal,
  });

  return {
    ...theme,
    token: mergedToken,
  };
}
