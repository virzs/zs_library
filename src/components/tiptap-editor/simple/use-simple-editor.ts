import { useEffect, useRef } from "react";
import { useEditor, JSONContent } from "@tiptap/react";
import { useTranslation } from "react-i18next";

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
    content: value,
  });

  useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent =
        output === "markdown"
          ? editor.getMarkdown()
          : output === "json"
          ? JSON.stringify(editor.getJSON())
          : editor.getHTML();

      const valueString = output === "json" && typeof value !== "string" ? JSON.stringify(value) : value;

      if (currentContent !== valueString) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor, output]);

  return editor;
}
