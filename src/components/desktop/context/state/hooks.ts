import { useContext } from 'react';
import { SortableStateContext } from './context';

export const useSortableState = () => {
  const state = useContext(SortableStateContext);

  return state;
};
