# 编辑器

## 代码块

使用 `Ace Editor` 作为 代码块组件

- Monaco Editor (不支持自动高度，需要额外设置)
- CodeMirror (输入与 BlockNote 冲突)
- Ace Editor

## 基础的编辑器

```jsx
import { Editor } from 'zs_library';

export default () => <Editor />;
```

## 隐藏内容块

```jsx
import { Editor } from 'zs_library';

export default () => <Editor hideSpecs={['image', 'video', 'audio', 'file']} />;
```

<API id="Editor" />
