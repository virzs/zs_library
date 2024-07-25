import AttachesTool from '@editorjs/attaches';
import Checklist from '@editorjs/checklist';
import CodeTool from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import ImageTool from '@editorjs/image';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import NestedList from '@editorjs/nested-list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import RawTool from '@editorjs/raw';
import Table from '@editorjs/table';
import TextVariantTune from '@editorjs/text-variant-tune';
import Underline from '@editorjs/underline';
import Warning from '@editorjs/warning';
import { css, cx } from '@emotion/css';
import DragDrop from 'editorjs-drag-drop';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

/** 附件配置 */
export interface EditorAttachesConfig {
  /** 可选的文件上传端点或使用上传器 */
  endpoint?: string;
  /** 可选的自定义上传方法或使用端点 */
  uploader?: (
    file: File,
  ) => Promise<{ success: number; file: { url: string } }>;
  /** (默认值:)POST requestfile中上传文件字段的名称 */
  field?: string;
  /** (默认值:)文件选择可以接受的文件类型 */
  types?: string;
  /** (默认:)文件上传按钮的占位符 */
  buttonText?: string;
  /** (default:)文件上传失败的消息 */
  errorMessage?: string;
  /** (default:)对象，带有任何将被添加到request中的自定义头。示例:{}{"X-CSRF-TOKEN": "W5fe2…hR8d1"} */
  additionalRequestHeaders?: object;
}

/** 图片配置 */
export interface EditorImageConfig {
  /** 上传文件的端点。包含2个字段: byFile -用于上传文件 byUrl -按URL上传 */
  endpoints?: { byFile?: string; byUrl?: string };
  /** (默认:)POST请求图片中上传图片字段的名称 */
  field?: string;
  /** 使用file selection.image/*可以接受的mime类型的文件 */
  types?: string;
  /** 对象，其中包含要随上传请求发送的任何数据 */
  additionalRequestData?: object;
  /** 对象的任何自定义头将添加到请求。 */
  additionalRequestHeaders?: object;
  /** (默认值:)标题的占位符 */
  captionPlaceholder?: string;
  /** 允许覆盖«选择文件»按钮的HTML内容 */
  buttonContent?: string;
  /** 可选的自定义上传方式。详情见下文。 */
  uploader?: {
    uploadByFile: (file: File) => Promise<{
      success: number;
      file: {
        url: string;
      };
    }>;
    uploadByUrl: (file: File) => Promise<{
      success: number;
      file: {
        url: string;
      };
    }>;
  };
  /** 数组，其中包含要显示在工具设置菜单中的自定义操作。详情见下文。 */
  actions?: {
    name?: string;
    icon?: string;
    title?: string;
    toggle?: boolean;
    action?: (name: string) => void;
  }[];
}

/**  */

/** 编辑器工具配置 */
export interface EditorToolsConfig {
  /** 附件 */
  attaches?: EditorAttachesConfig;
  /** 图片 */
  image?: EditorImageConfig;
}

export interface EditorProps {
  value: OutputData;
  onChange?: (data: OutputData) => void;
  bordered?: boolean;
  readOnly?: boolean;
  id?: string;
  tools?: EditorToolsConfig;
}

