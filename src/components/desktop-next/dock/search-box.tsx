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
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  theme?: Theme;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = desktopNextI18nResources[desktopNextDefaultLanguage].desktopNext
    .launchpad.searchPlaceholder,
  className = "",
  theme: explicitTheme,
}) => {
  const theme = useSurfaceTheme(explicitTheme);
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

  return (
    <div className={`zs-relative zs-w-full ${className}`}>
      <div
        className={cx(
          "zs-absolute zs-z-[1] zs-inset-0 zs-flex zs-items-center zs-justify-center zs-gap-1.5 zs-pointer-events-none",
          css`
            color: ${isFocused || value ? "transparent" : placeholderColor};
            transition: color 0.2s ease;
          `,
        )}
      >
        <RiSearchLine
          size={15}
          style={{ color: isFocused || value ? "transparent" : iconColor }}
        />
        <span
          className="zs-text-[15px] zs-leading-none"
        >
          {!value && placeholder}
        </span>
      </div>

      <div
        className={cx(
          "zs-absolute zs-z-[1] zs-left-3 zs-top-1/2 zs--translate-y-1/2 zs-pointer-events-none",
          css`
            color: ${isFocused ? iconFocusColor : iconColor};
            transition: color 0.2s ease;
            opacity: ${value ? 1 : 0};
          `,
        )}
      >
        <RiSearchLine size={15} />
      </div>

      <input
        ref={inputRef}
        className={cx(
          "zs-w-full zs-border-none zs-outline-none",
          css`
            height: 36px;
            border-radius: 18px;
            border: 0.75px solid ${base.borderColor};
            font-size: 15px;
            letter-spacing: 0;
            padding: 0 ${value ? "32px" : "12px"} 0 ${value ? "28px" : "12px"};
            text-align: ${value ? "left" : "center"};
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
            "zs-absolute zs-right-2.5 zs-top-1/2 zs--translate-y-1/2 zs-w-5 zs-h-5 zs-rounded-full zs-border-none zs-cursor-pointer zs-flex zs-items-center zs-justify-center",
            css`
              background-color: ${clearBg};
              color: ${clearTextColor};
              transition:
                background-color 0.2s ease,
                transform 0.1s ease;
              &:hover {
                background-color: ${clearHoverBg};
              }
              &:active {
                transform: translateY(-50%) scale(0.9);
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
