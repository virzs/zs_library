# 富文本编辑器

## 基础示例

### 包含上传图片的编辑器

```jsx
import React, { useState } from "react";
import { Editor } from "zs_library";

export default () => {
  const [value, setValue] = useState({
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Introducing Novel" }],
      },
    ],
  });

  console.log("🚀 ~ value:", value);

  return (
    <div>
      <Editor
        initialContent={value}
        onChange={setValue}
        uploadImageProps={{
          action: "https://tmpfiles.org/api/v1/upload",
          onSuccess: (res) => {
            return res.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
          },
        }}
      />
    </div>
  );
};
```

### 使用自定义上传函数

当需要更复杂的上传逻辑时，可以使用 `customUploadFn` 来完全控制上传过程：

```jsx
import React, { useState } from "react";
import { Editor } from "zs_library";

export default () => {
  const [value, setValue] = useState({
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "自定义上传示例" }],
      },
    ],
  });
  // 自定义上传函数
  const customUpload = async (file) => {
    try {
      // 1. 构建表单数据
      const formData = new FormData();
      formData.append("file", file);

      // 2. 发送请求到 tmpfiles.org API
      const response = await fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`上传失败: ${response.status}`);
      }

      const result = await response.json();

      // 3. 返回结果，支持多种格式
      return result; // 例如: { data: { url: "https://tmpfiles.org/...", ... } }
    } catch (error) {
      console.error("上传失败:", error);
      throw error; // 重新抛出错误，触发 onError 回调
    }
  };

  return (
    <div>
      <Editor
        initialContent={value}
        onChange={setValue}
        uploadImageProps={{
          // 使用自定义上传函数
          customUploadFn: customUpload, // 成功回调会接收 customUploadFn 返回的数据
          onSuccess: (result) => {
            console.log("上传成功:", result);
            // tmpfiles.org 返回格式: { data: { url: "https://tmpfiles.org/..." } }
            // 需要处理 URL 格式以便直接访问
            return result.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
          },
          // 错误回调
          onError: (error) => {
            console.error("上传失败:", error);
            alert(`图片上传失败: ${error.message}`);
          },
          // 上传前验证
          beforeUpload: (file) => {
            // 检查文件类型
            if (!file.type.startsWith("image/")) {
              alert("只能上传图片文件");
              return false;
            }
            // 检查文件大小（5MB）
            if (file.size > 5 * 1024 * 1024) {
              alert("图片大小不能超过 5MB");
              return false;
            }
            return true;
          },
        }}
      />
    </div>
  );
};
```

### 渲染 Json 为 Html

