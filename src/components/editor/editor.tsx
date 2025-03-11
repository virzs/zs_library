"use client";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  createImageUpload,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { FC, useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn as defaultUploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";

import hljs from "highlight.js";
import { defaultEditorContent } from "./lib/content";

import "./styles/base.css";
import "./styles/prosemirror.css";
import { cx } from "@emotion/css";
import { EditorProps } from "./type";
import DragHandle from "./generative/drag-handle";

export const Editor: FC<EditorProps> = (props) => {
  const {
    className,
    initialContent: propsInitialContent = {},
    onChange,
    cacheKey = "novel-content",
    enableCache = false,
    showSaveStatus = true,
    showWordCount = true,
    uploadImageProps,
    editorRef,
    enableAI = false,
    aiOptions,
  } = props;

  const [initialContent, setInitialContent] = useState<null | JSONContent>(
    propsInitialContent
  );
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState();

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      hljs.highlightElement(el as HTMLElement);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const json = editor.getJSON();
      setCharsCount(editor.storage.characterCount.words());
      onChange?.(json);
      if (!enableCache) return;
      window.localStorage.setItem(
        "html-content",
        highlightCodeblocks(editor.getHTML())
      );
      window.localStorage.setItem(cacheKey, JSON.stringify(json));
      window.localStorage.setItem(
        "markdown",
        editor.storage.markdown.getMarkdown()
      );
      setSaveStatus("Saved");
    },
    500
  );

  const uploadFn = useMemo(() => {
    if (!uploadImageProps) return defaultUploadFn;

    const {
      beforeUpload,
      maxSize,
      action,
      headers,
      method,
      name,
      onSuccess,
      onError,
    } = uploadImageProps;

    return createImageUpload({
      onUpload: (file) => {
        const body = new FormData();
        body.append(name || "file", file);

        const promise = fetch(action, {
          method: method || "POST",
          headers: {
            ...headers,
          },
          body,
        });
        return new Promise((resolve, reject) => {
          promise
            .then(async (res) => {
              if (onSuccess) {
                const json = await res.json();
                resolve(onSuccess(json));
                return;
              }

              if (res.status === 200) {
                const { url } = (await res.json()) as { url: string };
                const image = new Image();
                image.src = url;
                image.onload = () => {
                  resolve(url);
                };
              } else if (res.status === 401) {
                resolve(file);
                throw new Error(
                  "`BLOB_READ_WRITE_TOKEN` environment variable not found, reading image locally instead."
                );
              } else {
                throw new Error("Error uploading image. Please try again.");
              }
            })
            .catch((e) => {
              if (onError) onError(e);
              reject(e);
            });
        });
      },
      validateFn: (file) => {
        if (beforeUpload) return beforeUpload(file);

        if (!file.type.includes("image/")) {
          console.error("File type not supported.");
          return false;
        }

        if (maxSize && file.size > maxSize) {
          console.error("File size too big (max 20MB).");
          return false;
        }
        return true;
      },
    });
  }, [uploadImageProps]);

  useEffect(() => {
    if (!enableCache) return;
    const content = window.localStorage.getItem(cacheKey);
    if (content) setInitialContent(JSON.parse(content));
    else setInitialContent(defaultEditorContent);
  }, [cacheKey, enableCache]);

  if (!initialContent) return null;

  const extensions = [
    ...defaultExtensions,
    slashCommand({
      editorProps: props,
      uploadFn,
    }),
  ];

  return (
    <div className={cx("relative w-full max-w-screen-lg", className)}>
      {((enableCache && showSaveStatus) || showWordCount) && (
        <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
          {enableCache && showSaveStatus && (
            <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
              {saveStatus}
            </div>
          )}
          {showWordCount && (
            <div
              className={
                charsCount
                  ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground"
                  : "hidden"
              }
            >
              {charsCount} Words
            </div>
          )}
        </div>
      )}
      <EditorRoot>
        <EditorContent
          onCreate={({ editor }) => {
            if (editorRef) {
              editorRef.current = editor;
            }
          }}
          initialContent={initialContent}
          extensions={extensions}
          className="relative min-h-[500px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg editor-content"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              没有结果{/* No results */}
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems({
                editorProps: props,
                uploadFn,
              }).map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command!(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>
          <GenerativeMenuSwitch
            open={openAI}
            onOpenChange={setOpenAI}
            enableAI={enableAI}
            aiOptions={aiOptions}
          >
            {enableAI && <Separator orientation="vertical" />}
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <MathSelector />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
          <DragHandle />
        </EditorContent>
      </EditorRoot>
    </div>
  );
};
