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

## 受控模式

支持 `value` 和 `onChange` 属性，可用于受控模式或表单集成。

```jsx
import React, { useState } from "react";
import { SimpleEditor } from "zs_library";

const defaultContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: {
        textAlign: null,
        level: 1,
      },
      content: [
        {
          type: "text",
          text: "Getting started",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: null,
      },
      content: [
        {
          type: "text",
          text: "Welcome to the ",
        },
        {
          type: "text",
          marks: [
            {
              type: "italic",
            },
            {
              type: "highlight",
              attrs: {
                color: "var(--tt-color-highlight-yellow)",
              },
            },
          ],
          text: "Simple Editor",
        },
        {
          type: "text",
          text: " template! This template integrates ",
        },
        {
          type: "text",
          marks: [
            {
              type: "bold",
            },
          ],
          text: "open source",
        },
        {
          type: "text",
          text: " UI components and Tiptap extensions licensed under ",
        },
        {
          type: "text",
          marks: [
            {
              type: "bold",
            },
          ],
          text: "MIT",
        },
        {
          type: "text",
          text: ".",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: null,
      },
      content: [
        {
          type: "text",
          text: "Integrate it by following the ",
        },
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://tiptap.dev/docs/ui-components/templates/simple-editor",
                target: "_blank",
                rel: "noopener noreferrer nofollow",
                class: null,
              },
            },
          ],
          text: "Tiptap UI Components docs",
        },
        {
          type: "text",
          text: " or using our CLI tool.",
        },
      ],
    },
    {
      type: "codeBlock",
      attrs: {
        language: null,
      },
      content: [
        {
          type: "text",
          text: "npx @tiptap/cli init",
        },
      ],
    },
    {
      type: "heading",
      attrs: {
        textAlign: null,
        level: 2,
      },
      content: [
        {
          type: "text",
          text: "Features",
        },
      ],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              marks: [
                {
                  type: "italic",
                },
              ],
              text: "A fully responsive rich text editor with built-in support for common formatting and layout tools. Type markdown ",
            },
            {
              type: "text",
              marks: [
                {
                  type: "code",
                },
              ],
              text: "**",
            },
            {
              type: "text",
              marks: [
                {
                  type: "italic",
                },
              ],
              text: " or use keyboard shortcuts ",
            },
            {
              type: "text",
              marks: [
                {
                  type: "code",
                },
              ],
              text: "⌘+B",
            },
            {
              type: "text",
              text: " for ",
            },
            {
              type: "text",
              marks: [
                {
                  type: "strike",
                },
              ],
              text: "most",
            },
            {
              type: "text",
              text: " all common markdown marks. 🪄",
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: "left",
      },
      content: [
        {
          type: "text",
          text: "Add images, customize alignment, and apply ",
        },
        {
          type: "text",
          marks: [
            {
              type: "highlight",
              attrs: {
                color: "var(--tt-color-highlight-blue)",
              },
            },
          ],
          text: "advanced formatting",
        },
        {
          type: "text",
          text: " to make your writing more engaging and professional.",
        },
      ],
    },
    {
      type: "image",
      attrs: {
        src: "/images/tiptap-ui-placeholder-image.jpg",
        alt: "placeholder-image",
        title: "placeholder-image",
      },
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              attrs: {
                textAlign: "left",
              },
              content: [
                {
                  type: "text",
                  marks: [
                    {
                      type: "bold",
                    },
                  ],
                  text: "Superscript",
                },
                {
                  type: "text",
                  text: " (x",
                },
                {
                  type: "text",
                  marks: [
                    {
                      type: "superscript",
                    },
                  ],
                  text: "2",
                },
                {
                  type: "text",
                  text: ") and ",
                },
                {
                  type: "text",
                  marks: [
                    {
                      type: "bold",
                    },
                  ],
                  text: "Subscript",
                },
                {
                  type: "text",
                  text: " (H",
                },
                {
                  type: "text",
                  marks: [
                    {
                      type: "subscript",
                    },
                  ],
                  text: "2",
                },
                {
                  type: "text",
                  text: "O) for precision.",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              attrs: {
                textAlign: "left",
              },
              content: [
                {
                  type: "text",
                  marks: [
                    {
                      type: "bold",
                    },
                  ],
                  text: "Typographic conversion",
                },
                {
                  type: "text",
                  text: ": automatically convert to ",
                },
                {
                  type: "text",
                  marks: [
                    {
                      type: "code",
                    },
                  ],
                  text: "->",
                },
                {
                  type: "text",
                  text: " an arrow ",
                },
                {
                  type: "text",
                  marks: [
                    {
                      type: "bold",
                    },
                  ],
                  text: "→",
                },
                {
                  type: "text",
                  text: ".",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: "left",
      },
      content: [
        {
          type: "text",
          marks: [
            {
              type: "italic",
            },
          ],
          text: "→ ",
        },
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://tiptap.dev/docs/ui-components/templates/simple-editor#features",
                target: "_blank",
                rel: "noopener noreferrer nofollow",
                class: null,
              },
            },
          ],
          text: "Learn more",
        },
      ],
    },
    {
      type: "horizontalRule",
    },
    {
      type: "heading",
      attrs: {
        textAlign: "left",
        level: 2,
      },
      content: [
        {
          type: "text",
          text: "Make it your own",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: "left",
      },
      content: [
        {
          type: "text",
          text: "Switch between light and dark modes, and tailor the editor's appearance with customizable CSS to match your style.",
        },
      ],
    },
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: {
            checked: true,
          },
          content: [
            {
              type: "paragraph",
              attrs: {
                textAlign: "left",
              },
              content: [
                {
                  type: "text",
                  text: "Test template",
                },
              ],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: {
            checked: false,
          },
          content: [
            {
              type: "paragraph",
              attrs: {
                textAlign: "left",
              },
              content: [
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://tiptap.dev/docs/ui-components/templates/simple-editor",
                        target: "_blank",
                        rel: "noopener noreferrer nofollow",
                        class: null,
                      },
                    },
                  ],
                  text: "Integrate the free template",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: "left",
      },
    },
  ],
};

export default () => {
  const [value, setValue] = useState(defaultContent);

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
      <SimpleEditor
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          console.log("Editor content changed:", newValue);
        }}
      />
    </div>
  );
};
```

