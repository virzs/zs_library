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
import { useTranslation } from "react-i18next";
import { Button, ButtonGroup } from "../../tiptap-ui-primitive/button";
import { isNodeTypeSelected } from "../../../lib/tiptap-utils";

interface TableMenuProps {
  editor: Editor | null;
}

export function TableMenu({ editor }: TableMenuProps) {
  const { t } = useTranslation("simpleEditor");

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
          <Button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            aria-label={t("toolbar.table.addColumnBefore")}
            tooltip={t("toolbar.table.addColumnBefore")}
          >
            <RiInsertColumnLeft size={16} />
          </Button>
          <Button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            aria-label={t("toolbar.table.addColumnAfter")}
            tooltip={t("toolbar.table.addColumnAfter")}
          >
            <RiInsertColumnRight size={16} />
          </Button>
          <Button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            aria-label={t("toolbar.table.deleteColumn")}
            tooltip={t("toolbar.table.deleteColumn")}
          >
            <RiDeleteColumn size={16} />
          </Button>
        </ButtonGroup>
        <div className="tiptap-table-menu-divider" />
        <ButtonGroup orientation="horizontal">
          <Button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            aria-label={t("toolbar.table.addRowBefore")}
            tooltip={t("toolbar.table.addRowBefore")}
          >
            <RiInsertRowTop size={16} />
          </Button>
          <Button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            aria-label={t("toolbar.table.addRowAfter")}
            tooltip={t("toolbar.table.addRowAfter")}
          >
            <RiInsertRowBottom size={16} />
          </Button>
          <Button
            onClick={() => editor.chain().focus().deleteRow().run()}
            aria-label={t("toolbar.table.deleteRow")}
            tooltip={t("toolbar.table.deleteRow")}
          >
            <RiDeleteRow size={16} />
          </Button>
        </ButtonGroup>
        <div className="tiptap-table-menu-divider" />
        <ButtonGroup orientation="horizontal">
          <Button
            onClick={() => editor.chain().focus().mergeCells().run()}
            aria-label={t("toolbar.table.mergeCells")}
            tooltip={t("toolbar.table.mergeCells")}
          >
            <RiMergeCellsHorizontal size={16} />
          </Button>
          <Button
            onClick={() => editor.chain().focus().splitCell().run()}
            aria-label={t("toolbar.table.splitCell")}
            tooltip={t("toolbar.table.splitCell")}
          >
            <RiSplitCellsHorizontal size={16} />
          </Button>
        </ButtonGroup>
        <div className="tiptap-table-menu-divider" />
        <Button
          onClick={() => editor.chain().focus().deleteTable().run()}
          aria-label={t("toolbar.table.deleteTable")}
          tooltip={t("toolbar.table.deleteTable")}
          className="tiptap-table-menu-delete"
        >
          <RiDeleteBinLine size={16} />
        </Button>
      </div>
    </BubbleMenu>
  );
}
