import { forwardRef } from "react";
import { RiRobotLine, RiMagicLine } from "@remixicon/react";
import { useTranslation } from "react-i18next";

// --- Hooks ---
import { useAi, UseAiConfig } from "./use-ai";

// --- UI Primitives ---
import { Button, ButtonProps } from "../../tiptap-ui-primitive/button";
import { Popover, PopoverTrigger, PopoverContent } from "../../tiptap-ui-primitive/popover";
import { Input } from "../../tiptap-ui-primitive/input";
import { Separator } from "../../tiptap-ui-primitive/separator";

// --- Styles ---
import "./ai-button.scss";

export interface AiButtonProps extends Omit<ButtonProps, "type">, UseAiConfig {
  showShortcut?: boolean;
  hideWhenUnavailable?: boolean;
}

export const AiButton = forwardRef<HTMLButtonElement, AiButtonProps>(
  ({ editor, defaultPrompt, defaultModel, className, hideWhenUnavailable = false, ...props }, ref) => {
    const { t } = useTranslation("simpleEditor");
    const {
      isOpen,
      setIsOpen,
      prompt,
      setPrompt,
      isLoading,
      apiKey,
      setApiKey,
      generatedText,
      error,
      handleGenerate,
      handleInsert,
      handleReplace,
      selectionText,
    } = useAi({ editor, defaultPrompt, defaultModel });

    if (!editor && hideWhenUnavailable) return null;

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
            disabled={!editor?.isEditable}
            ref={ref}
            {...props}
          >
            <RiRobotLine className="tiptap-button-icon" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="tiptap-ai-popover-content" align="start" sideOffset={8}>
          <div className="tiptap-ai-panel">
            <div className="tiptap-ai-header">
              <RiMagicLine className="tiptap-ai-icon" />
              <span className="tiptap-ai-title">{t("toolbar.ai.label")}</span>
            </div>

            <div className="tiptap-ai-form">
              <div className="tiptap-ai-field">
                <label className="tiptap-ai-label">{t("toolbar.ai.apiKeyLabel")}</label>
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t("toolbar.ai.apiKeyPlaceholder")}
                  type="password"
                />
              </div>

              {selectionText && (
                <div className="tiptap-ai-selection-preview">
                  <span className="tiptap-ai-selection-label">{t("toolbar.ai.optimizeSelection", { text: "" })}</span>
                  <div className="tiptap-ai-selection-text">{selectionText}</div>
                </div>
              )}

              <div className="tiptap-ai-field">
                <label className="tiptap-ai-label">{t("toolbar.ai.promptLabel")}</label>
                <textarea
                  className="tiptap-ai-textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t("toolbar.ai.placeholder")}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading || !prompt || !apiKey}
                className="tiptap-ai-generate-btn"
                data-style="solid"
              >
                {isLoading ? t("toolbar.ai.generating") : t("toolbar.ai.generate")}
              </Button>

              {error && <div className="tiptap-ai-error">{error}</div>}
            </div>

            {generatedText && (
              <>
                <Separator className="tiptap-ai-separator" />
                <div className="tiptap-ai-result">
                  <div className="tiptap-ai-result-content">{generatedText}</div>
                  <div className="tiptap-ai-actions">
                    <Button onClick={handleInsert} data-style="ghost">
                      {t("toolbar.ai.insert")}
                    </Button>
                    <Button onClick={handleReplace} data-style="ghost">
                      {t("toolbar.ai.replace")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

AiButton.displayName = "AiButton";
