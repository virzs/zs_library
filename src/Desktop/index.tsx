import React from 'react';
import Sortable, { SortableProps } from './Sortable';
import { SortableProvider } from './context';
import { Theme } from './theme';
import { SortItem } from './types';

export interface DesktopProps<D = any, C = any> extends SortableProps<D, C> {
  /**
   * 数据源
   */
  list: SortItem<D, C>[];
  /**
   * onChange 事件，当排序发生变化时触发
   */
  onChange?: (list: SortItem<D, C>[]) => void;
  /**
   * 本地存储 key
   */
  readonly storageKey?: string;
  /**
   * 主题配置
   */
  theme?: 'light' | 'dark' | Theme;
  /**
   * 是否启用缓存
   * @default true
   */
  enableCaching: boolean;
}

const Desktop = <D, C>(props: DesktopProps<D, C>) => {
  const { list, onChange, storageKey, theme, enableCaching, ...rest } = props;

  return (
    <div>
      <SortableProvider
        theme={theme}
        list={list}
        onChange={onChange}
        storageKey={storageKey}
        enableCaching={enableCaching}
      >
        <Sortable {...rest} />
      </SortableProvider>
    </div>
  );
};

export default Desktop;
