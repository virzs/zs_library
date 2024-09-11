import EditorJS, { OutputData } from "@editorjs/editorjs";
import DragDrop from "editorjs-drag-drop";
import Undo from "editorjs-undo";
import { FC, useEffect, useRef, useState } from "react";
import Header from "./components/BlockTools/TextAndTypography/Header";
import Paragraph from "./components/BlockTools/TextAndTypography/Paragraph";
import Delete from "./components/BlockTuneTools/Delete";
import MoveDownTune from "./components/BlockTuneTools/MoveDown";
import MoveUpTune from "./components/BlockTuneTools/MoveUp";
import Alert from "./components/BlockTools/TextAndTypography/Alert";
import Delimiter from "./components/BlockTools/TextAndTypography/Delimiter";
import Quote from "./components/BlockTools/TextAndTypography/Quote";
import ImageTool from "./components/BlockTools/MediaAndEmbed/Image";

export interface EditorProps {
  value?: OutputData;
  onChange?: (data: OutputData | undefined) => void;
  readOnly?: boolean;
}

const Editor: FC<EditorProps> = (props) => {
  const { value, onChange, readOnly } = props;

  const editorRef = useRef<EditorJS | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  const [initValue, setInitValue] = useState<OutputData | undefined>(value);

  const handleChange = async () => {
    const data = await editorRef.current?.saver.save();
    setInitValue(data);
    if (onChange) {
      onChange(data);
    }
  };

  useEffect(() => {
    if (editorContainerRef.current) {
      const editor = new EditorJS({
        placeholder: "请输入内容",
        onReady: () => {
          editorRef.current = editor;
          new Undo({ editor });
          new DragDrop(editor);
        },
        holder: editorContainerRef.current,
        data: initValue,
        onChange: handleChange,
        readOnly,
        i18n: {
          messages: {
            toolNames: {
              Text: "段落",
              Heading: "标题",
              Alert: "警告",
            },
            ui: {
              blockTunes: {
                toggler: {
                  "Click to tune": "点击调整",
                  "or drag to move": "或拖动移动",
                },
              },
              inlineToolbar: {
                converter: {
                  "Convert to": "转换为",
                },
              },
              toolbar: {
                toolbox: {
                  Add: "添加",
                },
              },
            },
            tools: {
              alert: {
                Primary: "主要",
                Secondary: "次要",
                Info: "信息",
                Success: "成功",
                Warning: "警告",
                Danger: "危险",
                Light: "浅色",
                Dark: "深色",
                Left: "左对齐",
                Center: "居中",
                Right: "右对齐",
              },
              quote: {
                "Align Left": "左对齐",
                "Align Center": "居中",
                "Align Right": "右对齐",
                "Align Justify": "两端对齐",
              },
            },
            blockTunes: {
              delete: {
                Delete: "删除",
                "Click to delete": "点击删除",
              },
              moveUp: {
                "Move up": "上移",
              },
              moveDown: {
                "Move down": "下移",
              },
            },
          },
        },
        tools: {
          /** Text And Typography */
          paragraph: {
            // @ts-expect-error 无法解决的类型问题
            class: Paragraph,
            inlineToolbar: true,
          },
          header: Header,
          alert: Alert,
          /** 默认操作按钮覆盖 */
          delete: Delete,
          moveDown: MoveDownTune,
          moveUp: MoveUpTune,
          delimiter: Delimiter,
          quote: Quote,
          image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: "http://localhost:8008/uploadFile",
                byUrl: "http://localhost:8008/fetchUrl",
              },
            },
          },
        },
        tunes: ["delete", "moveDown", "moveUp"],
      });
    }

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.readOnly.toggle(readOnly ?? false);
    }
  }, [readOnly]);

  useEffect(() => {
    if (editorRef.current && value && readOnly) {
      editorRef.current.render(value);
    }
  }, [value, readOnly]);

  return <div className="" ref={editorContainerRef}></div>;
};

export default Editor;
