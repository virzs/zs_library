import { css, cx } from "@emotion/css";
import React from "react";

export interface PaginationProps {
  /**
   * 当前活跃的页面索引
   */
  activeSlide: number;
  /**
   * 拖拽进入分页点的回调
   */
  onDragEnter: (index: number) => void;
  /**
   * 点击分页点的回调
   */
  onClick?: (index: number) => void;
  /**
   * 自定义分页点容器构建器
   */
  pagingDotsBuilder?: (dots: React.ReactNode[]) => React.ReactNode;
  /**
   * react-slick 生成的分页点数组
   */
  slickDots: React.ReactNode[];
  /**
   * 是否禁用分页显示
   */
  disabled?: boolean;
  /**
   * 额外的CSS类名
   */
  className?: string;
}

const DefaultPaginationDots: React.FC<{
  dots: React.ReactNode[];
  className?: string;
}> = ({ dots, className }) => {
  return (
    <div>
      <ul
        className={cx(
          "slick-dots-default",
          "zs-p-2 zs-inline-flex zs-justify-center zs-items-center zs-gap-3",
          css`
            li {
              margin: 0;
              width: 8px;
              height: 8px;
              button {
                width: 8px;
                height: 8px;
                padding: 0;
                border-radius: 50%;
                background-color: rgba(0, 0, 0, 0.3);
                border: none;
                font-size: 0;
                transition: all 0.2s ease;
                cursor: pointer;
                &::before {
                  display: none;
                }
                &:hover {
                  background-color: rgba(0, 0, 0, 0.6);
                }
              }
              &.slick-active {
                color: white;
                border-radius: 0.25rem;
                width: auto;
                height: auto;
                button {
                  background-color: rgba(0, 0, 0, 1);
                  width: 8px;
                  height: 8px;
                }
              }
            }
          `,
          className
        )}
      >
        {dots}
      </ul>
    </div>
  );
};

const Pagination = ({ pagingDotsBuilder, slickDots, disabled = false, className }: PaginationProps) => {
  if (disabled) {
    return <div></div>;
  }

  // 使用自定义容器或默认容器
  if (pagingDotsBuilder) {
    return <>{pagingDotsBuilder(slickDots)}</>;
  }

  return <DefaultPaginationDots dots={slickDots} className={className} />;
};

export default Pagination;
