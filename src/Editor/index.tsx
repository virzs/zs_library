import {
  BlockNoteEditor,
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
} from '@blocknote/react';
import { MantineProvider } from '@mantine/core';
import { RiCodeLine } from '@remixicon/react';
import React, { FC, useMemo } from 'react';
import { Code } from './Blocks/Code';

export type BlockNoteViewProps = React.ComponentProps<typeof BlockNoteView>;

export interface EditorProps
  extends Omit<Partial<BlockNoteViewProps>, 'onChange'> {
  /** 希望隐藏的内容块 */
  hideSpecs?: (keyof typeof defaultBlockSpecs)[];
  /** 由于添加了自定义块，导致类型复杂无法在此处设置 typeof schema.BlockNoteEditor['initialContent'] */
  value?: PartialBlock<any>[];
  onChange?: (value: PartialBlock<any>[]) => void;
}

const Editor: FC<EditorProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hideSpecs = [], value, onChange, ...rest } = props;

  const schema = BlockNoteSchema.create({
    blockSpecs: {
      // 过滤掉不需要的内容块 filter
      ...(hideSpecs.length > 0
        ? Object.fromEntries(
            Object.entries(defaultBlockSpecs).filter(
              ([key]) =>
                !hideSpecs.includes(key as keyof typeof defaultBlockSpecs),
            ),
          )
        : defaultBlockSpecs),
      codeBlock: Code,
    },
  });

  const insertCode = (editor: typeof schema.BlockNoteEditor) => ({
    title: '代码',
    subtext: '插入代码块',
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: 'codeBlock',
      });
    },
    aliases: ['code', 'codeBlock', '代码', '代码块'],
    group: '其他',
    icon: <RiCodeLine size={18} />,
  });

  const editor = useMemo(() => {
    return BlockNoteEditor.create({
      // @ts-ignore
      initialContent: value,
      schema,
      dictionary: locales.zh,
    });
  }, [value]);

  return (
    <div>
      <MantineProvider>
        <BlockNoteView
          // @ts-ignore
          editor={editor}
          slashMenu={false}
          onChange={() => {
            onChange?.(editor.document);
          }}
          {...rest}
        >
          <SuggestionMenuController
            triggerCharacter={'/'}
            getItems={async (query) =>
              filterSuggestionItems(
                [...getDefaultReactSlashMenuItems(editor), insertCode(editor)],
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
