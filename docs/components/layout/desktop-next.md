# 桌面 (Motion)

基于 motion 实现的轻量级桌面组件，类似 iPadOS 桌面效果

## 依赖

```json
{
  "motion": "^12.23.6",
  "@emotion/css": "^11.13.0",
  "@floating-ui/react": "^0.27.13",
  "uuid": "^10.0.0",
  "rc-dialog": "^9.0.4"
}
```

## 功能

- 拖拽排序（网格布局，自动计算列数）
- 拖拽合并为文件夹（长按 app 拖拽到另一个 app 上）
- 拖拽添加到文件夹
- 文件夹弹窗查看内容
- 从文件夹弹窗拖出到主屏幕
- 多页分页（触摸滑动切换）
- 分页指示器
- 右键 / 长按上下文菜单（iPadOS 暗色玻璃风格）
- 按类型配置尺寸（如 1x1、2x2）

## 基本用法

```jsx
import { DesktopNext } from "zs_library";
import { useState } from "react";

// 自定义主题：薄荷绿
const mintTheme = {
  token: {
    base: {
      primaryColor: "#4ecdc4",
      backgroundColor: "rgba(78, 205, 196, 0.12)",
      textColor: "#ffffff",
      shadowColor: "rgba(78, 205, 196, 0.3)",
      borderColor: "rgba(78, 205, 196, 0.35)",
    },
  },
};

// 自定义主题：暖橙
const sunsetTheme = {
  token: {
    base: {
      primaryColor: "#ff6b35",
      backgroundColor: "rgba(255, 107, 53, 0.12)",
      textColor: "#ffffff",
      shadowColor: "rgba(255, 107, 53, 0.3)",
      borderColor: "rgba(255, 107, 53, 0.35)",
    },
  },
};

// 自定义主题：极光紫（精细配置各子项）
const auroraTheme = {
  token: {
    base: {
      primaryColor: "#a855f7",
      backgroundColor: "rgba(168, 85, 247, 0.12)",
      textColor: "#ffffff",
      shadowColor: "rgba(168, 85, 247, 0.3)",
      borderColor: "rgba(168, 85, 247, 0.35)",
    },
    contextMenu: {
      textColor: "#f3e8ff",
      activeColor: "rgba(168, 85, 247, 0.25)",
      dangerColor: "#f87171",
      backgroundColor: "rgba(30, 10, 50, 0.85)",
      shadowColor: "rgba(168, 85, 247, 0.4)",
      borderColor: "rgba(168, 85, 247, 0.3)",
    },
    dock: {
      backgroundColor: "rgba(30, 10, 50, 0.6)",
      borderColor: "rgba(168, 85, 247, 0.3)",
      boxShadowColor: "rgba(168, 85, 247, 0.25)",
    },
  },
};

const themeMap = {
  dark: "dark",
  light: "light",
  mint: mintTheme,
  sunset: sunsetTheme,
  aurora: auroraTheme,
};

const themeConfigs = {
  dark:    { label: "🌙 深色",   background: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)" },
  light:   { label: "☀️ 浅色",   background: "linear-gradient(135deg, #4a90d9 0%, #357abd 100%)" },
  mint:    { label: "🌿 薄荷",   background: "linear-gradient(135deg, #0f766e 0%, #134e4a 100%)" },
  sunset:  { label: "🌅 暖橙",   background: "linear-gradient(135deg, #c2410c 0%, #7c2d12 100%)" },
  aurora:  { label: "✨ 极光",   background: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)" },
};

export default () => {
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [transition, setTransition] = useState("slide");

  const [pages, setPages] = useState([
    {
      id: "page-1",
      children: [
        { id: "app1", type: "app", data: { name: "Chrome", icon: "https://placehold.co/100x100/4285F4/FFFFFF?text=Chrome" } },
        { id: "app2", type: "app", data: { name: "VS Code", icon: "https://placehold.co/100x100/007ACC/FFFFFF?text=VSCode" } },
        { id: "app3", type: "app", data: { name: "Figma", icon: "https://placehold.co/100x100/F24E1E/FFFFFF?text=Figma" } },
        { id: "app4", type: "app", data: { name: "Slack", icon: "https://placehold.co/100x100/4A154B/FFFFFF?text=Slack" } },
        { id: "app5", type: "app", data: { name: "Notion", icon: "https://placehold.co/100x100/000000/FFFFFF?text=Notion" } },
        { id: "app6", type: "app", data: { name: "Spotify", icon: "https://placehold.co/100x100/1DB954/FFFFFF?text=Spotify" } },
        {
          id: "folder1",
          type: "group",
          data: { name: "工具" },
          children: [
            { id: "app7", type: "app", data: { name: "终端", icon: "https://placehold.co/100x100/333333/FFFFFF?text=Term" } },
            { id: "app8", type: "app", data: { name: "计算器", icon: "https://placehold.co/100x100/FF9500/FFFFFF?text=Calc" } },
          ],
        },
        { id: "app9", type: "app", data: { name: "Safari", icon: "https://placehold.co/100x100/006CFF/FFFFFF?text=Safari" } },
      ],
    },
    {
      id: "page-2",
      children: [
        { id: "app10", type: "app", data: { name: "邮件", icon: "https://placehold.co/100x100/007AFF/FFFFFF?text=Mail" } },
        { id: "app11", type: "app", data: { name: "日历", icon: "https://placehold.co/100x100/FF3B30/FFFFFF?text=Cal" } },
        { id: "app12", type: "app", data: { name: "相册", icon: "https://placehold.co/100x100/FF2D55/FFFFFF?text=Photos" } },
      ],
    },
  ]);

  const transitions = ["slide", "fade", "zoom", "cube"];

  const btnBase = {
    padding: "4px 12px",
    borderRadius: 6,
    border: "1px solid currentColor",
    cursor: "pointer",
    fontSize: 12,
    opacity: 0.55,
    transition: "all 0.2s",
    background: "transparent",
  };

  const btnActive = { ...btnBase, opacity: 1, fontWeight: 600 };
  const btnInactive = { ...btnBase };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 8px" }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.5, marginRight: 4 }}>主题</span>
          {Object.keys(themeConfigs).map((key) => (
            <button
              key={key}
              style={currentTheme === key ? btnActive : btnInactive}
              onClick={() => setCurrentTheme(key)}
            >
              {themeConfigs[key].label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.5, marginRight: 4 }}>翻页</span>
          {transitions.map((tr) => (
            <button key={tr} style={transition === tr ? btnActive : btnInactive} onClick={() => setTransition(tr)}>
              {tr}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: "100%", height: 500, background: themeConfigs[currentTheme].background, borderRadius: 16, transition: "background 0.4s ease" }}>
        <DesktopNext
          pages={pages}
          onChange={setPages}
          iconSize={64}
          theme={themeMap[currentTheme]}
          pageTransition={transition}
          onItemClick={(item) => console.log("clicked:", item.data?.name)}
          dockProps={{
            showLaunchpad: true,
            fixedItems: [
              { id: "settings", type: "app", data: { name: "设置", icon: "https://placehold.co/100x100/8E8E93/FFFFFF?text=S" } },
            ],
          }}
        />
      </div>
    </div>
  );
};
```

