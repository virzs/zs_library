import { generateHTML, generateJSON, JSONContent, Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import { ImageNode as ImageExtension } from "../components/tiptap-node/image-node/image-node-extension";
import { HorizontalRule } from "../components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { ImageUploadNode } from "../components/tiptap-node/image-upload-node/image-upload-node-extension";
import { TableExtensions } from "../components/tiptap-node/table-node/table-node-extension";
import { Link } from "@tiptap/extension-link";
import { Markdown } from "@tiptap/markdown";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

// Default extensions for format conversion
const defaultExtensions = [
  StarterKit.configure({
    horizontalRule: false,
    heading: {
      levels: [1, 2, 3, 4],
    },
    codeBlock: false,
  }),
  CodeBlockLowlight.configure({
    lowlight,
  }),
  HorizontalRule,
  ...TableExtensions,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  TextStyle,
  Color,
  ImageExtension,
  Typography,
  Superscript,
  Subscript,
  ImageUploadNode,
  Link.configure({
    openOnClick: false,
    autolink: true,
  }),
  Markdown,
];

export type EditorOutputFormat = "html" | "json" | "markdown";

/**
 * Converts JSON content to HTML string
 */
export function jsonToHtml(json: JSONContent): string {
  return generateHTML(json, defaultExtensions);
}

/**
 * Converts HTML string to JSON content
 */
export function htmlToJson(html: string): JSONContent {
  return generateJSON(html, defaultExtensions);
}

/**
 * Utility class for content format conversion
 */
export class EditorFormatConverter {
  /**
   * Transforms content based on the desired output format
   * @param content - The content from the editor (HTML or JSON)
   * @param format - The desired output format
   * @returns The transformed content
   */
  static transform(content: string | JSONContent, format: EditorOutputFormat, editor?: Editor): string | JSONContent {
    if (format === "json") {
      if (typeof content === "string") {
        return htmlToJson(content);
      }
      return content;
    }

    if (format === "html") {
      if (typeof content !== "string") {
        return jsonToHtml(content);
      }
      return content;
    }

    if (format === "markdown") {
      // For markdown, we rely on the editor instance if available because tiptap-markdown works best within the editor context
      if (editor) {
        return editor.getMarkdown();
      }
      // Fallback: If no editor instance, we can't easily convert to markdown without a running editor instance with markdown extension
      // In a real utility, we might want to spin up a headless editor or use a separate markdown converter
      console.warn("Markdown conversion requires an editor instance.");
      return "";
    }

    return content;
  }
}
