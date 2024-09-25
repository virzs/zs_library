import {
  MDXEditor,
  MDXEditorProps,
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  CodeToggle,
  CreateLink,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  InsertFrontmatter,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  quotePlugin,
  Separator,
  StrikeThroughSupSubToggles,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  ImageUploadHandler,
  ImagePreviewHandler,
  ViewMode,
  HEADING_LEVEL,
  ConditionalContents,
  InsertAdmonition,
  EditorInFocus,
  DirectiveNode,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  CodeBlockEditorDescriptor,
  DirectiveDescriptor,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "github-markdown-css/github-markdown.css";
import { FC, useEffect, useState } from "react";
import { $t } from "./i18n";
import { css, cx } from "@emotion/css";

type Extension =
  | {
      extension: Extension;
    }
  | readonly Extension[];

export interface ImagePluginConfig {
  imageUploadHandler?: ImageUploadHandler;
  imageAutocompleteSuggestions?: string[];
  disableImageResize?: boolean;
  disableImageSettingsButton?: boolean;
  imagePreviewHandler?: ImagePreviewHandler;
  ImageDialog?: FC<object> | (() => JSX.Element);
}

export interface DiffSourcePluginConfig {
  viewMode?: ViewMode;
  diffMarkdown?: string;
  codeMirrorExtensions?: Extension[];
  readOnlyDiff?: boolean;
}

export interface HeadingPluginConfig {
  allowedHeadingLevels?: readonly HEADING_LEVEL[];
}

export interface LinkPluginConfig {
  validateUrl?: (url: string) => boolean;
  disableAutoLink?: boolean;
}

export interface CodeBlockPluginConfig {
  codeBlockEditorDescriptors?: CodeBlockEditorDescriptor[];
  defaultCodeBlockLanguage?: string | undefined;
}

export interface CodeMirrorPluginConfig {
  codeBlockLanguages: Record<string, string>;
  codeMirrorExtensions?: Extension[];
  autoLoadLanguageSupport?: boolean;
}

export interface DirectivePluginConfig {
  directiveDescriptors: DirectiveDescriptor[];
}

export interface MdEditorPluginConfig {
  image?: ImagePluginConfig;
  diffSource?: DiffSourcePluginConfig;
  headings?: HeadingPluginConfig;
  link?: LinkPluginConfig;
  codeBlock?: CodeBlockPluginConfig;
  codeMirror?: CodeMirrorPluginConfig;
  directives?: DirectivePluginConfig;
}

export interface MdEditorProps
  extends Omit<MDXEditorProps, "markdown" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  pluginConfig?: MdEditorPluginConfig;
}

function whenInAdmonition(editorInFocus: EditorInFocus | null) {
  const node = editorInFocus?.rootNode;
  if (!node || node.getType() !== "directive") {
    return false;
  }

  return ["note", "tip", "danger", "info", "caution"].includes(
    (node as DirectiveNode).getMdastNode().name
  );
}

const MdEditor: FC<MdEditorProps> = (props) => {
  const { value, onChange, translation, pluginConfig, ...rest } = props;

  const {
    image,
    diffSource = {
      viewMode: "rich-text",
    },
    headings,
    link,
    codeBlock,
    codeMirror = {
      codeBlockLanguages: {
        js: "JavaScript",
        css: "CSS",
        txt: "Plain Text",
        tsx: "TypeScript",
        "": "Unspecified",
      },
    },
    directives = {
      directiveDescriptors: [AdmonitionDirectiveDescriptor],
    },
  } = pluginConfig ?? {};

  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (value !== undefined) {
      setMarkdown(value);
    }
  }, [value]);

  return (
    <MDXEditor
      contentEditableClassName={cx(
        "markdown-body",
        css`
          table {
            border-spacing: 0;
            border-collapse: collapse;
            width: 100%;
            display: table;
            th[data-tool-cell],
            td[data-tool-cell] {
              padding: 0;
              border: none;
            }
            tr {
              border-top: 0;
            }
            thead {
              th {
                padding: 0;
                border: none;
              }
            }
            tfoot {
              th {
                padding: 0;
                border: none;
              }
            }
            [class*="_addRowButton"],
            [class*="_addColumnButton"],
            [class*="_tableColumnEditorTrigger"],
            [class*="_iconButton"] {
              cursor: pointer;
              transition: all 0.3s;
            }
          }
        `
      )}
      markdown={markdown}
      onChange={(v) => {
        // ! 如果没有传入 value 和 onChange，那么内部维护 markdown 的状态
        if (!value && !onChange) {
          setMarkdown(v);
        }
        if (onChange) {
          onChange(v);
        }
      }}
      translation={translation ?? $t}
      plugins={[
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper options={["rich-text", "source"]}>
              {/* 撤销&重做 */}
              <UndoRedo />

              <Separator />

              {/* 粗体&斜体&下划线 */}
              <BoldItalicUnderlineToggles />
              {/* 内联代码 */}
              <CodeToggle />

              <Separator />

              {/* 删除线&上标&下标 */}
              <StrikeThroughSupSubToggles />

              <Separator />

              {/* 无序列表&有序列表&任务列表 */}
              <ListsToggle />

              <Separator />

              {/* 创建链接 */}
              <CreateLink />
              {/* 插入图片 */}
              <InsertImage />

              <Separator />

              {/* 插入表格 */}
              <InsertTable />
              {/* 插入主图换行 */}
              <InsertThematicBreak />

              <Separator />

              {/* 插入代码块 */}
              <InsertCodeBlock />
              {/* 插入警告 */}
              <ConditionalContents
                options={[
                  {
                    when: (editorInFocus) => !whenInAdmonition(editorInFocus),
                    contents: () => (
                      <>
                        <Separator />
                        <InsertAdmonition />
                      </>
                    ),
                  },
                ]}
              />

              <Separator />

              {/* 插入元数据 */}
              <InsertFrontmatter />
            </DiffSourceToggleWrapper>
          ),
        }),
        diffSourcePlugin(diffSource),
        listsPlugin(),
        quotePlugin(),
        headingsPlugin(headings),
        linkPlugin(link),
        linkDialogPlugin(),
        imagePlugin(image),
        tablePlugin(),
        thematicBreakPlugin(),
        frontmatterPlugin(),
        codeBlockPlugin(codeBlock),
        codeMirrorPlugin(codeMirror),
        markdownShortcutPlugin(),
        directivesPlugin(directives),
      ]}
      {...rest}
    />
  );
};

export default MdEditor;
