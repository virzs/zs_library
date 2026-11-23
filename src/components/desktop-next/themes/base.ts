import type { BaseTheme, Theme } from ".";

const systemFont = "-apple-system, BlinkMacSystemFont, system-ui, sans-serif";

export const darkBase = {
  primaryColor: "#85b8ff",
  highlightColor: "rgba(242,248,255,.62)",
  fontFamily: systemFont,
  hoverColor: "rgba(255, 255, 255, 0.08)",
  dangerColor: "#ff8279",
  backgroundColor: "rgba(30, 30, 30, 0.85)",
  textColor: "rgba(255, 255, 255, 0.9)",
  shadowColor: "rgba(0, 0, 0, 0.4)",
  boxShadowBorderColor: "rgba(255, 255, 255, 0.08)",
  borderColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "saturate(155%) blur(22px)",
} satisfies Required<BaseTheme>;

export const lightBase = {
  primaryColor: "#135cc8",
  highlightColor: "rgba(255,255,255,.9)",
  fontFamily: systemFont,
  hoverColor: "rgba(255, 255, 255, 0.1)",
  dangerColor: "#bd302b",
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  textColor: "rgba(28, 28, 30, 0.88)",
  shadowColor: "rgba(0, 0, 0, 0.2)",
  boxShadowBorderColor: "rgba(255, 255, 255, 0.15)",
  borderColor: "rgba(255, 255, 255, 0.2)",
  backdropFilter: "saturate(155%) blur(22px)",
} satisfies Required<BaseTheme>;

export function baseTokens(theme?: Theme) {
  return { ...darkBase, ...theme?.token.base };
}
