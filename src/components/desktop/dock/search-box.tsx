import React, { useState, useRef } from "react";
import { RiSearchLine, RiCloseLine } from "@remixicon/react";
import { css, cx } from "@emotion/css";
import { useSortableConfig } from "../context/config/hooks";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const easeOutQuad = css`
  transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

const SearchBox: React.FC<SearchBoxProps> = ({ value, onChange, placeholder = "搜索应用", className = "" }) => {
  const { theme } = useSortableConfig();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchIconRef = useRef<HTMLDivElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    // 当输入框聚焦时，调整图标位置
    if (searchIconRef.current) {
      searchIconRef.current.style.transform = "translateY(-50%) translateX(-0.5rem)";
    }
    if (clearButtonRef.current) {
      clearButtonRef.current.style.transform = "translateY(-50%) translateX(0.5rem)";
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // 当输入框失焦时，恢复图标位置
    if (searchIconRef.current) {
      searchIconRef.current.style.transform = "translateY(-50%) translateX(0)";
    }
    if (clearButtonRef.current) {
      clearButtonRef.current.style.transform = "translateY(-50%) translateX(0)";
    }
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={`zs-relative zs-w-full zs-group ${className}`}>
      {/* 搜索图标 */}
      <div
        ref={searchIconRef}
        className={cx(
          "zs-absolute zs-left-4 zs-top-1/2 zs-transform zs--translate-y-1/2 zs-pointer-events-none zs-transition-all zs-duration-300",
          css`
            color: ${isFocused
              ? theme.token.dock?.launchpad?.modal?.searchBox?.iconFocusColor
              : theme.token.dock?.launchpad?.modal?.searchBox?.iconColor};
          `,
          easeOutQuad
        )}
      >
        <RiSearchLine size={16} />
      </div>

      {/* 搜索输入框 */}
      <input
        ref={inputRef}
        className={cx(
          "zs-w-full zs-h-11 zs-pl-12 zs-pr-12 zs-border-none zs-rounded-[22px] zs-text-base zs-outline-none zs-transition-all zs-duration-300 placeholder:zs-font-normal focus:zs-scale-[1.02]",
          css`
            background-color: ${theme.token.dock?.launchpad?.modal?.searchBox?.backgroundColor};
            color: ${theme.token.dock?.launchpad?.modal?.searchBox?.textColor};
            &::placeholder {
              color: ${theme.token.dock?.launchpad?.modal?.searchBox?.placeholderColor};
            }
            &:focus {
              background-color: ${theme.token.dock?.launchpad?.modal?.searchBox?.focusBackgroundColor};
              box-shadow: 0 4px 20px ${theme.token.dock?.launchpad?.modal?.searchBox?.shadowColor};
            }
          `,
          easeOutQuad
        )}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {/* 清除按钮 */}
      {value && (
        <button
          ref={clearButtonRef}
          className={cx(
            "zs-absolute zs-right-3 zs-top-1/2 zs-transform zs--translate-y-1/2 zs-w-5 zs-h-5 zs-rounded-full zs-border-none zs-text-xs zs-cursor-pointer zs-flex zs-items-center zs-justify-center zs-transition-all zs-duration-300 hover:zs-scale-110 active:zs-scale-95",
            css`
              background-color: ${theme.token.dock?.launchpad?.modal?.searchBox?.clearButton?.backgroundColor};
              color: ${theme.token.dock?.launchpad?.modal?.searchBox?.clearButton?.textColor};
              &:hover {
                background-color: ${theme.token.dock?.launchpad?.modal?.searchBox?.clearButton?.hoverBackgroundColor};
              }
            `,
            easeOutQuad
          )}
          onClick={handleClear}
          title="清除搜索"
        >
          <RiCloseLine size={12} />
        </button>
      )}
    </div>
  );
};

export default SearchBox;
