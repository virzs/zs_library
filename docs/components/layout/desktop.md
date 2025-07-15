# 桌面

基于 react-sortablejs 封装实现的桌面组件

## 依赖

```json
{
  "uuid": "^10.0.0",
  "ahooks": "^3.8.0",
  "@emotion/css": "^11.13.0",
  "react-sortablejs": "^6.1.4",
  "sortablejs": "^1.15.2",
  "framer-motion": "^11.3.19",
  "react-json-view": "^1.21.3",
  "react-modal-sheet": "^3.1.0",
  "rc-dialog": "^9.0.4",
  "react-slick": "^0.30.2",
  "slick-carousel": "^1.8.1"
}
```

## 功能

- 排序
- 文件夹
- 自定义追加元素
- 分页支持
- 本地存储
- 主题定制
- 右键菜单
- Dock 栏

## 基本用法

```jsx
import { Desktop } from "zs_library";

export default () => {
  const list = [
    {
      id: "123",
      data: {
        name: "常用",
      },
      children: [
        {
          id: 1,
          type: "group",
          data: {
            name: "常用软件",
          },
          config: {
            col: 2,
          },
          children: [
            {
              id: "app1",
              type: "app",
              data: {
                name: "Chrome",
                icon: "https://placehold.co/100x100/4285F4/FFFFFF?text=Chrome",
              },
            },
            {
              id: "app2",
              type: "app",
              data: {
                name: "VS Code",
                icon: "https://placehold.co/100x100/007ACC/FFFFFF?text=VSCode",
              },
            },
            {
              id: "app3",
              type: "app",
              data: {
                name: "Photoshop",
                icon: "https://placehold.co/100x100/31A8FF/FFFFFF?text=PS",
              },
            },
            {
              id: "app4",
              type: "app",
              data: {
                name: "Figma",
                icon: "https://placehold.co/100x100/F24E1E/FFFFFF?text=Figma",
              },
            },
          ],
        },
        {
          id: 2,
          type: "app",
          data: {
            name: "微信",
            icon: "https://placehold.co/100x100/07C160/FFFFFF?text=WeChat",
          },
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "支付宝",
            icon: "https://placehold.co/100x100/1677FF/FFFFFF?text=Alipay",
          },
        },
      ],
    },
    {
      id: "12313eqw",
      data: {
        name: "开发",
      },
      children: [
        {
          id: 90,
          type: "app",
          data: {
            name: "GitHub",
            icon: "https://placehold.co/100x100/181717/FFFFFF?text=GitHub",
          },
        },
        {
          id: 91,
          type: "app",
          data: {
            name: "Docker",
            icon: "https://placehold.co/100x100/2496ED/FFFFFF?text=Docker",
          },
        },
      ],
    },
    {
      id: "1239137sdcsdc",
      dataType: "dock",
      children: [
        {
          id: 93,
          type: "app",
          data: {
            name: "新闻",
            icon: "https://placehold.co/100x100/E60012/FFFFFF?text=News",
          },
        },
        {
          id: 94,
          type: "app",
          data: {
            name: "音乐",
            icon: "https://placehold.co/100x100/FF1493/FFFFFF?text=Music",
          },
        },
      ],
    },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        height: "500px",
        padding: "20px",
      }}
    >
      <Desktop list={list} enableCaching={false} />
    </div>
  );
};
```

## API

### Desktop Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| list | 桌面项目列表数据 | `SortItem[]` | `[]` |
| onChange | 列表数据变更回调 | `(list: SortItem[]) => void` | - |
| onItemClick | 项目点击事件 | `(item: SortItem) => void` | - |
| className | 自定义样式类名 | `string` | - |
| enableCaching | 是否启用本地存储缓存 | `boolean` | `true` |
| storageKey | 本地存储的键名 | `string` | `'ZS_LIBRARY_DESKTOP_SORTABLE_CONFIG'` |
| noLetters | 是否隐藏文字（无字模式） | `boolean` | `false` |
| theme | 主题配置 | `'light' \| 'dark' \| Theme` | `'light'` |
| typeConfigMap | 类型配置映射表 | `TypeConfigMap` | - |
| contextMenu | 右键菜单配置 | `ContextMenuProps \| ((data: SortItem) => ContextMenuProps \| false) \| false` | - |
| pagination | 分页配置 | `Pagination \| false` | `{ position: 'bottom' }` |
| dock | Dock 栏配置 | `DockConfig` | `{ enabled: true, position: 'bottom', showLaunchpad: true }` |
| extraItems | 自定义额外项目渲染 | `(listItem: SortItem) => React.ReactNode` | - |
| itemBuilder | 自定义项目渲染 | `(item: SortItem) => React.ReactNode` | - |
| itemIconBuilder | 自定义项目图标渲染 | `(item: SortItem) => React.ReactNode` | - |
| pagingDotBuilder | 自定义分页点渲染 | `(item: SortItem, index: number, isActive: boolean) => React.JSX.Element` | - |
| pagingDotsBuilder | 自定义分页点容器渲染 | `(dots: React.ReactNode) => React.JSX.Element` | - |
| sliderProps | Slider 组件配置 | `Settings` | - |

### SortItem 数据结构

```typescript
interface SortItem<D = any, C = any> {
  /** 唯一标识符 */
  id: string | number;
  /** 项目类型，支持内置类型（app、group）和自定义类型 */
  type: string;
  /** 项目数据 */
  data?: D & {
    name: string;
    icon?: string;
  };
  /** 项目配置 */
  config?: C & {
    /** 尺寸配置ID */
    sizeId?: string;
    /** 列数 */
    col?: number;
    /** 行数 */
    row?: number;
  };
  /** 子项目列表 */
  children?: SortItem[];
  /** 数据类型：page表示分页数据，dock表示dock数据 */
  dataType?: "page" | "dock";
}
```

### Pagination 分页配置

```typescript
interface Pagination {
  /** 分页位置 */
  position?: "top" | "bottom" | "left" | "right";
}
```

### DockConfig Dock 配置

```typescript
interface DockConfig {
  /** 是否启用 Dock */
  enabled?: boolean;
  /** Dock 位置 */
  position?: "top" | "bottom" | "left" | "right";
  /** 自定义样式类名 */
  className?: string;
  /** 自定义 Dock 项目渲染 */
  itemBuilder?: (item: SortItem, index: number) => React.ReactNode;
  /** 是否显示启动台按钮 */
  showLaunchpad?: boolean;
}
```

### Theme 主题配置

```typescript
interface Theme {
  token: {
    /** 项目名称颜色 */
    itemNameColor?: string;
    /** 其他主题配置... */
  };
}
```

### TypeConfigMap 类型配置

```typescript
type TypeConfigMap = Record<string, {
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
}>;
```

### DesktopHandle 实例方法

通过 ref 可以获取到桌面组件的实例方法：

```typescript
interface DesktopHandle {
  state: SortableState;
  config: SortableConfig;
}
```

使用示例：

```jsx pure
const desktopRef = useRef();

<Desktop ref={desktopRef} list={list} />;

// 访问实例
const { state, config } = desktopRef.current;
```
