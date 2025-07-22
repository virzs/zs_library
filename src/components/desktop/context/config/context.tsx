/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useMemo } from "react";
import { Theme, themeDark, themeLight, defaultTheme } from "../../themes";
import { ContextMenuProps } from "../../context-menu";
import { SortItem, ListItem, TypeConfigMap, DataTypeMenuConfigMap } from "../../types";

/**
 * 需要跨多个组件传递的配置，使用 context 传递
 */
export interface SortableConfig<D, C> {
  theme: Theme;
  /**
   * 是否不显示名称
   */
  noLetters?: boolean;
  /**
   * 类型配置映射表
   */
  typeConfigMap?: TypeConfigMap;
  /**
   * dataType菜单配置映射表
   */
  dataTypeMenuConfigMap?: DataTypeMenuConfigMap;
  /**
   * 右键菜单设置
   */
  contextMenu?: ContextMenuProps<D, C> | ((data: SortItem<D, C>) => ContextMenuProps<D, C> | false) | false;
  /**
   * 自定义分页点容器
   */
  pagingDotsBuilder?: (dots: React.ReactNode) => React.JSX.Element;
  /**
   * 自定义分页点
   * @param item 分页项数据
   * @param index 分页项索引
   * @param isActive 是否为当前选中页
   */
  pagingDotBuilder?: (item: ListItem<D, C>, index: number, isActive: boolean) => React.JSX.Element;
  /**
   * 自定义 item 渲染
   */
  itemBuilder?: (item: SortItem<D, C>) => React.ReactNode;
  /**
   * 自定义 item 图标渲染
   */
  itemIconBuilder?: (item: SortItem<D, C>) => React.ReactNode;
  /**
   * 自定义右键菜单
   */
  contextMenuBuilder?: (data: SortItem<D, C>) => ContextMenuProps<D, C>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SortableConfigContext = createContext<SortableConfig<any, any>>({
  theme: defaultTheme,
});

export interface SortableConfigProviderProps<D, C> extends Omit<SortableConfig<D, C>, "theme"> {
  readonly theme?: "light" | "dark" | Theme;
  children: React.ReactNode;
}

export const SortableConfigProvider = <D, C>(props: SortableConfigProviderProps<D, C>) => {
  const { children, theme: propTheme, ...rest } = props;

  const theme = useMemo(() => {
    if (propTheme === "light") {
      return themeLight;
    } else if (propTheme === "dark") {
      return themeDark;
    } else {
      return propTheme ?? defaultTheme;
    }
  }, [propTheme]);

  return <SortableConfigContext.Provider value={{ theme, ...rest }}>{children}</SortableConfigContext.Provider>;
};
