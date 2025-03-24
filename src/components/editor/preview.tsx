import { generateHTML } from "@tiptap/html";
import { FC, useMemo } from "react";
import { defaultExtensions } from "./extensions";
import { JSONContent } from "novel";

export interface PreviewProps {
  json?: JSONContent;
}

const Preview: FC<PreviewProps> = ({ json }) => {
  const output = useMemo(() => {
    return generateHTML(json ?? {}, defaultExtensions);
  }, [json]);

  return (
    <div className="tiptap ProseMirror prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full">
      <div dangerouslySetInnerHTML={{ __html: output }}></div>
    </div>
  );
};

export default Preview;
