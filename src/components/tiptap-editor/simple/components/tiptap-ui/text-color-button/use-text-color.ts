"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type Editor } from "@tiptap/react";

import { useTiptapEditor } from "../../../hooks/use-tiptap-editor";
import { isMarkInSchema, isNodeTypeSelected, isExtensionAvailable } from "../../../lib/tiptap-utils";

import { RiFontColor } from "@remixicon/react";

export const TEXT_COLORS = [
  {
    label: "gray",
    value: "var(--tt-color-text-gray)",
    contrast: "var(--tt-color-text-gray-contrast)",
  },
  {
    label: "brown",
    value: "var(--tt-color-text-brown)",
    contrast: "var(--tt-color-text-brown-contrast)",
  },
  {
    label: "orange",
    value: "var(--tt-color-text-orange)",
    contrast: "var(--tt-color-text-orange-contrast)",
  },
  {
    label: "yellow",
    value: "var(--tt-color-text-yellow)",
    contrast: "var(--tt-color-text-yellow-contrast)",
  },
  {
    label: "green",
    value: "var(--tt-color-text-green)",
    contrast: "var(--tt-color-text-green-contrast)",
  },
  {
    label: "blue",
    value: "var(--tt-color-text-blue)",
    contrast: "var(--tt-color-text-blue-contrast)",
  },
  {
    label: "purple",
    value: "var(--tt-color-text-purple)",
    contrast: "var(--tt-color-text-purple-contrast)",
  },
  {
    label: "pink",
    value: "var(--tt-color-text-pink)",
    contrast: "var(--tt-color-text-pink-contrast)",
  },
  {
    label: "red",
    value: "var(--tt-color-text-red)",
    contrast: "var(--tt-color-text-red-contrast)",
  },
] as const;

export type TextColor = (typeof TEXT_COLORS)[number];

export interface UseTextColorConfig {
  editor?: Editor | null;
  color?: string;
  label?: string;
  hideWhenUnavailable?: boolean;
  onApplied?: ({ color, label }: { color: string; label: string }) => void;
}

export function pickTextColorsByValue(values: string[]) {
  const colorMap = new Map<string, TextColor>(TEXT_COLORS.map((color) => [color.value, color]));
  return values.map((value) => colorMap.get(value)).filter((color): color is TextColor => !!color);
}

export function canSetTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (isNodeTypeSelected(editor, ["image"])) return false;
  if (!isMarkInSchema("textStyle", editor)) return false;
  if (!isExtensionAvailable(editor, ["color", "textStyle"])) return false;

  try {
    return editor.can().chain().setColor("var(--tt-color-text-blue)").run();
  } catch {
    return false;
  }
}

export function isTextColorActive(editor: Editor | null, color?: string): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema("textStyle", editor)) return false;

  if (color) {
    return editor.isActive("textStyle", { color });
  }

  return !!editor.getAttributes("textStyle")?.color;
}

export function removeTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canSetTextColor(editor)) return false;

  return editor.chain().focus().unsetColor().run();
}

export function shouldShowTextColorButton(props: { editor: Editor | null; hideWhenUnavailable: boolean }): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema("textStyle", editor)) return false;
  if (!isExtensionAvailable(editor, ["color", "textStyle"])) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canSetTextColor(editor);
  }

  return true;
}

export function useTextColor(config: UseTextColorConfig) {
  const { editor: providedEditor, label, color, hideWhenUnavailable = false, onApplied } = config;
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const canSetTextColorState = useMemo(() => canSetTextColor(editor), [editor]);
  const isActive = useMemo(() => isTextColorActive(editor, color), [editor, color]);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowTextColorButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();
    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleSetTextColor = useCallback(() => {
    if (!editor || !canSetTextColorState || !color || !label) return false;

    const success = editor.chain().focus().setColor(color).run();
    if (success) {
      onApplied?.({ color, label });
    }
    return success;
  }, [editor, canSetTextColorState, color, label, onApplied]);

  const handleRemoveTextColor = useCallback(() => {
    const success = removeTextColor(editor);
    if (success) {
      onApplied?.({ color: "", label: "Remove text color" });
    }
    return success;
  }, [editor, onApplied]);

  const currentColor = editor?.getAttributes("textStyle")?.color as string | undefined;

  return {
    isVisible,
    isActive,
    canSetTextColor: canSetTextColorState,
    handleSetTextColor,
    handleRemoveTextColor,
    label: label || "Text color",
    Icon: RiFontColor,
    currentColor,
  };
}
