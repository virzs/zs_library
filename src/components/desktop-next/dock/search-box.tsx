import React, { useState, useRef } from "react";
import { RiSearchLine, RiCloseLine } from "@remixicon/react";
import { css, cx } from "@emotion/css";
import { Theme } from "../themes";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  theme?: Theme;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = "搜索应用",
  className = "",
  theme,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const sb = theme?.token?.dock?.launchpad?.modal?.searchBox;
  const iconColor = sb?.iconColor ?? "rgba(255, 255, 255, 0.7)";
  const iconFocusColor = sb?.iconFocusColor ?? "rgba(255, 255, 255, 0.9)";
  const bgColor = sb?.backgroundColor ?? "rgba(255, 255, 255, 0.10)";
  const focusBgColor = sb?.focusBackgroundColor ?? "rgba(255, 255, 255, 0.16)";
  const textColor = sb?.textColor ?? "rgba(255, 255, 255, 0.9)";
  const placeholderColor = sb?.placeholderColor ?? "rgba(255, 255, 255, 0.45)";
  const clearBg =
    sb?.clearButton?.backgroundColor ?? "rgba(255, 255, 255, 0.20)";
  const clearHoverBg =
    sb?.clearButton?.hoverBackgroundColor ?? "rgba(255, 255, 255, 0.32)";
  const clearTextColor =
    sb?.clearButton?.textColor ?? "rgba(255, 255, 255, 0.9)";

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
          "zs-absolute zs-inset-0 zs-flex zs-items-center zs-justify-center zs-gap-1.5 zs-pointer-events-none",
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
          "zs-absolute zs-left-3 zs-top-1/2 zs--translate-y-1/2 zs-pointer-events-none",
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
            font-size: 15px;
            padding: 0 ${value ? "32px" : "12px"} 0 ${value ? "28px" : "12px"};
            text-align: ${value ? "left" : "center"};
            background-color: ${isFocused ? focusBgColor : bgColor};
            color: ${textColor};
            transition:
              background-color 0.2s ease,
              box-shadow 0.2s ease;
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
