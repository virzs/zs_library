"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { EditorContent, EditorContext, JSONContent, Editor } from "@tiptap/react";
import { useTranslation } from "react-i18next";

// --- UI Primitives ---
import { Button } from "./components/tiptap-ui-primitive/button";
import { Spacer } from "./components/tiptap-ui-primitive/spacer";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "./components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
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
// import content from "./data/content.json";
import enUS from "./i18n/en-US.json";
import zhCN from "./i18n/zh-CN.json";

// --- Styles ---
import "./simple-editor.scss";
import { SimpleEditorFeatures, isEnabled, getConfig } from "./lib/feature-utils";
import { EditorOutputFormat } from "./lib/format-utils";

import { useSimpleEditor } from "./use-simple-editor";
import "highlight.js/styles/github-dark.css";

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
  editor?: Editor | null;
}

export interface SimpleEditorRef {
  editor: Editor | null;
}

interface SimpleEditorContentProps extends SimpleEditorProps {
  editor: Editor | null;
}

const SimpleEditorContent = ({ editor, className, style, features }: SimpleEditorContentProps) => {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">("main");
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { i18n } = useTranslation("simpleEditor");

  useEffect(() => {
    i18n.addResourceBundle("en-US", "simpleEditor", enUS, true, true);
    i18n.addResourceBundle("zh-CN", "simpleEditor", zhCN, true, true);
  }, [i18n]);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  const handleGlobalClick = (e: React.MouseEvent) => {
    // Only handle clicks directly on the editor content wrapper or the ProseMirror container
    // when a node is selected (like an image) to facilitate deselection.
    if (!editor) return;

    // Check if we have a NodeSelection (like Image selected)
    if (editor.state.selection.toJSON().type === "node") {
      const target = e.target as HTMLElement;

      // If clicking on the main content area (ProseMirror padding area)
      if (target.classList.contains("ProseMirror") || target.classList.contains("simple-editor-content")) {
        // Find position at coordinates
        const pos = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
        if (pos) {
          editor.commands.setTextSelection(pos.pos);
        } else {
          // If we can't find a pos (e.g. way below content), move to end
          editor.commands.focus("end");
        }
      }
    }
  };

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

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
          onClick={handleGlobalClick}
        />
      </EditorContext.Provider>
    </div>
  );
};

export const SimpleEditor = forwardRef<SimpleEditorRef, SimpleEditorProps>((props, ref) => {
  const { editor: externalEditor } = props;

  if (externalEditor) {
    return <ControlledSimpleEditor {...props} editor={externalEditor} ref={ref} />;
  }

  return <UncontrolledSimpleEditor {...props} ref={ref} />;
});

const ControlledSimpleEditor = forwardRef<SimpleEditorRef, SimpleEditorProps & { editor: Editor | null }>(
  (props, ref) => {
    const { editor } = props;

    useImperativeHandle(ref, () => ({
      editor,
    }));

    return <SimpleEditorContent {...props} editor={editor} />;
  }
);

const UncontrolledSimpleEditor = forwardRef<SimpleEditorRef, SimpleEditorProps>((props, ref) => {
  const editor = useSimpleEditor(props);

  useImperativeHandle(ref, () => ({
    editor,
  }));

  return <SimpleEditorContent {...props} editor={editor} />;
});

SimpleEditor.displayName = "SimpleEditor";
ControlledSimpleEditor.displayName = "ControlledSimpleEditor";
UncontrolledSimpleEditor.displayName = "UncontrolledSimpleEditor";
