"use client";

import { forwardRef, useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { useTranslation } from "react-i18next";

// --- Hooks ---
import { useIsBreakpoint } from "../../../hooks/use-is-breakpoint";
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor";

// --- Icons ---
import { RiCornerDownLeftLine, RiDeleteBin7Line, RiExternalLinkLine, RiLinksLine } from "@remixicon/react";

// --- Tiptap UI ---
import type { UseLinkPopoverConfig } from "./use-link-popover";
import { useLinkPopover } from "./use-link-popover";

// --- UI Primitives ---
import type { ButtonProps } from "../../tiptap-ui-primitive/button";
import { Button, ButtonGroup } from "../../tiptap-ui-primitive/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../tiptap-ui-primitive/popover";
import { Separator } from "../../tiptap-ui-primitive/separator";
import { Card, CardBody, CardItemGroup } from "../../tiptap-ui-primitive/card";
import { Input, InputGroup } from "../../tiptap-ui-primitive/input";

export interface LinkMainProps {
  /**
   * The URL to set for the link.
   */
  url: string;
  /**
   * Function to update the URL state.
   */
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
  /**
   * Function to set the link in the editor.
   */
  setLink: () => void;
  /**
   * Function to remove the link from the editor.
   */
  removeLink: () => void;
  /**
   * Function to open the link.
   */
  openLink: () => void;
  /**
   * Whether the link is currently active in the editor.
   */
  isActive: boolean;
}

export interface LinkPopoverProps extends Omit<ButtonProps, "type">, UseLinkPopoverConfig {
  /**
   * Callback for when the popover opens or closes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Whether to automatically open the popover when a link is active.
   * @default true
   */
  autoOpenOnLinkActive?: boolean;
}

/**
 * Link button component for triggering the link popover
 */
export const LinkButton = forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, ...props }, ref) => {
  const { t } = useTranslation("simpleEditor");
  return (
    <Button
      type="button"
      className={className}
      data-style="ghost"
      role="button"
      tabIndex={-1}
      aria-label={t("toolbar.link.label")}
      tooltip={t("toolbar.link.label")}
      ref={ref}
      {...props}
    >
      {children || <RiLinksLine className="tiptap-button-icon" />}
    </Button>
  );
});

LinkButton.displayName = "LinkButton";

/**
 * Main content component for the link popover
 */
const LinkMain: React.FC<LinkMainProps> = ({ url, setUrl, setLink, removeLink, openLink, isActive }) => {
  const { t } = useTranslation("simpleEditor");
  const isMobile = useIsBreakpoint();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setLink();
    }
  };

  return (
    <Card
      style={{
        ...(isMobile ? { boxShadow: "none", border: 0 } : {}),
      }}
    >
      <CardBody
        style={{
          ...(isMobile ? { padding: 0 } : {}),
        }}
      >
        <CardItemGroup orientation="horizontal">
          <InputGroup>
            <Input
              type="url"
              placeholder={t("toolbar.link.placeholder")}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </InputGroup>

          <ButtonGroup orientation="horizontal">
            <Button
              type="button"
              onClick={setLink}
              title={t("toolbar.link.apply")}
              disabled={!url && !isActive}
              data-style="ghost"
            >
              <RiCornerDownLeftLine className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>

          <Separator />

          <ButtonGroup orientation="horizontal">
            <Button
              type="button"
              onClick={openLink}
              title={t("toolbar.link.open")}
              disabled={!url && !isActive}
              data-style="ghost"
            >
              <RiExternalLinkLine className="tiptap-button-icon" />
            </Button>

            <Button
              type="button"
              onClick={removeLink}
              title={t("toolbar.link.remove")}
              disabled={!url && !isActive}
              data-style="ghost"
            >
              <RiDeleteBin7Line className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  );
};

/**
 * Link content component for standalone use
 */
export const LinkContent: React.FC<{
  editor?: Editor | null;
}> = ({ editor }) => {
  const linkPopover = useLinkPopover({
    editor,
  });

  return <LinkMain {...linkPopover} />;
};

/**
 * Link popover component for Tiptap editors.
 *
 * For custom popover implementations, use the `useLinkPopover` hook instead.
 */
export const LinkPopover = forwardRef<HTMLButtonElement, LinkPopoverProps>(
  (
    {
      editor: providedEditor,
      hideWhenUnavailable = false,
      onSetLink,
      onOpenChange,
      autoOpenOnLinkActive = true,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = useState(false);

    const { isVisible, canSet, isActive, url, setUrl, setLink, removeLink, openLink, label, Icon } = useLinkPopover({
      editor,
      hideWhenUnavailable,
      onSetLink,
    });

    const handleOnOpenChange = useCallback(
      (nextIsOpen: boolean) => {
        setIsOpen(nextIsOpen);
        onOpenChange?.(nextIsOpen);
      },
      [onOpenChange]
    );

    const handleSetLink = useCallback(() => {
      setLink();
      setIsOpen(false);
    }, [setLink]);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        setIsOpen(!isOpen);
      },
      [onClick, isOpen]
    );

    useEffect(() => {
      if (autoOpenOnLinkActive && isActive) {
        setIsOpen(true);
      }
    }, [autoOpenOnLinkActive, isActive]);

    if (!isVisible) {
      return null;
    }

    return (
      <Popover open={isOpen} onOpenChange={handleOnOpenChange}>
        <PopoverTrigger asChild>
          <LinkButton
            disabled={!canSet}
            data-active-state={isActive ? "on" : "off"}
            data-disabled={!canSet}
            aria-label={label}
            aria-pressed={isActive}
            onClick={handleClick}
            {...buttonProps}
            ref={ref}
          >
            {children ?? <Icon className="tiptap-button-icon" />}
          </LinkButton>
        </PopoverTrigger>

        <PopoverContent>
          <LinkMain
            url={url}
            setUrl={setUrl}
            setLink={handleSetLink}
            removeLink={removeLink}
            openLink={openLink}
            isActive={isActive}
          />
        </PopoverContent>
      </Popover>
    );
  }
);

LinkPopover.displayName = "LinkPopover";

export default LinkPopover;
