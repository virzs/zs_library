import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { 
  RiInsertRowTop, 
  RiInsertRowBottom, 
  RiInsertColumnLeft, 
  RiInsertColumnRight,
  RiDeleteRow,
  RiDeleteColumn,
  RiMergeCellsHorizontal,
  RiSplitCellsHorizontal,
  RiDeleteBinLine
} from "@remixicon/react";
import { Button, ButtonGroup } from "../../tiptap-ui-primitive/button";
import { isNodeTypeSelected } from "../../../lib/tiptap-utils";

interface TableMenuProps {
  editor: Editor | null;
}

export function TableMenu({ editor }: TableMenuProps) {
  if (!editor) {
    return null;
  }

  const shouldShow = ({ editor }: { editor: Editor }) => {
    return isNodeTypeSelected(editor, ["table", "tableRow", "tableCell", "tableHeader"], true);
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableMenu"
      shouldShow={shouldShow}
      tippyOptions={{ duration: 100, maxWidth: "none", placement: "top" }}
    >
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <ButtonGroup orientation="horizontal">
            <Button onClick={() => editor.chain().focus().addColumnBefore().run()} tooltip="Add Column Before" size="sm" variant="ghost">
                <RiInsertColumnLeft size={16} />
            </Button>
            <Button onClick={() => editor.chain().focus().addColumnAfter().run()} tooltip="Add Column After" size="sm" variant="ghost">
                <RiInsertColumnRight size={16} />
            </Button>
            <Button onClick={() => editor.chain().focus().deleteColumn().run()} tooltip="Delete Column" size="sm" variant="ghost">
                <RiDeleteColumn size={16} />
            </Button>
        </ButtonGroup>
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />
        <ButtonGroup orientation="horizontal">
            <Button onClick={() => editor.chain().focus().addRowBefore().run()} tooltip="Add Row Before" size="sm" variant="ghost">
                <RiInsertRowTop size={16} />
            </Button>
            <Button onClick={() => editor.chain().focus().addRowAfter().run()} tooltip="Add Row After" size="sm" variant="ghost">
                <RiInsertRowBottom size={16} />
            </Button>
            <Button onClick={() => editor.chain().focus().deleteRow().run()} tooltip="Delete Row" size="sm" variant="ghost">
                <RiDeleteRow size={16} />
            </Button>
        </ButtonGroup>
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />
        <ButtonGroup orientation="horizontal">
            <Button onClick={() => editor.chain().focus().mergeCells().run()} tooltip="Merge Cells" size="sm" variant="ghost">
                <RiMergeCellsHorizontal size={16} />
            </Button>
            <Button onClick={() => editor.chain().focus().splitCell().run()} tooltip="Split Cell" size="sm" variant="ghost">
                <RiSplitCellsHorizontal size={16} />
            </Button>
        </ButtonGroup>
         <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />
        <Button onClick={() => editor.chain().focus().deleteTable().run()} tooltip="Delete Table" size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
            <RiDeleteBinLine size={16} />
        </Button>
      </div>
    </BubbleMenu>
  );
}
