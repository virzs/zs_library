import { useEffect, useRef } from "react";
import { useEditor, JSONContent } from "@tiptap/react";
import { useTranslation } from "react-i18next";
import { marked } from "marked";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- Tiptap Node ---
import { ImageUploadNode } from "./components/tiptap-node/image-upload-node/image-upload-node-extension";
import { ImageNode as ImageExtension } from "./components/tiptap-node/image-node/image-node-extension";
import { HorizontalRule } from "./components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { Markdown } from "@tiptap/markdown";

// --- Lib ---
import { MAX_FILE_SIZE } from "./lib/tiptap-utils";
import { handleImageUploadRequest } from "./lib/image-upload-handler";
import enUS from "./i18n/en-US.json";
import zhCN from "./i18n/zh-CN.json";
import { SimpleEditorFeatures, isEnabled, getConfig } from "./lib/feature-utils";
import { EditorOutputFormat } from "./lib/format-utils";

export interface UseSimpleEditorProps {
  value?: string | JSONContent;
  onChange?: (value: string | JSONContent) => void;
  features?: SimpleEditorFeatures;
  output?: EditorOutputFormat;
}

export function useSimpleEditor({ value, onChange, features, output = "html" }: UseSimpleEditorProps) {
  const { t, i18n } = useTranslation("simpleEditor");

  const imageConfig = getConfig(features?.image);
  const finalImageProps = imageConfig;
  const imageRef = useRef(finalImageProps);
  imageRef.current = finalImageProps;

  useEffect(() => {
    i18n.addResourceBundle("en-US", "simpleEditor", enUS, true, true);
    i18n.addResourceBundle("zh-CN", "simpleEditor", zhCN, true, true);
  }, [i18n]);

  // Determine content type helper
  const getContent = (val: string | JSONContent | undefined) => {
    if (val === undefined) return undefined;
    if (typeof val === "string") {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(val);
        if (typeof parsed === "object" && parsed !== null) {
          return parsed;
        }
      } catch {
        // Not JSON, continue
      }

      // If output is HTML, check if input looks like Markdown and convert if necessary.
      // Or if output is Markdown, convert Markdown to HTML for editor.
      // But user wants "value can be auto formatted to json" - Tiptap handles JSON object directly.
      // If it's a string, Tiptap treats it as HTML by default.

      // Heuristic to detect Markdown:
      // If it contains common markdown patterns AND doesn't look like full HTML document
      const isHtml = /<[a-z][\s\S]*>/i.test(val);
      if (!isHtml) {
        // Assume Markdown if not clearly HTML
        return marked.parse(val, { async: false }) as string;
      }

      return val;
    }
    return val;
  };

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": t("editor.contentAriaLabel"),
        class: "simple-editor",
      },
    },
    onUpdate: ({ editor }) => {
      const content =
        output === "markdown" ? editor.getMarkdown() : output === "json" ? editor.getJSON() : editor.getHTML();
      onChange?.(content);
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        heading: isEnabled(features?.heading)
          ? {
              levels: [1, 2, 3, 4], // Default levels
              ...getConfig(features?.heading),
            }
          : false,
        bulletList: isEnabled(features?.list) ? undefined : false,
        orderedList: isEnabled(features?.list) ? undefined : false,
        listItem: isEnabled(features?.list) ? undefined : false,
        blockquote: isEnabled(features?.blockquote) ? undefined : false,
        codeBlock: isEnabled(features?.codeBlock) ? undefined : false,
        bold: isEnabled(features?.bold) ? undefined : false,
        italic: isEnabled(features?.italic) ? undefined : false,
        strike: isEnabled(features?.strike) ? undefined : false,
        code: isEnabled(features?.code) ? undefined : false,
        link: isEnabled(features?.link)
          ? {
              openOnClick: false,
              enableClickSelection: true,
              ...getConfig(features?.link),
            }
          : false,
        undoRedo: isEnabled(features?.undoRedo) ? undefined : false,
      }),
      HorizontalRule,
      ...(isEnabled(features?.textAlign)
        ? [
            TextAlign.configure({
              types: ["heading", "paragraph"],
              ...getConfig(features?.textAlign),
            }),
          ]
        : []),
      ...(isEnabled(features?.list) ? [TaskList, TaskItem.configure({ nested: true })] : []),
      ...(isEnabled(features?.highlight)
        ? [Highlight.configure({ multicolor: true, ...getConfig(features?.highlight) })]
        : []),
      ...(isEnabled(features?.image) ? [ImageExtension] : []),
      Typography,
      ...(isEnabled(features?.superscript) ? [Superscript] : []),
      ...(isEnabled(features?.subscript) ? [Subscript] : []),
      Selection,
      ...(isEnabled(features?.image)
        ? [
            ImageUploadNode.configure({
              accept: "image/*",
              maxSize: MAX_FILE_SIZE,
              limit: 3,
              upload: (file, onProgress) =>
                handleImageUploadRequest({
                  file,
                  onProgress,
                  imageProps: imageRef.current,
                }),
              onError: (error) => console.error("Upload failed:", error),
              ...imageConfig,
            }),
          ]
        : []),
      Markdown,
    ],
    content: getContent(value),
  });

  // Track if we have set the initial content
  const hasContent = useRef(value !== undefined);

  useEffect(() => {
    // If we already have content (tracked by ref), don't do anything.
    // This ignores subsequent updates to value, treating it as initial value only.
    if (hasContent.current) return;

    if (editor && value !== undefined) {
      editor.commands.setContent(getContent(value) || "");
      hasContent.current = true;
    }
  }, [value, editor]);

  return editor;
}
