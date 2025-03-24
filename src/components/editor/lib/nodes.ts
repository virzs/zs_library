import {
  RemixiconComponentType,
  RiCodeLine,
  RiH1,
  RiH2,
  RiH3,
  RiListCheck,
  RiListOrdered,
  RiListUnordered,
  RiQuoteText,
  RiText,
} from "@remixicon/react";
import { useEditor } from "novel";

export type SelectorItem = {
  name: string;
  icon: RemixiconComponentType;
  command: (editor: ReturnType<typeof useEditor>["editor"]) => void;
  isActive: (editor: ReturnType<typeof useEditor>["editor"]) => boolean;
};

export const NODE_SELECTOR_ITEMS: SelectorItem[] = [
  {
    name: "正文", // Text
    icon: RiText,
    command: (editor) => editor!.chain().focus().clearNodes().run(),
    isActive: (editor) =>
      editor!.isActive("paragraph") &&
      !editor!.isActive("bulletList") &&
      !editor!.isActive("orderedList"),
  },
  {
    name: "标题 1", // Heading 1
    icon: RiH1,
    command: (editor) =>
      editor!.chain().focus().clearNodes().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor!.isActive("heading", { level: 1 }),
  },
  {
    name: "标题 2", // Heading 2
    icon: RiH2,
    command: (editor) =>
      editor!.chain().focus().clearNodes().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor!.isActive("heading", { level: 2 }),
  },
  {
    name: "标题 3", // Heading 3
    icon: RiH3,
    command: (editor) =>
      editor!.chain().focus().clearNodes().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor!.isActive("heading", { level: 3 }),
  },
  {
    name: "待办列表", // To-do List
    icon: RiListCheck,
    command: (editor) =>
      editor!.chain().focus().clearNodes().toggleTaskList().run(),
    isActive: (editor) => editor!.isActive("taskItem"),
  },
  {
    name: "无序列表", // Bullet List
    icon: RiListUnordered,
    command: (editor) =>
      editor!.chain().focus().clearNodes().toggleBulletList().run(),
    isActive: (editor) => editor!.isActive("bulletList"),
  },
  {
    name: "有序列表", // Numbered List
    icon: RiListOrdered,
    command: (editor) =>
      editor!.chain().focus().clearNodes().toggleOrderedList().run(),
    isActive: (editor) => editor!.isActive("orderedList"),
  },
  {
    name: "引用", // Quote
    icon: RiQuoteText,
    command: (editor) =>
      editor!.chain().focus().clearNodes().toggleBlockquote().run(),
    isActive: (editor) => editor!.isActive("blockquote"),
  },
  {
    name: "代码块", // Code
    icon: RiCodeLine,
    command: (editor) =>
      editor!.chain().focus().clearNodes().toggleCodeBlock().run(),
    isActive: (editor) => editor!.isActive("codeBlock"),
  },
];
