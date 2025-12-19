import { forwardRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useTiptapEditor } from "../../../hooks/use-tiptap-editor";

import type { ButtonProps } from "../../tiptap-ui-primitive/button";
import { Button } from "../../tiptap-ui-primitive/button";

import type { UseTextColorConfig } from "./use-text-color";
import { useTextColor } from "./use-text-color";

import "./text-color-button.scss";

export interface TextColorButtonProps extends Omit<ButtonProps, "type">, UseTextColorConfig {
  text?: string;
}

export const TextColorButton = forwardRef<HTMLButtonElement, TextColorButtonProps>(
  (
    { editor: providedEditor, color, text, hideWhenUnavailable = false, onApplied, onClick, children, style, ...props },
    ref
  ) => {
    const { t } = useTranslation("simpleEditor");
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canSetTextColor, isActive, handleSetTextColor, label } = useTextColor({
      editor,
      color,
      label: text || t("toolbar.textColor.toggle", { color }),
      hideWhenUnavailable,
      onApplied,
    });

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleSetTextColor();
      },
      [handleSetTextColor, onClick]
    );

    const buttonStyle = useMemo(
      () =>
        ({
          ...style,
          "--text-color": color,
        } as React.CSSProperties),
      [color, style]
    );

    if (!isVisible) return null;

    return (
      <Button
        type="button"
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        disabled={!canSetTextColor}
        data-disabled={!canSetTextColor}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        style={buttonStyle}
        {...props}
        ref={ref}
      >
        {children ?? (
          <>
            <span className="tiptap-button-text-color-swatch" style={{ "--text-color": color } as React.CSSProperties}>
              A
            </span>
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    );
  }
);

TextColorButton.displayName = "TextColorButton";
