import React, { useState } from "react";
import { SimpleEditor, htmlToJson, type EditorOutputFormat, type JSONContent } from "zs_library";

export default () => {
  const [outputFormat, setOutputFormat] = useState<EditorOutputFormat>("html");
  const [content, setContent] = useState<string | JSONContent | undefined>("<p>Hello <strong>World</strong>!</p>");
  const [displayContent, setDisplayContent] = useState<string | JSONContent>(content ?? "");

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value as EditorOutputFormat;
    setOutputFormat(newFormat);
    // Clearing content to let editor re-initialize with new format if needed
    // In real app you might want to convert current content to new format
    setContent(undefined);
    setTimeout(() => setContent("<p>Switching format...</p>"), 10);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <label>输出格式：</label>
        <select
          value={outputFormat}
          onChange={handleFormatChange}
          style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="html">HTML</option>
          <option value="json">JSON</option>
          <option value="markdown">Markdown</option>
        </select>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: "8px", overflow: "hidden" }}>
        <SimpleEditor
          value={content}
          output={outputFormat}
          onChange={(val) => setDisplayContent(val)}
          style={{ height: "300px" }}
        />
      </div>

      <div style={{ background: "#f5f5f5", padding: "16px", borderRadius: "8px" }}>
        <h4 style={{ margin: "0 0 8px 0" }}>实时输出 ({outputFormat}):</h4>
        <pre
          style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: "200px", overflow: "auto" }}
        >
          {typeof displayContent === "string" ? displayContent : JSON.stringify(displayContent, null, 2)}
        </pre>
      </div>

      <div style={{ background: "#e6f7ff", padding: "16px", borderRadius: "8px" }}>
        <h4 style={{ margin: "0 0 8px 0" }}>工具函数演示:</h4>
        <p>HTML 转 JSON:</p>
        <pre style={{ fontSize: "12px" }}>{JSON.stringify(htmlToJson("<p>Test</p>"), null, 2)}</pre>
      </div>
    </div>
  );
};
