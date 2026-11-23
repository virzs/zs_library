import type { Theme } from ".";
import { baseTokens } from "./base";

export function fade(color: string, percent: number) {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

export const reducedTransparency = "@media (prefers-reduced-transparency: reduce), (prefers-contrast: more)";

// 浮层使用主题底色透出壁纸，斜向高光仅用于表现玻璃的边缘和厚度。
export function glassSurface(tint: string, filter: string, highlight: string) {
  const solid = `
    background-color: Canvas;
    background-image: linear-gradient(${tint}, ${tint});
    @supports (color: rgb(from white r g b)) {
      background: rgb(from ${tint} r g b / 1);
    }
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  `;
  return `
    background: linear-gradient(146deg, ${fade(highlight, 26)}, transparent 46%, ${fade(highlight, 8)}), ${tint};
    backdrop-filter: ${filter};
    -webkit-backdrop-filter: ${filter};
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) { ${solid} }
    ${reducedTransparency} { ${solid} }
  `;
}

// 桌面上的四个玻璃表面共用同一层反光和细边，具体色值仍由主题覆盖。
export function desktopSurface(theme: Theme | undefined, colors: {
  backgroundColor?: string;
  borderColor?: string;
  shadowColor?: string;
} = { ...theme?.token.dock, shadowColor: theme?.token.dock?.boxShadowColor }) {
  const base = baseTokens(theme);
  const edge = colors.borderColor ?? base.borderColor;
  const shadow = colors.shadowColor ?? base.shadowColor;
  return `
    ${glassSurface(colors.backgroundColor ?? base.backgroundColor, base.backdropFilter, fade(base.highlightColor, 55))}
    box-shadow: inset 0 0 0 1px ${edge}, inset 0 1px 0 ${fade(base.highlightColor, 20)}, 0 3px 9px -4px ${shadow};
  `;
}
