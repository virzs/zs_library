import React from "react";
import { SimpleEditor, useSimpleEditor } from "zs_library";

export default () => {
  // 1. 使用 hook 创建 editor 实例
  const editor = useSimpleEditor({
    value: "<p>Hello <strong>World</strong></p>",
    onChange: (content) => console.log("Content changed:", content),
    features: {
      // 可以在这里配置功能
      highlight: true,
    },
  });

  const handleClear = () => {
    // 2. 直接调用 editor 命令
    editor?.commands.clearContent();
    editor?.commands.focus();
  };

  const handleInsert = () => {
    editor?.commands.insertContent(" Inserted text");
    editor?.commands.focus();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={handleClear} style={{ padding: "4px 8px" }}>
          清空内容
        </button>
        <button onClick={handleInsert} style={{ padding: "4px 8px" }}>
          插入文本
        </button>
      </div>

      <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
        {/* 3. 将 editor 传递给组件 */}
        <SimpleEditor editor={editor} />
      </div>
    </div>
  );
};
