import { ReactCustomBlockRenderProps } from '@blocknote/react';
import { css, cx } from '@emotion/css';
import { Menu, Tooltip, UnstyledButton } from '@mantine/core';
import '@mantine/core/styles.css';
import { RiCheckLine, RiFileCopyLine } from '@remixicon/react';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-beautify';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-dockerfile';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/theme-cloud9_day';
import 'ace-builds/src-noconflict/theme-cloud9_night';
import 'ace-builds/src-noconflict/theme-cloud_editor';
import 'ace-builds/src-noconflict/theme-cloud_editor_dark';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-github_dark';
import 'ace-builds/src-noconflict/theme-monokai';
import { motion } from 'framer-motion';
import React, { FC, useState } from 'react';
import AceEditor from 'react-ace';

const languages = [
  {
    title: 'Text',
    value: 'text',
  },
  {
    title: 'JavaScript',
    value: 'javascript',
  },
  {
    title: 'TypeScript',
    value: 'typescript',
  },
  {
    title: 'JSON',
    value: 'json',
  },
  {
    title: 'HTML',
    value: 'html',
  },
  {
    title: 'CSS',
    value: 'css',
  },
  {
    title: 'Dockerfile',
    value: 'dockerfile',
  },
];

const themes = [
  {
    title: 'Github',
    value: 'github',
  },
  {
    title: 'Github Dark',
    value: 'github_dark',
  },
  {
    title: 'Monokai',
    value: 'monokai',
  },
  {
    title: 'Cloud9 Day',
    value: 'cloud9_day',
  },
  {
    title: 'Cloud9 Night',
    value: 'cloud9_night',
  },
  {
    title: 'Cloud Editor',
    value: 'cloud_editor',
  },
  {
    title: 'Cloud Editor Dark',
    value: 'cloud_editor_dark',
  },
];

const CodeBlock: FC<ReactCustomBlockRenderProps<any, any, any>> = (props) => {
  const { block, editor } = props;
  const { language, theme } = block.props;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [copyed, setCopyed] = useState(false);

  //   @ts-ignore
  const code = block.content[0]?.text ?? '';

  const languageTitle = languages.find(
    (item) => item.value === language,
  )?.title;

  const themeTitle = themes.find((item) => item.value === theme)?.title;

  const editable = editor.isEditable;

  return (
    <div
      className={cx(
        `ace-${theme.replace('_', '-')}`,
        `ace-${theme.replace('-', '_')}`,
        'overflow-hidden rounded w-full relative',
        !editable &&
          css`
            &:hover .code-block-copy {
              opacity: 100;
            }
          `,
      )}
      onMouseLeave={() => {
        setCopyed(false);
      }}
    >
      <div className="inline-flex justify-start items-center mb-1 bg-gray-100 bg-opacity-10 rounded-br">
        <Menu withinPortal={false} zIndex={999999} disabled={!editable}>
          <Menu.Target>
            <div
              className="cursor-pointer px-2 py-1 text-xs font-bold"
              contentEditable={false}
            >
              {languageTitle ?? language}
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>语言</Menu.Label>
            {languages.map((type) => {
              return (
                <Menu.Item
                  key={type.value}
                  onClick={() =>
                    props.editor.updateBlock(block, {
                      type: 'codeBlock',
                      props: { language: type.value as any },
                    })
                  }
                >
                  {type.title}
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
        {editable && (
          <Menu withinPortal={false} zIndex={999999}>
            <Menu.Target>
              <div
                className="cursor-pointer px-2 py-1 text-xs font-bold"
                contentEditable={false}
              >
                {themeTitle ?? theme}
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>主题</Menu.Label>
              {themes.map((type) => {
                return (
                  <Menu.Item
                    key={type.value}
                    onClick={() =>
                      props.editor.updateBlock(block, {
                        type: 'codeBlock',
                        props: { theme: type.value as any },
                      })
                    }
                  >
                    {type.title}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        )}
      </div>
      {!editable && (
        <div className="code-block-copy opacity-0 absolute right-2 top-2 z-10">
          <Tooltip label="复制">
            <UnstyledButton
              className="hover:bg-gray-100 hover:bg-opacity-10 transition-all cursor-pointer flex justify-center items-center rounded z-10 w-8 h-8"
              onClick={() => {
                navigator.clipboard.writeText(code).then(() => {
                  setCopyed(true);
                });
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                {copyed ? (
                  <RiCheckLine size={18} />
                ) : (
                  <RiFileCopyLine size={18} />
                )}
              </motion.div>
            </UnstyledButton>
          </Tooltip>
        </div>
      )}
      <div>
        <AceEditor
          readOnly={!editable}
          className="!w-full min-h-[200px]"
          enableLiveAutocompletion
          placeholder="请输入代码"
          maxLines={Infinity}
          value={code}
          mode={language}
          theme={theme}
          onChange={(value) => {
            editor.updateBlock(block, {
              content: [{ type: 'text', text: value, styles: {} }],
            });
          }}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
        />
      </div>
    </div>
  );
};

export default CodeBlock;
