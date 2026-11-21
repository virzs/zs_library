import { css, cx } from "@emotion/css";
import React from "react";
import type { DesktopDndConfigContextValue } from "./contexts/types";
import type { DndPageItem } from "./types";

export interface DesktopNextPagination {
  visible?: boolean;
  variant?: "pill" | "dots" | "bars";
  activeColor?: string;
  inactiveColor?: string;
}

const sizes = {
  pill: { width: 7, activeWidth: 18, height: 7 },
  dots: { width: 7, activeWidth: 7, height: 7 },
  bars: { width: 16, activeWidth: 16, height: 4 },
};
const gap = 6;
const padding = 9;
const timing = "0.32s cubic-bezier(0.2, 0.82, 0.2, 1)";

const track = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${gap}px;
  padding: 6px ${padding}px;
  border-radius: 999px;
  &[data-variant="pill"] {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 -1px 0 rgba(0, 0, 0, 0.08);
  }
`;

const dot = css`
  display: block;
  flex: none;
  position: relative;
  appearance: none;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
  transition: width ${timing}, background-color ${timing};
  &::after { content: ""; position: absolute; inset: -6px -3px; }
  &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
`;

const marker = css`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  border-radius: 999px;
  transition: inset-inline-start ${timing};
`;

const immediate = css`transition: none;`;
const reducedMotion = css`@media (prefers-reduced-motion: reduce) { transition: none; }`;

interface Props extends Pick<DesktopDndConfigContextValue, "pagingDotBuilder" | "pagingDotsBuilder"> {
  pages: DndPageItem[];
  currentPage: number;
  swipeRatio: number;
  goToPage: (index: number) => void;
  options?: DesktopNextPagination;
}

export default function Pagination({ pages, currentPage, swipeRatio, goToPage, options, pagingDotBuilder, pagingDotsBuilder }: Props) {
  const variant = options?.variant ?? "pill";
  const { width, activeWidth, height } = sizes[variant];
  const activeColor = options?.activeColor ?? "rgba(255, 255, 255, 0.9)";
  const inactiveColor = options?.inactiveColor ?? "rgba(255, 255, 255, 0.34)";
  const progress = Math.max(0, Math.min(pages.length - 1, currentPage - swipeRatio));
  const sharedMarker = !pagingDotBuilder && !pagingDotsBuilder;

  const nodes = pages.map((page, index) => {
    const active = index === currentPage;
    if (pagingDotBuilder) {
      return <React.Fragment key={page.id}>{pagingDotBuilder(index, active, () => goToPage(index))}</React.Fragment>;
    }
    const weight = sharedMarker ? Math.max(0, 1 - Math.abs(progress - index)) : Number(active);
    return (
      <button
        key={page.id} type="button" aria-label={`${index + 1} / ${pages.length}`}
        aria-current={active ? "page" : undefined} data-active={active}
        className={cx(dot, swipeRatio !== 0 && immediate, reducedMotion)}
        style={{
          width: width + weight * (activeWidth - width), height,
          backgroundColor: active && !sharedMarker ? activeColor : inactiveColor,
        }}
        onClick={() => goToPage(index)}
      />
    );
  });

  if (pagingDotsBuilder) {
    return <div className="zs-flex zs-justify-center zs-items-center zs-gap-1.5 zs-py-2">{pagingDotsBuilder(nodes)}</div>;
  }
  return (
    <div className={track} data-variant={variant}>
      {nodes}
      {sharedMarker && (
        <span
          aria-hidden="true" className={cx(marker, swipeRatio !== 0 && immediate, reducedMotion)}
          style={{ insetInlineStart: padding + progress * (width + gap), width: activeWidth, height, backgroundColor: activeColor }}
        />
      )}
    </div>
  );
}
