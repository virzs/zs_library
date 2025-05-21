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

## 代码演示

### 基本用法

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
            name: "one",
          },
          config: {
            col: 2,
          },
          children:
            // 生成20个子项
            Array(60)
              .fill(0)
              .map((_, index) => ({
                id: "sdanka" + 1 + index,
                type: "app",
                data: {
                  name: `one-${index}`,
                },
              })),
        },
        {
          id: 2,
          type: "app",
          data: {
            name: "two",
          },
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "three",
          },
        },
        {
          id: 4,
          type: "app",
          data: {
            name: "four",
          },
        },
        {
          id: 5,
          type: "app",
          data: {
            name: "five",
          },
        },
        {
          id: 6,
          type: "app",
          data: {
            name: "six",
          },
        },
        {
          id: 7,
          type: "app",
          data: {
            name: "x",
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
            name: "x90",
          },
        },
      ],
    },
  ];

  return <Desktop list={list} enableCaching={false} />;
};
```

### 分页配置

> **注意** 如果使用自定义分页，不要设置分页位置

#### 自定义分页位置

```jsx
import React from "react";
import { Button, MantineProvider } from "@mantine/core";
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
          id: 2,
          type: "app",
          data: {
            name: "two",
          },
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "three",
          },
        },
        {
          id: 4,
          type: "app",
          data: {
            name: "four",
          },
        },
        {
          id: 5,
          type: "app",
          data: {
            name: "five",
          },
        },
        {
          id: 6,
          type: "app",
          data: {
            name: "six",
          },
        },
        {
          id: 7,
          type: "app",
          data: {
            name: "x",
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
            name: "x90",
          },
        },
      ],
    },
  ];

  const [pagingLocation, setPagingLocation] = React.useState("bottom");

  const handlePositionChange = (position) => {
    setPagingLocation(position);
  };

  return (
    <MantineProvider>
      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "center",
          marginBottom: "8px",
        }}
      >
        <Button variant="filled" onClick={() => handlePositionChange("top")}>
          Top
        </Button>
        <Button variant="filled" onClick={() => handlePositionChange("bottom")}>
          Bottom
        </Button>
        <Button variant="filled" onClick={() => handlePositionChange("left")}>
          Left
        </Button>
        <Button variant="filled" onClick={() => handlePositionChange("right")}>
          Right
        </Button>
      </div>
      <div style={{ padding: "0 50px" }}>
        <Desktop
          list={list}
          enableCaching={false}
          pagination={{ position: pagingLocation }}
        />
      </div>
    </MantineProvider>
  );
};
```

#### 隐藏分页

```jsx
import React from "react";
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
          id: 2,
          type: "app",
          data: {
            name: "two",
          },
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "three",
          },
        },
        {
          id: 4,
          type: "app",
          data: {
            name: "four",
          },
        },
        {
          id: 5,
          type: "app",
          data: {
            name: "five",
          },
        },
        {
          id: 6,
          type: "app",
          data: {
            name: "six",
          },
        },
        {
          id: 7,
          type: "app",
          data: {
            name: "x",
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
            name: "x90",
          },
        },
      ],
    },
  ];

  return <Desktop list={list} enableCaching={false} pagination={false} />;
};
```

### 本地存储

默认启用本地存储，如果不需要则设置 `enableCaching = false`

通过设置 `storageKey` 修改本地存储名，如果不设置，则默认 `ZS_LIBRARY_DESKTOP_SORTABLE_CONFIG`

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
            name: "one",
          },
          config: {
            col: 2,
          },
          children:
            // 生成20个子项
            Array(60)
              .fill(0)
              .map((_, index) => ({
                id: "sdanka" + 1 + index,
                type: "app",
                data: {
                  name: `one-${index}`,
                },
              })),
        },
        {
          id: 2,
          type: "app",
          data: {
            name: "two",
          },
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "three",
          },
        },
        {
          id: 4,
          type: "app",
          data: {
            name: "four",
          },
        },
        {
          id: 5,
          type: "app",
          data: {
            name: "five",
          },
        },
        {
          id: 6,
          type: "app",
          data: {
            name: "six",
          },
        },
        {
          id: 7,
          type: "app",
          data: {
            name: "x",
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
            name: "x90",
          },
        },
      ],
    },
  ];

  return <Desktop list={list} storageKey="CUSTOM" />;
};
```

### 点击事件

```jsx
import { useState } from "react";
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
            name: "one",
          },
          config: {
            col: 2,
            row: 2,
          },
          children:
            // 生成20个子项
            Array(60)
              .fill(0)
              .map((_, index) => ({
                id: "sdanka" + 1 + index,
                type: "app",
                data: {
                  name: `one-${index}`,
                },
              })),
        },
        {
          id: 2,
          type: "app",
          data: {
            name: "two",
          },
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "three",
          },
        },
        {
          id: 4,
          type: "app",
          data: {
            name: "four",
          },
        },
        {
          id: 5,
          type: "app",
          data: {
            name: "five",
          },
        },
        {
          id: 6,
          type: "app",
          data: {
            name: "six",
          },
        },
        {
          id: 7,
          type: "app",
          data: {
            name: "x",
          },
        },
      ],
    },
  ];

  const [clickData, setClickData] = useState(null);

  return (
    <div>
      <Desktop
        list={list}
        enableCaching={false}
        onItemClick={(data) => {
          setClickData(data);
        }}
      />
      <p>点击事件结果：{JSON.stringify(clickData)}</p>
    </div>
  );
};
```

