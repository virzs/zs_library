import React from 'react';
import Sortable, { SortableProps } from './Sortable';
import { SortableProvider } from './context';
import { Theme } from './theme';
import { SortItem } from './types';

export interface DesktopProps<D = any, C = any> extends SortableProps<D, C> {
  list: SortItem<D, C>[];
  onChange?: (list: SortItem<D, C>[]) => void;
  readonly storageKey?: string;
  theme?: 'light' | 'dark' | Theme;
}

const Desktop = <D, C>(props: DesktopProps<D, C>) => {
  const { list, onChange, storageKey, theme, ...rest } = props;

  return (
    <div>
      <SortableProvider
        theme={theme}
        list={list}
        onChange={onChange}
        storageKey={storageKey}
      >
        <Sortable {...rest} />
      </SortableProvider>
    </div>
  );
};

export default Desktop;
