/* eslint-disable @typescript-eslint/no-explicit-any */

/** 尺寸配置项 */
export interface SizeConfig {
  /** 配置ID（可选，通常使用对象key作为ID） */
  id?: string;
  /** 显示名称 */
  name: string;
  /** 列数 */
  col: number;
  /** 行数 */
  row: number;
}

/** 用户可配置的设置（会存储到用户数据中） */
export interface SortItemUserConfig {
  /** 尺寸配置ID */
  sizeId?: string;
}

/** 菜单项配置 */
export interface MenuItemConfig {
  /** 菜单项文本 */
  text: string;
  /** 菜单项图标 */
  icon?: React.ReactNode;
  /** 菜单项颜色 */
  color?: string;
  /** 文本颜色 */
  textColor?: string;
  /** 点击回调 */
  onClick?: (item: SortItem, contextActions: any) => void;
}

/** dataType菜单配置映射表 */
export type DataTypeMenuConfigMap = Record<string, MenuItemConfig[]>;

/** 系统默认配置（不会存储到用户数据中，防止篡改） */
export interface SortItemDefaultConfig {
  /** 可用的尺寸配置列表 */
  sizeConfigs: SizeConfig[];
  /** 默认尺寸配置ID */
  defaultSizeId: string;
  /** 允许设置大小 */
  allowResize: boolean;
  /** 允许打开右键菜单 */
  allowContextMenu: boolean;
  /** 允许显示分享按钮 */
  allowShare: boolean;
  /** 允许显示删除按钮 */
  allowDelete: boolean;
  /** 允许显示信息按钮 */
  allowInfo: boolean;
}

/** 完整的配置接口（用户配置 + 系统默认配置） */
export interface SortItemBaseConfig extends SortItemUserConfig, SortItemDefaultConfig {}

/** 类型配置映射表 */
export type TypeConfigMap = Record<string, SortItemDefaultConfig>;

export interface SortItemBaseData {
  name: string;
  icon?: string;
}

export interface SortItem<D = any & SortItemBaseData, C = any & SortItemUserConfig> {
  id: string | number;
  /** 项目类型，支持内置类型（app、group）和自定义类型 */
  type: "app" | "group" | string;
  data?: D & SortItemBaseData;
  config?: C & SortItemUserConfig;
  children?: SortItem<D & SortItemBaseData, C & SortItemUserConfig>[];
  /** 区分数据类型：page表示分页数据，dock表示dock数据，string任意类型，关联自定义右键菜单项 */
  dataType?: "page" | "dock" | string;
  /** 下面的参数为组件内部处理时自动添加，不影响数据 */
  parentIds?: (string | number)[];
  /** groupItem 点击时的坐标，用于打开弹窗时从坐标处打开 */
  pageX?: number;
  pageY?: number;
}

/** List项目类型，只包含id、type、children三个属性 */
export interface ListItem<D = any & SortItemBaseData, C = any & SortItemUserConfig> {
  id: string | number;
  /** 区分数据类型：page表示分页数据，dock表示dock数据，string任意类型 */
  type: "page" | "dock" | string;
  children: SortItem<D & SortItemBaseData, C & SortItemUserConfig>[];
}

// 类型别名，保持向后兼容
export type SortableItemData = SortItem;
export type DesktopSizeConfig = SizeConfig;
export type DesktopTypeConfigMap = TypeConfigMap;
