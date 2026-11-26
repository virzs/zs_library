import { useSurfaceTheme } from "../contexts/config-context";
import React, { useState, useRef } from "react";
import { RiSearchLine, RiCloseLine } from "@remixicon/react";
import { css, cx } from "@emotion/css";
import { baseTokens } from "../themes/base";
import { fade, glassSurface } from "../themes/material";
import { Theme } from "../themes";
import {
  desktopNextDefaultLanguage,
  desktopNextI18nResources,
} from "../i18n";

export interface SearchBoxProps {
  variant?: "default" | "drawer";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  theme?: Theme;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  variant = "default",
  onChange,
  placeholder = desktopNextI18nResources[desktopNextDefaultLanguage].desktopNext
    .launchpad.searchPlaceholder,
  className = "",
  theme: explicitTheme,
}) => {
  const theme = useSurfaceTheme(explicitTheme);
  const drawer = variant === "drawer";
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const base = baseTokens(theme);
  const sb = theme?.token?.dock?.launchpad?.modal?.searchBox;
  const iconColor = sb?.iconColor ?? base.textColor;
  const iconFocusColor = sb?.iconFocusColor ?? base.primaryColor;
  const bgColor = sb?.backgroundColor ?? base.backgroundColor;
  const focusBgColor = sb?.focusBackgroundColor ?? base.hoverColor;
  const textColor = sb?.textColor ?? base.textColor;
  const placeholderColor = sb?.placeholderColor ?? fade(textColor, 72);
  const clearBg = sb?.clearButton?.backgroundColor ?? base.hoverColor;
  const clearHoverBg = sb?.clearButton?.hoverBackgroundColor ?? fade(base.primaryColor, 24);
  const clearTextColor = sb?.clearButton?.textColor ?? textColor;
  const shadowColor = sb?.shadowColor ?? base.shadowColor;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const showPlaceholder = !value && !isFocused;
  const leading = drawer || !showPlaceholder;

  return (
    <div className={`zs-relative zs-w-full ${className}`}>
      <div
        aria-hidden="true"
        className={cx(
          "zs-absolute zs-z-[1] zs-inset-0 zs-flex zs-items-center zs-gap-1.5 zs-pointer-events-none",
          css`
            justify-content: ${leading ? "flex-start" : "center"};
            padding-inline-start: ${leading ? (drawer ? 14 : 12) : 0}px;
            color: ${placeholderColor};
          `,
        )}
      >
        <RiSearchLine size={15} style={{ color: isFocused ? iconFocusColor : iconColor }} />
        {showPlaceholder && <span className="zs-text-[15px] zs-leading-none">{placeholder}</span>}
      </div>

      <input
        ref={inputRef}
        className={cx(
          "zs-w-full zs-border-none zs-outline-none",
          css`
            height: ${drawer ? 46 : 36}px;
            border-radius: ${drawer ? 23 : 18}px;
            border: 0.75px solid ${base.borderColor};
            font-size: ${drawer ? 16 : 15}px;
            letter-spacing: 0;
            display: block;
            padding-block: 0;
            padding-inline: ${leading ? (drawer ? 36 : 34) : 12}px ${value ? 36 : 12}px;
            text-align: ${leading ? "start" : "center"};
            ${glassSurface(isFocused ? focusBgColor : bgColor, base.backdropFilter, base.highlightColor)}
            color: ${textColor};
            box-shadow:
              inset 0 1px 0 ${fade(base.highlightColor, 26)},
              0 8px 20px ${isFocused ? shadowColor : "transparent"};
            transition:
              background-color 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease;
            &:focus {
              border-color: ${iconFocusColor};
            }
            &::placeholder {
              color: transparent;
            }
          `,
        )}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {value && (
        <button
          type="button"
          className={cx(
            "zs-absolute zs-w-5 zs-h-5 zs-rounded-full zs-border-none zs-cursor-pointer zs-flex zs-items-center zs-justify-center",
            css`
              inset-block: 0;
              inset-inline-end: 10px;
              margin-block: auto;
              background-color: ${clearBg};
              color: ${clearTextColor};
              transition:
                background-color 0.2s ease,
                transform 0.1s ease;
              &:hover {
                background-color: ${clearHoverBg};
              }
              &:active {
                transform: scale(0.9);
              }
            `,
          )}
          onClick={handleClear}
        >
          <RiCloseLine size={12} />
        </button>
      )}
    </div>
  );
};

export default SearchBox;
