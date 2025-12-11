"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, EditorContext, JSONContent, useEditor, Editor } from "@tiptap/react";
import { useTranslation } from "react-i18next";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- UI Primitives ---
import { Button } from "./components/tiptap-ui-primitive/button";
import { Spacer } from "./components/tiptap-ui-primitive/spacer";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "./components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "./components/tiptap-node/image-upload-node/image-upload-node-extension";
import { ImageNode as ImageExtension } from "./components/tiptap-node/image-node/image-node-extension";
import { HorizontalRule } from "./components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "./components/tiptap-node/blockquote-node/blockquote-node.scss";
import "./components/tiptap-node/code-block-node/code-block-node.scss";
import "./components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "./components/tiptap-node/list-node/list-node.scss";
import "./components/tiptap-node/image-node/image-node.scss";
import "./components/tiptap-node/heading-node/heading-node.scss";
import "./components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "./components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "./components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "./components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "./components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "./components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "./components/tiptap-ui/color-highlight-popover";
import { LinkPopover, LinkContent, LinkButton } from "./components/tiptap-ui/link-popover";
import { MarkButton } from "./components/tiptap-ui/mark-button";
import { TextAlignButton } from "./components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "./components/tiptap-ui/undo-redo-button";
import { AiButton } from "./components/tiptap-ui/ai-button";

// --- Icons ---
import { ArrowLeftIcon } from "./components/tiptap-icons/arrow-left-icon";
import { RiLinksLine, RiMarkPenLine } from "@remixicon/react";

// --- Hooks ---
import { useIsBreakpoint } from "./hooks/use-is-breakpoint";
import { useWindowSize } from "./hooks/use-window-size";
import { useCursorVisibility } from "./hooks/use-cursor-visibility";

// --- Components ---
import { ThemeToggle } from "./theme-toggle";

// --- Lib ---
import { MAX_FILE_SIZE } from "./lib/tiptap-utils";
import { handleImageUploadRequest } from "./lib/image-upload-handler";
// import content from "./data/content.json";
import enUS from "./i18n/en-US.json";
import zhCN from "./i18n/zh-CN.json";

// --- Styles ---
import "./simple-editor.scss";
import { SimpleEditorFeatures, isEnabled, getConfig } from "./lib/feature-utils";
import { EditorOutputFormat } from "./lib/format-utils";
import { Markdown } from "@tiptap/markdown";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  features,
  editor,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
  features?: SimpleEditorFeatures;
  editor: Editor | null;
}) => {
  const showUndoRedo = isEnabled(features?.undoRedo);
  const showHeading = isEnabled(features?.heading);
  const showList = isEnabled(features?.list);
  const showBlockquote = isEnabled(features?.blockquote);
  const showCodeBlock = isEnabled(features?.codeBlock);
  const showBold = isEnabled(features?.bold);
  const showItalic = isEnabled(features?.italic);
  const showStrike = isEnabled(features?.strike);
  const showCode = isEnabled(features?.code);
  const showUnderline = isEnabled(features?.underline);
  const showHighlight = isEnabled(features?.highlight);
  const showLink = isEnabled(features?.link);
  const showSubscript = isEnabled(features?.subscript);
  const showSuperscript = isEnabled(features?.superscript);
  const showTextAlign = isEnabled(features?.textAlign);
  const showImage = isEnabled(features?.image);
  const showAi = isEnabled(features?.ai);
  const showThemeToggle = isEnabled(features?.themeToggle);

  const undoRedoConfig = getConfig(features?.undoRedo);
  const headingConfig = getConfig(features?.heading);
  const listConfig = getConfig(features?.list);
  const blockquoteConfig = getConfig(features?.blockquote);
  const codeBlockConfig = getConfig(features?.codeBlock);
  const boldConfig = getConfig(features?.bold);
  const italicConfig = getConfig(features?.italic);
  const strikeConfig = getConfig(features?.strike);
  const codeConfig = getConfig(features?.code);
  const underlineConfig = getConfig(features?.underline);
  const highlightConfig = getConfig(features?.highlight);
  const linkConfig = getConfig(features?.link);
  const subscriptConfig = getConfig(features?.subscript);
  const superscriptConfig = getConfig(features?.superscript);
  const textAlignConfig = getConfig(features?.textAlign);
  const imageConfig = getConfig(features?.image);
  const aiConfig = getConfig(features?.ai);

  return (
    <>
      <Spacer />
      {showUndoRedo && (
        <>
          <ToolbarGroup>
            <UndoRedoButton action="undo" {...undoRedoConfig} />
            <UndoRedoButton action="redo" {...undoRedoConfig} />
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      )}

      {(showHeading || showList || showBlockquote || showCodeBlock) && (
        <>
          <ToolbarGroup>
            {showHeading && (
              <HeadingDropdownMenu
                levels={headingConfig?.levels || [1, 2, 3, 4]}
                portal={isMobile}
                {...headingConfig}
              />
            )}
            {showList && (
              <ListDropdownMenu
                types={listConfig?.types || ["bulletList", "orderedList", "taskList"]}
                portal={isMobile}
                {...listConfig}
              />
            )}
            {showBlockquote && <BlockquoteButton {...blockquoteConfig} />}
            {showCodeBlock && <CodeBlockButton {...codeBlockConfig} />}
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      )}

      {(showBold || showItalic || showStrike || showCode || showUnderline || showHighlight || showLink) && (
        <>
          <ToolbarGroup>
            {showBold && <MarkButton type="bold" {...boldConfig} />}
            {showItalic && <MarkButton type="italic" {...italicConfig} />}
            {showStrike && <MarkButton type="strike" {...strikeConfig} />}
            {showCode && <MarkButton type="code" {...codeConfig} />}
            {showUnderline && <MarkButton type="underline" {...underlineConfig} />}
            {showHighlight &&
              (!isMobile ? (
                <ColorHighlightPopover {...highlightConfig} />
              ) : (
                <ColorHighlightPopoverButton onClick={onHighlighterClick} />
              ))}
            {showLink && (!isMobile ? <LinkPopover {...linkConfig} /> : <LinkButton onClick={onLinkClick} />)}
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      )}

      {(showSubscript || showSuperscript) && (
        <>
          <ToolbarGroup>
            {showSuperscript && <MarkButton type="superscript" {...superscriptConfig} />}
            {showSubscript && <MarkButton type="subscript" {...subscriptConfig} />}
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      )}

      {showTextAlign && (
        <>
          <ToolbarGroup>
            <TextAlignButton align="left" {...textAlignConfig} />
            <TextAlignButton align="center" {...textAlignConfig} />
            <TextAlignButton align="right" {...textAlignConfig} />
            <TextAlignButton align="justify" {...textAlignConfig} />
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      )}

      {showImage && (
        <ToolbarGroup>
          <ImageUploadButton {...imageConfig} />
        </ToolbarGroup>
      )}

      {showAi && (
        <ToolbarGroup>
          <AiButton editor={editor} {...aiConfig} />
        </ToolbarGroup>
      )}

      <Spacer />

      {isMobile && <ToolbarSeparator />}
      {showThemeToggle && (
        <ToolbarGroup>
          <ThemeToggle />
        </ToolbarGroup>
      )}
    </>
  );
};

