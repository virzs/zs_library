import { Editor } from "@tiptap/react";
import { RiTable2 } from "@remixicon/react";
import { Popover, PopoverContent, PopoverTrigger } from "../../tiptap-ui-primitive/popover";
import { Button } from "../../tiptap-ui-primitive/button";
import { useState } from "react";
import { cn } from "../../../lib/tiptap-utils";
import { useTranslation } from "react-i18next";

interface TableTriggerButtonProps {
  editor: Editor | null;
}

export function TableTriggerButton({ editor }: TableTriggerButtonProps) {
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const { t } = useTranslation("simpleEditor");

  if (!editor) {
    return null;
  }

  const insertTable = (r: number, c: number) => {
    editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          data-active={editor.isActive("table")}
          className={cn(editor.isActive("table") && "is-active")}
          aria-label={t("toolbar.table.insertTable")}
          tooltip={t("toolbar.table.insertTable")}
        >
          <RiTable2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-3 w-auto bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-lg"
        align="start"
        style={{ width: "auto", minWidth: "auto" }}
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 px-1">
            {cols > 0 && rows > 0 ? t("toolbar.table.size", { cols, rows }) : t("toolbar.table.insertTable")}
          </div>
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: "repeat(10, 1fr)" }}
            onMouseLeave={() => {
              setRows(0);
              setCols(0);
            }}
          >
            {Array.from({ length: 100 }).map((_, i) => {
              const r = Math.floor(i / 10) + 1;
              const c = (i % 10) + 1;
              return (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 border rounded-[2px] cursor-pointer transition-all duration-75",
                    c <= cols && r <= rows
                      ? "bg-blue-500 border-blue-600 dark:bg-blue-600 dark:border-blue-500"
                      : "bg-neutral-100 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700"
                  )}
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
