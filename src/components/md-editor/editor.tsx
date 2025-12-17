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
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  CodeBlockEditorDescriptor,
  DirectiveDescriptor,
  MDXEditorMethods,
} from "@mdxeditor/editor";
import "github-markdown-css/github-markdown.css";
import "@mdxeditor/editor/style.css";
import { FC, JSX, useEffect, useRef, useState } from "react";
import { $t } from "./i18n";
import {
  githubMarkdownDarkStyle,
  githubMarkdownLightStyle,
  markdownEditorDarkStyle,
  markdownEditorStyle,
  markdownStyle,
} from "./style";
import { cx } from "@emotion/css";
import { isDarkScheme } from "./utils";

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

/**
 * Markdown 编辑器
 * @deprecated 请使用 SimpleEditor 组件代替
 */
export interface MdEditorProps
  extends Omit<MDXEditorProps, "markdown" | "onChange"> {
  /**
   * Markdown 内容
   */
  value?: string;
  /**
   * Markdown 内容变化时的回调
   * @param value Markdown 内容
   * @returns
   */
  onChange?: (value: string) => void;
  /**
   * 编辑器插件配置
   */
  pluginConfig?: MdEditorPluginConfig;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 主题，可选值为 `light`、`dark`、`auto`
   */
  theme?: "light" | "dark" | "auto";
}

export const PrivMdEditor: FC<MdEditorProps> = (props) => {
  const {
    value,
    onChange,
    translation,
    pluginConfig,
    className,
    theme = "auto",
    ...rest
  } = props;

  const ref = useRef<MDXEditorMethods>(null);

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
    console.warn(
      "[MdEditor] is deprecated. Please use [SimpleEditor] instead."
    );
  }, []);

  useEffect(() => {
    if (value !== undefined && ref.current) {
      ref.current?.setMarkdown(value);
      setMarkdown(value);
    }
  }, [value, ref]);

  return (
    <MDXEditor
      ref={ref}
      className={cx(
        markdownEditorStyle,
        isDarkScheme(theme) ? markdownEditorDarkStyle : "",
        isDarkScheme(theme)
          ? githubMarkdownDarkStyle
          : githubMarkdownLightStyle,
        className
      )}
      contentEditableClassName={markdownStyle}
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
