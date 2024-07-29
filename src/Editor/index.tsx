import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import React, { FC } from 'react';

export type BlockNoteViewProps = React.ComponentProps<typeof BlockNoteView>;

export interface EditorProps extends Partial<BlockNoteViewProps> {
  editor?: ReturnType<typeof useCreateBlockNote>;
}

const Editor: FC<EditorProps> = (props) => {
  const { editor: propEditor, ...rest } = props;
  // If editor is not provided, create a new one
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const editor = propEditor ?? useCreateBlockNote();

  const {} = editor;

  return (
    <div>
      <BlockNoteView editor={editor} {...rest} />
    </div>
  );
};

export default Editor;
