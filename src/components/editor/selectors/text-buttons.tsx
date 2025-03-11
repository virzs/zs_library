import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";
import { Button } from "../ui/button";
import { cx } from "@emotion/css";
import { SelectorItem } from "../lib/nodes";

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;
  const items: SelectorItem[] = [
    {
      name: "粗体", // bold
      isActive: (editor) => editor!.isActive("bold"),
      command: (editor) => editor!.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "斜体", // italic
      isActive: (editor) => editor!.isActive("italic"),
      command: (editor) => editor!.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "下划线", // underline
      isActive: (editor) => editor!.isActive("underline"),
      command: (editor) => editor!.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "删除线", // strike
      isActive: (editor) => editor!.isActive("strike"),
      command: (editor) => editor!.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: "代码", // code
      isActive: (editor) => editor!.isActive("code"),
      command: (editor) => editor!.chain().focus().toggleCode().run(),
      icon: CodeIcon,
    },
  ];
  return (
    <div className="flex">
      {items.map((item) => (
        <EditorBubbleItem
          key={item.name}
          onSelect={(editor) => {
            item.command(editor);
          }}
        >
          <Button
            size="sm"
            className="rounded-md"
            variant="ghost"
            type="button"
          >
            <item.icon
              className={cx("h-4 w-4", {
                "text-blue-500": item.isActive(editor),
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};
