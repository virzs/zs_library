# Dock

## 依赖

```json
{
  "framer-motion": "^11.5.4",
  "@remixicon/react": "^4.2.0"
}
```

## 代码演示

### 基本用法

```jsx
import { Dock } from "zs_library";

export default () => {
  return (
    <div
      style={{
        minHeight: "200px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Dock
        items={[
          {
            title: "Home",
            icon: "H",
          },
          {
            title: "Photo",
            icon: "P",
          },
        ]}
      />
    </div>
  );
};
```

### 单独使用 桌面/移动端

桌面端

```jsx
import { Dock } from "zs_library";

export default () => {
  return (
    <div
      style={{
        minHeight: "200px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Dock.Desktop
        items={[
          {
            title: "Home",
            icon: "H",
          },
          {
            title: "Photo",
            icon: "P",
          },
        ]}
      />
    </div>
  );
};
```

移动端

```jsx
import { Dock } from "zs_library";

export default () => {
  return (
    <div
      style={{
        minHeight: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Dock.Mobile
        items={[
          {
            title: "Home",
            icon: "H",
          },
          {
            title: "Photo",
            icon: "P",
          },
        ]}
      />
    </div>
  );
};
```