## 自定义图标渲染

```jsx
import { DesktopNext } from "zs_library";
import { useState } from "react";

export default () => {
  const [pages, setPages] = useState([
    {
      id: "page-1",
      children: [
        { id: "1", type: "app", data: { name: "App A", icon: "https://placehold.co/100x100/FF6B6B/FFFFFF?text=A" } },
        { id: "2", type: "app", data: { name: "App B", icon: "https://placehold.co/100x100/4ECDC4/FFFFFF?text=B" } },
        { id: "3", type: "app", data: { name: "App C", icon: "https://placehold.co/100x100/45B7D1/FFFFFF?text=C" } },
      ],
    },
  ]);

  return (
    <div style={{ width: "100%", height: 400, background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", borderRadius: 16 }}>
      <DesktopNext
        pages={pages}
        onChange={setPages}
        itemIconBuilder={(item) => (
          <div style={{
            width: "100%",
            height: "100%",
            borderRadius: 16,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, #e0e5ec, #ffffff)",
            boxShadow: "4px 4px 8px #b8bec7, -4px -4px 8px #ffffff",
          }}>
            {item.data?.icon ? (
              <img src={item.data.icon} alt="" style={{ width: "60%", height: "60%", objectFit: "cover", borderRadius: 8 }} />
            ) : (
              <span style={{ fontSize: 24 }}>{(item.data?.name ?? "?").charAt(0)}</span>
            )}
            <span style={{ fontSize: 10, marginTop: 4, color: "#333" }}>{item.data?.name}</span>
          </div>
        )}
      />
    </div>
  );
};
```

