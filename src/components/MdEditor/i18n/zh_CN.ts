export interface Translation {
  [key: string]: string | Translation;
}

export default {
  frontmatterEditor: {
    title: "编辑前置元数据",
    key: "键",
    value: "值",
    addEntry: "添加项目",
  },
  dialogControls: {
    save: "保存",
    cancel: "取消",
  },
  uploadImage: {
    uploadInstructions: "从您的设备中上传图片：",
    addViaUrlInstructions: "或从网址新增图片：",
    autoCompletePlaceholder: "选择或粘贴图片",
    alt: "替代文本：",
    title: "标题：",
  },
  imageEditor: {
    editImage: "编辑图片",
  },
  createLink: {
    url: "网址",
    urlPlaceholder: "选择或粘贴网址",
    title: "标题",
    saveTooltip: "设置网址",
    cancelTooltip: "取消更改",
  },
  linkPreview: {
    open: "在新窗口中打开 {{url}}",
    edit: "编辑链接网址",
    copyToClipboard: "复制到剪贴板",
    copied: "已复制！",
    remove: "移除链接",
  },
  table: {
    deleteTable: "删除表格",
    columnMenu: "列菜单",
    textAlignment: "文字对齐",
    alignLeft: "左对齐",
    alignCenter: "居中对齐",
    alignRight: "右对齐",
    insertColumnLeft: "在当前列左侧插入一列",
    insertColumnRight: "在当前列右侧插入一列",
    deleteColumn: "删除此列",
    rowMenu: "行菜单",
    insertRowAbove: "在当前行上方插入一行",
    insertRowBelow: "在当前行下方插入一行",
    deleteRow: "删除此行",
  },
  toolbar: {
    blockTypes: {
      paragraph: "段落",
      quote: "引用",
      heading: "标题 {{level}}",
    },
    blockTypeSelect: {
      selectBlockTypeTooltip: "选择块类型",
      placeholder: "块类型",
    },
    toggleGroup: "切换组",
    removeBold: "移除粗体",
    bold: "粗体",
    removeItalic: "移除斜体",
    italic: "斜体",
    underline: "移除下划线",
    removeUnderline: "下划线",
    removeInlineCode: "移除内联代码样式",
    inlineCode: "内联代码样式",
    link: "创建链接",
    richText: "富文本",
    diffMode: "差异模式",
    source: "源码模式",
    admonition: "插入注释区块",
    codeBlock: "插入代码块",
    editFrontmatter: "编辑前置元数据",
    insertFrontmatter: "插入前置元数据",
    image: "插入图片",
    insertSandpack: "插入 Sandpack",
    table: "插入表格",
    thematicBreak: "插入主题换行",
    bulletedList: "无序列表",
    numberedList: "有序列表",
    checkList: "任务列表",
    deleteSandpack: "删除 Sandpack",
    undo: "撤销 {{shortcut}}",
    redo: "重做 {{shortcut}}",
    superscript: "上标",
    subscript: "下标",
    strikethrough: "删除线",
    removeSubscript: "移除下标",
    removeSuperscript: "移除上标",
    removeStrikethrough: "移除删除线",
  },
  admonitions: {
    note: "注意",
    tip: "提示",
    danger: "危险",
    info: "信息",
    caution: "警告",
    changeType: "选择注释区块类型",
    placeholder: "注释区块类型",
  },
  codeBlock: {
    language: "代码块语言",
    selectLanguage: "选择代码块语言",
    inlineLanguage: "代码块语言",
  },
  codeblock: {
    delete: "删除代码块",
  },
  contentArea: {
    editableMarkdown: "可编辑的 Markdown",
  },
  image: {
    delete: "删除图片",
  },
} as Translation;
