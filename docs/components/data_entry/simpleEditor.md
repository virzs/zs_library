# Tiptap Editor 简单编辑器

基于 Tiptap 的富文本编辑器，提供基础的文本编辑功能。

## 基础示例

```jsx
import React from "react";
import { SimpleEditor } from "zs_library";

export default () => {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
      <SimpleEditor />
    </div>
  );
};
```

## 功能特性

- **文本格式化**: 粗体、斜体、删除线、下划线、代码
- **标题**: H1 - H6
- **列表**: 无序列表、有序列表、任务列表
- **引用**: 块引用
- **代码块**: 支持语法高亮
- **链接**: 添加和编辑链接
- **图片**: 支持图片上传和展示
- **对齐**: 左对齐、居中、右对齐、两端对齐
- **撤销/重做**
- **主题**: 支持浅色/深色模式切换
