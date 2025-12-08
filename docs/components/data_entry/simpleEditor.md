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

## 图片上传

支持通过 `image` 属性配置图片上传行为。

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
        image={{
          action: "https://tmpfiles.org/api/v1/upload",
          name: "file",
          formatResult: (response) => {
            return response.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
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
        image={{
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
        }}
      />
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
