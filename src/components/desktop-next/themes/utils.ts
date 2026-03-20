import { Theme, BaseTheme } from "./index";
import { themeLight } from "./light";
import { themeDark } from "./dark";

function generateThemeFromBase(base: BaseTheme): Theme["token"] {
  const lightToken = themeLight.token;

  return deepMerge(lightToken, {
    contextMenu: {
      textColor: base.textColor,
      activeColor: base.hoverColor,
      dangerColor: base.dangerColor,
      backgroundColor: base.backgroundColor,
      shadowColor: base.shadowColor,
      boxShadowBorderColor: base.boxShadowBorderColor,
      borderColor: base.borderColor,
      backdropFilter: base.backdropFilter,
    },
    items: {
      textColor: base.textColor,
      iconBackgroundColor: base.backgroundColor,
      iconShadowColor: base.shadowColor,
      groupIconBackgroundColor: base.backgroundColor,
      groupIconShadowColor: base.shadowColor,
      infoModalBackgroundColor: base.backgroundColor,
      groupModal: {
        backgroundColor: base.backgroundColor,
      },
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
        boxShadowBorderColor: base.boxShadowBorderColor,
        borderColor: base.borderColor,
      },
      header: {
        textColor: base.textColor,
      },
      scrollbar: {},
    },
  });
}

function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        typeof sourceValue === "object" &&
        sourceValue !== null &&
        !Array.isArray(sourceValue)
      ) {
        result[key] = deepMerge(
          (targetValue as Record<string, unknown>) || {},
          sourceValue as Record<string, unknown>,
        ) as T[Extract<keyof T, string>];
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

export function mergeTheme(theme: Theme | "light" | "dark"): Theme {
  if (typeof theme === "string") {
    return theme === "dark" ? themeDark : themeLight;
  }

  const baseConfig: BaseTheme = {
    ...themeLight.token.base,
    ...theme.token.base,
  };

  const generatedToken = generateThemeFromBase(baseConfig);

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
