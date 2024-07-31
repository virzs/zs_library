import { createReactBlockSpec } from '@blocknote/react';
import React from 'react';
import CB from './CodeBlock';

export const CodeBlock = createReactBlockSpec(
  {
    type: 'codeBlock',
    propSchema: {
      language: {
        default: 'text',
        values: [
          'text',
          'javascript',
          'typescript',
          'json',
          'html',
          'css',
          'dockerfile',
        ],
      },
      theme: {
        default: 'monokai',
        values: [
          'github',
          'github_dark',
          'monokai',
          'cloud9_day',
          'cloud9_night',
          'cloud_editor',
          'cloud_editor_dark',
        ],
      },
    },
    content: 'inline',
  },
  {
    render: (props) => {
      return <CB {...props} />;
    },
  },
);
