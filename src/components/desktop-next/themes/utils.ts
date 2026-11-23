import type { Theme, BaseTheme } from "./index";
import { themeLight } from "./light";
import { themeDark } from "./dark";
import { fade } from "./material";
import { lightBase } from "./base";

function withAlpha(color: string | undefined, alpha: number): string | undefined {
  if (!color) return undefined;
  const rgbaMatch = color.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)$/,
  );
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${alpha})`;
  }
  const hexMatch = color.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4)
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgb(from ${color} r g b / ${alpha})`;
}

function generateThemeFromBase(base: Required<BaseTheme>): Theme["token"] {
  const lightToken = themeLight.token;

  return deepMerge(lightToken, {
    base,
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
      textShadowColor: base.shadowColor,
      iconBackgroundColor: base.backgroundColor,
      iconShadowColor: base.shadowColor,
      groupIconBackgroundColor: base.backgroundColor,
      groupIconBorderColor: base.borderColor,
      groupIconShadowColor: base.shadowColor,
      infoModalBackgroundColor: base.backgroundColor,
      groupModal: {
        title: {
          textColor: base.textColor, hoverBackgroundColor: base.hoverColor,
          focusBackgroundColor: base.hoverColor, shadowColor: base.primaryColor,
          placeholderColor: fade(base.textColor, 58), selectionBackgroundColor: fade(base.primaryColor, 30),
        },
      },
    },
    desktop: {
      pagination: {
        activeColor: base.primaryColor,
        inactiveColor: fade(base.textColor, 42),
        edgeColor: base.borderColor,
      },
      pageSwitchEdge: {
        leftGradient: `linear-gradient(90deg, ${withAlpha(base.primaryColor, 0.48) ?? base.hoverColor} 0%, ${withAlpha(base.primaryColor, 0.18) ?? base.hoverColor} 42%, ${withAlpha(base.primaryColor, 0) ?? base.hoverColor} 100%)`,
        rightGradient: `linear-gradient(270deg, ${withAlpha(base.primaryColor, 0.48) ?? base.hoverColor} 0%, ${withAlpha(base.primaryColor, 0.18) ?? base.hoverColor} 42%, ${withAlpha(base.primaryColor, 0) ?? base.hoverColor} 100%)`,
        glowColor: withAlpha(base.primaryColor, 0.5) ?? base.hoverColor,
      },
    },
    dock: {
      launchpad: {
        modal: {
          letterIndexColor: fade(base.textColor, 74),
          searchBox: {
            iconColor: fade(base.textColor, 75), iconFocusColor: base.primaryColor,
            textColor: base.textColor, placeholderColor: fade(base.textColor, 72),
            backgroundColor: base.backgroundColor, focusBackgroundColor: base.hoverColor,
            shadowColor: base.shadowColor,
            clearButton: {
              textColor: base.textColor, backgroundColor: base.hoverColor,
              hoverBackgroundColor: fade(base.primaryColor, 24),
            },
          },
        },
        icon: {
          backgroundColor: base.backgroundColor,
          textColor: base.textColor,
          borderColor: base.borderColor,
          shadowColor: base.shadowColor,
          hoverGlowColor: base.highlightColor,
        },
      },
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
        backdropFilter: base.backdropFilter,
        backgroundColor: base.backgroundColor,
        boxShadowColor: base.shadowColor,
        boxShadowBorderColor: base.boxShadowBorderColor,
        borderColor: base.borderColor,
      },
      header: {
        textColor: base.textColor,
      },
      floatingControls: {
        backgroundColor:
          withAlpha(base.backgroundColor, 0.16) ?? base.backgroundColor,
        borderColor: base.borderColor,
        backdropFilter: base.backdropFilter,
      },
      scrollbar: { thumbColor: fade(base.textColor, 30), thumbHoverColor: fade(base.textColor, 48) },
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

  if (theme === themeDark || theme === themeLight) return theme;
  const overrides = theme.token.base;
  const baseConfig = {
    ...deepMerge(lightBase, overrides ?? {}),
    hoverColor: overrides?.hoverColor ?? (overrides?.primaryColor ? fade(overrides.primaryColor, 16) : lightBase.hoverColor),
    highlightColor: overrides?.highlightColor ?? overrides?.borderColor ?? lightBase.highlightColor,
  };

  const generatedToken = generateThemeFromBase(baseConfig);

  const mergedToken = deepMerge(generatedToken, {
    contextMenu: theme.token.contextMenu,
    items: theme.token.items,
    desktop: theme.token.desktop,
    dock: theme.token.dock,
    modal: theme.token.modal,
  });

  return {
    ...theme,
    token: mergedToken,
  };
}