## 组件注册表 (componentRegistry)

除了使用 `itemIconBuilder` 手动判断类型，还可以通过 `componentRegistry` 按 `item.type` 注册组件，支持本地 React 组件、静态图片 URL 和远程 ES Module URL 三种方式。对于需要完全自定义渲染的场景，`itemBuilder` 仍然可用。

### 本地组件注册

```jsx
import { DesktopNext } from "zs_library";
import { useState } from "react";

const ChartWidget = ({ item }) => (
  <div style={{
    width: "100%", height: "100%", borderRadius: 16,
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", color: "#fff",
  }}>
    <div style={{ fontSize: 28 }}>📊</div>
    <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85 }}>{item.data?.name}</div>
  </div>
);

const WeatherWidget = ({ item }) => (
  <div style={{
    width: "100%", height: "100%", borderRadius: 16,
    background: "linear-gradient(135deg, #74b9ff, #0984e3)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", color: "#fff",
  }}>
    <div style={{ fontSize: 28 }}>🌤</div>
    <div style={{ fontSize: 16, fontWeight: 600 }}>24°</div>
    <div style={{ fontSize: 11, opacity: 0.85 }}>{item.data?.name}</div>
  </div>
);

export default () => {
  const [pages, setPages] = useState([{
    id: "page-1",
    children: [
      { id: "w1", type: "chart", data: { name: "收入统计" } },
      { id: "w2", type: "weather", data: { name: "上海天气" } },
      { id: "w3", type: "app", data: { name: "Chrome", icon: "https://placehold.co/100x100/4285F4/FFFFFF?text=C" } },
    ],
  }]);

  return (
    <div style={{ width: "100%", height: 400, background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 16 }}>
      <DesktopNext
        pages={pages}
        onChange={setPages}
        componentRegistry={{
          chart: {
            name: "图表组件",
            sizeConfigs: [
              { id: "1x1", name: "小", col: 1, row: 1 },
              { id: "2x2", name: "标准", col: 2, row: 2 },
            ],
            defaultSizeId: "2x2",
            component: ChartWidget,
          },
          weather: {
            name: "天气组件",
            sizeConfigs: [{ id: "2x1", name: "宽条", col: 2, row: 1 }],
            component: WeatherWidget,
          },
        }}
      />
    </div>
  );
};
```

### 图片 URL 注册

类型键对应的 item 会自动渲染注册的图标，无需编写渲染逻辑：

```jsx
import { DesktopNext } from "zs_library";
import { useState } from "react";

export default () => {
  const [pages, setPages] = useState([{
    id: "page-1",
    children: [
      { id: "m1", type: "music", data: { name: "音乐" } },
      { id: "m2", type: "mail", data: { name: "邮件" } },
      { id: "m3", type: "music", data: { name: "播客" } },
    ],
  }]);

  return (
    <div style={{ width: "100%", height: 400, background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 16 }}>
      <DesktopNext
        pages={pages}
        onChange={setPages}
        componentRegistry={{
          music: {
            name: "音乐",
            iconUrl: "https://placehold.co/100x100/1DB954/FFFFFF?text=%E2%99%AA",
          },
          mail: {
            name: "邮件",
            iconUrl: "https://placehold.co/100x100/007AFF/FFFFFF?text=%E2%9C%89",
          },
        }}
      />
    </div>
  );
};
```

`type: "music"` 或 `type: "mail"` 的 item 会自动渲染对应的注册图标。

### 远程 ES Module 注册

通过 `remoteUrl` 指定远程 JS 文件地址，组件在首次渲染时动态加载。远程文件须通过 `window.React` 访问 React，并 `export default` 一个接收 `{ item }` 的组件。`iconUrl` 在加载期间作为占位展示；加载失败会抛给最近的 ErrorBoundary。

下面用 Blob URL 在浏览器内模拟一个"远程"模块，与真实 CDN 地址行为完全一致：

