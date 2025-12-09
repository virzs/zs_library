import { useCallback, useRef, useState, useEffect } from "react";
import { Editor, JSONContent } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
import { generateAiContent } from "../../../lib/ai-service";
import { useTranslation } from "react-i18next";
import { marked } from "marked";

export interface UseAiConfig {
  editor: Editor | null;
  defaultPrompt?: string;
  defaultModel?: string;
}

export type AiStatus = "idle" | "generating" | "reviewing";

const AI_API_KEY_STORAGE_KEY = "tiptap-ai-api-key";

export function useAi({ editor, defaultPrompt = "", defaultModel = "deepseek-chat" }: UseAiConfig) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [status, setStatus] = useState<AiStatus>("idle");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectionText, setSelectionText] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const originalSelectionRef = useRef<{ from: number; to: number; content: JSONContent[] | undefined } | null>(null);
  const generationStartPosRef = useRef<number | null>(null);

  const { t } = useTranslation("simpleEditor");

  // Load API Key from localStorage
  useEffect(() => {
    const storedKey = localStorage.getItem(AI_API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Save API Key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(AI_API_KEY_STORAGE_KEY, apiKey);
    }
  }, [apiKey]);

  const updateSelection = useCallback(() => {
    if (editor && status === "idle") {
      const selection = editor.state.selection;
      const text = selection && !selection.empty ? editor.state.doc.textBetween(selection.from, selection.to, " ") : "";
      setSelectionText(text);
      setHasSelection(!!selection && !selection.empty);
    }
  }, [editor, status]);

  useEffect(() => {
    if (!editor) return;

    updateSelection();
    editor.on("selectionUpdate", updateSelection);

    return () => {
      editor.off("selectionUpdate", updateSelection);
    };
  }, [editor, updateSelection]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus("reviewing");
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        updateSelection();
      } else {
        if (status === "generating") {
          handleStop();
        }
        // If we were reviewing, we should probably "Apply" or "Discard"?
        // If the user clicks outside, it usually implies "Apply" or "Cancel".
        // Tiptap UI usually applies on close for things like links, but for AI...
        // Let's reset to idle, effectively "Applying" (leaving content as is).
        setStatus("idle");
        // Reset refs
        originalSelectionRef.current = null;
        generationStartPosRef.current = null;
        setPrompt(defaultPrompt); // Reset prompt for next time
      }
      setIsOpen(open);
    },
    [updateSelection, status, handleStop, defaultPrompt]
  );

  const convertMarkdownToHtml = useCallback((markdown: string) => {
    const html = marked.parse(markdown, { async: false }) as string;

    // Attempt to unwrap single paragraph to preserve current block style
    const trimmed = html.trim();
    if (trimmed.startsWith("<p>") && trimmed.endsWith("</p>")) {
      const content = trimmed.substring(3, trimmed.length - 4);
      // If there are no other closing tags, it's a single paragraph
      if (!content.includes("</p>")) {
        return content;
      }
    }

    return html;
  }, []);

  const handleGenerate = useCallback(async (promptOverride?: string) => {
    const currentPrompt = typeof promptOverride === 'string' ? promptOverride : prompt;

    if (!currentPrompt || !apiKey || !editor) return;

    // Save original selection if this is the first generation
    if (status === "idle") {
      const { from, to } = editor.state.selection;
      // We need to save the content in a way that we can restore it.
      // toJSON() of a Slice returns { content: [...], openStart: ..., openEnd: ... }
      // We can use the content array directly.
      const slice = editor.state.doc.slice(from, to);
      const content = slice.toJSON().content;

      originalSelectionRef.current = { from, to, content };
      generationStartPosRef.current = from;
    }

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setStatus("generating");
    setError(null);
    if (currentPrompt !== prompt) {
      setPrompt(currentPrompt);
    }
    setLastPrompt(currentPrompt);

    try {
      // Use current selection as context
      const selection = editor.state.selection;
      const contextText =
        selection && !selection.empty ? editor.state.doc.textBetween(selection.from, selection.to, " ") : "";

      await generateAiContent({
        prompt: currentPrompt,
        context: contextText,
        apiKey,
        model: defaultModel,
        onUpdate: (fullText) => {
          if (!editor) return;

          const htmlContent = convertMarkdownToHtml(fullText);

          editor.commands.command(({ dispatch }) => {
            if (dispatch && generationStartPosRef.current !== null) {
              return true;
            }
            return false;
          });

          const start = generationStartPosRef.current!;
          const currentSelection = editor.state.selection;

          // If we are starting, or if selection looks weird, ensure we start at `start`.
          // But `currentSelection.from` should match `start` roughly (or exactly).

          // We select from `start` to `currentSelection.to` (assuming it covers the previous chunk).
          // If it's the very first chunk, `currentSelection` is the original text.

          editor
            .chain()
            .setTextSelection({ from: start, to: currentSelection.to })
            .insertContent(htmlContent)
            // After insertion, cursor is at the end.
            // We need to select from `start` to `new_cursor_pos`.
            .command(({ tr, dispatch }) => {
              if (dispatch) {
                const newEnd = tr.selection.to; // The position after insertion
                tr.setSelection(TextSelection.create(tr.doc, start, newEnd));
                return true;
              }
              return false;
            })
            .setMark("highlight", { color: "var(--tt-color-highlight-purple)" })
            .run();
        },
        signal: abortControllerRef.current.signal,
      });

      setStatus("reviewing");
      setPrompt(""); // Clear prompt for refinement
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage === "Request aborted") return;
      console.error("Failed to generate content:", error);
      setError(errorMessage || t("toolbar.ai.error"));
      setStatus("reviewing");
    } finally {
      abortControllerRef.current = null;
    }
  }, [prompt, apiKey, defaultModel, editor, t, status, convertMarkdownToHtml]);

  const handleDiscard = useCallback(() => {
    if (editor && originalSelectionRef.current) {
      const { from, to, content } = originalSelectionRef.current;

      // Delete the generated content (which is currently selected)
      // And insert the original content.

      editor
        .chain()
        .deleteSelection()
        .insertContentAt(from, content || []) // Insert original content
        .setTextSelection({ from, to }) // Restore original selection
        .run();
    }

    setStatus("idle");
    setIsOpen(false);
    originalSelectionRef.current = null;
    generationStartPosRef.current = null;
    setPrompt(defaultPrompt);
  }, [editor, defaultPrompt]);

  const handleApply = useCallback(() => {
    if (editor) {
      // Remove the highlight mark from the current selection (which should be the AI generated text)
      editor.chain().unsetMark("highlight").run();
    }
    setStatus("idle");
    setIsOpen(false);
    originalSelectionRef.current = null;
    generationStartPosRef.current = null;
    setPrompt(defaultPrompt);
  }, [defaultPrompt]);

  const handleRefine = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleTryAgain = useCallback(() => {
    if (lastPrompt) {
      handleGenerate(lastPrompt);
    }
  }, [lastPrompt, handleGenerate]);

  return {
    isOpen,
    setIsOpen: handleOpenChange,
    prompt,
    setPrompt,
    status,
    apiKey,
    setApiKey,
    error,
    handleGenerate,
    handleStop,
    handleDiscard,
    handleApply,
    handleRefine,
    handleTryAgain,
    selectionText,
    hasSelection,
    lastPrompt, // expose if needed
  };
}
