import React from "react";
import { SortItem } from "../types";

// 为react-slick的customPaging提供单个分页点生成器
export const createCustomPagingDot = <D, C>(
  list: SortItem<D, C>[],
  activeSlide: number,
  pagingDotBuilder?: (
    item: SortItem<D, C>,
    index: number,
    isActive: boolean
  ) => React.ReactElement
) => {
  return (index: number): React.ReactElement => {
    const isActive = activeSlide === index;
    const item = list[index];

    if (pagingDotBuilder && item) {
      const content = pagingDotBuilder(item, index, isActive);
      return content;
    }

    // 默认显示圆点样式
    return (
      <button
        type="button"
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: isActive ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.3)",
          border: "none",
          cursor: "pointer",
          fontSize: 0,
          transition: "all 0.2s ease",
        }}
      />
    );
  };
};
