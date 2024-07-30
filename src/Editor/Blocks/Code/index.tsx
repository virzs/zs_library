import { createReactBlockSpec } from '@blocknote/react';
import { cx } from '@emotion/css';
import { Menu } from '@mantine/core';
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
import React from 'react';
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

export const Code = createReactBlockSpec(
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
      const { block, editor } = props;
      const { language, theme } = block.props;

      //   @ts-ignore
      const code = block.content[0]?.text ?? '';

      const languageTitle = languages.find(
        (item) => item.value === language,
      )?.title;

      const themeTitle = themes.find((item) => item.value === theme)?.title;

      return (
        <div
          className={cx(
            `ace-${theme.replace('_', '-')}`,
            `ace-${theme.replace('-', '_')}`,
            'overflow-hidden rounded w-full',
          )}
        >
          <div className="flex justify-start items-center gap-2 mb-1">
            <Menu withinPortal={false} zIndex={999999}>
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
          </div>
          <div>
            <AceEditor
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
    },
  },
);
