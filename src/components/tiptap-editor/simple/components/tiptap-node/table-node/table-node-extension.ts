import { Extension } from "@tiptap/core";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { RiAddLine } from "@remixicon/react";

const TableAddButtons = Extension.create({
  name: "tableAddButtons",
  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey("tableAddButtons"),
        view: (view) => {
          const columnButton = document.createElement("div");
          columnButton.className = "table-add-button";
          columnButton.style.display = "none";

          const rowButton = document.createElement("div");
          rowButton.className = "table-add-button";
          rowButton.style.display = "none";

          const columnIconHost = document.createElement("span");
          const rowIconHost = document.createElement("span");
          columnButton.appendChild(columnIconHost);
          rowButton.appendChild(rowIconHost);

          let columnIconRoot: Root | null = null;
          let rowIconRoot: Root | null = null;
          columnIconRoot = createRoot(columnIconHost);
          rowIconRoot = createRoot(rowIconHost);
          columnIconRoot.render(React.createElement(RiAddLine, { size: 14 }));
          rowIconRoot.render(React.createElement(RiAddLine, { size: 14 }));

          let currentWrapper: HTMLElement | null = null;
          let isColumnVisible = false;
          let isRowVisible = false;

          const detachButtons = () => {
            columnButton.remove();
            rowButton.remove();
            currentWrapper = null;
          };

          const hideButtons = () => {
            columnButton.style.display = "none";
            rowButton.style.display = "none";
            isColumnVisible = false;
            isRowVisible = false;
          };

          const attachToWrapper = (wrapper: HTMLElement) => {
            if (currentWrapper === wrapper) return;

            detachButtons();
            currentWrapper = wrapper;
            if (getComputedStyle(wrapper).position === "static") {
              wrapper.style.position = "relative";
            }
            wrapper.appendChild(columnButton);
            wrapper.appendChild(rowButton);
          };

          const positionButtons = (wrapper: HTMLElement, table: HTMLTableElement) => {
            const edgePadding = 24;
            const buttonSize = 20;
            const gap = edgePadding - buttonSize;

            const wrapperRect = wrapper.getBoundingClientRect();
            const tableRect = table.getBoundingClientRect();

            const tableLeft = tableRect.left - wrapperRect.left + wrapper.scrollLeft;
            const tableTop = tableRect.top - wrapperRect.top + wrapper.scrollTop;
            const tableWidth = tableRect.width;
            const tableHeight = tableRect.height;

            if (isColumnVisible) {
              columnButton.style.left = `${tableLeft + tableWidth + gap}px`;
              columnButton.style.top = `${tableTop}px`;
              columnButton.style.width = `${buttonSize}px`;
              columnButton.style.height = `${tableHeight}px`;
            }

            if (isRowVisible) {
              rowButton.style.left = `${tableLeft}px`;
              rowButton.style.top = `${tableTop + tableHeight + gap}px`;
              rowButton.style.width = `${tableWidth}px`;
              rowButton.style.height = `${buttonSize}px`;
            }
          };

          const keepIfOnEdge = (event: MouseEvent) => {
            if (!currentWrapper) return false;
            if (!isColumnVisible && !isRowVisible) return false;

            const table = currentWrapper.querySelector("table");
            if (!table) return false;

            const rect = table.getBoundingClientRect();
            const x = event.clientX;
            const y = event.clientY;

            const isRightEdge = x >= rect.right && x <= rect.right + 24 && y >= rect.top && y <= rect.bottom;
            const isBottomEdge = y >= rect.bottom && y <= rect.bottom + 24 && x >= rect.left && x <= rect.right;

            if ((isRightEdge && isColumnVisible) || (isBottomEdge && isRowVisible)) {
              return true;
            }

            return false;
          };

          const getEventTargetElement = (eventTarget: EventTarget | null) => {
            if (!eventTarget) return null;
            if (eventTarget instanceof HTMLElement) return eventTarget;
            if (eventTarget instanceof Text) return eventTarget.parentElement;
            return null;
          };

          const onMouseMove = (event: MouseEvent) => {
            const target = getEventTargetElement(event.target);
            if (!target) {
              hideButtons();
              detachButtons();
              return;
            }

            if (target.closest(".table-add-button")) {
              return;
            }

            if (target.closest(".column-resize-handle")) {
              return;
            }

            const cell = target.closest("td, th") as HTMLElement | null;
            if (!cell) {
              if (keepIfOnEdge(event)) return;
              hideButtons();
              detachButtons();
              return;
            }

            const table = cell.closest("table");
            if (!table) {
              hideButtons();
              detachButtons();
              return;
            }

            const wrapper = table.closest(".tableWrapper") as HTMLElement | null;
            if (!wrapper) {
              hideButtons();
              detachButtons();
              return;
            }

            const row = cell.closest("tr");
            if (!row) {
              hideButtons();
              detachButtons();
              return;
            }

            const rows = Array.from(table.querySelectorAll("tr"));
            const rowIndex = rows.indexOf(row);
            const isLastRow = rowIndex === rows.length - 1;

            const cellsInRow = Array.from(row.querySelectorAll("td, th"));
            const cellIndex = cellsInRow.indexOf(cell);
            const isLastCol = cellIndex === cellsInRow.length - 1;

            attachToWrapper(wrapper);

            if (isLastCol) {
              columnButton.style.display = "flex";
              isColumnVisible = true;
            } else {
              columnButton.style.display = "none";
              isColumnVisible = false;
            }

            if (isLastRow) {
              rowButton.style.display = "flex";
              isRowVisible = true;
            } else {
              rowButton.style.display = "none";
              isRowVisible = false;
            }

            if (isLastCol || isLastRow) {
              positionButtons(wrapper, table);
            }

            if (!isLastCol && !isLastRow) {
              detachButtons();
            }
          };

          const onMouseLeave = () => {
            hideButtons();
            detachButtons();
          };

          const onColumnMouseDown = (event: MouseEvent) => {
            event.preventDefault();
          };
          const onRowMouseDown = (event: MouseEvent) => {
            event.preventDefault();
          };

          const onAddColumn = (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            editor.chain().focus().addColumnAfter().run();
            hideButtons();
            detachButtons();
          };

          const onAddRow = (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            editor.chain().focus().addRowAfter().run();
            hideButtons();
            detachButtons();
          };

          view.dom.addEventListener("mousemove", onMouseMove);
          view.dom.addEventListener("mouseleave", onMouseLeave);
          columnButton.addEventListener("mousedown", onColumnMouseDown);
          rowButton.addEventListener("mousedown", onRowMouseDown);
          columnButton.addEventListener("click", onAddColumn);
          rowButton.addEventListener("click", onAddRow);

          return {
            update: () => {
              if (currentWrapper && !currentWrapper.isConnected) {
                hideButtons();
                detachButtons();
                return;
              }

              if (currentWrapper && (isColumnVisible || isRowVisible)) {
                const table = currentWrapper.querySelector("table");
                if (table instanceof HTMLTableElement) {
                  positionButtons(currentWrapper, table);
                }
              }
            },
            destroy: () => {
              view.dom.removeEventListener("mousemove", onMouseMove);
              view.dom.removeEventListener("mouseleave", onMouseLeave);
              columnButton.removeEventListener("mousedown", onColumnMouseDown);
              rowButton.removeEventListener("mousedown", onRowMouseDown);
              columnButton.removeEventListener("click", onAddColumn);
              rowButton.removeEventListener("click", onAddRow);
              hideButtons();
              detachButtons();
              columnIconRoot?.unmount();
              rowIconRoot?.unmount();
              columnIconRoot = null;
              rowIconRoot = null;
            },
          };
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
  TableAddButtons,
];