const Editor: FC<EditorProps> = (props) => {
  const {
    value,
    onChange,
    bordered = true,
    readOnly = false,
    id = 'ZsLibraryEditor',
    tools,
  } = props;

  const editorRef = useRef<EditorJS | null>(null);

  const isReady = useRef(false);
  const [saving, setSaving] = useState(false);
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: id,
        readOnly,
        tools: {
          /** https://github.com/editor-js/attaches */
          attaches: {
            class: AttachesTool,
            config: {
              ...tools?.attaches,
            },
          },
          /** https://github.com/editor-js/image */
          image: {
            // @ts-ignore
            class: ImageTool,
            config: {
              ...tools?.image,
            },
          },
          /** https://github.com/editor-js/warning */
          warning: {
            class: Warning,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+W',
            config: {
              titlePlaceholder: '标题',
              messagePlaceholder: '信息',
            },
          },
        },
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [id, readOnly]);

  const editor = useMemo(() => {
    return {
      placeholder: '输入/来浏览选项',
      holder: 'editor',
      readOnly: readOnly,
      tools: {
        warning: {
          class: Warning,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+W',
          config: {
            titlePlaceholder: '标题',
            messagePlaceholder: '信息',
          },
        },
        list: {
          class: NestedList,
          inlineToolbar: true,
          config: {
            // 默认列表样式:有序或无序，默认为无序
            defaultStyle: 'unordered',
          },
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
          // placeholder 占位符。当整个编辑器为空时，将只显示在第一段。
          // preserveBlank (默认值:false)保存编辑器数据时是否保留空白段落
        },
        code: {
          class: CodeTool,
          // placeholder 代码工具的占位符字符串
        },
        header: {
          class: Header,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+H',
          config: {
            placeholder: '输入标题',
            // levels
            // defaultLevel
          },
        },
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+M',
        },
        table: {
          class: Table,
          inlineToolbar: true,
          config: {
            rows: 2, // 初始行数。默认为2
            cols: 3, // 初始列数。默认为2
            // withHeadings 切换表格标题。默认为False
          },
        },
        Marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M',
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+O',
          config: {
            quotePlaceholder: '输入引用',
            captionPlaceholder: '引用的作者',
          },
        },
        raw: {
          class: RawTool,
          // placeholder 占位符。
        },
        delimiter: Delimiter,
        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },
        textVariant: TextVariantTune,
        underline: Underline,
      },
      // tunes: ["textVariant"],
      /**
       * Internationalzation config
       */
      i18n: {
        /**
         * @type {I18nDictionary}
         */
        messages: {
          /**
           * Other below: translation of different UI components of the editor.js core
           */
          ui: {
            blockTunes: {
              toggler: {
                'Click to tune': '单击以调整',
                'or drag to move': '或拖动以移动',
              },
            },
            inlineToolbar: {
              converter: {
                'Convert to': '转换为',
              },
            },
            toolbar: {
              toolbox: {
                Add: '添加',
              },
            },
          },

          /**
           * Section for translation Tool Names: both block and inline tools
           */
          toolNames: {
            Text: '文本',
            Heading: '标题',
            List: '嵌套列表',
            Warning: '警告',
            Checklist: '列表选择',
            Quote: '引用',
            Code: '代码',
            Delimiter: '分隔符',
            'Raw HTML': '原始HTML',
            Table: '表格',
            Link: '链接',
            Marker: '标记',
            Bold: '粗体',
            Italic: '斜体',
            InlineCode: '行内代码',
            Image: '图片',
            Attachment: '附件',
            Underline: '下划线',
          },

          /**
           * Section for passing translations to the external tools classes
           */
          tools: {
            /**
             * Each subsection is the i18n dictionary that will be passed to the corresponded plugin
             * The name of a plugin should be equal the name you specify in the 'tool' section for that plugin
             */
            warning: {
              // <-- 'Warning' tool will accept this dictionary section
              Title: '标题',
              Message: '信息',
            },

            /**
             * Link is the internal Inline Tool
             */
            link: {
              'Add a link': '添加链接',
            },
            /**
             * The "stub" is an internal block tool, used to fit blocks that does not have the corresponded plugin
             */
            stub: {
              'The block can not be displayed correctly.': '该块不能正确显示。',
            },
            header: {
              'Heading 1': '标题1',
              'Heading 2': '标题2',
              'Heading 3': '标题3',
              'Heading 4': '标题4',
              'Heading 5': '标题5',
              'Heading 6': '标题6',
            },
            textVariant: {
              'Call-out': '标注',
            },
          },

          /**
           * Section allows to translate Block Tunes
           */
          blockTunes: {
            /**
             * Each subsection is the i18n dictionary that will be passed to the corresponded Block Tune plugin
             * The name of a plugin should be equal the name you specify in the 'tunes' section for that plugin
             *
             * Also, there are few internal block tunes: "delete", "moveUp" and "moveDown"
             */
            delete: {
              Delete: '删除',
              'Click to delete': '单击以删除',
            },
            moveUp: {
              'Move up': '向上移动',
            },
            moveDown: {
              'Move down': '向下移动',
            },
            callOut: {
              'Call-out': '标注',
            },
          },
        },
      },
      onReady: () => {
        new DragDrop(editor);
        isReady.current = true;
        console.log('Editor.js is ready to work!');
      },
      onChange: (api, event) => {
        setSaving(true);
      },
    };
  }, []);

  useEffect(() => {
    if (editor.render && !init && value) {
      editor.render(value);
      setInit(true);
    }
  }, [value, editor.render, init]);

  useEffect(() => {
    if (saving && editor?.save) {
      editor.save().then((outputData) => {
        onChange?.(outputData);
        setSaving(false);
      });
    }
  }, [saving, editor]);

  return (
    <div
      id={id}
      className={cx(
        'px-8 py-6',
        bordered ? 'border border-solid rounded-md' : '',
        bordered
          ? css`
              border-color: rgba(5, 5, 5, 0.06);
            `
          : '',
        css`
          .ce-popover__items {
            display: flex;
            flex-direction: column;

            .ce-popover-item {
              &[data-item-name='delete'] {
                transition: 0.3s;
                /* 删除按钮 */
                color: red;
                order: 9999;
                &:not(.ce-popover-item--confirmation) {
                  background-color: rgba(255, 0, 0, 0.08);
                }
              }
            }
          }
        `,
      )}
    ></div>
  );
};

export default Editor;