## 编辑与预览

支持 `SimpleEditor` 与 `SimpleEditorViewer` 配合使用，实现编辑与预览分离。

```jsx
import React, { useState } from "react";
import { SimpleEditor, SimpleEditorViewer } from "zs_library";

const defaultContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: {
        textAlign: null,
        level: 1,
      },
      content: [
        {
          type: "text",
          text: "Getting started",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        textAlign: null,
      },
      content: [
        {
          type: "text",
          text: "Welcome to the ",
        },
        {
          type: "text",
          marks: [
            {
              type: "italic",
            },
            {
              type: "highlight",
              attrs: {
                color: "var(--tt-color-highlight-yellow)",
              },
            },
          ],
          text: "Simple Editor",
        },
        {
          type: "text",
          text: " template! This template integrates ",
        },
        {
          type: "text",
          marks: [
            {
              type: "bold",
            },
          ],
          text: "open source",
        },
        {
          type: "text",
          text: " UI components and Tiptap extensions licensed under ",
        },
        {
          type: "text",
          marks: [
            {
              type: "bold",
            },
          ],
          text: "MIT",
        },
        {
          type: "text",
          text: ".",
        },
      ],
    },
  ],
};

export default () => {
  const [value, setValue] = useState(defaultContent);

  return (
    <div style={{ display: "flex", gap: "20px", height: "600px" }}>
      <div
        style={{
          flex: 1,
          border: "1px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SimpleEditor value={value} onChange={setValue} />
      </div>
      <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: "8px", overflow: "auto", padding: "20px" }}>
        <h3>预览</h3>
        <SimpleEditorViewer value={typeof value === "string" ? value : ""} />
      </div>
    </div>
  );
};
```

## 功能开关与配置

支持通过 `features` 属性控制各项功能的开关和配置。

```jsx
import React from "react";
import { SimpleEditor } from "zs_library";

export default () => {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
      <SimpleEditor
        features={{
          // 禁用撤销重做
          undoRedo: false,
          // 禁用代码块
          codeBlock: false,
          // 配置标题等级
          heading: {
            configure: {
              levels: [1, 2, 3],
            },
          },
          // 启用高亮并配置
          highlight: {
            configure: {
              multicolor: true,
            },
          },
        }}
      />
    </div>
  );
};
```

## 图片上传

支持通过 `features.image` 属性配置图片上传行为。

### 默认上传 (Action)

使用 `action` 属性指定上传接口。以下示例使用 `https://tmpfiles.org/api/v1/upload` 作为接口。
由于 `tmpfiles.org` 返回的 URL 是预览页面地址，我们需要通过 `formatResult` 将其转换为直接下载地址。

```jsx
import React from "react";
import { SimpleEditor } from "zs_library";

export default () => {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
      <SimpleEditor
        features={{
          image: {
            configure: {
              action: "https://tmpfiles.org/api/v1/upload",
              name: "file",
              formatResult: (response) => {
                return response.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
              },
            },
          },
        }}
      />
    </div>
  );
};
```

### 自定义上传 (Custom Request)

使用 `customRequest` 完全控制上传过程。以下示例展示了如何对接 `tmpfiles.org` 服务，并处理其特殊的返回 URL 格式。

