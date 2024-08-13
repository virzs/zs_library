import React from 'react';
import Sortable, { SortableProps } from './Sortable';
import { SortableProvider } from './context';
import { SortItem } from './types';

export interface DesktopProps<D = any, C = any> extends SortableProps<D, C> {
  list: SortItem<D, C>[];
  onChange?: (list: SortItem<D, C>[]) => void;
}

const Desktop = <D, C>(props: DesktopProps<D, C>) => {
  const { list, ...rest } = props;

  return (
    <div>
      <SortableProvider list={list}>
        <Sortable {...rest} />
      </SortableProvider>
    </div>
  );
};

export default Desktop;