```jsx
import { DesktopNext } from "zs_library";
import React, { useState, useMemo } from "react";

const REMOTE_CHART_CODE = `
const React = window.React;
const ChartWidget = ({ item }) =>
  React.createElement(
    "div",
    {
      style: {
        width: "100%", height: "100%", borderRadius: 16,
        background: "linear-gradient(135deg, #6C5CE7, #a29bfe)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", color: "#fff",
        gap: 4,
      },
    },
    React.createElement("div", { style: { fontSize: 28 } }, "📊"),
    React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } }, item.data?.name ?? "图表"),
    React.createElement("div", { style: { fontSize: 11, opacity: 0.75 } }, "远程加载 ✓")
  );
export default ChartWidget;
`;

export default () => {
  window.React = React;

  const remoteBlobUrl = useMemo(() => {
    const blob = new Blob([REMOTE_CHART_CODE], { type: "application/javascript" });
    return URL.createObjectURL(blob);
  }, []);

  const [pages, setPages] = useState([{
    id: "page-1",
    children: [
      { id: "r1", type: "remote-chart", data: { name: "收入统计" } },
      { id: "r2", type: "remote-chart", data: { name: "销售数据" } },
      { id: "a1", type: "app", data: { name: "Chrome", icon: "https://placehold.co/100x100/4285F4/FFFFFF?text=C" } },
    ],
  }]);

  return (
    <div style={{ width: "100%", height: 400, background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 16 }}>
      <DesktopNext
        pages={pages}
        onChange={setPages}
        componentRegistry={{
          "remote-chart": {
            name: "远程图表",
            remoteUrl: remoteBlobUrl,
            iconUrl: "https://placehold.co/100x100/6C5CE7/FFFFFF?text=%E2%9A%A1",
          },
        }}
      />
    </div>
  );
};
```

## 持久化布局

通过 `storageKey` 将分页数据自动保存到 `localStorage`，页面刷新后恢复上次布局：

```jsx
import { DesktopNext } from "zs_library";
import { useState } from "react";

export default () => {
  const [pages, setPages] = useState([{
    id: "page-1",
    children: [
      { id: "app1", type: "app", data: { name: "Chrome", icon: "https://placehold.co/100x100/4285F4/FFFFFF?text=C" } },
      { id: "app2", type: "app", data: { name: "VS Code", icon: "https://placehold.co/100x100/007ACC/FFFFFF?text=VS" } },
      { id: "app3", type: "app", data: { name: "Figma", icon: "https://placehold.co/100x100/F24E1E/FFFFFF?text=F" } },
    ],
  }]);

  return (
    <div style={{ width: "100%", height: 400, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: 16 }}>
      <DesktopNext
        pages={pages}
        onChange={setPages}
        storageKey="my-desktop-layout"
      />
    </div>
  );
};
```

## API

### DesktopNextExtendedProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| pages | `DndPageItem<D>[]` | - | 分页数据（受控） |
| onChange | `(pages: DndPageItem<D>[]) => void` | - | 数据变化回调 |
| iconSize | `number` | `64` | 图标尺寸（px） |
| onItemClick | `(item: DndSortItem<D>) => void` | - | 点击 item 回调 |
| itemIconBuilder | `(item: DndSortItem<D>) => ReactNode` | - | 自定义图标渲染 |
| className | `string` | - | 容器 className |
| maxPages | `number` | - | 最大页数 |
| mergeDwellTime | `number` | `500` | 合并检测延迟（ms） |
| typeConfigMap | `TypeConfigMap` | - | 按类型控制尺寸、是否允许菜单/删除 |
| dataTypeMenuConfigMap | `DataTypeMenuConfigMap` | - | 按 `dataType` 配置自定义菜单 |
| onRemoveClick | `(item: DndSortItem<D>) => void` | - | 点击"移除"回调，默认行为是删除 |
| onContextMenuItemClick | `(item: DndSortItem<D>, payload: ContextMenuActionPayload) => void` | - | 菜单点击总回调 |
| contextMenuProps | `DesktopNextContextMenuProps` | - | 控制内置菜单项显隐 |
| theme | `'light' \| 'dark' \| Theme` | `'dark'` | 主题配置（默认深色，iPadOS 风格） |
| noLetters | `boolean` | `false` | 是否隐藏图标文字 |
| storageKey | `string` | - | 本地存储键名，启用后自动持久化分页数据 |
| itemBuilder | `(item: DndSortItem<D>, index: number) => ReactNode \| null` | - | 自定义完整 item 渲染 |
| itemBuilderAllowNull | `boolean` | - | itemBuilder 返回 null 时是否跳过渲染 |
| itemIconBuilderAllowNull | `boolean` | - | itemIconBuilder 返回 null 时是否跳过渲染 |
| pagingDotBuilder | `(index: number, isActive: boolean) => ReactNode` | - | 自定义分页点渲染 |
| pagingDotsBuilder | `(dots: ReactNode[]) => ReactNode` | - | 自定义分页点容器渲染 |
| extraItems | `DndSortItem<D>[]` | - | 额外附加的 item 数据（通过 context 透传） |
| dockProps | `DockProps` | - | Dock 栏配置，传入后渲染底部 Dock |
| componentRegistry | `ComponentRegistry` | - | 组件注册表，按 `item.type` 匹配自动渲染；自动合并 size/permission 配置到 typeConfigMap |

