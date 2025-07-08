import React, { useState, useRef } from "react";
import { RiSearchLine, RiCloseLine } from "@remixicon/react";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ value, onChange, placeholder = "搜索应用", className = "" }) => {
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
        className="zs-absolute zs-left-4 zs-top-1/2 zs-transform zs--translate-y-1/2 zs-pointer-events-none zs-transition-all zs-duration-300 zs-ease-[cubic-bezier(0.25,0.46,0.45,0.94)] zs-text-[rgba(60,60,67,0.6)]"
        style={{
          color: isFocused ? "#007aff" : "rgba(60,60,67,0.6)",
        }}
      >
        <RiSearchLine size={16} />
      </div>

      {/* 搜索输入框 */}
      <input
        ref={inputRef}
        className="zs-w-full zs-h-11 zs-pl-12 zs-pr-12 zs-border-none zs-rounded-[22px] zs-bg-[rgba(118,118,128,0.12)] zs-text-base zs-text-[#1d1d1f] zs-outline-none zs-transition-all zs-duration-300 zs-ease-[cubic-bezier(0.25,0.46,0.45,0.94)] placeholder:zs-text-[rgba(60,60,67,0.6)] placeholder:zs-font-normal focus:zs-bg-[rgba(118,118,128,0.2)] focus:zs-scale-[1.02] focus:zs-shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
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
          className="zs-absolute zs-right-3 zs-top-1/2 zs-transform zs--translate-y-1/2 zs-w-5 zs-h-5 zs-rounded-full zs-bg-[rgba(60,60,67,0.3)] zs-border-none zs-text-white zs-text-xs zs-cursor-pointer zs-flex zs-items-center zs-justify-center zs-transition-all zs-duration-300 zs-ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:zs-bg-[rgba(60,60,67,0.5)] hover:zs-scale-110 active:zs-scale-95"
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