const MobileToolbarContent = ({ type, onBack }: { type: "highlighter" | "link"; onBack: () => void }) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <RiMarkPenLine className="tiptap-button-icon" />
        ) : (
          <RiLinksLine className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>
    <ToolbarSeparator />
    {type === "highlighter" ? <ColorHighlightPopoverContent /> : <LinkContent />}
  </>
);

export interface SimpleEditorProps {
  value?: string | JSONContent;
  onChange?: (value: string | JSONContent) => void;
  className?: string;
  style?: React.CSSProperties;
  features?: SimpleEditorFeatures;
  output?: EditorOutputFormat;
}

export function SimpleEditor({ value, onChange, className, style, features, output = "html" }: SimpleEditorProps) {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">("main");
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation("simpleEditor");

  const imageConfig = getConfig(features?.image);
  const finalImageProps = imageConfig;
  const imageRef = useRef(finalImageProps);
  imageRef.current = finalImageProps;

  useEffect(() => {
    i18n.addResourceBundle("en-US", "simpleEditor", enUS, true, true);
    i18n.addResourceBundle("zh-CN", "simpleEditor", zhCN, true, true);
  }, [i18n]);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": t("editor.contentAriaLabel"),
        class: "simple-editor",
      },
    },
    onUpdate: ({ editor }) => {
      const content =
        output === "markdown" ? editor.getMarkdown() : output === "json" ? editor.getJSON() : editor.getHTML();
      onChange?.(content);
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        heading: isEnabled(features?.heading)
          ? {
              levels: [1, 2, 3, 4], // Default levels
              ...getConfig(features?.heading),
            }
          : false,
        bulletList: isEnabled(features?.list) ? undefined : false,
        orderedList: isEnabled(features?.list) ? undefined : false,
        listItem: isEnabled(features?.list) ? undefined : false,
        blockquote: isEnabled(features?.blockquote) ? undefined : false,
        codeBlock: isEnabled(features?.codeBlock) ? undefined : false,
        bold: isEnabled(features?.bold) ? undefined : false,
        italic: isEnabled(features?.italic) ? undefined : false,
        strike: isEnabled(features?.strike) ? undefined : false,
        code: isEnabled(features?.code) ? undefined : false,
        link: isEnabled(features?.link)
          ? {
              openOnClick: false,
              enableClickSelection: true,
              ...getConfig(features?.link),
            }
          : false,
        undoRedo: isEnabled(features?.undoRedo) ? undefined : false,
      }),
      HorizontalRule,
      ...(isEnabled(features?.textAlign)
        ? [
            TextAlign.configure({
              types: ["heading", "paragraph"],
              ...getConfig(features?.textAlign),
            }),
          ]
        : []),
      ...(isEnabled(features?.list) ? [TaskList, TaskItem.configure({ nested: true })] : []),
      ...(isEnabled(features?.highlight)
        ? [Highlight.configure({ multicolor: true, ...getConfig(features?.highlight) })]
        : []),
      ...(isEnabled(features?.image) ? [ImageExtension] : []),
      Typography,
      ...(isEnabled(features?.superscript) ? [Superscript] : []),
      ...(isEnabled(features?.subscript) ? [Subscript] : []),
      Selection,
      ...(isEnabled(features?.image)
        ? [
            ImageUploadNode.configure({
              accept: "image/*",
              maxSize: MAX_FILE_SIZE,
              limit: 3,
              upload: (file, onProgress) =>
                handleImageUploadRequest({
                  file,
                  onProgress,
                  imageProps: imageRef.current,
                }),
              onError: (error) => console.error("Upload failed:", error),
              ...imageConfig,
            }),
          ]
        : []),
      Markdown,
    ],
    content: value,
  });

  useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent =
        output === "markdown"
          ? editor.getMarkdown()
          : output === "json"
          ? JSON.stringify(editor.getJSON())
          : editor.getHTML();

      const valueString = output === "json" && typeof value !== "string" ? JSON.stringify(value) : value;

      if (currentContent !== valueString) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor, output]);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  return (
    <div className={`simple-editor-wrapper ${className || ""}`} style={style}>
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              features={features}
              editor={editor}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
      </EditorContext.Provider>
    </div>
  );
}
