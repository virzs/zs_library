import { useContext } from 'react';
import { SortableConfigContext } from './context';

export const useSortableConfig = () => {
  const state = useContext(SortableConfigContext);

  return state;
};
