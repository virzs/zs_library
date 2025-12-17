import { PrivMdEditor } from "./editor";
import MDXEditorPreview from "./preview";

/**
 * Markdown 编辑器
 * @deprecated 请使用 SimpleEditor 组件代替
 */
export type MdEditorType = typeof PrivMdEditor & {
  /**
   * 预览组件
   */
  Preview: typeof MDXEditorPreview;
};

const MdEditor: MdEditorType = PrivMdEditor as MdEditorType;

MdEditor.Preview = MDXEditorPreview;

export default MdEditor;