```jsx
import { Editor } from "zs_library";

export default () => {
  return (
    <Editor.Preview
      json={{
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Introducing Novel" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                marks: [
                  {
                    type: "link",
                    attrs: {
                      href: "https://github.com/steven-tey/novel",
                      target: "_blank",
                    },
                  },
                ],
                text: "Novel",
              },
              {
                type: "text",
                text: " is a Notion-style WYSIWYG editor with AI-powered autocompletion. Built with ",
              },
              {
                type: "text",
                marks: [
                  {
                    type: "link",
                    attrs: {
                      href: "https://tiptap.dev/",
                      target: "_blank",
                    },
                  },
                ],
                text: "Tiptap",
              },
              { type: "text", text: " + " },
              {
                type: "text",
                marks: [
                  {
                    type: "link",
                    attrs: {
                      href: "https://sdk.vercel.ai/docs",
                      target: "_blank",
                    },
                  },
                ],
                text: "Vercel AI SDK",
              },
              { type: "text", text: "." },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Installation" }],
          },
          {
            type: "codeBlock",
            attrs: { language: null },
            content: [{ type: "text", text: "npm i novel" }],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Usage" }],
          },
          {
            type: "codeBlock",
            attrs: { language: null },
            content: [
              {
                type: "text",
                text: 'import { Editor } from "novel";\n\nexport default function App() {\n  return (\n     <Editor />\n  )\n}',
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Features" }],
          },
          {
            type: "orderedList",
            attrs: { tight: true, start: 1 },
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Slash menu & bubble menu" },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "AI autocomplete (type " },
                      { type: "text", marks: [{ type: "code" }], text: "++" },
                      {
                        type: "text",
                        text: " to activate, or select from slash menu)",
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
                    content: [
                      {
                        type: "text",
                        text: "Image uploads (drag & drop / copy & paste, or select from slash menu) ",
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
                    content: [
                      {
                        type: "text",
                        text: "Add tweets from the command slash menu:",
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
                    content: [
                      {
                        type: "text",
                        text: "Mathematical symbols with LaTeX expression:",
                      },
                    ],
                  },
                  {
                    type: "orderedList",
                    attrs: {
                      tight: true,
                      start: 1,
                    },
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              {
                                type: "math",
                                attrs: {
                                  latex: "E = mc^2",
                                },
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
                            content: [
                              {
                                type: "math",
                                attrs: {
                                  latex: "a^2 = \\sqrt{b^2 + c^2}",
                                },
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
                            content: [
                              {
                                type: "math",
                                attrs: {
                                  latex:
                                    "\\hat{f} (\\xi)=\\int_{-\\infty}^{\\infty}f(x)e^{-2\\pi ix\\xi}dx",
                                },
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
                            content: [
                              {
                                type: "math",
                                attrs: {
                                  latex:
                                    "A=\\begin{bmatrix}a&b\\\\c&d \\end{bmatrix}",
                                },
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
                            content: [
                              {
                                type: "math",
                                attrs: {
                                  latex: "\\sum_{i=0}^n x_i",
                                },
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "image",
            attrs: {
              src: "https://public.blob.vercel-storage.com/pJrjXbdONOnAeZAZ/banner-2wQk82qTwyVgvlhTW21GIkWgqPGD2C.png",
              alt: "banner.png",
              title: "banner.png",
              width: null,
              height: null,
            },
          },
          { type: "horizontalRule" },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Learn more" }],
          },
          {
            type: "taskList",
            content: [
              {
                type: "taskItem",
                attrs: { checked: false },
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Star us on " },
                      {
                        type: "text",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://github.com/steven-tey/novel",
                              target: "_blank",
                            },
                          },
                        ],
                        text: "GitHub",
                      },
                    ],
                  },
                ],
              },
              {
                type: "taskItem",
                attrs: { checked: false },
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Install the " },
                      {
                        type: "text",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://www.npmjs.com/package/novel",
                              target: "_blank",
                            },
                          },
                        ],
                        text: "NPM package",
                      },
                    ],
                  },
                ],
              },
              {
                type: "taskItem",
                attrs: { checked: false },
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "https://vercel.com/templates/next.js/novel",
                              target: "_blank",
                            },
                          },
                        ],
                        text: "Deploy your own",
                      },
                      { type: "text", text: " to Vercel" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }}
    />
  );
};
```

## API 参考

### Editor Props

| 参数               | 类型                             | 说明           | 默认值  |
| ------------------ | -------------------------------- | -------------- | ------- |
| `initialContent`   | `JSONContent`                    | 编辑器初始内容 | -       |
| `onChange`         | `(content: JSONContent) => void` | 内容变化回调   | -       |
| `uploadImageProps` | `UploadImageProps`               | 图片上传配置   | -       |
| `className`        | `string`                         | 自定义样式类名 | -       |
| `cacheKey`         | `string`                         | 缓存键名       | -       |
| `enableCache`      | `boolean`                        | 是否启用缓存   | `false` |

### UploadImageProps

| 参数             | 类型                           | 说明                           | 默认值   |
| ---------------- | ------------------------------ | ------------------------------ | -------- |
| `action`         | `string`                       | 上传地址（使用默认上传时必需） | -        |
| `method`         | `string`                       | 上传方法                       | `'POST'` |
| `name`           | `string`                       | 文件字段名                     | `'file'` |
| `headers`        | `Record<string, string>`       | 请求头                         | -        |
| `maxSize`        | `number`                       | 最大文件大小(MB)               | -        |
| `beforeUpload`   | `(file: File) => boolean`      | 上传前验证函数                 | -        |
| `onSuccess`      | `(res: any) => string`         | 上传成功回调，返回图片 URL     | -        |
| `onError`        | `(error: Error) => void`       | 上传失败回调                   | -        |
| `customUploadFn` | `(file: File) => Promise<any>` | 自定义上传函数                 | -        |

### 自定义上传函数说明

- `customUploadFn` 接收一个 `File` 参数，需要返回 `Promise`
- 返回的数据格式支持：
  - 包含 `url` 字段的对象（推荐）
  - 包含嵌套 `data.url` 结构的对象（如 tmpfiles.org 格式）
  - 直接的 URL 字符串
  - 其他格式需要通过 `onSuccess` 回调处理
- 错误处理：抛出错误会触发 `onError` 回调
- `onSuccess` 和 `onError` 回调的行为与默认上传方式完全一致
- 如果同时提供了 `customUploadFn` 和 `action`，优先使用 `customUploadFn`
