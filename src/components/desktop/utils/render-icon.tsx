import React, { useState, useCallback, useMemo, memo, FC } from "react";
import { SortItem, SortItemBaseData } from "../types";

/**
 * 带加载动画的图片组件
 */
const ImageWithLoading: FC<{ src: string }> = memo(({ src }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const imageClassName = useMemo(() => {
    return `zs-w-full zs-h-full zs-object-cover zs-transition-opacity zs-duration-300 ${
      isLoading ? "zs-opacity-0" : "zs-opacity-100"
    }`;
  }, [isLoading]);

  return (
    <div className="zs-relative zs-w-full zs-h-full">
      {isLoading && (
        <div className="zs-absolute zs-inset-0 zs-flex zs-items-center zs-justify-center zs-bg-gray-100">
          <div className="zs-animate-spin zs-rounded-full zs-h-4 zs-w-4 zs-border-b-2 zs-border-gray-600"></div>
        </div>
      )}
      {hasError ? (
        <div className="zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center zs-bg-gray-100 zs-text-gray-400">
          <span className="zs-text-xs">加载失败</span>
        </div>
      ) : (
        <img src={src} alt="" className={imageClassName} onLoad={handleLoad} onError={handleError} />
      )}
    </div>
  );
});

/**
 * 渲染图标的通用函数
 * @param item 排序项数据
 * @param icon 外部传入的图标（优先级最高）
 * @param configItemIconBuilder 配置中的图标构建器
 * @returns 渲染的图标元素
 */
export const renderIcon = <D, C>(
  item: SortItem<D, C>,
  icon?: React.ReactNode,
  configItemIconBuilderAllowNull?: (item: SortItem<D, C>) => React.ReactNode,
  configItemIconBuilder?: ((item: SortItem<D, C>) => React.ReactNode) | React.ReactNode
): React.ReactNode => {
  const { data: itemData = {} } = item;
  const { icon: dataIcon } = itemData as D & SortItemBaseData;

  // 优先使用外部传入的icon
  if (icon) return icon;

  // 其次尝试允许返回 null 的构建器；当返回 null/undefined 时，回退到默认逻辑
  if (typeof configItemIconBuilderAllowNull === "function") {
    const built = configItemIconBuilderAllowNull(item);
    if (built !== null && built !== undefined) {
      return built;
    }
  }

  // 其次使用数据中的icon
  if (dataIcon) {
    // 如果icon是url字符串，则显示为图片
    if (typeof dataIcon === "string" && (dataIcon.startsWith("http") || dataIcon.startsWith("https"))) {
      return <ImageWithLoading src={dataIcon} />;
    }
    return dataIcon;
  }

  // 最后使用配置中的itemIconBuilder
  if (!configItemIconBuilder) return null;
  if (typeof configItemIconBuilder === "function") {
    return configItemIconBuilder(item);
  }
  return configItemIconBuilder;
};
