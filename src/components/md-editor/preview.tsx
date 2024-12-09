import { FC } from "react";
import "github-markdown-css/github-markdown.css";
import "@mdxeditor/editor/style.css";
import Markdown from "react-markdown";
import { cx } from "@emotion/css";
import {
  githubMarkdownDarkStyle,
  githubMarkdownLightStyle,
  markdownStyle,
} from "./style";
import remarkGfm from "remark-gfm";
import emoji from "remark-emoji";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { isDarkScheme } from "./utils";

export interface MDXEditorPreviewProps {
  children?: string;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

const MDXEditorPreview: FC<MDXEditorPreviewProps> = (props) => {
  const { children = "", className, theme = "auto" } = props;

  return (
    <div
      className={
        isDarkScheme(theme) ? githubMarkdownDarkStyle : githubMarkdownLightStyle
      }
    >
      <Markdown
        className={cx(markdownStyle, className)}
        remarkPlugins={[remarkGfm, emoji]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code(props) {
            const { children, className, node, ref, ...rest } = props;
            //   @ts-expect-error node 和 ref 与 SyntaxHighlighter 不兼容
            //   eslint-disable-next-line
            const unUsed = { node, ref };
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter
                {...rest}
                PreTag="div"
                children={String(children).replace(/\n$/, "")}
                language={match[1]}
                style={oneLight}
              />
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  );
};

export default MDXEditorPreview;