### 无字模式

无字模式下开启文件夹仍显示名称

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
          id: 2,
          type: "app",
          data: {
            name: "two",
          },
        },
        {
          id: 1,
          type: "group",
          data: {
            name: "one",
          },
          config: {
            col: 2,
            row: 2,
          },
          children:
            // 生成20个子项
            Array(60)
              .fill(0)
              .map((_, index) => ({
                id: "sdanka" + 1 + index,
                type: "app",
                data: {
                  name: `one-${index}`,
                },
              })),
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "three",
          },
        },
        {
          id: 4,
          type: "app",
          data: {
            name: "four",
          },
        },
        {
          id: 5,
          type: "app",
          data: {
            name: "five",
          },
        },
        {
          id: 6,
          type: "app",
          data: {
            name: "six",
          },
        },
        {
          id: 7,
          type: "app",
          data: {
            name: "x",
          },
        },
      ],
    },
  ];

  return (
    <div>
      <Desktop list={list} enableCaching={false} noLetters />
    </div>
  );
};
```

### 定制主题

通过 `theme` 设置主题或自定义

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
          id: 2,
          type: "app",
          data: {
            name: "two",
          },
        },
        {
          id: 1,
          type: "group",
          data: {
            name: "one",
          },
          config: {
            col: 2,
            row: 2,
          },
          children:
            // 生成20个子项
            Array(60)
              .fill(0)
              .map((_, index) => ({
                id: "sdanka" + 1 + index,
                type: "app",
                data: {
                  name: `one-${index}`,
                },
              })),
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "three",
          },
        },
        {
          id: 4,
          type: "app",
          data: {
            name: "four",
          },
        },
        {
          id: 5,
          type: "app",
          data: {
            name: "five",
          },
        },
        {
          id: 6,
          type: "app",
          data: {
            name: "six",
          },
        },
        {
          id: 7,
          type: "app",
          data: {
            name: "x",
          },
        },
      ],
    },
  ];

  return (
    <div>
      <Desktop list={list} enableCaching={false} theme="light" />
      <Desktop list={list} enableCaching={false} theme="dark" />
      <Desktop
        list={list}
        enableCaching={false}
        theme={{
          token: {
            itemNameColor: "yellow",
          },
        }}
      />
    </div>
  );
};
```

### 渲染图标

组件未提供默认的图标渲染方式，通过 `itemIconBuilder` 设置图标

> ##注意## 如果需要完全自定义渲染，请使用 `itemBuilder`

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
          id: 2,
          type: "app",
          data: {
            name: "two",
          },
        },
        {
          id: 1,
          type: "group",
          data: {
            name: "one",
          },
          config: {
            col: 2,
            row: 2,
          },
          children:
            // 生成20个子项
            Array(60)
              .fill(0)
              .map((_, index) => ({
                id: "sdanka" + 1 + index,
                type: "app",
                data: {
                  name: `one-${index}`,
                },
              })),
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "three",
          },
        },
        {
          id: 4,
          type: "app",
          data: {
            name: "four",
          },
        },
        {
          id: 5,
          type: "app",
          data: {
            name: "five",
          },
        },
        {
          id: 6,
          type: "app",
          data: {
            name: "six",
          },
        },
        {
          id: 7,
          type: "app",
          data: {
            name: "x",
          },
        },
      ],
    },
  ];

  return (
    <div>
      <Desktop
        list={list}
        enableCaching={false}
        itemIconBuilder={(data) => {
          const images = {
            1: "https://dailybing.com/api/v1/20240815zh-cnMRK",
            2: "https://dailybing.com/api/v1/20240814zh-cnMRK",
            3: "https://dailybing.com/api/v1/20240813zh-cnMRK",
            4: "https://dailybing.com/api/v1/20240812zh-cnMRK",
            5: "https://dailybing.com/api/v1/20240811zh-cnMRK",
          };
          return (
            <img
              style={{
                width: "100%",
                height: "100%",
              }}
              src={
                images[data.id] ??
                "https://dailybing.com/api/v1/20240815zh-cnMRK"
              }
            />
          );
        }}
      />
    </div>
  );
};
```

### 禁用菜单

设置 `contextMenu = false` 关闭右键菜单

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
          id: 2,
          type: "app",
          data: {
            name: "two",
          },
        },
        {
          id: 1,
          type: "group",
          data: {
            name: "one",
          },
          config: {
            col: 2,
            row: 2,
          },
          children:
            // 生成20个子项
            Array(60)
              .fill(0)
              .map((_, index) => ({
                id: "sdanka" + 1 + index,
                type: "app",
                data: {
                  name: `one-${index}`,
                },
              })),
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "three",
          },
        },
        {
          id: 4,
          type: "app",
          data: {
            name: "four",
          },
        },
        {
          id: 5,
          type: "app",
          data: {
            name: "five",
          },
        },
        {
          id: 6,
          type: "app",
          data: {
            name: "six",
          },
        },
        {
          id: 7,
          type: "app",
          data: {
            name: "x",
          },
        },
      ],
    },
  ];

  return (
    <div>
      <Desktop list={list} enableCaching={false} contextMenu={false} />
    </div>
  );
};
```

