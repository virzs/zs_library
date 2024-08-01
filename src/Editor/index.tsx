import {
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
  insertOrUpdateBlock,
  locales,
  PartialBlock,
} from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from '@blocknote/react';
import { MantineProvider } from '@mantine/core';
import { RiCodeLine } from '@remixicon/react';
import React, { FC, useEffect, useState } from 'react';
import { CodeBlock } from './Blocks/CodeBlock';

export type BlockNoteViewProps = React.ComponentProps<typeof BlockNoteView>;

export interface EditorProps
  extends Omit<Partial<BlockNoteViewProps>, 'onChange'> {
  /** 希望隐藏的内容块 */
  hideSpecs?: (keyof typeof defaultBlockSpecs)[];
  /** 由于添加了自定义块，导致类型复杂无法在此处设置 typeof schema.BlockNoteEditor['initialContent'] */
  value?: PartialBlock<any>[];
  onChange?: (value: PartialBlock<any>[]) => void;
  uploadFile?: (file: File) => Promise<string>;
  className?: string;
}

const Editor: FC<EditorProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    hideSpecs = [],
    value,
    onChange,
    editable,
    uploadFile,
    className,
    ...rest
  } = props;

  const [init, setInit] = useState(false);
  const [firstChange, setFirstChange] = useState(false);

  const specs = {
    // 过滤掉不需要的内容块 filter
    ...defaultBlockSpecs,
    codeBlock: CodeBlock,
  };

  const schema = BlockNoteSchema.create({
    blockSpecs:
      hideSpecs.length > 0
        ? Object.fromEntries(
            Object.entries(specs).filter(
              ([key]) =>
                !hideSpecs.includes(key as keyof typeof defaultBlockSpecs),
            ),
          )
        : specs,
  });

  const insertCode = (editor: typeof schema.BlockNoteEditor) => ({
    title: '代码',
    subtext: '插入代码块',
    key: 'code_block',
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: 'codeBlock',
      });
    },
    aliases: ['code', 'codeBlock', '代码', '代码块'],
    group: '其他',
    icon: <RiCodeLine size={18} />,
  });

  const editor = useCreateBlockNote({
    schema,
    dictionary: locales.zh,
    uploadFile,
  });

  useEffect(() => {
    if (!!value?.length && ((!init && !firstChange) || editable === false)) {
      setInit(true);
      setTimeout(() => {
        editor.replaceBlocks(editor.document, value);
      }, 0);
    }
  }, [value, editable, editor, init]);

  return (
    <div className={className}>
      <MantineProvider>
        <BlockNoteView
          editable={editable}
          // @ts-ignore
          editor={editor}
          slashMenu={false}
          onChange={() => {
            // console.log('onChange', editor.document, init);
            onChange?.(editor.document);
            if (!firstChange) setFirstChange(true);
          }}
          {...rest}
        >
          <SuggestionMenuController
            triggerCharacter={'/'}
            getItems={async (query) =>
              filterSuggestionItems(
                [
                  ...getDefaultReactSlashMenuItems(editor),
                  insertCode(editor),
                ].filter((i) => {
                  // @ts-ignore
                  const key = i.key.replace(/_(\w)/g, (_, c) =>
                    c.toUpperCase(),
                  );
                  return !hideSpecs.some((s) => key.includes(s));
                }),
                query,
              )
            }
          />
        </BlockNoteView>
      </MantineProvider>
    </div>
  );
};

export default Editor;
