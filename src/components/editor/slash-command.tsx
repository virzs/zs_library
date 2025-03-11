import { Command, createSuggestionItems, renderItems, UploadFn } from "novel";
import {
  RiCodeLine,
  RiH1,
  RiH2,
  RiH3,
  RiImageLine,
  RiListCheck,
  RiListOrdered,
  RiListUnordered,
  RiQuoteText,
  RiText,
} from "@remixicon/react";
import { EditorProps } from "./type";

export interface SuggestionItemOptions {
  editorProps: EditorProps;
  uploadFn: UploadFn;
}

export const suggestionItems = ({ uploadFn }: SuggestionItemOptions) =>
  createSuggestionItems([
    {
      title: "文本", // "Text",
      description: "从纯文本开始编写。", // "Just start typing with plain text.",
      searchTerms: ["p", "paragraph"],
      icon: <RiText size={18} />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleNode("paragraph", "paragraph")
          .run();
      },
    },
    {
      title: "标题1", // "Heading 1",
      description: "大标题。", // "Big section heading.",
      searchTerms: ["title", "big", "large"],
      icon: <RiH1 size={18} />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run();
      },
    },
    {
      title: "标题2", // "Heading 2",
      description: "中标题。", // "Medium section heading.",
      searchTerms: ["subtitle", "medium"],
      icon: <RiH2 size={18} />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run();
      },
    },
    {
      title: "标题3", // "Heading 3",
      description: "小标题。", // "Small section heading.",
      searchTerms: ["subtitle", "small"],
      icon: <RiH3 size={18} />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 3 })
          .run();
      },
    },
    {
      title: "待办清单", // "To-do List",
      description: "使用待办清单追踪任务。", // "Track tasks with a to-do list.",
      searchTerms: ["todo", "task", "list", "check", "checkbox"],
      icon: <RiListCheck size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: "项目符号列表", // "Bullet List",
      description: "创建一个简单的项目符号列表。", // "Create a simple bullet list.",
      searchTerms: ["unordered", "point"],
      icon: <RiListUnordered size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "有序列表", // "Numbered List",
      description: "创建一个带有序号的列表。", // "Create a list with numbering.",
      searchTerms: ["ordered"],
      icon: <RiListOrdered size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "引用", // "Quote",
      description: "摘取引用。", // "Capture a quote.",
      searchTerms: ["blockquote"],
      icon: <RiQuoteText size={18} />,
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleNode("paragraph", "paragraph")
          .toggleBlockquote()
          .run(),
    },
    {
      title: "代码", // "Code",
      description: "捕获代码段。", // "Capture a code snippet.",
      searchTerms: ["codeblock"],
      icon: <RiCodeLine size={18} />,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      title: "图片", // "Image",
      description: "从您的计算机上传图像。", // "Upload an image from your computer.",
      searchTerms: ["photo", "picture", "media"],
      icon: <RiImageLine size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        // upload image
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {
          if (input.files?.length) {
            const file = input.files[0];
            const pos = editor.view.state.selection.from;
            uploadFn(file, editor.view, pos);
          }
        };
        input.click();
      },
    },
  ]);

export const slashCommand = (options: SuggestionItemOptions) =>
  Command.configure({
    suggestion: {
      items: () => suggestionItems(options),
      render: renderItems,
    },
  });
