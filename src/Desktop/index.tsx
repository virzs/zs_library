import React, { FC } from 'react';
import Sortable, { SortableProps } from './Sortable';
import { SortableProvider } from './context';

export interface DesktopProps extends SortableProps {
  list: any[];
}

const Desktop: FC<DesktopProps> = (props) => {
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