### DockProps

```typescript
interface DockProps {
  items?: DndSortItem[];
  fixedItems?: DndSortItem[];
  position?: 'bottom' | 'top';
  showLaunchpad?: boolean;
  itemBuilder?: (item: DndSortItem, index: number) => ReactNode;
  theme?: Theme;
  className?: string;
}
```

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| items | `DndSortItem[]` | Dock 项目列表（来自桌面页面数据中的 dock 页） |
| fixedItems | `DndSortItem[]` | 固定项目（始终显示在 Dock 左侧，不可拖拽） |
| position | `'bottom' \| 'top'` | Dock 位置 |
| showLaunchpad | `boolean` | 是否显示启动台按钮 |
| itemBuilder | `(item: DndSortItem, index: number) => ReactNode` | 自定义 Dock 项目渲染 |
| theme | `Theme` | 主题（不传时继承桌面 theme） |
| className | `string` | 自定义样式类名 |

### DndPageItem

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| id | `string \| number` | 页面唯一 ID |
| children | `DndSortItem<D>[]` | 页面内的 item 列表 |

> 注意：`DndPageItem` 没有 `type: "dock"` 字段。Dock 项目通过 `dockProps.items` 单独传入，不混入分页数据。

### DndSortItem

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| id | `string \| number` | 唯一 ID |
| type | `"app" \| "group"` | `app` 普通项 / `group` 文件夹 |
| dataType | `string` | 自定义数据类型（用于自定义菜单匹配） |
| config | `SortItemUserConfig` | 用户配置（如 `sizeId`） |
| data | `D & DndItemBaseData` | 数据（需包含 `name`，可选 `icon`、`iconColor`） |
| children | `DndSortItem<D>[]` | 文件夹子项（仅 `type: "group"` 时有效） |

### DndItemBaseData

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| name | `string` | 名称 |
| icon | `string` | 图标 URL |
| iconColor | `string` | 图标背景色 |

### Theme 主题配置

默认主题为深色（iPadOS 风格），可通过 `theme` 属性切换为浅色或传入自定义主题对象。

```typescript
interface Theme {
  token: {
    base?: {
      primaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
      shadowColor?: string;
      borderColor?: string;
    };
    contextMenu?: {
      textColor?: string;
      activeColor?: string;
      dangerColor?: string;
      backgroundColor?: string;
      shadowColor?: string;
      borderColor?: string;
    };
    items?: {
      textColor?: string;
      iconBackgroundColor?: string;
      iconShadowColor?: string;
      groupIconBackgroundColor?: string;
      groupIconShadowColor?: string;
      groupModalBackgroundColor?: string;
      infoModalBackgroundColor?: string;
    };
    dock?: {
      backgroundColor?: string;
      borderColor?: string;
      boxShadowColor?: string;
      divider?: {
        color?: string;
      };
    };
    modal?: {
      mask?: {
        backgroundColor?: string;
        backdropFilter?: string;
      };
      content?: {
        backgroundColor?: string;
        backdropFilter?: string;
        boxShadowColor?: string;
        boxShadowBorderColor?: string;
        borderColor?: string;
        borderRadius?: string;
      };
      header?: {
        backgroundColor?: string;
        textColor?: string;
      };
      body?: {
        backgroundColor?: string;
      };
      scrollbar?: {
        width?: string;
        trackColor?: string;
        thumbColor?: string;
        thumbHoverColor?: string;
        borderRadius?: string;
      };
    };
  };
}
```

