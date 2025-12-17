import React from "react";
import { SimpleEditor } from "zs_library";

export default () => {
  // 传入 Markdown 字符串作为初始值
  // 编辑器会自动检测并将其转换为 HTML 进行渲染
  const initialMarkdown = `
# Markdown 自动转换

这是一个 **Markdown** 示例。

- 列表项 1
- 列表项 2

> 这是一个引用块
`;

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
      <SimpleEditor value={initialMarkdown} onChange={(val) => console.log(val)} />
    </div>
  );
};
