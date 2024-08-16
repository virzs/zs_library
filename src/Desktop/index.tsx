import React from 'react';
import Sortable from './Sortable';
import {
  SortableConfigProvider,
  SortableConfigProviderProps,
} from './context/config/context';
import {
  SortableStateProvider,
  SortableStateProviderProps,
} from './context/state/context';

export interface DesktopProps<D = any, C = any>
  extends Omit<SortableStateProviderProps<D, C>, 'children'>,
    Omit<SortableConfigProviderProps<D, C>, 'children'> {}

const Desktop = <D, C>(props: DesktopProps<D, C>) => {
  const {
    list,
    onChange,
    storageKey,
    enableCaching,
    theme,
    noLetters,
    contextMenu,
    contextMenuBuilder,
    itemBuilder,
    itemIconBuilder,
    pagingDotBuilder,
    pagingDotsBuilder,
    ...rest
  } = props;

  const state: Omit<SortableStateProviderProps<D, C>, 'children'> = {
    list,
    onChange,
    storageKey,
    enableCaching,
  };

  const config: Omit<SortableConfigProviderProps<D, C>, 'children'> = {
    theme: theme,
    noLetters: noLetters,
    contextMenu: contextMenu,
    pagingDotsBuilder: pagingDotsBuilder,
    pagingDotBuilder: pagingDotBuilder,
    itemBuilder: itemBuilder,
    itemIconBuilder: itemIconBuilder,
    contextMenuBuilder: contextMenuBuilder,
  };

  return (
    <div>
      <SortableStateProvider<D, C> {...state}>
        <SortableConfigProvider<D, C> {...config}>
          <Sortable<D, C> {...rest} />
        </SortableConfigProvider>
      </SortableStateProvider>
    </div>
  );
};

export default Desktop;
