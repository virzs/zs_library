import { MDXEditor, MDXEditorProps } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
// import "github-markdown-css/github-markdown.css";
import { FC, useEffect, useState } from "react";
import { ALL_PLUGINS } from "./_boilerplate";
import { $t } from "./i18n";

export interface MdEditorProps
  extends Omit<MDXEditorProps, "markdown" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
}

const MdEditor: FC<MdEditorProps> = (props) => {
  const { value, onChange, translation, ...rest } = props;

  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (value !== undefined) {
      setMarkdown(value);
    }
  }, [value]);

  return (
    <MDXEditor
      contentEditableClassName="markdown-body"
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
      plugins={ALL_PLUGINS}
      {...rest}
    />
  );
};

export default MdEditor;
