import { type Editor, findParentNodeClosestToPos } from "@tiptap/react";
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
  RiDeleteBinLine,
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

  const getEditorBoundaryEl = (): HTMLElement => {
    const dom = editor.view.dom as HTMLElement;
    const closest = dom.closest(".simple-editor-wrapper");
    if (closest instanceof HTMLElement) {
      return closest;
    }
    return dom.parentElement ?? dom;
  };

  const getTableRect = () => {
    const tableNode = findParentNodeClosestToPos(editor.state.selection.$from, (node) => node.type.name === "table");
    if (tableNode) {
      const dom = editor.view.nodeDOM(tableNode.pos);
      if (dom instanceof HTMLElement) {
        const wrapper = dom.closest(".tableWrapper") ?? dom.parentElement?.closest(".tableWrapper");
        if (wrapper instanceof HTMLElement) {
          return wrapper.getBoundingClientRect();
        }
        return dom.getBoundingClientRect();
      }
    }

    return editor.view.dom.getBoundingClientRect();
  };

  const shouldShow = ({ editor }: { editor: Editor }) => {
    return isNodeTypeSelected(editor, ["table", "tableRow", "tableCell", "tableHeader"], true);
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableMenu"
      shouldShow={shouldShow}
      appendTo={getEditorBoundaryEl}
      getReferencedVirtualElement={() => ({ getBoundingClientRect: getTableRect })}
      options={{
        strategy: "absolute",
        placement: "top",
        offset: 8,
        shift: { boundary: getEditorBoundaryEl(), padding: 8 },
        flip: {
          boundary: getEditorBoundaryEl(),
          padding: 8,
          fallbackPlacements: ["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end"],
        },
      }}
    >
      <div className="tiptap-table-menu">
        <ButtonGroup orientation="horizontal">
          <Button onClick={() => editor.chain().focus().addColumnBefore().run()} tooltip="Add Column Before">
            <RiInsertColumnLeft size={16} />
          </Button>
          <Button onClick={() => editor.chain().focus().addColumnAfter().run()} tooltip="Add Column After">
            <RiInsertColumnRight size={16} />
          </Button>
          <Button onClick={() => editor.chain().focus().deleteColumn().run()} tooltip="Delete Column">
            <RiDeleteColumn size={16} />
          </Button>
        </ButtonGroup>
        <div className="tiptap-table-menu-divider" />
        <ButtonGroup orientation="horizontal">
          <Button onClick={() => editor.chain().focus().addRowBefore().run()} tooltip="Add Row Before">
            <RiInsertRowTop size={16} />
          </Button>
          <Button onClick={() => editor.chain().focus().addRowAfter().run()} tooltip="Add Row After">
            <RiInsertRowBottom size={16} />
          </Button>
          <Button onClick={() => editor.chain().focus().deleteRow().run()} tooltip="Delete Row">
            <RiDeleteRow size={16} />
          </Button>
        </ButtonGroup>
        <div className="tiptap-table-menu-divider" />
        <ButtonGroup orientation="horizontal">
          <Button onClick={() => editor.chain().focus().mergeCells().run()} tooltip="Merge Cells">
            <RiMergeCellsHorizontal size={16} />
          </Button>
          <Button onClick={() => editor.chain().focus().splitCell().run()} tooltip="Split Cell">
            <RiSplitCellsHorizontal size={16} />
          </Button>
        </ButtonGroup>
        <div className="tiptap-table-menu-divider" />
        <Button
          onClick={() => editor.chain().focus().deleteTable().run()}
          tooltip="Delete Table"
          className="tiptap-table-menu-delete"
        >
          <RiDeleteBinLine size={16} />
        </Button>
      </div>
    </BubbleMenu>
  );
}
