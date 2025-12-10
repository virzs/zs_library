import "./simple-editor.scss";
import "./components/tiptap-node/blockquote-node/blockquote-node.scss";
import "./components/tiptap-node/code-block-node/code-block-node.scss";
import "./components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "./components/tiptap-node/list-node/list-node.scss";
import "./components/tiptap-node/image-node/image-node.scss";
import "./components/tiptap-node/heading-node/heading-node.scss";
import "./components/tiptap-node/paragraph-node/paragraph-node.scss";

export interface SimpleEditorRenderProps {
  value: string;
  className?: string;
}

export function SimpleEditorRender({ value, className }: SimpleEditorRenderProps) {
  return (
    <div className={`simple-editor-wrapper ${className || ""}`}>
      <div
        className="simple-editor-content tiptap ProseMirror simple-editor"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}
