import { css, cx } from "@emotion/css";

export const markdownEditorDarkStyle = css`
  --accentBase: var(--tomato-1);
  --accentBgSubtle: var(--tomato-2);
  --accentBg: var(--tomato-3);
  --accentBgHover: var(--tomato-4);
  --accentBgActive: var(--tomato-5);
  --accentLine: var(--tomato-6);
  --accentBorder: var(--tomato-7);
  --accentBorderHover: var(--tomato-8);
  --accentSolid: var(--tomato-9);
  --accentSolidHover: var(--tomato-10);
  --accentText: var(--tomato-11);
  --accentTextContrast: var(--tomato-12);

  --baseBase: var(--mauve-1);
  --baseBgSubtle: var(--mauve-2);
  --baseBg: var(--mauve-3);
  --baseBgHover: var(--mauve-4);
  --baseBgActive: var(--mauve-5);
  --baseLine: var(--mauve-6);
  --baseBorder: var(--mauve-7);
  --baseBorderHover: var(--mauve-8);
  --baseSolid: var(--mauve-9);
  --baseSolidHover: var(--mauve-10);
  --baseText: var(--mauve-11);
  --baseTextContrast: var(--mauve-12);

  --admonitionTipBg: var(--cyan-4);
  --admonitionTipBorder: var(--cyan-8);

  --admonitionInfoBg: var(--grass-4);
  --admonitionInfoBorder: var(--grass-8);

  --admonitionCautionBg: var(--amber-4);
  --admonitionCautionBorder: var(--amber-8);

  --admonitionDangerBg: var(--red-4);
  --admonitionDangerBorder: var(--red-8);

  --admonitionNoteBg: var(--mauve-4);
  --admonitionNoteBorder: var(--mauve-8);

  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;

  color: var(--baseText);
  --basePageBg: #000000;
  background-color: var(--basePageBg);
  background-image: linear-gradient(
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.05)
  );
`;

export const markdownEditorStyle = css`
  [class*="_toolbarRoot"] {
    flex-wrap: wrap;
    transition: all 0.3s;
  }
  [class*="_codeMirrorWrapper"] {
    padding: 0;
    [class*="_codeMirrorToolbar"] {
      position: static;
      background-color: var(--bgColor-muted);
      justify-content: flex-end;
      [class*="_iconButton"] {
        cursor: pointer;
      }
    }
  }
  [class*="_tableEditor"] {
    border-spacing: 0;
    border-collapse: collapse;
    width: 100%;
    display: table;
    th[data-tool-cell],
    td[data-tool-cell] {
      padding: 0;
      border: none;
    }
    tr {
      border-top: 0;
    }
    thead {
      th {
        padding: 0;
        border: none;
      }
    }
    tfoot {
      th {
        padding: 0;
        border: none;
      }
    }
    [class*="_addRowButton"],
    [class*="_addColumnButton"],
    [class*="_tableColumnEditorTrigger"],
    [class*="_iconButton"] {
      cursor: pointer;
      transition: all 0.3s;
    }
  }
  ul {
    [role="checkbox"] {
      padding: 0 20px;
      &::before {
        width: 13px;
        height: 13px;
        top: 6px;
      }
      &::after {
        top: 7px;
        left: 4px;
      }
    }
  }
  ul,
  ol {
    li {
      margin-top: 4px;
      margin-bottom: 0;
    }
  }
`;

export const markdownStyle = cx(
  "markdown-body",
  css`
    p {
      margin-bottom: 8px;
    }
    ul {
      list-style: disc;
    }
    ol {
      list-style: decimal;
    }
    table {
      width: 100%;
      display: table;
    }
    pre {
      padding: 0;
      > div {
        margin: 0 !important;
      }
    }
  `
);

