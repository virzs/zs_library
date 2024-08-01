---
title: 编辑器
atomId: Editor
description: 编辑器组件
group:
  title: 数据录入
---

在 `BlockNote` 基础上开发，封装操作

## 基础编辑器

#### 默认内容块

```jsx
import { Editor } from 'zs_library';

export default () => (
  <Editor
    value={[
      {
        type: 'paragraph',
        content: 'Hello World!!!',
      },
    ]}
  />
);
```

#### 隐藏内容块

设置 `hideSpecs` 隐藏不需要的内容快

> **注意** 不要隐藏 `paragraph`，它是编辑器默认的内容快，隐藏后需要为编辑器设置默认的 `value`

```jsx
import { Editor } from 'zs_library';

export default () => <Editor hideSpecs={['image', 'video', 'audio', 'file']} />;
```

### 预览

直接禁用编辑器即可实现预览效果

> **注意** 如果将编辑器内容保存为 markdown 或 html 格式，将会损失部分内容

```jsx
import { Editor } from 'zs_library';

export default () => {
  return (
    <div>
      <Editor
        editable={false}
        value={[
          {
            type: 'paragraph',
            content: 'Hello World!!!',
          },
          {
            type: 'codeBlock',
            content: '// Hello World\n\nconsole.log("Hello World !!!");',
            props: {
              language: 'typescript',
              theme: 'github_dark',
            },
          },
        ]}
      />
    </div>
  );
};
```

### 实时预览

```jsx
import React from 'react';
import { Editor } from 'zs_library';
import { css } from '@emotion/css';

export default () => {
  const [value, setValue] = React.useState([]);
  return (
    <div
      className={css`
        width: 100%;
        display: flex;
      `}
    >
      <Editor
        className={css`
          flex-grow: 1;
          max-width: 50%;
        `}
        value={value}
        onChange={(v) => {
          setValue(v);
        }}
      />
      <Editor
        className={css`
          flex-grow: 1;
          max-width: 50%;
        `}
        editable={false}
        value={value}
      />
    </div>
  );
};
```

### 上传文件

使用 `uploadFile` 上传文件

> **注意** [tmpfiles](https://tmpfiles.org/) 在上传文件后 60 分钟后会删除上传的文件

```jsx
import { Editor } from 'zs_library';

export default () => {
  const uploadFile = async (file) => {
    const body = new FormData();
    body.append('file', file);

    const ret = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: body,
    });
    const res = (await ret.json()).data.url.replace(
      'tmpfiles.org/',
      'tmpfiles.org/dl/',
    );
    return res;
  };

  return (
    <Editor
      uploadFile={uploadFile}
      hideSpecs={[
        'heading',
        'bulletListItem',
        'numberedListItem',
        'checkListItem',
        'table',
        'codeBlock',
      ]}
    />
  );
};
```

## 新增的内容块

#### 代码块

使用 `Ace Editor` 作为 代码块组件

- Monaco Editor (不支持自动高度，需要额外设置)
- CodeMirror (输入与 BlockNote 冲突)
- Ace Editor

```jsx
import { Editor } from 'zs_library';

export default () => (
  <Editor
    value={[
      {
        type: 'codeBlock',
        content: '// Hello World\n\nconsole.log("Hello World !!!");',
        props: {
          language: 'typescript',
          theme: 'github_dark',
        },
      },
    ]}
  />
);
```

<API id="Editor" />
