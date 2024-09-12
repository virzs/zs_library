import { MDXEditor } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "github-markdown-css/github-markdown.css";
import { FC, useState } from "react";
import { ALL_PLUGINS } from "./_boilerplate";

export interface MdEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const MdEditor: FC = () => {
  const [markdown, setMarkdown] = useState("");

  return (
    <MDXEditor
      contentEditableClassName="markdown-body"
      markdown={markdown}
      onChange={(v) => {
        setMarkdown(v);
      }}
      plugins={ALL_PLUGINS}
    />
  );
};

export default MdEditor;