```jsx
import React from "react";
import { SimpleEditor } from "zs_library";

export default () => {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
      <SimpleEditor
        features={{
          image: {
            configure: {
              customRequest: async ({ file, onProgress, onSuccess, onError }) => {
                try {
                  const formData = new FormData();
                  formData.append("file", file);

                  // 模拟上传进度
                  onProgress({ percent: 20 });

                  const response = await fetch("https://tmpfiles.org/api/v1/upload", {
                    method: "POST",
                    body: formData,
                  });

                  if (!response.ok) {
                    throw new Error("Upload failed");
                  }

                  // 模拟上传进度
                  onProgress({ percent: 100 });

                  const json = await response.json();

                  // tmpfiles.org 返回的是页面地址，需要转换为直接下载地址才能在 img 标签中显示
                  const url = json.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");

                  onSuccess(url);
                } catch (error) {
                  onError(error);
                }
              },
            },
          },
        }}
      />
    </div>
  );
};
```

## AI 功能配置

支持通过 `features.ai` 属性配置 AI 辅助写作功能。支持自定义 API 地址、模型、Prompt 以及请求参数。

### 自定义配置与测试

以下示例展示了如何配置 AI 功能，并提供了一个输入框用于输入 API Key 进行测试。

```jsx
import React, { useState, useEffect } from "react";
import { SimpleEditor } from "zs_library";

const STORAGE_KEY = "simple-editor-demo-api-key";

export default () => {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setApiKey(stored);
  }, []);

  const handleApiKeyChange = (e) => {
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

## 数据格式转换

支持多种数据格式输出：`html` (默认)、`json`、`markdown`。

```jsx
import React, { useState } from "react";
import { SimpleEditor, jsonToHtml, htmlToJson } from "zs_library";

export default () => {
  const [outputFormat, setOutputFormat] = useState("html");
  const [content, setContent] = useState("<p>Hello <strong>World</strong>!</p>");
  const [displayContent, setDisplayContent] = useState(content);

  const handleFormatChange = (e) => {
    const newFormat = e.target.value;
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
```

## Markdown 自动转换

`SimpleEditor` 支持自动检测并转换 Markdown 格式的初始内容。

```jsx
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
```

## 外部控制 (Editor Instance)

支持通过 `editor` 属性传入外部创建的 `Editor` 实例，或者通过 `useSimpleEditor` Hook 创建并控制编辑器。

### 使用 useSimpleEditor Hook

这是推荐的高级用法，可以直接持有并操作编辑器实例。

```jsx
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
```

### 使用 Ref (传统方式)

如果您更习惯使用 Ref 来访问实例，也可以使用 `useRef`。

```jsx
import React, { useRef } from "react";
import { SimpleEditor } from "zs_library";

export default () => {
  const editorRef = useRef(null);

  const handleLogHtml = () => {
    if (editorRef.current?.editor) {
      console.log(editorRef.current.editor.getHTML());
    }
  };

  return (
    <div>
      <button onClick={handleLogHtml} style={{ marginBottom: "8px" }}>
        Log HTML
      </button>
      <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
        <SimpleEditor ref={editorRef} />
      </div>
    </div>
  );
};
```

## API

### SimpleEditor

| 参数      | 说明           | 类型                                     | 默认值   |
| --------- | -------------- | ---------------------------------------- | -------- |
| value     | 编辑器内容     | `string \| JSONContent`                  | -        |
| onChange  | 内容变化回调   | `(value: string \| JSONContent) => void` | -        |
| className | 自定义类名     | `string`                                 | -        |
| style     | 自定义样式     | `React.CSSProperties`                    | -        |
| output    | 输出格式       | `'html' \| 'json' \| 'markdown'`         | `'html'` |
| features  | 功能配置       | `SimpleEditorFeatures`                   | 见下表   |
| editor    | 外部编辑器实例 | `Editor \| null`                         | -        |

### useSimpleEditor

| 参数     | 说明         | 类型                                     | 默认值   |
| -------- | ------------ | ---------------------------------------- | -------- |
| value    | 编辑器内容   | `string \| JSONContent`                  | -        |
| onChange | 内容变化回调 | `(value: string \| JSONContent) => void` | -        |
| output   | 输出格式     | `'html' \| 'json' \| 'markdown'`         | `'html'` |
| features | 功能配置     | `SimpleEditorFeatures`                   | -        |

### SimpleEditorViewer

| 参数      | 说明               | 类型                    | 默认值 |
| --------- | ------------------ | ----------------------- | ------ |
| value     | 需要渲染的内容     | `string \| JSONContent` | -      |
| className | 自定义类名         | `string`                | -      |
| sanitize  | 是否开启 HTML 净化 | `boolean`               | `true` |
| theme     | 主题               | `'light' \| 'dark'`     | -      |
