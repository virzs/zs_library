import { forwardRef, useMemo, useRef, useState } from "react";
import { type Editor } from "@tiptap/react";
import { useTranslation } from "react-i18next";

import { useMenuNavigation } from "../../../hooks/use-menu-navigation";
import { useIsBreakpoint } from "../../../hooks/use-is-breakpoint";
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor";

import { RiForbidLine, RiFontColor } from "@remixicon/react";

import type { ButtonProps } from "../../tiptap-ui-primitive/button";
import { Button, ButtonGroup } from "../../tiptap-ui-primitive/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../tiptap-ui-primitive/popover";
import { Separator } from "../../tiptap-ui-primitive/separator";
import { Card, CardBody, CardItemGroup } from "../../tiptap-ui-primitive/card";

import type { TextColor, UseTextColorConfig } from "../text-color-button";
import { TextColorButton, pickTextColorsByValue, useTextColor } from "../text-color-button";

export interface TextColorPopoverContentProps {
  editor?: Editor | null;
  colors?: TextColor[];
}

export interface TextColorPopoverProps
  extends Omit<ButtonProps, "type">,
    Pick<UseTextColorConfig, "editor" | "hideWhenUnavailable" | "onApplied"> {
  colors?: TextColor[];
}

export const TextColorPopoverButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    const { t } = useTranslation("simpleEditor");

    return (
      <Button
        type="button"
        className={className}
        data-style="ghost"
        data-appearance="default"
        role="button"
        tabIndex={-1}
        aria-label={t("toolbar.textColor.label")}
        tooltip={t("toolbar.textColor.label")}
        ref={ref}
        {...props}
      >
        {children ?? <RiFontColor className="tiptap-button-icon" />}
      </Button>
    );
  }
);

TextColorPopoverButton.displayName = "TextColorPopoverButton";

export function TextColorPopoverContent({
  editor,
  colors = pickTextColorsByValue([
    "var(--tt-color-text-green)",
    "var(--tt-color-text-blue)",
    "var(--tt-color-text-red)",
    "var(--tt-color-text-purple)",
    "var(--tt-color-text-yellow)",
  ]),
}: TextColorPopoverContentProps) {
  const { t } = useTranslation("simpleEditor");
  const { handleRemoveTextColor } = useTextColor({ editor });
  const isMobile = useIsBreakpoint();
  const containerRef = useRef<HTMLDivElement>(null);

  const menuItems = useMemo(() => [...colors, { label: "none", value: "none", contrast: "" }], [colors]);

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (!containerRef.current) return false;
      const highlightedElement = containerRef.current.querySelector('[data-highlighted="true"]') as HTMLElement;
      if (highlightedElement) highlightedElement.click();
      if (item.value === "none") handleRemoveTextColor();
      return true;
    },
    autoSelectFirstItem: false,
  });

  return (
    <Card ref={containerRef} tabIndex={0} style={isMobile ? { boxShadow: "none", border: 0 } : {}}>
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <CardItemGroup orientation="horizontal">
          <ButtonGroup orientation="horizontal">
            {colors.map((color, index) => (
              <TextColorButton
                key={color.value}
                editor={editor}
                color={color.value}
                tooltip={t(`toolbar.textColor.colors.${color.label}`)}
                aria-label={t(`toolbar.textColor.colors.${color.label}`)}
                tabIndex={index === selectedIndex ? 0 : -1}
                data-highlighted={selectedIndex === index}
              />
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup orientation="horizontal">
            <Button
              onClick={handleRemoveTextColor}
              aria-label={t("toolbar.textColor.remove")}
              tooltip={t("toolbar.textColor.remove")}
              tabIndex={selectedIndex === colors.length ? 0 : -1}
              type="button"
              role="menuitem"
              data-style="ghost"
              data-highlighted={selectedIndex === colors.length}
            >
              <RiForbidLine className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  );
}

export function TextColorPopover({
  editor: providedEditor,
  colors = pickTextColorsByValue([
    "var(--tt-color-text-green)",
    "var(--tt-color-text-blue)",
    "var(--tt-color-text-red)",
    "var(--tt-color-text-purple)",
    "var(--tt-color-text-yellow)",
  ]),
  hideWhenUnavailable = false,
  onApplied,
  ...props
}: TextColorPopoverProps) {
  const { t } = useTranslation("simpleEditor");
  const triggerLabel = t("toolbar.textColor.label");
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = useState(false);

  const { isVisible, canSetTextColor, isActive, Icon } = useTextColor({
    editor,
    hideWhenUnavailable,
    onApplied,
    label: triggerLabel,
  });

  if (!isVisible) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <TextColorPopoverButton
          disabled={!canSetTextColor}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={!canSetTextColor}
          aria-pressed={isActive}
          aria-label={triggerLabel}
          tooltip={triggerLabel}
          {...props}
        >
          <Icon className="tiptap-button-icon" />
        </TextColorPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label={t("toolbar.textColor.label")}>
        <TextColorPopoverContent editor={editor} colors={colors} />
      </PopoverContent>
    </Popover>
  );
}

export default TextColorPopover;
