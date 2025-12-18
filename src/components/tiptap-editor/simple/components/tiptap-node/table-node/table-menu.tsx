import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { posToDOMRect, findParentNode } from "@tiptap/core";
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
    const boundary = dom.closest(".simple-editor-wrapper");
    if (boundary instanceof HTMLElement) {
      return boundary;
    }

    return dom.parentElement ?? dom;
  };

  const getReferencedVirtualElement = () => {
    const parentNode = findParentNode((node) => node.type.name === "table")(editor.state.selection);

    if (parentNode) {
      const tableEl = editor.view.nodeDOM(parentNode.pos);
      if (tableEl instanceof HTMLElement) {
        return tableEl;
      }

      const domRect = posToDOMRect(editor.view, parentNode.start, parentNode.start + parentNode.node.nodeSize);
      return { getBoundingClientRect: () => domRect, getClientRects: () => [domRect] };
    }

    return null;
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableMenu"
      shouldShow={({ editor: currentEditor }) => {
        return isNodeTypeSelected(currentEditor, ["table", "tableRow", "tableCell", "tableHeader"], true);
      }}
      appendTo={getEditorBoundaryEl}
      getReferencedVirtualElement={getReferencedVirtualElement}
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
