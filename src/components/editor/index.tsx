import { Editor as E } from "./editor";
import Preview from "./preview";

/**
 * 富文本编辑器
 */
export type EditorType = typeof E & {
  /**
   * 预览组件
   */
  Preview: typeof Preview;
};

const Editor: EditorType = E as EditorType;

Editor.Preview = Preview;

export default Editor;
