import {
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
  insertOrUpdateBlock,
  locales,
} from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from '@blocknote/react';
import { MantineProvider } from '@mantine/core';
import { RiCodeLine } from '@remixicon/react';
import React, { FC } from 'react';
import { Code } from './Blocks/Code';

export type BlockNoteViewProps = React.ComponentProps<typeof BlockNoteView>;

export interface EditorProps extends Partial<BlockNoteViewProps> {
  editor?: ReturnType<typeof useCreateBlockNote>;
}

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    codeBlock: Code,
  },
});

const insertCode = (editor: typeof schema.BlockNoteEditor) => ({
  title: 'Code',
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: 'codeBlock',
    });
  },
  aliases: ['code'],
  group: 'Other',
  icon: <RiCodeLine />,
});

const Editor: FC<EditorProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { editor: propEditor, ...rest } = props;
  const editor = useCreateBlockNote({
    schema,
    dictionary: locales.zh,
  });

  const {} = editor;

  return (
    <div>
      <MantineProvider>
        <BlockNoteView
          editor={editor}
          slashMenu={false}
          {...rest}
          // onKeyDown={handleKeyDown}
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
