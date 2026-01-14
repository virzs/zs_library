import React, { useState, useEffect } from "react";
import { SimpleEditor } from "zs_library";

const STORAGE_KEY = "simple-editor-demo-api-key";

export default () => {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setApiKey(stored);
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem(STORAGE_KEY, val);
  };

  const handleClear = () => {
    setApiKey("");
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span>API Key:</span>
        <input
          type="password"
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder="请输入 API Key (例如: sk-...)"
          style={{
            padding: "4px 8px",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            width: "300px",
            outline: "none",
          }}
        />
        <button
          onClick={handleClear}
          style={{
            padding: "4px 8px",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            background: "#f5f5f5",
            cursor: "pointer",
          }}
        >
          清除
        </button>
        <span style={{ fontSize: "12px", color: "#666" }}>(密钥将存储在浏览器本地，请勿在公共设备上使用)</span>
      </div>

      <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
        <SimpleEditor
          features={{
            ai: {
              // 如果提供了 API Key，则启用 AI 功能
              enabled: !!apiKey,
              configure: {
                // 自定义 API 地址 (可选)
                // baseUrl: "https://api.openai.com/v1",
                // 自定义 API Key
                apiKey: apiKey,
                // 自定义模型 (可选)
                // model: "gpt-3.5-turbo",
                // 自定义请求头 (可选)
                // headers: {
                //   "Custom-Header": "value",
                // },
                // 自定义 Prompt (可选)
                defaultPrompt: "你是一个智能写作助手，请帮助我完善以下内容：",
                // 自定义系统 Prompt (可选)
                systemPrompt: "你是一个专业的文本编辑器助手...",
                // 自定义预设 (可选)
                presets: [
                  { label: "润色", text: "请润色这段文字，使其更加流畅" },
                  { label: "翻译", text: "请将这段文字翻译成英文", icon: <span>A</span> },
                ],
                // 生命周期回调
                onStart: () => console.log("AI generation started"),
                onSuccess: (text) => console.log("AI generation success:", text),
                onError: (error) => console.error("AI generation error:", error),
              },
            },
          }}
        />
      </div>
    </div>
  );
};
