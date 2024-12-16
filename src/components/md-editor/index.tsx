import { PrivMdEditor } from "./editor";
import MDXEditorPreview from "./preview";

/**
 * Markdown 编辑器
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
