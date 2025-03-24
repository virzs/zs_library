import { EditorBubble, removeAIHighlight, useEditor } from "novel";
import { Fragment, type ReactNode, useEffect } from "react";
import { Button } from "../ui/button";
import { AISelector } from "./ai-selector";
import { RiSparklingFill } from "@remixicon/react";
import { UseCompletionOptions } from "@ai-sdk/react";

interface GenerativeMenuSwitchProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enableAI?: boolean;
  aiOptions?: UseCompletionOptions;
}
const GenerativeMenuSwitch = ({
  children,
  open,
  onOpenChange,
  enableAI = false,
  aiOptions,
}: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();

  useEffect(() => {
    if (!open) removeAIHighlight(editor!);
  }, [open]);

  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? "bottom-start" : "top",
        onHidden: () => {
          onOpenChange(false);
          editor!.chain().unsetHighlight().run();
        },
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded-lg border border-muted bg-background shadow-xl p-1 gap-1"
    >
      {open && enableAI && (
        <AISelector
          open={open}
          onOpenChange={onOpenChange}
          options={aiOptions}
        />
      )}
      {!open && (
        <Fragment>
          {enableAI && (
            <Button
              className="gap-1 text-purple-500"
              variant="ghost"
              onClick={() => onOpenChange(true)}
              size="sm"
            >
              <RiSparklingFill size={14} />
              询问AI
              {/* Ask AI */}
            </Button>
          )}
          {children}
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
