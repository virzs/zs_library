import "./simple-editor.scss";
import "./components/tiptap-node/blockquote-node/blockquote-node.scss";
import "./components/tiptap-node/code-block-node/code-block-node.scss";
import "./components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "./components/tiptap-node/list-node/list-node.scss";
import "./components/tiptap-node/image-node/image-node.scss";
import "./components/tiptap-node/heading-node/heading-node.scss";
import "./components/tiptap-node/paragraph-node/paragraph-node.scss";

import DOMPurify from "dompurify";
import { JSONContent } from "@tiptap/react";
import { jsonToHtml } from "./lib/format-utils";

export interface SimpleEditorRenderProps {
  value: string | JSONContent;
  className?: string;
  sanitize?: boolean;
}

export function SimpleEditorRender({ value, className, sanitize = true }: SimpleEditorRenderProps) {
  // Convert content to HTML string for rendering
  let htmlContent = "";

  if (typeof value === "string") {
    // Check if it's markdown or HTML
    // A simple heuristic: if it looks like JSON or Markdown, try to convert.
    // However, `value` prop is ambiguous here.
    // Ideally we should know the format.
    // But assuming strict usage:
    // If it's a string, it could be HTML or Markdown.
    // EditorFormatConverter.transform needs a target format, but here we need HTML for display.

    // For now, let's assume if it's a string it is HTML, as markdown rendering would require parsing.
    // If we want to support markdown input here, we'd need a markdown-to-html converter.
    // Since we don't have a standalone markdown parser exposed easily without editor instance,
    // let's assume string input is HTML for now, or use a simple heuristic.
    htmlContent = value;
  } else {
    // It's JSONContent
    htmlContent = jsonToHtml(value);
  }

  const content = sanitize ? DOMPurify.sanitize(htmlContent) : htmlContent;

  return (
    <div className={`simple-editor-wrapper ${className || ""}`}>
      <div
        className="simple-editor-content tiptap ProseMirror simple-editor"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
