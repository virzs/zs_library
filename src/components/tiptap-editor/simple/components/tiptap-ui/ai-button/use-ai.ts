import { useCallback, useRef, useState } from "react";
import { Editor } from "@tiptap/react";
import { generateAiContent } from "../../../lib/ai-service";
import { useTranslation } from "react-i18next";
import { marked } from "marked";

export interface UseAiConfig {
  editor: Editor | null;
  defaultPrompt?: string;
  defaultModel?: string;
}

export function useAi({ editor, defaultPrompt = "", defaultModel = "deepseek-chat" }: UseAiConfig) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectionText, setSelectionText] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const { t } = useTranslation("simpleEditor");

  const updateSelection = useCallback(() => {
    if (editor) {
      const selection = editor.state.selection;
      const text = selection && !selection.empty ? editor.state.doc.textBetween(selection.from, selection.to, " ") : "";
      setSelectionText(text);
    }
  }, [editor]);

  // Update selection when dialog opens
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        updateSelection();
      }
      setIsOpen(open);
    },
    [updateSelection]
  );

  const handleGenerate = useCallback(async () => {
    if (!prompt || !apiKey) return;

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setGeneratedText("");
    setError(null);

    try {
      const selection = editor?.state.selection;
      const selectedText =
        selection && !selection.empty ? editor.state.doc.textBetween(selection.from, selection.to, " ") : "";

      await generateAiContent({
        prompt,
        context: selectedText,
        apiKey,
        model: defaultModel,
        onUpdate: (text) => setGeneratedText(text),
        signal: abortControllerRef.current.signal,
      });
    } catch (error: any) {
      if (error.message === "Request aborted") return;
      console.error("Failed to generate content:", error);
      setError(error.message || t("toolbar.ai.error"));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [prompt, apiKey, defaultModel, editor, t]);

  const convertMarkdownToHtml = useCallback((markdown: string) => {
    return marked.parse(markdown, { async: false });
  }, []);

  const handleInsert = useCallback(() => {
    if (editor && generatedText) {
      const htmlContent = convertMarkdownToHtml(generatedText);
      editor.chain().focus().insertContent(htmlContent).run();
      setIsOpen(false);
    }
  }, [editor, generatedText, convertMarkdownToHtml]);

  const handleReplace = useCallback(() => {
    if (editor && generatedText) {
      const htmlContent = convertMarkdownToHtml(generatedText);
      // If there is a selection, replace it. Otherwise just insert.
      const selection = editor.state.selection;
      if (!selection.empty) {
        editor.chain().focus().deleteSelection().insertContent(htmlContent).run();
      } else {
        editor.chain().focus().insertContent(htmlContent).run();
      }
      setIsOpen(false);
    }
  }, [editor, generatedText, convertMarkdownToHtml]);

  return {
    isOpen,
    setIsOpen: handleOpenChange,
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
  };
}
