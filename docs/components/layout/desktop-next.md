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

- 拖到指定格子，支持空位和多格组件
- 自动计算行列数，也可分别指定固定行数或列数
- 页面空间不足时自动分页
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
  const [indicator, setIndicator] = useState("pill");

  const [pages, setPages] = useState([
    {
      id: "page-1",
      children: [
        { id: "app1", position: { row: 0, col: 0 }, type: "app", data: { name: "Chrome", icon: "https://placehold.co/100x100/4285F4/FFFFFF?text=Chrome" } },
        { id: "app2", position: { row: 0, col: 2 }, type: "app", data: { name: "VS Code", icon: "https://placehold.co/100x100/007ACC/FFFFFF?text=VSCode" } },
        { id: "app3", position: { row: 0, col: 3 }, type: "app", data: { name: "Figma", icon: "https://placehold.co/100x100/F24E1E/FFFFFF?text=Figma" } },
        { id: "app4", position: { row: 1, col: 0 }, type: "app", data: { name: "Slack", icon: "https://placehold.co/100x100/4A154B/FFFFFF?text=Slack" } },
        { id: "app5", position: { row: 1, col: 1 }, type: "app", data: { name: "Notion", icon: "https://placehold.co/100x100/000000/FFFFFF?text=Notion" } },
        { id: "app6", position: { row: 1, col: 2 }, type: "app", data: { name: "Spotify", icon: "https://placehold.co/100x100/1DB954/FFFFFF?text=Spotify" } },
        {
          id: "folder1",
          position: { row: 1, col: 3 },
          type: "group",
          data: { name: "工具" },
          children: [
            { id: "app7", type: "app", data: { name: "终端", icon: "https://placehold.co/100x100/333333/FFFFFF?text=Term" } },
            { id: "app8", type: "app", data: { name: "计算器", icon: "https://placehold.co/100x100/FF9500/FFFFFF?text=Calc" } },
          ],
        },
        { id: "app9", position: { row: 2, col: 0 }, type: "app", data: { name: "Safari", icon: "https://placehold.co/100x100/006CFF/FFFFFF?text=Safari" } },
        { id: "app10", position: { row: 2, col: 1 }, type: "app", data: { name: "邮件", icon: "https://placehold.co/100x100/007AFF/FFFFFF?text=Mail" } },
        { id: "app11", position: { row: 2, col: 2 }, type: "app", data: { name: "日历", icon: "https://placehold.co/100x100/FF3B30/FFFFFF?text=Cal" } },
        { id: "app12", position: { row: 2, col: 3 }, type: "app", data: { name: "相册", icon: "https://placehold.co/100x100/FF2D55/FFFFFF?text=Photos" } },
      ],
    },
    {
      id: "page-2",
      children: [
        { id: "app13", position: { row: 0, col: 0 }, type: "app", data: { name: "备忘录", icon: "📝" } },
        { id: "app14", position: { row: 0, col: 1 }, type: "app", data: { name: "时钟", icon: "🕒" } },
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
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.5, marginRight: 4 }}>分页指示器</span>
          {Object.entries({ pill: "胶囊", dots: "圆点", bars: "短条" }).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={indicator === value}
              style={indicator === value ? btnActive : btnInactive} onClick={() => setIndicator(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: "100%", height: "clamp(280px, 60vh, 560px)", background: themeConfigs[currentTheme].background, borderRadius: 16, transition: "background 0.4s ease" }}>
        <DesktopNext
          pages={pages}
          onChange={setPages}
          grid={{ mobile: { columns: 4, rows: 5 } }}
          iconSize={64}
          theme={themeMap[currentTheme]}
          pageTransition={transition}
          pagination={{ variant: indicator }}
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

## 行列、空位与自动分页

每个桌面项目通过 `position: { row, col }` 指定左上角，行列从 0 开始。例如同一行的两个图标分别设置 `col: 0` 和 `col: 2`，中间就会留出一个空格。文件夹内部沿用数组顺序。

```tsx pure
<DesktopNext
  pages={pages}
  onChange={setPages}
  grid={{ mobile: { columns: 4, rows: 5 } }}
  autoPaginate
  preserveGaps
/>
```

桌面端根据组件可用宽高和 `iconSize` 自动计算行列数。缩窄桌面窗口或侧栏时，图标会随可用空间重新分页。可用 `grid.columns` 和 `grid.rows` 分别固定一项或两项。主要使用触摸、没有悬停功能的设备默认显示 4 列 5 行，横屏和竖屏均使用配置的行列数。`grid.mobile` 优先于顶层行列配置。固定行列时，组件会按需要缩小图标和格子。

每个手动页独立分页。窗口缩小时，组件保留放得下的项目，为越界项目寻找连续空位，空间不足时在源页后增加自动页。窗口放大后，组件优先恢复项目原来的位置，收回已空的自动页。手动分页和用户保留的空位可以在源位置恢复。达到 `maxPages` 后，每组的最后一页可纵向滚动。项目的显示跨度最多占满一页。

将图标拖到另一个图标的边缘，周围图标会在按住期间移动，预览插入后的顺序。松手即放到预览位置。拖到空格可直接放置并在原位留空，按 Esc 可撤销本次拖动。进入图标中央会暂停排序，桌面保持此时的位置。看到合并提示后松手，可在目标图标所在的格子创建文件夹或加入已有文件夹。提示出现前松手，保留上一次已确认的落点。

拖动 2×2 文件夹或多格小组件时，网格按整个图标的覆盖范围吸附。同页拖动优先向原位置腾出的方向逐格推移，遇到相邻图标时一起让位，保留行内或列内的先后顺序。边界挡住时会尝试其他方向，再尝试成组或分别移入空位。

尺寸变化引起的重排会通过 `onChange` 提交。持久化时请保留回调返回的完整分页数据。调用 `ref.current?.arrange()` 可填补空位并合并多余页面。需要始终紧凑排列时可设置 `preserveGaps={false}`。

## 分页指示器

默认使用胶囊样式。点击分页点时，高亮标记滑到目标页；拖动页面时，高亮随滑动进度移动。系统开启减少动态效果时，点击后直接切换高亮。下方示例可切换预设并点击分页点体验。

```jsx
import { useState } from "react";
import { DesktopNext } from "zs_library";

export default () => {
  const [variant, setVariant] = useState("pill");
  const [pages, setPages] = useState(() => ["工作", "工具", "生活"].map((name, index) => ({
    id: index,
    children: [{ id: name, type: "app", data: { name }, position: { row: 0, col: 0 } }],
  })));

  return (
    <div>
      <label>
        指示器样式{" "}
        <select value={variant} onChange={event => setVariant(event.target.value)}>
          <option value="pill">胶囊</option>
          <option value="dots">圆点</option>
          <option value="bars">短条</option>
        </select>
      </label>
      <div style={{ height: 180, marginTop: 8, borderRadius: 12, background: "#303b4c" }}>
        <DesktopNext pages={pages} onChange={setPages} iconSize={40}
          pagination={{ variant, activeColor: "#fff", inactiveColor: "#8993a3" }} />
      </div>
    </div>
  );
};
```

设置 `pagination={false}` 或 `pagination={{ visible: false }}` 可隐藏指示器。要显示页码或使用自己的容器，可以通过 `pagingDotBuilder` 绘制单项，通过 `pagingDotsBuilder` 排列这些单项。自定义单项可调用第三个参数 `selectPage` 跳转到对应页面。

```tsx pure
<DesktopNext
  pages={pages}
  onChange={setPages}
  pagingDotBuilder={(index, active, selectPage) => (
    <button type="button" onClick={selectPage} aria-current={active ? "page" : undefined}
      style={{ fontWeight: active ? 700 : 400 }}>
      {index + 1}
    </button>
  )}
  pagingDotsBuilder={dots => <div style={{ display: "flex", gap: 8 }}>{dots}</div>}
/>
```

## 转换旧版数据

在加载旧数据时调用 `convertLegacyDesktopPages`，将返回值交给组件。传入旧桌面的实际列数，可同时传入原来的 `typeConfigMap` 或 `componentRegistry`，以还原多格组件的位置。

```ts
import { convertLegacyDesktopPages } from "zs_library";

const pages = convertLegacyDesktopPages(oldPages, { columns: 4 });
```

只传 `columns` 时沿用原分页。再传 `rows` 可在转换时按容量分页。使用 `storageKey` 的应用可将旧键的数据读出、转换并存入新键，再用新键挂载桌面。

```ts
const saved = localStorage.getItem("my-desktop-layout");
if (saved && localStorage.getItem("my-desktop-layout-v2") === null) {
  const migrated = convertLegacyDesktopPages(JSON.parse(saved), { columns: 4 });
  localStorage.setItem("my-desktop-layout-v2", JSON.stringify(migrated));
}
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
        { id: "1", position: { row: 0, col: 0 }, type: "app", data: { name: "App A", icon: "https://placehold.co/100x100/FF6B6B/FFFFFF?text=A" } },
        { id: "2", position: { row: 0, col: 1 }, type: "app", data: { name: "App B", icon: "https://placehold.co/100x100/4ECDC4/FFFFFF?text=B" } },
        { id: "3", position: { row: 0, col: 2 }, type: "app", data: { name: "App C", icon: "https://placehold.co/100x100/45B7D1/FFFFFF?text=C" } },
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
      { id: "w1", position: { row: 0, col: 0 }, type: "chart", data: { name: "收入统计" } },
      { id: "w2", position: { row: 0, col: 2 }, type: "weather", data: { name: "上海天气" } },
      { id: "w3", position: { row: 1, col: 2 }, type: "app", data: { name: "Chrome", icon: "https://placehold.co/100x100/4285F4/FFFFFF?text=C" } },
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
      { id: "m1", position: { row: 0, col: 0 }, type: "music", data: { name: "音乐" } },
      { id: "m2", position: { row: 0, col: 1 }, type: "mail", data: { name: "邮件" } },
      { id: "m3", position: { row: 0, col: 2 }, type: "music", data: { name: "播客" } },
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
      { id: "r1", position: { row: 0, col: 0 }, type: "remote-chart", data: { name: "收入统计" } },
      { id: "r2", position: { row: 0, col: 1 }, type: "remote-chart", data: { name: "销售数据" } },
      { id: "a1", position: { row: 0, col: 2 }, type: "app", data: { name: "Chrome", icon: "https://placehold.co/100x100/4285F4/FFFFFF?text=C" } },
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
      { id: "app1", position: { row: 0, col: 0 }, type: "app", data: { name: "Chrome", icon: "https://placehold.co/100x100/4285F4/FFFFFF?text=C" } },
      { id: "app2", position: { row: 0, col: 1 }, type: "app", data: { name: "VS Code", icon: "https://placehold.co/100x100/007ACC/FFFFFF?text=VS" } },
      { id: "app3", position: { row: 0, col: 2 }, type: "app", data: { name: "Figma", icon: "https://placehold.co/100x100/F24E1E/FFFFFF?text=F" } },
    ],
  }]);

  return (
    <div style={{ width: "100%", height: 400, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: 16 }}>
      <DesktopNext
        pages={pages}
        onChange={setPages}
        storageKey="my-desktop-layout-v2"
      />
    </div>
  );
};
```

## 浮动弹窗控制按钮

`DesktopNextBaseModal` 支持开启 iPadOS 风格的浮动关闭和全屏按钮。该能力默认关闭，内置的启动台、文件夹弹窗也不会自动开启；需要业务侧显式传入 `floatingControls`。

```jsx
import { DesktopNextBaseModal } from "zs_library";
import { useState } from "react";

export default () => {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
      <button
        type="button"
        onClick={() => setVisible(true)}
        style={{
          height: 36,
          padding: "0 16px",
          borderRadius: 8,
          border: "1px solid rgba(15, 23, 42, 0.18)",
          background: "#ffffff",
          cursor: "pointer",
        }}
      >
        打开弹窗
      </button>

      <DesktopNextBaseModal
        visible={visible}
        onClose={() => setVisible(false)}
        width={720}
        title="浮动控制示例"
        floatingControls
      >
        <div
          style={{
            minHeight: 260,
            display: "grid",
            placeItems: "center",
            borderRadius: 12,
            background:
              "linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(34, 197, 94, 0.16))",
            color: "rgba(255, 255, 255, 0.92)",
            textAlign: "center",
            padding: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>鼠标移到弹窗顶部</div>
            <div style={{ marginTop: 8, fontSize: 14, opacity: 0.72 }}>
              控制按钮会从半透明缩小状态恢复为完整显示，点击绿色按钮切换全屏。
            </div>
          </div>
        </div>
      </DesktopNextBaseModal>
    </div>
  );
};
```

也可以按需只显示其中一个按钮：

```jsx
<DesktopNextBaseModal
  visible={visible}
  onClose={() => setVisible(false)}
  floatingControls={{ close: true, fullscreen: false }}
>
  内容
</DesktopNextBaseModal>
```

## API

### DesktopNextExtendedProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| pages | `DndPageItem<D>[]` | - | 分页数据（受控） |
| onChange | `(pages: DndPageItem<D>[]) => void` | - | 数据变化回调 |
| grid | `DesktopGridConfig` | 桌面自动，移动端 4 列 5 行 | 顶层 rows、columns 可为正整数或 `"auto"`。mobile 可单独指定固定行列 |
| autoPaginate | `boolean` | `true` | 页面空间不足时换页。关闭时页面可纵向滚动 |
| preserveGaps | `boolean` | `true` | 保留空位。关闭时自动紧凑排列 |
| iconSize | `number` | `64` | 图标尺寸（px） |
| onItemClick | `(item: DndSortItem<D>) => void` | - | 点击 item 回调 |
| itemIconBuilder | `(item: DndSortItem<D>) => ReactNode` | - | 自定义图标渲染 |
| className | `string` | - | 容器 className |
| maxPages | `number` | - | 最大页数 |
| mergeDwellTime | `number` | `500` | 合并检测延迟（ms） |
| typeConfigMap | `TypeConfigMap` | - | 按类型控制尺寸、是否允许菜单/删除 |
| dataTypeMenuConfigMap | `DataTypeMenuConfigMap` | - | 按 `dataType` 配置自定义菜单 |
| onBeforeRemove | `(item: DndSortItem<D>) => boolean \| void \| Promise<boolean \| void>` | - | 移除动画和提交前确认；返回 `false` 或拒绝 Promise 时取消 |
| onRemoveClick | `(item: DndSortItem<D>) => void` | - | 点击"移除"回调，默认行为是删除 |
| onContextMenuItemClick | `(item: DndSortItem<D>, payload: ContextMenuActionPayload) => void` | - | 菜单点击总回调 |
| contextMenuProps | `DesktopNextContextMenuProps` | - | 控制内置菜单项显隐 |
| theme | `'light' \| 'dark' \| Theme` | `'dark'` | 主题配置（默认深色，iPadOS 风格） |
| noLetters | `boolean` | `false` | 是否隐藏图标文字 |
| storageKey | `string` | - | 本地存储键名，启用后自动持久化分页数据 |
| itemBuilder | `(item: DndSortItem<D>, index: number) => ReactNode \| null` | - | 自定义完整 item 渲染 |
| itemBuilderAllowNull | `boolean` | - | itemBuilder 返回 null 时是否跳过渲染 |
| itemIconBuilderAllowNull | `boolean` | - | itemIconBuilder 返回 null 时是否跳过渲染 |
| pagination | `false \| DesktopNextPagination` | `{ variant: "pill" }` | 支持 visible、variant（pill / dots / bars）、activeColor 和 inactiveColor |
| pagingDotBuilder | `(index: number, isActive: boolean, selectPage?: () => void) => ReactNode` | - | 自定义分页点渲染 |
| pagingDotsBuilder | `(dots: ReactNode[]) => ReactNode` | - | 自定义分页点容器渲染 |
| extraItems | `DndSortItem<D>[]` | - | 额外附加的 item 数据（通过 context 透传） |
| dockProps | `DockProps` | - | Dock 栏配置，传入后渲染底部 Dock |
| componentRegistry | `ComponentRegistry` | - | 组件注册表，按 `item.type` 匹配自动渲染；自动合并 size/permission 配置到 typeConfigMap |

### 移除前确认

`onBeforeRemove` 会在碎散动画和数据变更之前执行。同步返回 `false`、异步返回 `false`，或 Promise 被拒绝时，DesktopNext 会保留原项目并停止后续移除事件；返回 `true` 或 `void` 才会继续。

```tsx
const confirmRemove = (item: DndSortItem) =>
  new Promise<boolean>((resolve) => {
    openConfirmDialog({
      title: `移除“${item.data?.name ?? "应用"}”？`,
      onCancel: () => resolve(false),
      onConfirm: () => resolve(true),
    });
  });

<DesktopNext
  pages={pages}
  onChange={setPages}
  onBeforeRemove={confirmRemove}
/>;
```

`onRemoveClick` 仍保持原有的提交后自定义回调语义。只有实际提交移除时，`onContextMenuItemClick` 才会收到 `actionType: "remove"`。

### 国际化

通过全局 `ZsI18nProvider` 设置语言和文案覆盖。`DesktopNext` 默认内置 `zh-CN` 和 `en-US` 文案，默认文案维护在 `src/i18n/locales/desktop-next/`，只有使用 `DesktopNext` 时才会读取该组件的 namespace。

```tsx
import { DesktopNext, ZsI18nProvider, type DesktopNextI18n } from "zs_library";

const desktopI18n: DesktopNextI18n = {
  "en-US": {
    desktopNext: {
      contextMenu: {
        remove: "Delete",
      },
      launchpad: {
        searchPlaceholder: "Find apps",
      },
    },
  },
  "ja-JP": {
    desktopNext: {
      contextMenu: {
        remove: "削除",
        size: "サイズ",
      },
      launchpad: {
        searchPlaceholder: "アプリを検索",
        noSearchResults: "一致するアプリがありません",
        noApps: "アプリがありません",
        searchHint: "別のキーワードを試してください",
        emptyHint: "Launchpad にアプリを追加してください",
        close: "閉じる",
      },
      folder: {
        defaultName: "フォルダ",
        placeholder: "フォルダ",
      },
    },
  },
};

<ZsI18nProvider language="en-US" i18n={desktopI18n}>
  <DesktopNext pages={pages} onChange={setPages} />
</ZsI18nProvider>;
```

`ZsI18nProvider` 的 `i18n` 只作为各组件按需读取的资源覆盖池；未使用组件的 namespace 不会被注册到全局 i18next 实例。

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
| children | `PositionedItem<D>[]` | 桌面项目及其当前格子坐标 `position: { row, col }`。自动重排的项目还可能包含原坐标 `preferredPosition` |
| overflowOf | `string \| number` | 自动页所属的手动页 id。手动页省略此字段 |

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
      floatingControls?: {
        inset?: string;
        fullscreenInset?: string;
        gap?: string;
        padding?: string;
        backgroundColor?: string;
        borderColor?: string;
        backdropFilter?: string;
        opacity?: number;
        inactiveOpacity?: number;
        inactiveScale?: number;
        buttonSize?: string;
        inactiveButtonSize?: string;
        closeButton?: {
          backgroundColor?: string;
          textColor?: string;
          iconSize?: number;
        };
        fullscreenButton?: {
          backgroundColor?: string;
          textColor?: string;
          iconSize?: number;
        };
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
  arrange: () => void;
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
      { id: "app1", position: { row: 0, col: 0 }, type: "app", data: { name: "Chrome", icon: "https://placehold.co/100x100/4285F4/FFFFFF?text=C" } },
      { id: "app2", position: { row: 0, col: 1 }, type: "app", data: { name: "VS Code", icon: "https://placehold.co/100x100/007ACC/FFFFFF?text=VS" } },
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

- **拖动项目**：拖到空格可指定位置，原位留空
- **创建文件夹**: 将一个 app 拖到另一个 app 中央，待合并提示出现后松手，在目标位置创建文件夹
- **添加到文件夹**: 将 app 拖拽到已有文件夹上
- **查看文件夹**: 点击文件夹打开弹窗查看内容
- **拖出文件夹**: 在文件夹弹窗中长按 item 拖拽到弹窗外，item 回到主屏幕
- **切换分页**: 触摸滑动左右切换页面，或点击底部分页指示器
