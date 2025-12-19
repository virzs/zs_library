"use client";

import { forwardRef, useCallback, useState } from "react";
import { RiTable2 } from "@remixicon/react";
import { useTranslation } from "react-i18next";

import { useTiptapEditor } from "../../../hooks/use-tiptap-editor";

import { Button } from "../../tiptap-ui-primitive/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../tiptap-ui-primitive/popover";

import { useTableTriggerButton, type UseTableTriggerButtonConfig } from "./use-table-trigger-button";

import "./table-trigger-button.scss";

export interface TableTriggerButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "type">,
    UseTableTriggerButtonConfig {
  maxRows?: number;
  maxCols?: number;
  onInserted?: (rows: number, cols: number) => void;
}

export const TableTriggerButton = forwardRef<HTMLButtonElement, TableTriggerButtonProps>(
  (
    {
      editor: providedEditor,
      hideWhenUnavailable = false,
      maxRows = 10,
      maxCols = 10,
      onInserted,
      className,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { t } = useTranslation("simpleEditor");
    const { isVisible, canInsert, label } = useTableTriggerButton({ editor, hideWhenUnavailable });

    const [isOpen, setIsOpen] = useState(false);
    const [rows, setRows] = useState(0);
    const [cols, setCols] = useState(0);

    const resetSelection = useCallback(() => {
      setRows(0);
      setCols(0);
    }, []);

    const insertTable = useCallback(
      (r: number, c: number) => {
        if (!editor) return;
        if (!canInsert) return;

        const success = editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run();
        if (success) {
          onInserted?.(r, c);
        }

        setIsOpen(false);
        resetSelection();
      },
      [canInsert, editor, onInserted, resetSelection]
    );

    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!editor || !canInsert) return;
        setIsOpen(open);
        if (!open) {
          resetSelection();
        }
      },
      [canInsert, editor, resetSelection]
    );

    if (!isVisible) {
      return null;
    }

    const sizeLabel = cols > 0 && rows > 0 ? t("toolbar.table.size", { cols, rows }) : label;
    const gridStyle = { ["--tt-table-trigger-grid-cols" as unknown as string]: maxCols } as React.CSSProperties;

    return (
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            data-active-state={editor?.isActive("table") ? "on" : "off"}
            role="button"
            tabIndex={-1}
            disabled={!canInsert}
            data-disabled={!canInsert}
            aria-label={label}
            aria-pressed={editor?.isActive("table")}
            tooltip={label}
            className={className}
            ref={ref}
            {...buttonProps}
          >
            <RiTable2 className="tiptap-button-icon" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="tiptap-table-trigger-popover-content"
        >
          <div className="tiptap-table-trigger-picker">
            <div className="tiptap-table-trigger-picker-label">{sizeLabel}</div>

            <div
              className="tiptap-table-trigger-picker-grid"
              style={gridStyle}
              onMouseLeave={resetSelection}
            >
              {Array.from({ length: maxRows * maxCols }).map((_, i) => {
                const r = Math.floor(i / maxCols) + 1;
                const c = (i % maxCols) + 1;
                const isSelected = c <= cols && r <= rows;

                return (
                  <div
                    key={i}
                    className="tiptap-table-trigger-picker-cell"
                    data-selected={isSelected ? "true" : "false"}
                    onMouseEnter={() => {
                      setRows(r);
                      setCols(c);
                    }}
                    onClick={() => insertTable(r, c)}
                  />
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

TableTriggerButton.displayName = "TableTriggerButton";
