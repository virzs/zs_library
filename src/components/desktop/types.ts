/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SortItemBaseConfig {
  /** 最大行数 default 2 */
  maxRow?: number;
  /** 最大列数 default 2 */
  maxCol?: number;
  /** 行数 */
  row?: number;
  /** 列数 */
  col?: number;
  /** 允许设置大小 default true */
  allowResize?: boolean;
  /** 允许打开右键菜单 default true */
  allowContextMenu?: boolean;
  /** 允许显示分享按钮 default true */
  allowShare?: boolean;
  /** 允许显示删除按钮 default true */
  allowDelete?: boolean;
  /** 允许显示信息按钮 default true */
  allowInfo?: boolean;
}

export interface SortItemBaseData {
  name: string;
  icon?: string;
}

export interface SortItem<
  D = any & SortItemBaseData,
  C = any & SortItemBaseConfig
> {
  id: string | number;
  type: "app" | "group";
  data?: D;
  config?: C;
  children?: SortItem<D, C>[];
  /** 区分数据类型：page表示分页数据，dock表示dock数据 */
  dataType?: "page" | "dock";
  /** 下面的参数为组件内部处理时自动添加，不影响数据 */
  parentIds?: (string | number)[];
  /** groupItem 点击时的坐标，用于打开弹窗时从坐标处打开 */
  pageX?: number;
  pageY?: number;
}

// 类型别名，保持向后兼容
export type SortableItemData = SortItem;
