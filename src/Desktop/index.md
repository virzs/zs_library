---
title: 桌面
atomId: Desktop
description: 基于 react-sortablejs 封装实现的桌面组件
group:
  title: 布局
---

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

## 代码演示

### 基本用法

```jsx
import { Desktop } from 'zs_library';

export default () => {
  const list = [
    {
      id: '123',
      data: {
        name: '常用',
      },
      children: [
        {
          id: 1,
          type: 'group',
          data: {
            name: 'one',
          },
          config: {
            col: 2,
          },
          children:
            // 生成20个子项
            Array(60)
              .fill(0)
              .map((_, index) => ({
                id: 1 + index,
                type: 'app',
                data: {
                  name: `one-${index}`,
                },
              })),
        },
        {
          id: 2,
          type: 'app',
          data: {
            name: 'two',
          },
        },
        {
          id: 3,
          type: 'app',
          data: {
            name: 'three',
          },
        },
        {
          id: 4,
          type: 'app',
          data: {
            name: 'four',
          },
        },
        {
          id: 5,
          type: 'app',
          data: {
            name: 'five',
          },
        },
        {
          id: 6,
          type: 'app',
          data: {
            name: 'six',
          },
        },
        {
          id: 7,
          type: 'app',
          data: {
            name: 'x',
          },
        },
      ],
    },
    {
      id: '12313eqw',
      data: {
        name: '开发',
      },
      children: [
        {
          id: 90,
          type: 'app',
          data: {
            name: 'x90',
          },
        },
      ],
    },
  ];

  return <Desktop list={list} />;
};
```

### 自定义分页位置

> **注意** 如果使用自定义分页，不要设置分页位置

```jsx
import React from 'react';
import { Button, MantineProvider } from '@mantine/core';
import { Desktop } from 'zs_library';

export default () => {
  const list = [
    {
      id: '123',
      data: {
        name: '常用',
      },
      children: [
        {
          id: 2,
          type: 'app',
          data: {
            name: 'two',
          },
        },
        {
          id: 3,
          type: 'app',
          data: {
            name: 'three',
          },
        },
        {
          id: 4,
          type: 'app',
          data: {
            name: 'four',
          },
        },
        {
          id: 5,
          type: 'app',
          data: {
            name: 'five',
          },
        },
        {
          id: 6,
          type: 'app',
          data: {
            name: 'six',
          },
        },
        {
          id: 7,
          type: 'app',
          data: {
            name: 'x',
          },
        },
      ],
    },
    {
      id: '12313eqw',
      data: {
        name: '开发',
      },
      children: [
        {
          id: 90,
          type: 'app',
          data: {
            name: 'x90',
          },
        },
      ],
    },
  ];

  const [pagingLocation, setPagingLocation] = React.useState('bottom');

  const handlePositionChange = (position) => {
    setPagingLocation(position);
  };

  return (
    <MantineProvider>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '8px',
        }}
      >
        <Button variant="filled" onClick={() => handlePositionChange('top')}>
          Top
        </Button>
        <Button variant="filled" onClick={() => handlePositionChange('bottom')}>
          Bottom
        </Button>
        <Button variant="filled" onClick={() => handlePositionChange('left')}>
          Left
        </Button>
        <Button variant="filled" onClick={() => handlePositionChange('right')}>
          Right
        </Button>
      </div>
      <div style={{ padding: '0 50px' }}>
        <Desktop list={list} pagingLocation={pagingLocation} />
      </div>
    </MantineProvider>
  );
};
```

### 本地存储

通过设置 `storageKey` 修改本地存储名，如果不设置，则默认 `ZS_LIBRARY_DESKTOP_SORTABLE_CONFIG`

```jsx
import { Desktop } from 'zs_library';

export default () => {
  const list = [
    {
      id: '123',
      data: {
        name: '常用',
      },
      children: [
        {
          id: 1,
          type: 'group',
          data: {
            name: 'one',
          },
          config: {
            col: 2,
          },
          children:
            // 生成20个子项
            Array(60)
              .fill(0)
              .map((_, index) => ({
                id: 1 + index,
                type: 'app',
                data: {
                  name: `one-${index}`,
                },
              })),
        },
        {
          id: 2,
          type: 'app',
          data: {
            name: 'two',
          },
        },
        {
          id: 3,
          type: 'app',
          data: {
            name: 'three',
          },
        },
        {
          id: 4,
          type: 'app',
          data: {
            name: 'four',
          },
        },
        {
          id: 5,
          type: 'app',
          data: {
            name: 'five',
          },
        },
        {
          id: 6,
          type: 'app',
          data: {
            name: 'six',
          },
        },
        {
          id: 7,
          type: 'app',
          data: {
            name: 'x',
          },
        },
      ],
    },
    {
      id: '12313eqw',
      data: {
        name: '开发',
      },
      children: [
        {
          id: 90,
          type: 'app',
          data: {
            name: 'x90',
          },
        },
      ],
    },
  ];

  return <Desktop list={list} storageKey="CUSTOM" />;
};
```

<API id="Desktop" />
