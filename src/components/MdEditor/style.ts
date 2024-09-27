import { css, cx } from "@emotion/css";

export const markdownEditorStyle = css`
  [class*="_toolbarRoot"] {
    flex-wrap: wrap;
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