export const githubMarkdownLightStyle = css`
  .markdown-body {
    /* light */
    color-scheme: light;
    --focus-outlineColor: #0969da;
    --fgColor-default: #1f2328;
    --fgColor-muted: #59636e;
    --fgColor-accent: #0969da;
    --fgColor-success: #1a7f37;
    --fgColor-attention: #9a6700;
    --fgColor-danger: #d1242f;
    --fgColor-done: #8250df;
    --bgColor-default: #ffffff;
    --bgColor-muted: #f6f8fa;
    --bgColor-neutral-muted: #818b981f;
    --bgColor-attention-muted: #fff8c5;
    --borderColor-default: transparent;
    --borderColor-muted: #d1d9e0b3;
    --borderColor-neutral-muted: #d1d9e0b3;
    --borderColor-accent-emphasis: #0969da;
    --borderColor-success-emphasis: #1a7f37;
    --borderColor-attention-emphasis: #9a6700;
    --borderColor-danger-emphasis: #cf222e;
    --borderColor-done-emphasis: #8250df;
    --color-prettylights-syntax-comment: #59636e;
    --color-prettylights-syntax-constant: #0550ae;
    --color-prettylights-syntax-constant-other-reference-link: #0a3069;
    --color-prettylights-syntax-entity: #6639ba;
    --color-prettylights-syntax-storage-modifier-import: #1f2328;
    --color-prettylights-syntax-entity-tag: #0550ae;
    --color-prettylights-syntax-keyword: #cf222e;
    --color-prettylights-syntax-string: #0a3069;
    --color-prettylights-syntax-variable: #953800;
    --color-prettylights-syntax-brackethighlighter-unmatched: #82071e;
    --color-prettylights-syntax-brackethighlighter-angle: #59636e;
    --color-prettylights-syntax-invalid-illegal-text: #f6f8fa;
    --color-prettylights-syntax-invalid-illegal-bg: #82071e;
    --color-prettylights-syntax-carriage-return-text: #f6f8fa;
    --color-prettylights-syntax-carriage-return-bg: #cf222e;
    --color-prettylights-syntax-string-regexp: #116329;
    --color-prettylights-syntax-markup-list: #3b2300;
    --color-prettylights-syntax-markup-heading: #0550ae;
    --color-prettylights-syntax-markup-italic: #1f2328;
    --color-prettylights-syntax-markup-bold: #1f2328;
    --color-prettylights-syntax-markup-deleted-text: #82071e;
    --color-prettylights-syntax-markup-deleted-bg: #ffebe9;
    --color-prettylights-syntax-markup-inserted-text: #116329;
    --color-prettylights-syntax-markup-inserted-bg: #dafbe1;
    --color-prettylights-syntax-markup-changed-text: #953800;
    --color-prettylights-syntax-markup-changed-bg: #ffd8b5;
    --color-prettylights-syntax-markup-ignored-text: #d1d9e0;
    --color-prettylights-syntax-markup-ignored-bg: #0550ae;
    --color-prettylights-syntax-meta-diff-range: #8250df;
    --color-prettylights-syntax-sublimelinter-gutter-mark: #818b98;
  }
`;

export const githubMarkdownDarkStyle = css`
  .markdown-body {
    /* dark */
    color-scheme: dark;
    --focus-outlineColor: #1f6feb;
    --fgColor-default: #f0f6fc;
    --fgColor-muted: #9198a1;
    --fgColor-accent: #4493f8;
    --fgColor-success: #3fb950;
    --fgColor-attention: #d29922;
    --fgColor-danger: #f85149;
    --fgColor-done: #ab7df8;
    --bgColor-default: transparent;
    --bgColor-muted: #151b23;
    --bgColor-neutral-muted: #656c7633;
    --bgColor-attention-muted: #bb800926;
    --borderColor-default: #3d444d;
    --borderColor-muted: #3d444db3;
    --borderColor-neutral-muted: #3d444db3;
    --borderColor-accent-emphasis: #1f6feb;
    --borderColor-success-emphasis: #238636;
    --borderColor-attention-emphasis: #9e6a03;
    --borderColor-danger-emphasis: #da3633;
    --borderColor-done-emphasis: #8957e5;
    --color-prettylights-syntax-comment: #9198a1;
    --color-prettylights-syntax-constant: #79c0ff;
    --color-prettylights-syntax-constant-other-reference-link: #a5d6ff;
    --color-prettylights-syntax-entity: #d2a8ff;
    --color-prettylights-syntax-storage-modifier-import: #f0f6fc;
    --color-prettylights-syntax-entity-tag: #7ee787;
    --color-prettylights-syntax-keyword: #ff7b72;
    --color-prettylights-syntax-string: #a5d6ff;
    --color-prettylights-syntax-variable: #ffa657;
    --color-prettylights-syntax-brackethighlighter-unmatched: #f85149;
    --color-prettylights-syntax-brackethighlighter-angle: #9198a1;
    --color-prettylights-syntax-invalid-illegal-text: #f0f6fc;
    --color-prettylights-syntax-invalid-illegal-bg: #8e1519;
    --color-prettylights-syntax-carriage-return-text: #f0f6fc;
    --color-prettylights-syntax-carriage-return-bg: #b62324;
    --color-prettylights-syntax-string-regexp: #7ee787;
    --color-prettylights-syntax-markup-list: #f2cc60;
    --color-prettylights-syntax-markup-heading: #1f6feb;
    --color-prettylights-syntax-markup-italic: #f0f6fc;
    --color-prettylights-syntax-markup-bold: #f0f6fc;
    --color-prettylights-syntax-markup-deleted-text: #ffdcd7;
    --color-prettylights-syntax-markup-deleted-bg: #67060c;
    --color-prettylights-syntax-markup-inserted-text: #aff5b4;
    --color-prettylights-syntax-markup-inserted-bg: #033a16;
    --color-prettylights-syntax-markup-changed-text: #ffdfb6;
    --color-prettylights-syntax-markup-changed-bg: #5a1e02;
    --color-prettylights-syntax-markup-ignored-text: #f0f6fc;
    --color-prettylights-syntax-markup-ignored-bg: #1158c7;
    --color-prettylights-syntax-meta-diff-range: #d2a8ff;
    --color-prettylights-syntax-sublimelinter-gutter-mark: #3d444d;
  }
`;
