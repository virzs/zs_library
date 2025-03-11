import { css, cx } from "@emotion/css";
import { RiAddLine, RiDraggable } from "@remixicon/react";
import { useEditor } from "novel";
import { Button } from "../ui/button";

const DragHandle = () => {
  const { editor } = useEditor();

  const onAddClick = (e: React.MouseEvent) => {
    if (!editor) return;

    const dragHandle = (e.target as Element).closest(".custom-drag-handle");
    if (!dragHandle) return;

    const nodePos = (dragHandle as HTMLElement).dataset.nodePos;

    const index =
      nodePos !== undefined
        ? parseInt((dragHandle as HTMLElement).dataset.nodePos || "0", 10)
        : nodePos;

    if (index !== undefined) {
      editor.commands.focus();
      editor.commands.setNodeSelection(index);

      // 创建新段落
      const success = editor.commands.createParagraphNear();

      if (success) {
        // 插入斜杠触发命令菜单
        editor.commands.insertContent("/");
      } else {
        // 备选方案：直接在位置插入内容
        editor
          .chain()
          .insertContentAt(index, {
            type: "paragraph",
            content: [{ type: "text", text: "/" }],
          })
          .run();
      }
    }
  };

  const onDraggableClick = () => {};

  return (
    <div
      className={cx(
        "custom-drag-handle",
        css`
          width: auto;
          background: none;
          display: flex;
          align-items: center;
        `
      )}
    >
      <Button
        size="icon"
        variant="ghost"
        className="w-auto h-auto p-0.5"
        onClick={onAddClick}
      >
        <RiAddLine className="cursor-pointer" size={22} />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="w-auto h-auto p-0.5"
        onClick={onDraggableClick}
      >
        <RiDraggable size={22} />
      </Button>
    </div>
  );
};

export default DragHandle;
