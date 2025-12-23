/* eslint-disable react-refresh/only-export-components */
import React, { useState } from "react";
import { JSONContent, SimpleEditor, SimpleEditorViewer } from "zs_library";
import { createPortal } from "react-dom";

const defaultContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { textAlign: null, level: 1 },
      content: [{ type: "text", text: "SimpleEditor 全量示例" }],
    },
    {
      type: "paragraph",
      attrs: { textAlign: "left" },
      content: [
        { type: "text", text: "段落样式：" },
        { type: "text", marks: [{ type: "bold" }], text: "粗体" },
        { type: "text", text: " / " },
        { type: "text", marks: [{ type: "italic" }], text: "斜体" },
        { type: "text", text: " / " },
        { type: "text", marks: [{ type: "strike" }], text: "删除线" },
        { type: "text", text: " / " },
        { type: "text", marks: [{ type: "underline" }], text: "下划线" },
        { type: "text", text: " / " },
        { type: "text", marks: [{ type: "code" }], text: "行内代码" },
        { type: "text", text: " / " },
        {
          type: "text",
          marks: [{ type: "textStyle", attrs: { color: "rgb(220, 38, 38)" } }],
          text: "文字颜色",
        },
        { type: "text", text: " / " },
        {
          type: "text",
          marks: [{ type: "highlight", attrs: { color: "var(--tt-color-highlight-yellow)" } }],
          text: "高亮",
        },
        { type: "text", text: " / " },
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://tiptap.dev",
                target: "_blank",
                rel: "noopener noreferrer nofollow",
                class: null,
              },
            },
          ],
          text: "链接",
        },
        { type: "text", text: "。" },
      ],
    },
    {
      type: "heading",
      attrs: { textAlign: "left", level: 2 },
      content: [{ type: "text", text: "对齐" }],
    },
    {
      type: "paragraph",
      attrs: { textAlign: "center" },
      content: [{ type: "text", text: "居中对齐（paragraph.textAlign = center）" }],
    },
    {
      type: "paragraph",
      attrs: { textAlign: "right" },
      content: [{ type: "text", text: "右对齐（paragraph.textAlign = right）" }],
    },
    {
      type: "paragraph",
      attrs: { textAlign: "justify" },
      content: [
        {
          type: "text",
          text: "两端对齐（paragraph.textAlign = justify）：这是一段用于展示两端对齐效果的较长文本，请随意编辑以观察布局变化。",
        },
      ],
    },
    { type: "horizontalRule" },
    {
      type: "heading",
      attrs: { textAlign: "left", level: 2 },
      content: [{ type: "text", text: "列表" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: [{ type: "text", text: "无序列表项 1" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: [{ type: "text", text: "无序列表项 2" }],
            },
          ],
        },
      ],
    },
    {
      type: "orderedList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: [{ type: "text", text: "有序列表项 1" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: [{ type: "text", text: "有序列表项 2" }],
            },
          ],
        },
      ],
    },
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: true },
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: [{ type: "text", text: "任务列表：已完成" }],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: [{ type: "text", text: "任务列表：未完成" }],
            },
          ],
        },
      ],
    },
    { type: "horizontalRule" },
    {
      type: "heading",
      attrs: { textAlign: "left", level: 2 },
      content: [{ type: "text", text: "引用" }],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          attrs: { textAlign: "left" },
          content: [{ type: "text", marks: [{ type: "italic" }], text: "这是一段引用内容，用于展示 blockquote。" }],
        },
      ],
    },
    { type: "horizontalRule" },
    {
      type: "heading",
      attrs: { textAlign: "left", level: 2 },
      content: [{ type: "text", text: "代码块（语法高亮）" }],
    },
    {
      type: "codeBlock",
      attrs: { language: "ts" },
      content: [
        {
          type: "text",
          text: `type User = { id: string; name: string };\n\nexport function getUserName(user: User) {\n  return user.name;\n}\n`,
        },
      ],
    },
    { type: "horizontalRule" },
    {
      type: "heading",
      attrs: { textAlign: "left", level: 2 },
      content: [{ type: "text", text: "图片" }],
    },
    {
      type: "paragraph",
      attrs: { textAlign: "left" },
      content: [{ type: "text", text: "你可以删除下面图片或在编辑器里重新上传。" }],
    },
    {
      type: "image",
      attrs: {
        src: "https://picsum.photos/1200/700",
        alt: "random-image",
        title: "random-image",
      },
    },
    { type: "horizontalRule" },
    {
      type: "heading",
      attrs: { textAlign: "left", level: 2 },
      content: [{ type: "text", text: "表格" }],
    },
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [
            {
              type: "tableHeader",
              content: [{ type: "paragraph", attrs: { textAlign: "left" }, content: [{ type: "text", text: "字段" }] }],
            },
            {
              type: "tableHeader",
              content: [{ type: "paragraph", attrs: { textAlign: "left" }, content: [{ type: "text", text: "说明" }] }],
            },
          ],
        },
        {
          type: "tableRow",
          content: [
            {
              type: "tableCell",
              content: [
                { type: "paragraph", attrs: { textAlign: "left" }, content: [{ type: "text", text: "value" }] },
              ],
            },
            {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: "left" },
                  content: [{ type: "text", text: "支持 string（Markdown）或 JSONContent" }],
                },
              ],
            },
          ],
        },
        {
          type: "tableRow",
          content: [
            {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: "left" },
                  content: [{ type: "text", text: "SimpleEditorViewer" }],
                },
              ],
            },
            {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: "left" },
                  content: [{ type: "text", text: "用于脱离编辑器进行渲染预览" }],
                },
              ],
            },
          ],
        },
      ],
    },
    { type: "paragraph", attrs: { textAlign: "left" }, content: [{ type: "text", text: "/" }] },
  ],
};

export default () => {
  const [value, setValue] = useState<JSONContent | string>(defaultContent);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  const editorPane = (
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
      <SimpleEditor value={value} onChange={(v) => setValue(v)} />
    </div>
  );

  const viewerPane = (showFullscreenButton: boolean) => (
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
        }}
      >
        <h3 style={{ margin: 0 }}>预览</h3>
        {showFullscreenButton && (
          <button
            type="button"
            onClick={() => setIsPreviewFullscreen(true)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            全屏对比
          </button>
        )}
      </div>
      <div style={{ overflow: "auto", padding: "16px" }}>
        <SimpleEditorViewer value={value} />
      </div>
    </div>
  );

  const previewFullscreen =
    typeof document !== "undefined" && isPreviewFullscreen
      ? createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.55)",
              zIndex: 2147483647,
              display: "flex",
              flexDirection: "column",
              padding: "24px",
            }}
            onClick={() => setIsPreviewFullscreen(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "10px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 600 }}>编辑与预览（全屏对比）</div>
                <button
                  type="button"
                  onClick={() => setIsPreviewFullscreen(false)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  关闭
                </button>
              </div>
              <div style={{ flex: 1, overflow: "hidden", padding: "16px" }}>
                <div style={{ display: "flex", gap: "20px", height: "100%" }}>
                  {editorPane}
                  {viewerPane(false)}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div style={{ display: "flex", gap: "20px", height: "70vh", minHeight: "600px" }}>
      {editorPane}
      {viewerPane(true)}
      {previewFullscreen}
    </div>
  );
};
