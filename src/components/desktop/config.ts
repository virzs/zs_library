import { SortItemDefaultConfig, TypeConfigMap, SizeConfig, DataTypeMenuConfigMap } from "./types";

/** 通用尺寸配置 */
export const commonSizeConfigs = {
  "1x1": { name: "1x1", col: 1, row: 1 },
  "2x1": { name: "2x1", col: 2, row: 1 },
  "1x2": { name: "1x2", col: 1, row: 2 },
  "2x2": { name: "2x2", col: 2, row: 2 },
  "3x2": { name: "3x2", col: 3, row: 2 },
  "4x3": { name: "4x3", col: 4, row: 3 },
} as const;

/** 通用尺寸配置数组（用于需要数组格式的场景） */
export const commonSizeConfigsArray: SizeConfig[] = Object.entries(commonSizeConfigs).map(([id, config]) => ({
  ...config,
  id,
}));

/** app类型的默认配置 */
export const appDefaultConfig: SortItemDefaultConfig = {
  sizeConfigs: [commonSizeConfigs["1x1"]],
  defaultSizeId: "1x1",
  allowResize: false,
  allowContextMenu: true,
  allowShare: false,
  allowDelete: true,
  allowInfo: true,
};

/** group类型的默认配置 */
export const groupDefaultConfig: SortItemDefaultConfig = {
  sizeConfigs: [commonSizeConfigs["1x1"], commonSizeConfigs["2x2"]],
  defaultSizeId: "1x1",
  allowResize: false,
  allowContextMenu: true,
  allowShare: false,
  allowDelete: true,
  allowInfo: false,
};

/** 内置默认配置映射表 */
export const builtinConfigMap: TypeConfigMap = {
  app: appDefaultConfig,
  group: groupDefaultConfig,
};

/**
 * 获取指定类型的默认配置
 * @param type 类型名称
 * @param customConfigMap 自定义类型配置映射表
 * @returns 默认配置对象，如果类型不存在则返回app类型的配置
 */
export function getDefaultConfig(type: string, customConfigMap?: TypeConfigMap): SortItemDefaultConfig {
  // 优先使用自定义配置，然后是内置配置，最后回退到app配置
  return customConfigMap?.[type] || builtinConfigMap[type] || builtinConfigMap.app;
}

/**
 * 根据尺寸配置ID获取具体的尺寸信息
 * @param sizeId 尺寸配置ID
 * @param sizeConfigs 可用的尺寸配置列表
 * @param defaultSizeId 默认尺寸配置ID
 * @returns 尺寸配置对象
 */
export function getSizeConfig(
  sizeId: string | undefined,
  sizeConfigs?: SizeConfig[],
  defaultSizeId?: string | number
): SizeConfig {
  const configs = sizeConfigs || [];
  if (!sizeId) {
    return configs.find((config) => config.id === defaultSizeId || config.name === defaultSizeId) || configs[0];
  }
  return (
    configs.find((config) => config.id === sizeId || config.name === sizeId) ||
    configs.find((config) => config.id === defaultSizeId || config.name === defaultSizeId) ||
    configs[0]
  );
}

/**
 * 获取项目的实际尺寸（col和row）
 * @param type 项目类型
 * @param sizeId 尺寸配置ID
 * @param customConfigMap 自定义类型配置映射表
 * @returns 包含col和row的对象
 */
export function getItemSize(
  type: string,
  sizeId?: string,
  customConfigMap?: TypeConfigMap
): { col: number; row: number } {
  const config = getDefaultConfig(type, customConfigMap);
  const sizeConfig = getSizeConfig(sizeId, config.sizeConfigs, config.defaultSizeId);
  return { col: sizeConfig.col, row: sizeConfig.row };
}

/**
 * 获取dataType对应的菜单配置
 * @param dataType 数据类型
 * @param customConfigMap 自定义dataType菜单配置映射表
 * @returns 菜单配置数组
 */
export function getDataTypeMenuConfig(dataType: string, customConfigMap?: DataTypeMenuConfigMap) {
  return customConfigMap?.[dataType] || [];
}
