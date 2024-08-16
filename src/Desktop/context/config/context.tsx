import React, { createContext, useMemo } from 'react';
import { ContextMenuProps } from '../../ContextMenu';
import { Theme, themeDark, themeLight } from '../../theme';
import { SortItem } from '../../types';

/**
 * 需要跨多个组件传递的配置，使用 context 传递
 */
export interface SortableConfig<D, C> {
  theme?: Theme;
  /**
   * 是否不显示名称
   */
  noLetters?: boolean;
  /**
   * 右键菜单设置
   */
  contextMenu?:
    | ContextMenuProps<D, C>
    | ((data: SortItem<D, C>) => ContextMenuProps<D, C> | false)
    | false;
  /**
   * 自定义分页点容器
   */
  pagingDotsBuilder?: (dots: React.ReactNode) => React.JSX.Element;
  /**
   * 自定义分页点
   */
  pagingDotBuilder?: (item: SortItem<D, C>, index: number) => React.JSX.Element;
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

export const SortableConfigContext = createContext<SortableConfig<any, any>>(
  {},
);

export interface SortableConfigProviderProps<D, C>
  extends Omit<SortableConfig<D, C>, 'theme'> {
  readonly theme?: 'light' | 'dark' | Theme;
  children: React.ReactNode;
}

export const SortableConfigProvider = <D, C>(
  props: SortableConfigProviderProps<D, C>,
) => {
  const { children, theme: propTheme, ...rest } = props;

  const theme = useMemo(() => {
    if (propTheme === 'light') {
      return themeLight;
    } else if (propTheme === 'dark') {
      return themeDark;
    } else {
      return propTheme;
    }
  }, [propTheme]);

  return (
    <SortableConfigContext.Provider value={{ theme, ...rest }}>
      {children}
    </SortableConfigContext.Provider>
  );
};
