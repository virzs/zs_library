import { EditorBubbleItem, useEditor } from "novel";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { NODE_SELECTOR_ITEMS } from "../lib/nodes";
import { RiArrowDropDownLine, RiCheckLine } from "@remixicon/react";

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
  const { editor } = useEditor();
  if (!editor) return null;
  const activeItem = NODE_SELECTOR_ITEMS.filter((item) =>
    item.isActive(editor)
  ).pop() ?? {
    name: "多个选中", // Multiple
  };

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        asChild
        className="rounded-md border-none hover:bg-accent focus:ring-0 pr-0"
      >
        <Button size="sm" variant="ghost">
          <span className="whitespace-nowrap text-sm">{activeItem.name}</span>
          <RiArrowDropDownLine />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={5} align="start" className="w-48 p-1">
        <p className="mb-2 text-sm text-secondary-foreground">转换成</p>{" "}
        {/* Convert to */}
        {NODE_SELECTOR_ITEMS.map((item) => (
          <EditorBubbleItem
            key={item.name}
            onSelect={(editor) => {
              item.command(editor);
              onOpenChange(false);
            }}
            className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-accent"
          >
            <div className="flex items-center space-x-2">
              <div className="rounded-sm border p-1">
                <item.icon className="h-3 w-3" />
              </div>
              <span>{item.name}</span>
            </div>
            {activeItem.name === item.name && <RiCheckLine size={14} />}
          </EditorBubbleItem>
        ))}
      </PopoverContent>
    </Popover>
  );
};
