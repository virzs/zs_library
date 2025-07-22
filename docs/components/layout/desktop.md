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
import { Desktop, desktopThemeLight, desktopThemeDark } from "zs_library";
import { useState } from "react";

export default () => {
  const [currentTheme, setCurrentTheme] = useState("light");

  // 自定义主题示例
  const customTheme = {
    token: {
      itemNameColor: "#ff6b6b",
      itemIconBackgroundColor: "#4ecdc4",
      itemIconShadowColor: "rgba(255, 107, 107, 0.3)",
      groupItemIconBackgroundColor: "rgba(78, 205, 196, 0.2)",
      groupItemIconShadowColor: "rgba(255, 107, 107, 0.2)",
      groupItemModalBackgroundColor: "rgba(78, 205, 196, 0.9)",
      contextMenuTextColor: "#2c3e50",
      contextMenuActiveColor: "#ecf0f1",
      contextMenuBackgroundColor: "#ffffff",
      contextMenuShadowColor: "rgba(255, 107, 107, 0.2)",
    },
  };

  const themes = {
    light: desktopThemeLight,
    dark: desktopThemeDark,
    custom: customTheme,
  };
  const themeConfigs = {
    light: { name: "浅色", icon: "☀️", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    dark: { name: "深色", icon: "🌙", background: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)" },
    custom: {
      name: "自定义",
      icon: "🎨",
      background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
    },
  };

  const theme = themes[currentTheme];
  const config = themeConfigs[currentTheme];

  const list = [
    {"id":"123","children":[{"id":1,"type":"group","data":{"name":"常用软件"},"config":{"col":2},"children":[{"id":"app1","type":"app","data":{"name":"Chrome","icon":"https://placehold.co/100x100/4285F4/FFFFFF?text=Chrome"}},{"id":"app2","type":"app","data":{"name":"VS Code","icon":"https://placehold.co/100x100/007ACC/FFFFFF?text=VSCode"}},{"id":"app3","type":"app","data":{"name":"Photoshop","icon":"https://placehold.co/100x100/31A8FF/FFFFFF?text=PS"}},{"id":"app4","type":"app","data":{"name":"Figma","icon":"https://placehold.co/100x100/F24E1E/FFFFFF?text=Figma"}},{"id":"app5","type":"app","data":{"name":"Sketch","icon":"https://placehold.co/100x100/FDB300/FFFFFF?text=Sketch"}},{"id":"app6","type":"app","data":{"name":"Notion","icon":"https://placehold.co/100x100/000000/FFFFFF?text=Notion"}}]},{"id":2,"type":"app","data":{"name":"微信","icon":"https://placehold.co/100x100/07C160/FFFFFF?text=WeChat"}},{"id":3,"type":"app","data":{"name":"支付宝","icon":"https://placehold.co/100x100/1677FF/FFFFFF?text=Alipay"}},{"id":4,"type":"app","data":{"name":"钉钉","icon":"https://placehold.co/100x100/2E7CF6/FFFFFF?text=DingTalk"}},{"id":5,"type":"app","data":{"name":"QQ","icon":"https://placehold.co/100x100/12B7F5/FFFFFF?text=QQ"}}]},
    {"id":"12313eqw","children":[{"id":90,"type":"app","data":{"name":"GitHub","icon":"https://placehold.co/100x100/181717/FFFFFF?text=GitHub"}},{"id":91,"type":"app","data":{"name":"Docker","icon":"https://placehold.co/100x100/2496ED/FFFFFF?text=Docker"}},{"id":92,"type":"app","data":{"name":"Postman","icon":"https://placehold.co/100x100/FF6C37/FFFFFF?text=Postman"}},{"id":95,"type":"app","data":{"name":"Terminal","icon":"https://placehold.co/100x100/000000/FFFFFF?text=Terminal"}},{"id":96,"type":"app","data":{"name":"Xcode","icon":"https://placehold.co/100x100/1575F9/FFFFFF?text=Xcode"}}]},
    {"id":"office_group","children":[{"id":100,"type":"group","data":{"name":"办公套件"},"config":{"col":3},"children":[{"id":"word","type":"app","data":{"name":"Word","icon":"https://placehold.co/100x100/2B579A/FFFFFF?text=Word"}},{"id":"excel","type":"app","data":{"name":"Excel","icon":"https://placehold.co/100x100/217346/FFFFFF?text=Excel"}},{"id":"ppt","type":"app","data":{"name":"PowerPoint","icon":"https://placehold.co/100x100/D24726/FFFFFF?text=PPT"}},{"id":"outlook","type":"app","data":{"name":"Outlook","icon":"https://placehold.co/100x100/0078D4/FFFFFF?text=Outlook"}},{"id":"teams","type":"app","data":{"name":"Teams","icon":"https://placehold.co/100x100/6264A7/FFFFFF?text=Teams"}},{"id":"onenote","type":"app","data":{"name":"OneNote","icon":"https://placehold.co/100x100/7719AA/FFFFFF?text=OneNote"}}]},{"id":101,"type":"app","data":{"name":"Slack","icon":"https://placehold.co/100x100/4A154B/FFFFFF?text=Slack"}},{"id":102,"type":"app","data":{"name":"Zoom","icon":"https://placehold.co/100x100/2D8CFF/FFFFFF?text=Zoom"}}]},
    {"id":"media_group","children":[{"id":200,"type":"group","data":{"name":"多媒体"},"config":{"col":2},"children":[{"id":"spotify","type":"app","data":{"name":"Spotify","icon":"https://placehold.co/100x100/1DB954/FFFFFF?text=Spotify"}},{"id":"netflix","type":"app","data":{"name":"Netflix","icon":"https://placehold.co/100x100/E50914/FFFFFF?text=Netflix"}},{"id":"youtube","type":"app","data":{"name":"YouTube","icon":"https://placehold.co/100x100/FF0000/FFFFFF?text=YouTube"}},{"id":"vlc","type":"app","data":{"name":"VLC","icon":"https://placehold.co/100x100/FF8800/FFFFFF?text=VLC"}}]},{"id":201,"type":"app","data":{"name":"iTunes","icon":"https://placehold.co/100x100/FA57C1/FFFFFF?text=iTunes"}},{"id":202,"type":"app","data":{"name":"Steam","icon":"https://placehold.co/100x100/1B2838/FFFFFF?text=Steam"}}]},
    {"id":"1239137sdcsdc","type":"dock","children":[{"id":93,"type":"app","data":{"name":"新闻","icon":"https://placehold.co/100x100/E60012/FFFFFF?text=News"}},{"id":94,"type":"app","data":{"name":"音乐","icon":"https://placehold.co/100x100/FF1493/FFFFFF?text=Music"}},{"id":300,"type":"app","data":{"name":"设置","icon":"https://placehold.co/100x100/8E8E93/FFFFFF?text=Settings"}},{"id":301,"type":"app","data":{"name":"计算器","icon":"https://placehold.co/100x100/FF9500/FFFFFF?text=Calc"}},{"id":302,"type":"app","data":{"name":"日历","icon":"https://placehold.co/100x100/FC3D39/FFFFFF?text=Calendar"}}]}
  ];

  return (
    <div
      style={{
        background: config.background,
        height: "500px",
        padding: "20px",
        position: "relative",
      }}
    >
      {/* 主题切换按钮 */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          display: "flex",
          gap: "8px",
          zIndex: 1000,
        }}
      >
        {Object.keys(themes).map((themeKey) => {
          const isActive = currentTheme === themeKey;
          const btnConfig = themeConfigs[themeKey];

          return (
            <button
              key={themeKey}
              onClick={() => setCurrentTheme(themeKey)}
              style={{
                padding: "8px 16px",
                backgroundColor: isActive ? "#4a5568" : "#ffffff",
                color: isActive ? "#ffffff" : "#000000",
                border: `2px solid ${isActive ? "#4a5568" : "#e2e8f0"}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: isActive ? "bold" : "normal",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = "#f7fafc";
                  e.target.style.borderColor = "#cbd5e0";
                }
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = "#ffffff";
                  e.target.style.borderColor = "#e2e8f0";
                }
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              {btnConfig.icon} {btnConfig.name}
            </button>
          );
        })}
      </div>

      <Desktop list={list} theme={theme} enableCaching={false} />
    </div>
  );
};
```

## API

### Desktop Props

| 参数              | 说明                     | 类型                                                                           | 默认值                                                       |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| list              | 桌面项目列表数据         | `SortItem[]`                                                                   | `[]`                                                         |
| onChange          | 列表数据变更回调         | `(list: SortItem[]) => void`                                                   | -                                                            |
| onItemClick       | 项目点击事件             | `(item: SortItem) => void`                                                     | -                                                            |
| className         | 自定义样式类名           | `string`                                                                       | -                                                            |
| enableCaching     | 是否启用本地存储缓存     | `boolean`                                                                      | `true`                                                       |
| storageKey        | 本地存储的键名           | `string`                                                                       | `'ZS_LIBRARY_DESKTOP_SORTABLE_CONFIG'`                       |
| noLetters         | 是否隐藏文字（无字模式） | `boolean`                                                                      | `false`                                                      |
| theme             | 主题配置                 | `'light' \| 'dark' \| Theme`                                                   | `'light'`                                                    |
| typeConfigMap     | 类型配置映射表           | `TypeConfigMap`                                                                | -                                                            |
| contextMenu       | 右键菜单配置             | `ContextMenuProps \| ((data: SortItem) => ContextMenuProps \| false) \| false` | -                                                            |
| pagination        | 分页配置                 | `Pagination \| false`                                                          | `{ position: 'bottom' }`                                     |
| dock              | Dock 栏配置              | `DockConfig`                                                                   | `{ enabled: true, position: 'bottom', showLaunchpad: true }` |
| extraItems        | 自定义额外项目渲染       | `(listItem: SortItem) => React.ReactNode`                                      | -                                                            |
| itemBuilder       | 自定义项目渲染           | `(item: SortItem) => React.ReactNode`                                          | -                                                            |
| itemIconBuilder   | 自定义项目图标渲染       | `(item: SortItem) => React.ReactNode`                                          | -                                                            |
| pagingDotBuilder  | 自定义分页点渲染         | `(item: SortItem, index: number, isActive: boolean) => React.JSX.Element`      | -                                                            |
| pagingDotsBuilder | 自定义分页点容器渲染     | `(dots: React.ReactNode) => React.JSX.Element`                                 | -                                                            |
| sliderProps       | Slider 组件配置          | `Settings`                                                                     | -                                                            |

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
    /** 项目图标背景颜色 */
    itemIconBackgroundColor?: string;
    /** 项目图标阴影颜色 */
    itemIconShadowColor?: string;
    /** 分组项目图标背景颜色 */
    groupItemIconBackgroundColor?: string;
    /** 分组项目图标阴影颜色 */
    groupItemIconShadowColor?: string;
    /** 分组项目模态框背景颜色 */
    groupItemModalBackgroundColor?: string;
    /** 右键菜单文字颜色 */
    contextMenuTextColor?: string;
    /** 右键菜单激活颜色 */
    contextMenuActiveColor?: string;
    /** 右键菜单背景颜色 */
    contextMenuBackgroundColor?: string;
    /** 右键菜单阴影颜色 */
    contextMenuShadowColor?: string;
  };
}
```

#### 内置主题

```typescript
import {
  desktopThemeLight,
  desktopThemeDark,
  desktopDefaultTheme,
  desktopThemes
} from 'zs-library';

// 使用内置浅色主题
<Desktop theme="light" />
// 或
<Desktop theme={desktopThemeLight} />

// 使用内置深色主题
<Desktop theme="dark" />
// 或
<Desktop theme={desktopThemeDark} />

// 使用默认主题（浅色）
<Desktop theme={desktopDefaultTheme} />

// 自定义主题
const customTheme = {
  token: {
    itemNameColor: '#ff6b6b',
    itemIconBackgroundColor: '#4ecdc4',
    // ... 其他配置
  }
};
<Desktop theme={customTheme} />
```

### TypeConfigMap 类型配置

```typescript
type TypeConfigMap = Record<
  string,
  {
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
>;
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
