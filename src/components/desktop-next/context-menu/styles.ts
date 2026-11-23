import { css } from "@emotion/css";
import { useDesktopDndConfig } from "../contexts/config-context";
import { baseTokens } from "../themes/base";

export function useMenuTheme() {
  const { theme } = useDesktopDndConfig();
  const base = baseTokens(theme);
  const menu = theme.token.contextMenu;
  return {
    ...base,
    ...menu,
    activeColor: menu?.activeColor ?? base.hoverColor,
    iconColor: menu?.iconColor ?? menu?.textColor ?? base.textColor,
    selectedColor: menu?.selectedColor ?? base.primaryColor,
    borderRadius: menu?.borderRadius ?? "18px",
  };
}

export const menuRow = css`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 0 11px;
  position: relative;
  isolation: isolate;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: -.01em;

  &[data-destructive]:not(:last-child) {
    margin-bottom: 5px;
    &::after {
      content: "";
      position: absolute;
      bottom: -3px;
      inset-inline: 9px;
      height: 1px;
      background: var(--zs-menu-divider);
      pointer-events: none;
    }
  }
`;

export const menuIcon = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 18px;
  & > svg { width: 17px; height: 17px; }
`;
