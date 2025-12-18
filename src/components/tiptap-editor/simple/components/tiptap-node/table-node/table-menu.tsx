import { Editor, findParentNodeClosestToPos } from "@tiptap/react";
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

  const getEditorBoundaryEl = () => {
    const dom = editor.view.dom as HTMLElement;
    return dom.closest(".simple-editor-wrapper") ?? dom.parentElement ?? dom;
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

  const updatePlacement = (instance: any) => {
    const boundaryEl = getEditorBoundaryEl();
    const boundaryRect = boundaryEl.getBoundingClientRect();
    const tableRect = getTableRect();

    const padding = 8;
    const popperWidth = instance.popper.getBoundingClientRect().width;

    const leftMin = boundaryRect.left + padding;
    const rightMax = boundaryRect.right - padding;

    const canStart = tableRect.left >= leftMin && tableRect.left + popperWidth <= rightMax;
    const canEnd = tableRect.right <= rightMax && tableRect.right - popperWidth >= leftMin;
    const tableCenter = tableRect.left + tableRect.width / 2;
    const canCenter = tableCenter - popperWidth / 2 >= leftMin && tableCenter + popperWidth / 2 <= rightMax;

    let placement: string = "top";
    if (!canCenter) {
      if (!canStart && canEnd) {
        placement = "top-end";
      } else if (canStart && !canEnd) {
        placement = "top-start";
      } else if (canStart) {
        placement = "top-start";
      }
    }

    instance.setProps({ placement });
    instance.popperInstance?.update();
  };

  const shouldShow = ({ editor }: { editor: Editor }) => {
    return isNodeTypeSelected(editor, ["table", "tableRow", "tableCell", "tableHeader"], true);
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableMenu"
      shouldShow={shouldShow}
      tippyOptions={{
        duration: 100,
        maxWidth: "none",
        placement: "top",
        offset: [0, 8],
        appendTo: getEditorBoundaryEl,
        onMount: updatePlacement,
        onShow: updatePlacement,
        onAfterUpdate: updatePlacement,
        popperOptions: {
          strategy: "absolute",
          modifiers: [
            {
              name: "shift",
              options: {
                boundary: getEditorBoundaryEl(),
                padding: 8,
              },
            },
            {
              name: "preventOverflow",
              options: {
                boundary: getEditorBoundaryEl(),
                padding: 8,
                altAxis: true,
                tether: false,
              },
            },
            {
              name: "flip",
              options: {
                boundary: getEditorBoundaryEl(),
                padding: 8,
                fallbackPlacements: ["top", "bottom", "top-start", "bottom-start", "top-end", "bottom-end"],
              },
            },
          ],
        },
        getReferenceClientRect: getTableRect,
      }}
    >
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
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
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />
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
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />
        <ButtonGroup orientation="horizontal">
          <Button onClick={() => editor.chain().focus().mergeCells().run()} tooltip="Merge Cells">
            <RiMergeCellsHorizontal size={16} />
          </Button>
          <Button onClick={() => editor.chain().focus().splitCell().run()} tooltip="Split Cell">
            <RiSplitCellsHorizontal size={16} />
          </Button>
        </ButtonGroup>
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />
        <Button
          onClick={() => editor.chain().focus().deleteTable().run()}
          tooltip="Delete Table"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <RiDeleteBinLine size={16} />
        </Button>
      </div>
    </BubbleMenu>
  );
}
