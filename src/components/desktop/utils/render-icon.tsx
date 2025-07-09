import React from "react";
import { SortItem, SortItemBaseData } from "../types";

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
  configItemIconBuilder?: ((item: SortItem<D, C>) => React.ReactNode) | React.ReactNode
): React.ReactNode => {
  const { data: itemData = {} } = item;
  const { icon: dataIcon } = itemData as D & SortItemBaseData;

  // 优先使用外部传入的icon
  if (icon) return icon;

  // 其次使用数据中的icon
  if (dataIcon) {
    // 如果icon是url字符串，则显示为图片
    if (typeof dataIcon === "string" && (dataIcon.startsWith("http") || dataIcon.startsWith("https"))) {
      return <img src={dataIcon} alt="" className="zs-w-full zs-h-full zs-object-cover" />;
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
