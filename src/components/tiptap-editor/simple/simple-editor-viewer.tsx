import "./styles/_variables.scss";
import "./styles/_keyframe-animations.scss";
import "./simple-editor.scss";
import "./components/tiptap-node/blockquote-node/blockquote-node.scss";
import "./components/tiptap-node/code-block-node/code-block-node.scss";
import "./components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "./components/tiptap-node/list-node/list-node.scss";
import "./components/tiptap-node/image-node/image-node.scss";
import "./components/tiptap-node/heading-node/heading-node.scss";
import "./components/tiptap-node/paragraph-node/paragraph-node.scss";
import "./components/tiptap-node/table-node/table-node.scss";

import DOMPurify from "dompurify";
import { JSONContent } from "@tiptap/react";
import { marked } from "marked";
import { jsonToHtml } from "./lib/format-utils";
import "highlight.js/styles/github-dark.css";
import { useEffect, useRef } from "react";
import hljs from "highlight.js";

export interface SimpleEditorViewerProps {
  value: string | JSONContent;
  className?: string;
  sanitize?: boolean;
  theme?: "light" | "dark";
}

export function SimpleEditorViewer({ value, className, sanitize = true, theme }: SimpleEditorViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert content to HTML string for rendering
  let htmlContent = "";

  if (typeof value === "string") {
    // Treat string input as Markdown, similar to useSimpleEditor
    htmlContent = marked.parse(value, { async: false }) as string;
  } else {
    // It's JSONContent
    htmlContent = jsonToHtml(value);
  }

  const content = sanitize ? DOMPurify.sanitize(htmlContent) : htmlContent;

  const themeClass = theme === "dark" ? "dark" : "";

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.querySelectorAll("table").forEach((table) => {
        if (table.parentElement?.classList.contains("tableWrapper")) {
          return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "tableWrapper";

        const parent = table.parentNode;
        if (!parent) return;

        parent.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      });

      containerRef.current.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [content]);

  return (
    <div className={`simple-editor-wrapper simple-editor-viewer ${themeClass} ${className || ""}`}>
      <div className="simple-editor-content">
        <div
          ref={containerRef}
          className="tiptap ProseMirror simple-editor"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
