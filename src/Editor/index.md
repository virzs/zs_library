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

```jsx
import { Editor } from 'zs_library';

export default () => <Editor hideSpecs={['image', 'video', 'audio', 'file']} />;
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
