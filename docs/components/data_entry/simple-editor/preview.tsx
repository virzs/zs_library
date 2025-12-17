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
