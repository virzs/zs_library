"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { useTranslation } from "react-i18next";

import { useTiptapEditor } from "../../../hooks/use-tiptap-editor";
import { isNodeInSchema } from "../../../lib/tiptap-utils";

export interface UseTableTriggerButtonConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
}

export function canInsertTable(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema("table", editor)) return false;
  const canCommands = editor.can() as unknown as {
    insertTable?: (attrs: { rows: number; cols: number; withHeaderRow: boolean }) => boolean;
  };
  return canCommands.insertTable ? canCommands.insertTable({ rows: 1, cols: 1, withHeaderRow: true }) : false;
}

export function shouldShowButton(props: { editor: Editor | null; hideWhenUnavailable: boolean }): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema("table", editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canInsertTable(editor);
  }

  return true;
}

export function useTableTriggerButton(config?: UseTableTriggerButtonConfig) {
  const { editor: providedEditor, hideWhenUnavailable = false } = config || {};
  const { t } = useTranslation("simpleEditor");
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const canInsert = canInsertTable(editor);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  return {
    editor,
    isVisible,
    canInsert,
    label: t("toolbar.table.insertTable"),
  };
}
