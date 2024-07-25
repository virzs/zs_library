import AttachesTool from '@editorjs/attaches';
import Checklist from '@editorjs/checklist';
import CodeTool from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import EditorJS from '@editorjs/editorjs';
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
import { EditorProps } from './interface';

const Editor: FC<EditorProps> = (props) => {
  const {
    value,
    onChange,
    bordered = true,
    readOnly = false,
    id = 'ZsLibraryEditor',
    tools,
    placeholder,
  } = props;

  const editorRef = useRef<EditorJS | null>(null);

  const isReady = useRef(false);
  const [saving, setSaving] = useState(false);
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: id,
        placeholder,
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
            config: {
              ...tools?.warning,
            },
          },
          /** https://github.com/editor-js/nested-list */
          list: {
            class: NestedList,
            config: {
              ...tools?.list,
            },
          },
          /** https://github.com/editor-js/paragraph */
          paragraph: {
            // @ts-ignore
            class: Paragraph,
            config: {
              ...tools?.paragraph,
            },
          },
          /** https://github.com/editor-js/code */
          code: {
            class: CodeTool,
            config: {
              ...tools?.code,
            },
          },
          /** https://github.com/editor-js/header */
          header: {
            // @ts-ignore
            class: Header,
            config: {
              ...tools?.header,
            },
          },
          /** https://github.com/editor-js/inline-code */
          inlineCode: {
            class: InlineCode,
          },
          /** https://github.com/editor-js/table */
          table: {
            class: Table,
            config: {
              ...tools?.table,
            },
          },
          /** https://github.com/editor-js/marker */
          Marker: {
            class: Marker,
          },
          /** https://github.com/editor-js/quote */
          quote: {
            class: Quote,
            config: {
              ...tools?.quote,
            },
          },
          /** https://github.com/editor-js/raw */
          raw: {
            class: RawTool,
            config: {
              ...tools?.raw,
            },
          },
          /** https://github.com/editor-js/checklist */
          checklist: {
            class: Checklist,
          },
          /** https://github.com/editor-js/delimiter */
          delimiter: Delimiter,
          /** https://github.com/editor-js/text-variant-tune */
          textVariant: TextVariantTune,
          /** https://github.com/editor-js/underline */
          underline: Underline,
        },
        onReady: () => {
          new DragDrop(editorRef.current);
          isReady.current = true;
        },
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [id, readOnly, tools, placeholder]);

  const editor = useMemo(() => {
    return {
      placeholder: '输入/来浏览选项',
      holder: 'editor',
      readOnly: readOnly,
      tools: {},
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
      onChange: () => {
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