#### 内置主题

```typescript
import {
  desktopNextThemeLight,
  desktopNextThemeDark,
  desktopNextDefaultTheme,
  desktopNextThemes,
} from 'zs_library';

// 使用内置浅色主题
<DesktopNext theme="light" />

// 使用内置深色主题（默认）
<DesktopNext theme="dark" />

// 自定义主题
const customTheme = {
  token: {
    base: {
      primaryColor: '#4ecdc4',
      backgroundColor: 'rgba(78, 205, 196, 0.1)',
      textColor: '#2c3e50',
      shadowColor: 'rgba(255, 107, 107, 0.2)',
      borderColor: 'rgba(78, 205, 196, 0.3)',
    },
    contextMenu: {
      textColor: '#2c3e50',
      activeColor: '#ecf0f1',
      dangerColor: '#ff3b30',
      backgroundColor: '#ffffff',
      shadowColor: 'rgba(255, 107, 107, 0.2)',
      borderColor: 'rgba(78, 205, 196, 0.3)',
    },
  }
};
<DesktopNext theme={customTheme} />

// 或者只配置 base，其他全部自动生成
const simpleTheme = {
  token: {
    base: {
      primaryColor: '#ff6b6b',
      textColor: '#2c3e50',
    },
  }
};
<DesktopNext theme={simpleTheme} />
```

### TypeConfigMap 类型配置

```typescript
type TypeConfigMap = Record<
  string,
  {
    sizeConfigs: SizeConfig[];
    defaultSizeId: string;
    allowResize: boolean;
    allowContextMenu: boolean;
    allowShare: boolean;
    allowDelete: boolean;
    allowInfo: boolean;
  }
>;
```

### ComponentRegistry 组件注册表

```typescript
type ComponentRegistry = Record<string, ComponentRegistryEntry>;

interface ComponentRegistryEntry {
  name: string;
  sizeConfigs?: SizeConfig[];
  defaultSizeId?: string;
  allowResize?: boolean;
  allowContextMenu?: boolean;
  allowShare?: boolean;
  allowDelete?: boolean;
  allowInfo?: boolean;
  component?: React.ComponentType<{ item: DndSortItem }>;
  iconUrl?: string;
  remoteUrl?: string;
  meta?: Record<string, unknown>;
}
```

渲染优先级为 `component` > `remoteUrl` > `iconUrl`。注册表中的条目会自动合并到 `typeConfigMap`，无需重复配置。若 `typeConfigMap` 中已有相同类型键的显式配置，则以 `typeConfigMap` 为准。

### DesktopHandle 实例引用

通过 `ref` 获取桌面组件实例，可读取当前分页状态或命令式跳转页面：

```typescript
interface DesktopHandle {
  pages: DndPageItem[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}
```

```jsx
import { DesktopNext } from "zs_library";
import { useState, useRef } from "react";

export default () => {
  const desktopRef = useRef();
  const [pages, setPages] = useState([{
    id: "page-1",
    children: [
      { id: "app1", type: "app", data: { name: "Chrome", icon: "https://placehold.co/100x100/4285F4/FFFFFF?text=C" } },
      { id: "app2", type: "app", data: { name: "VS Code", icon: "https://placehold.co/100x100/007ACC/FFFFFF?text=VS" } },
    ],
  }]);

  return (
    <div style={{ width: "100%", height: 400, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: 16 }}>
      <DesktopNext ref={desktopRef} pages={pages} onChange={setPages} />
    </div>
  );
};

// 访问实例
// const { pages, currentPage } = desktopRef.current;
```

## 交互说明

- **拖拽排序**: 长按 item 后拖拽可重新排序
- **创建文件夹**: 将一个 app 拖拽到另一个 app 上悬停，自动合并为文件夹
- **添加到文件夹**: 将 app 拖拽到已有文件夹上
- **查看文件夹**: 点击文件夹打开弹窗查看内容
- **拖出文件夹**: 在文件夹弹窗中长按 item 拖拽到弹窗外，item 回到主屏幕
- **切换分页**: 触摸滑动左右切换页面，或点击底部分页指示器
