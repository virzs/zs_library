import { SortItemBaseConfig } from './types';

// app 类型 config
export const appConfig: SortItemBaseConfig = {
  maxRow: 2,
  maxCol: 2,
};

export const groupConfig: SortItemBaseConfig = {
  ...appConfig,
};

export const configMap: {
  [key: string]: SortItemBaseConfig;
} = {
  app: appConfig,
  group: groupConfig,
};
