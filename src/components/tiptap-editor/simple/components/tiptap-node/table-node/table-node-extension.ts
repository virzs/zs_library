import { Extension } from "@tiptap/core";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { cellAround, CellSelection, TableMap } from "@tiptap/pm/tables";

const TableCellFocus = Extension.create({
  name: "tableCellFocus",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("tableCellFocus"),
        props: {
          decorations: (state) => {
            const { selection, doc } = state;

            if (selection instanceof CellSelection) {
              const $anchor = selection.$anchor;
              let tableNode: PMNode | null = null;
              let tablePos = -1;

              for (let d = $anchor.depth; d > 0; d--) {
                const node = $anchor.node(d);
                if (node.type.name === "table" || node.type.spec.tableRole === "table") {
                  tableNode = node;
                  tablePos = $anchor.before(d);
                  break;
                }
              }

              if (!tableNode || tablePos < 0) {
                return DecorationSet.empty;
              }

              const start = tablePos + 1;
              const map = TableMap.get(tableNode);
              const selected = new Set<number>();

              selection.forEachCell((_, pos) => {
                selected.add(pos);
              });

              const isSelectedAt = (row: number, col: number) => {
                if (row < 0 || col < 0 || row >= map.height || col >= map.width) return false;
                const rel = map.map[row * map.width + col];
                return selected.has(start + rel);
              };

              const decos: Decoration[] = [];

              selected.forEach((pos) => {
                const cellNode = doc.nodeAt(pos);
                if (!cellNode) return;

                let rect: { left: number; right: number; top: number; bottom: number } | null = null;
                try {
                  rect = map.findCell(pos - start);
                } catch {
                  rect = null;
                }
                if (!rect) return;

                let showTop = rect.top === 0;
                let showBottom = rect.bottom === map.height;
                let showLeft = rect.left === 0;
                let showRight = rect.right === map.width;

                if (!showTop) {
                  let allSelected = true;
                  for (let c = rect.left; c < rect.right; c++) {
                    if (!isSelectedAt(rect.top - 1, c)) {
                      allSelected = false;
                      break;
                    }
                  }
                  showTop = !allSelected;
                }

                if (!showBottom) {
                  let allSelected = true;
                  for (let c = rect.left; c < rect.right; c++) {
                    if (!isSelectedAt(rect.bottom, c)) {
                      allSelected = false;
                      break;
                    }
                  }
                  showBottom = !allSelected;
                }

                if (!showLeft) {
                  let allSelected = true;
                  for (let r = rect.top; r < rect.bottom; r++) {
                    if (!isSelectedAt(r, rect.left - 1)) {
                      allSelected = false;
                      break;
                    }
                  }
                  showLeft = !allSelected;
                }

                if (!showRight) {
                  let allSelected = true;
                  for (let r = rect.top; r < rect.bottom; r++) {
                    if (!isSelectedAt(r, rect.right)) {
                      allSelected = false;
                      break;
                    }
                  }
                  showRight = !allSelected;
                }

                const classes = [
                  "table-selected-cell",
                  showTop && "table-sel-top",
                  showRight && "table-sel-right",
                  showBottom && "table-sel-bottom",
                  showLeft && "table-sel-left",
                ]
                  .filter(Boolean)
                  .join(" ");

                decos.push(
                  Decoration.node(pos, pos + cellNode.nodeSize, {
                    class: classes,
                  })
                );
              });

              return DecorationSet.create(doc, decos);
            }

            const cell = cellAround(selection.$from);
            if (!cell) {
              return DecorationSet.empty;
            }

            const cellNode = doc.nodeAt(cell.pos);
            if (!cellNode) {
              return DecorationSet.empty;
            }

            const deco = Decoration.node(cell.pos, cell.pos + cellNode.nodeSize, {
              class: "table-active-cell",
            });

            return DecorationSet.create(doc, [deco]);
          },
        },
      }),
    ];
  },
});

export const TableExtensions = [
  Table.configure({
    resizable: true,
    cellMinWidth: 120,
  }),
  TableRow,
  TableHeader,
  TableCell,
  TableCellFocus,
];
