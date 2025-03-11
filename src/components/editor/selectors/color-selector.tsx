import { EditorBubbleItem, useEditor } from "novel";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { HIGHLIGHT_COLORS, TEXT_COLORS } from "../lib/colors";
import { RiArrowDropDownLine, RiCheckLine } from "@remixicon/react";
import Tooltip from "../ui/tooltip";

interface ColorSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ColorSelector = ({ open, onOpenChange }: ColorSelectorProps) => {
  const { editor } = useEditor();

  if (!editor) return null;
  const activeColorItem = TEXT_COLORS.find(({ color }) =>
    editor.isActive("textStyle", { color })
  );

  const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) =>
    editor.isActive("highlight", { color })
  );

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <Tooltip overlay="文本颜色" placement="top">
        <PopoverTrigger asChild>
          <Button size="sm" className="gap-1 rounded-md pr-0" variant="ghost">
            <span
              className="rounded-sm px-1"
              style={{
                color: activeColorItem?.color,
                backgroundColor: activeHighlightItem?.color,
              }}
            >
              A
            </span>
            <RiArrowDropDownLine />
          </Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        sideOffset={5}
        className="my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded border p-1 shadow-xl "
        align="start"
      >
        <div className="flex flex-col">
          <div className="my-1 px-2 text-sm font-semibold text-muted-foreground">
            颜色{/*  Color */}
          </div>
          {TEXT_COLORS.map(({ name, color }) => (
            <EditorBubbleItem
              key={name}
              onSelect={() => {
                editor.commands.unsetColor();
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                name !== "Default" &&
                  editor
                    .chain()
                    .focus()
                    .setColor(color || "")
                    .run();
                onOpenChange(false);
              }}
              className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-sm border px-2 py-px font-medium"
                  style={{ color }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
              {editor.isActive("textStyle", { color }) && (
                <RiCheckLine size={14} />
              )}
            </EditorBubbleItem>
          ))}
        </div>
        <div>
          <div className="my-1 px-2 text-sm font-semibold text-muted-foreground">
            背景 {/* Background */}
          </div>
          {HIGHLIGHT_COLORS.map(({ name, color }) => (
            <EditorBubbleItem
              key={name}
              onSelect={() => {
                editor.commands.unsetHighlight();
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                name !== "Default" &&
                  editor.chain().focus().setHighlight({ color }).run();
                onOpenChange(false);
              }}
              className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-sm border px-2 py-px font-medium"
                  style={{ backgroundColor: color }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
              {editor.isActive("highlight", { color }) && (
                <RiCheckLine size={14} />
              )}
            </EditorBubbleItem>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