### 自定义菜单

具体内容参考类型定义

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
          id: 2,
          type: "app",
          data: {
            name: "two",
          },
        },
        {
          id: 1,
          type: "group",
          data: {
            name: "one",
          },
          config: {
            col: 2,
            row: 2,
          },
          children:
            // 生成20个子项
            Array(60)
              .fill(0)
              .map((_, index) => ({
                id: "sdanka" + 1 + index,
                type: "app",
                data: {
                  name: `one-${index}`,
                },
              })),
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "three",
          },
        },
        {
          id: 4,
          type: "app",
          data: {
            name: "four",
          },
        },
        {
          id: 5,
          type: "app",
          data: {
            name: "five",
          },
        },
        {
          id: 6,
          type: "app",
          data: {
            name: "six",
          },
        },
        {
          id: 7,
          type: "app",
          data: {
            name: "x",
          },
        },
      ],
    },
  ];

  return (
    <div>
      <Desktop
        list={list}
        enableCaching={false}
        contextMenu={{
          showShareButton: false,
        }}
      />
    </div>
  );
};
```

### 拖拽添加

支持外部元素拖拽添加，需要手动设置数据类型，组件会自动为这个数据添加其他参数

> **注意** 当前存在限制，仅允许拖拽到当前分页，无法拖拽到当前分页下的文件夹中

```jsx
import { Desktop } from "zs_library";

export default () => {
  const needDragInData = [
    {
      name: "谷歌",
      url: "https://google.com",
    },
    {
      name: "必应",
      url: "https://cn.bing.com",
    },
  ];

  const list = [
    {
      id: "123",
      data: {
        name: "常用",
      },
      children: [
        {
          id: 2,
          type: "app",
          data: {
            name: "two",
          },
        },
        {
          id: 1,
          type: "group",
          data: {
            name: "one",
          },
          config: {
            col: 2,
            row: 2,
          },
          children:
            // 生成20个子项
            Array(60)
              .fill(0)
              .map((_, index) => ({
                id: "sdanka" + 1 + index,
                type: "app",
                data: {
                  name: `one-${index}`,
                },
              })),
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "three",
          },
        },
        {
          id: 4,
          type: "app",
          data: {
            name: "four",
          },
        },
        {
          id: 5,
          type: "app",
          data: {
            name: "five",
          },
        },
        {
          id: 6,
          type: "app",
          data: {
            name: "six",
          },
        },
        {
          id: 7,
          type: "app",
          data: {
            name: "x",
          },
        },
      ],
    },
    {
      id: "xcajd",
      data: {
        name: "新分类",
      },
    },
  ];

  const handleDragStart = (e, data) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "app",
        data,
      })
    );
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        {needDragInData.map((i) => {
          return (
            <div
              style={{
                cursor: "pointer",
                padding: "1rem",
                border: "1px solid gray",
                borderRadius: "0.25rem",
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
            >
              {i.name}
            </div>
          );
        })}
      </div>
      <Desktop list={list} enableCaching={false} />
    </div>
  );
};
```

### 自定义额外项目

通过 `extraItems` 属性可以在桌面中添加额外项目，将显示在子项列表内部的末尾。您可以使用它添加一个或多个额外项目，例如"添加"按钮或其他自定义功能。这些项目将作为网格中的项显示，与其他项目一起排列。

```jsx
import React from "react";
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
            name: "文件夹",
          },
          children: [],
        },
        {
          id: 2,
          type: "app",
          data: {
            name: "应用",
          },
        },
      ],
    },
    {
      id: "456",
      data: {
        name: "工作",
      },
      children: [],
    },
  ];

  const handleAddItem = (listItem) => {
    console.log("添加项目到:", listItem.id);
    // 这里可以实现添加新项目的逻辑
  };

  return (
    <Desktop
      list={list}
      enableCaching={false}
      extraItems={(listItem) => (
        <div
          className="drag-disabled"
          style={{
            width: "96px",
            height: "96px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            backgroundColor: "black",
            color: "white",
            borderRadius: "8px",
          }}
          onClick={() => handleAddItem(listItem)}
        >
          自定义元素
        </div>
      )}
    />
  );
};
```

额外项目将显示在网格内容的末尾，您可以使用它来实现添加新项目、显示更多信息或任何其他自定义功能。
