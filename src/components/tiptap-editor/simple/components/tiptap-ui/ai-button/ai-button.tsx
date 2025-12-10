import { forwardRef, useEffect, useRef } from "react";
import {
  RiAi,
  RiStopCircleFill,
  RiCheckLine,
  RiCloseLine,
  RiSparklingLine,
  RiArrowUpLine,
  RiQuillPenLine,
  RiEraserLine,
  RiAlignLeft,
} from "@remixicon/react";
import { useTranslation } from "react-i18next";

// --- Hooks ---
import { useAi, UseAiConfig } from "./use-ai";

// --- UI Primitives ---
import { Button, ButtonProps } from "../../tiptap-ui-primitive/button";
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "../../tiptap-ui-primitive/popover";
// import { Input } from "../../tiptap-ui-primitive/input";

// --- Styles ---
import "./ai-button.scss";

import { AiPreset } from "../../../lib/feature-utils";

export interface AiButtonProps extends Omit<ButtonProps, "type" | "onError">, UseAiConfig {
  showShortcut?: boolean;
  hideWhenUnavailable?: boolean;
  presets?: AiPreset[];
}

export const AiButton = forwardRef<HTMLButtonElement, AiButtonProps>(
  (
    {
      editor,
      defaultPrompt,
      defaultModel,
      apiKey,
      baseUrl,
      model,
      headers,
      params,
      body,
      request,
      onStart,
      onSuccess,
      onError,
      className,
      hideWhenUnavailable = false,
      presets,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation("simpleEditor");
    const {
      isOpen,
      setIsOpen,
      prompt,
      setPrompt,
      status, // idle, generating, reviewing
      apiKey: currentApiKey,
      error,
      handleGenerate,
      handleStop,
      handleDiscard,
      handleApply,
      handleRefine,
      handleTryAgain,
      selectionText,
      hasSelection,
    } = useAi({
      editor,
      defaultPrompt,
      defaultModel,
      apiKey,
      baseUrl,
      model,
      headers,
      params,
      body,
      request,
      onStart,
      onSuccess,
      onError,
    });

    // Virtual Anchor
    // Extract the Measurable type from PopoverAnchor's virtualRef prop to avoid using any
    type VirtualRefProp = React.ComponentProps<typeof PopoverAnchor>["virtualRef"];
    // infer T from RefObject<T>
    type Measurable = VirtualRefProp extends React.RefObject<infer T> | undefined ? T : never;

    // We need to cast null to Measurable because useRef(null) infers RefObject<Measurable | null>
    // but PopoverAnchor expects RefObject<Measurable>.
    // However, React refs are mutable and can be null initially.
    // The issue is strict null checks on the RefObject type parameter.
    const selectionRef = useRef<Measurable>(null!);

    // Update virtual anchor when selection changes or open
    useEffect(() => {
      if (editor) {
        // Function to calculate rect
        const getRect = () => {
          // Get the editor's bounding rectangle for width and left alignment
          const editorRect = editor.view.dom.getBoundingClientRect();

          // Get the selection's vertical position
          const { from } = editor.state.selection;
          const start = editor.view.coordsAtPos(from);

          // Create a rect that spans the full width of the editor at the selection's vertical position
          // This ensures the popover is left-aligned with the editor and can be as wide as the editor
          return new DOMRect(editorRect.left, start.top, editorRect.width, start.bottom - start.top);
        };

        selectionRef.current = {
          getBoundingClientRect: getRect,
        };
      }
    }, [editor, selectionText, status]);

    if (!editor && hideWhenUnavailable) return null;

    const defaultPresets = [
      {
        label: t("toolbar.ai.presets.improve", "Improve writing"),
        text: "Improve writing",
        icon: <RiQuillPenLine size={16} />,
      },
      {
        label: t("toolbar.ai.presets.fix", "Fix spelling & grammar"),
        text: "Fix spelling & grammar",
        icon: <RiCheckLine size={16} />,
      },
      {
        label: t("toolbar.ai.presets.shorter", "Make shorter"),
        text: "Make shorter",
        icon: <RiEraserLine size={16} />,
      },
      { label: t("toolbar.ai.presets.longer", "Make longer"), text: "Make longer", icon: <RiAlignLeft size={16} /> },
    ];

    const finalPresets = presets?.length
      ? presets.map((p) => ({ ...p, icon: p.icon || <RiQuillPenLine size={16} /> }))
      : defaultPresets;

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            className={className}
            data-style="ghost"
            role="button"
            tabIndex={-1}
            aria-label={t("toolbar.ai.label")}
            tooltip={t("toolbar.ai.label")}
            disabled={!editor?.isEditable || !hasSelection}
            ref={ref}
            {...props}
          >
            <RiAi className="tiptap-button-icon" />
          </Button>
        </PopoverTrigger>

        <PopoverAnchor virtualRef={selectionRef} />

        <PopoverContent
          className="tiptap-ai-popover-content"
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{ width: editor?.view.dom.clientWidth }}
        >
          <div className="tiptap-ai-panel">
            <div className="tiptap-ai-body">
              {status === "idle" && (
                <>
                  <div className="tiptap-ai-input-wrapper">
                    <textarea
                      className="tiptap-ai-textarea-input"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={t("toolbar.ai.placeholder")}
                      rows={1}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                    />

                    <div className="tiptap-ai-input-footer">
                      <div />
                      <Button
                        onClick={() => handleGenerate()}
                        disabled={!prompt || !currentApiKey}
                        className="tiptap-ai-send-btn"
                        data-variant={prompt ? "primary" : "ghost"}
                      >
                        <RiArrowUpLine size={16} />
                      </Button>
                    </div>
                  </div>

                  {(!prompt || prompt === defaultPrompt) && (
                    <div className="tiptap-ai-presets">
                      <div className="tiptap-ai-preset-group">
                        <div className="tiptap-ai-preset-title">{t("toolbar.ai.presets.edit", "Edit")}</div>
                        {finalPresets.map((preset, index) => (
                          <Button
                            key={index}
                            className="tiptap-ai-preset-item"
                            onClick={() => handleGenerate(preset.text)}
                            data-variant="ghost"
                          >
                            {preset.icon}
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {status === "generating" && (
                <div className="tiptap-ai-generating">
                  <div className="tiptap-ai-generating-text">
                    <span className="tiptap-ai-generating-label">{t("toolbar.ai.isWriting", "AI is writing")}</span>
                    <span className="tiptap-ai-typing-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  </div>
                  <Button onClick={handleStop} className="tiptap-ai-stop-btn" data-variant="ghost">
                    <RiStopCircleFill size={20} />
                  </Button>
                </div>
              )}

              {status === "reviewing" && (
                <div className="tiptap-ai-review">
                  <div className="tiptap-ai-input-wrapper">
                    <textarea
                      className="tiptap-ai-textarea-input"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={t("toolbar.ai.refinePlaceholder", "Tell AI what else needs to be changed...")}
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleRefine();
                        }
                      }}
                    />
                    <div className="tiptap-ai-input-footer">
                      <div /> {/* Spacer */}
                      <Button
                        onClick={handleRefine}
                        disabled={!prompt}
                        className="tiptap-ai-send-btn"
                        data-variant={prompt ? "primary" : "ghost"}
                      >
                        <RiArrowUpLine size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="tiptap-ai-actions">
                    <Button onClick={handleTryAgain} data-variant="ghost" className="tiptap-ai-action-btn">
                      <RiSparklingLine size={16} style={{ marginRight: 6 }} />
                      {t("toolbar.ai.tryAgain", "Try again")}
                    </Button>

                    <div className="tiptap-ai-actions-right">
                      <Button onClick={handleDiscard} data-variant="ghost" className="tiptap-ai-action-btn">
                        <RiCloseLine size={16} style={{ marginRight: 6 }} />
                        {t("toolbar.ai.discard", "Discard")}
                      </Button>
                      <Button onClick={handleApply} data-variant="primary" className="tiptap-ai-action-btn">
                        <RiCheckLine size={16} style={{ marginRight: 6 }} />
                        {t("toolbar.ai.apply", "Apply")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="tiptap-ai-error">
                  <RiCloseLine size={16} />
                  {error}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

AiButton.displayName = "AiButton";
