import React from 'react';
import Sortable, { SortableProps } from './Sortable';
import { SortableProvider } from './context';
import { SortItem } from './types';

export interface DesktopProps<D = any, C = any> extends SortableProps<D, C> {
  list: SortItem<D, C>[];
  onChange?: (list: SortItem<D, C>[]) => void;
  readonly storageKey?: string;
}

const Desktop = <D, C>(props: DesktopProps<D, C>) => {
  const { list, onChange, storageKey, ...rest } = props;

  return (
    <div>
      <SortableProvider list={list} onChange={onChange} storageKey={storageKey}>
        <Sortable {...rest} />
      </SortableProvider>
    </div>
  );
};

export default Desktop;
