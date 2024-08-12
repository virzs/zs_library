import React, { FC } from 'react';
import Sortable from './Sortable';
import { SortableProvider } from './context';

export interface DesktopProps {
  list: any[];
}

const Desktop: FC<DesktopProps> = (props) => {
  const { list } = props;

  return (
    <div>
      <SortableProvider list={list}>
        <Sortable />
      </SortableProvider>
    </div>
  );
};

export default Desktop;
