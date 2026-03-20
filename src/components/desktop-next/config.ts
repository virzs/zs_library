import {
  SortItemDefaultConfig,
  TypeConfigMap,
  SizeConfig,
  DataTypeMenuConfigMap,
} from "./types";

export const commonSizeConfigs = {
  "1x1": { name: "1x1", col: 1, row: 1 },
  "2x1": { name: "2x1", col: 2, row: 1 },
  "1x2": { name: "1x2", col: 1, row: 2 },
  "2x2": { name: "2x2", col: 2, row: 2 },
  "3x2": { name: "3x2", col: 3, row: 2 },
  "4x3": { name: "4x3", col: 4, row: 3 },
} as const;

export const commonSizeConfigsArray: SizeConfig[] = Object.entries(
  commonSizeConfigs,
).map(([id, config]) => ({
  ...config,
  id,
}));

export const appDefaultConfig: SortItemDefaultConfig = {
  sizeConfigs: [commonSizeConfigs["1x1"]],
  defaultSizeId: "1x1",
  allowResize: false,
  allowContextMenu: true,
  allowShare: false,
  allowDelete: true,
  allowInfo: false,
};

export const groupDefaultConfig: SortItemDefaultConfig = {
  sizeConfigs: [commonSizeConfigs["1x1"], commonSizeConfigs["2x2"]],
  defaultSizeId: "1x1",
  allowResize: true,
  allowContextMenu: true,
  allowShare: false,
  allowDelete: true,
  allowInfo: false,
};

export const builtinConfigMap: TypeConfigMap = {
  app: appDefaultConfig,
  group: groupDefaultConfig,
};

export function getDefaultConfig(
  type: string,
  customConfigMap?: TypeConfigMap,
): SortItemDefaultConfig {
  return (
    customConfigMap?.[type] ?? builtinConfigMap[type] ?? builtinConfigMap.app
  );
}

export function getSizeConfig(
  sizeId: string | undefined,
  sizeConfigs?: SizeConfig[],
  defaultSizeId?: string,
): SizeConfig {
  const configs = sizeConfigs ?? [];
  const fallbackConfig: SizeConfig = {
    id: "1x1",
    ...commonSizeConfigs["1x1"],
  };

  if (configs.length === 0) {
    return fallbackConfig;
  }

  const targetId = sizeId ?? defaultSizeId;
  if (!targetId) {
    return configs[0];
  }

  return (
    configs.find(
      (config) => config.id === targetId || config.name === targetId,
    ) ||
    configs.find(
      (config) => config.id === defaultSizeId || config.name === defaultSizeId,
    ) ||
    configs[0]
  );
}

export function getItemSize(
  type: string,
  sizeId?: string,
  customConfigMap?: TypeConfigMap,
): { col: number; row: number } {
  const config = getDefaultConfig(type, customConfigMap);
  const sizeConfig = getSizeConfig(
    sizeId,
    config.sizeConfigs,
    config.defaultSizeId,
  );
  return { col: sizeConfig.col, row: sizeConfig.row };
}

export function getDataTypeMenuConfig(
  dataType: string,
  customConfigMap?: DataTypeMenuConfigMap,
) {
  return customConfigMap?.[dataType] ?? [];
}
