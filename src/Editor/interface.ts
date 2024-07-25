import { OutputData } from '@editorjs/editorjs';

/** 附件配置 */
export interface EditorAttachesConfig {
  /** 可选的文件上传端点或使用上传器 */
  endpoint?: string;
  /** 可选的自定义上传方法或使用端点 */
  uploader?: (
    file: File,
  ) => Promise<{ success: number; file: { url: string } }>;
  /** (默认值:)POST requestfile中上传文件字段的名称 */
  field?: string;
  /** (默认值:)文件选择可以接受的文件类型 */
  types?: string;
  /** (默认:)文件上传按钮的占位符 */
  buttonText?: string;
  /** (default:)文件上传失败的消息 */
  errorMessage?: string;
  /** (default:)对象，带有任何将被添加到request中的自定义头。示例:{}{"X-CSRF-TOKEN": "W5fe2…hR8d1"} */
  additionalRequestHeaders?: object;
}

/** 图片配置 */
export interface EditorImageConfig {
  /** 上传文件的端点。包含2个字段: byFile -用于上传文件 byUrl -按URL上传 */
  endpoints?: { byFile?: string; byUrl?: string };
  /** (默认:)POST请求图片中上传图片字段的名称 */
  field?: string;
  /** 使用file selection.image/*可以接受的mime类型的文件 */
  types?: string;
  /** 对象，其中包含要随上传请求发送的任何数据 */
  additionalRequestData?: object;
  /** 对象的任何自定义头将添加到请求。 */
  additionalRequestHeaders?: object;
  /** (默认值:)标题的占位符 */
  captionPlaceholder?: string;
  /** 允许覆盖«选择文件»按钮的HTML内容 */
  buttonContent?: string;
  /** 可选的自定义上传方式。详情见下文。 */
  uploader?: {
    uploadByFile: (file: File) => Promise<{
      success: number;
      file: {
        url: string;
      };
    }>;
    uploadByUrl: (file: File) => Promise<{
      success: number;
      file: {
        url: string;
      };
    }>;
  };
  /** 数组，其中包含要显示在工具设置菜单中的自定义操作。详情见下文。 */
  actions?: {
    name?: string;
    icon?: string;
    title?: string;
    toggle?: boolean;
    action?: (name: string) => void;
  }[];
}

/** 警告配置 */
export interface EditorWarningConfig {
  /** 标题的占位符 */
  titlePlaceholder?: string;
  /** 信息的占位符 */
  messagePlaceholder?: string;
}

/** 列表配置 */
export interface EditorListConfig {
  /** 默认列表样式:有序或无序，默认为无序 */
  defaultStyle?: 'ordered' | 'unordered';
}

/** 段落配置 */
export interface EditorParagraphConfig {
  /** 占位符。当整个编辑器为空时，将只显示在第一段。 */
  placeholder?: string;
  /** (默认值:false)保存编辑器数据时是否保留空白段落 */
  preserveBlank?: boolean;
}

/** 代码配置 */
export interface EditorCodeConfig {
  /** 占位符 */
  placeholder?: string;
}

/** 标题配置 */
export interface EditorHeaderConfig {
  /** 占位符 */
  placeholder?: string;
  /** 允许的标题级别 */
  levels?: number[];
  /** 默认标题级别 */
  defaultLevel?: number;
}

/** 表格配置 */
export interface EditorTableConfig {
  /** 初始行数。默认为2 */
  rows?: number;
  /** 初始列数。默认为2 */
  cols?: number;
  /** 切换表格标题。默认为False */
  withHeadings?: boolean;
}

/** 引用配置 */
export interface EditorQuoteConfig {
  /** 引用的占位符字符串 */
  quotePlaceholder?: string;
  /** 标题的占位符字符串 */
  captionPlaceholder?: string;
}

/** 原始工具配置 */
export interface EditorRawConfig {
  /** 占位符 */
  placeholder?: string;
}

/** 编辑器工具配置 */
export interface EditorToolsConfig {
  /** 附件 */
  attaches?: EditorAttachesConfig;
  /** 图片 */
  image?: EditorImageConfig;
  /** 警告 */
  warning?: EditorWarningConfig;
  /** 列表 */
  list?: EditorListConfig;
  /** 段落 */
  paragraph?: EditorParagraphConfig;
  /** 代码 */
  code?: EditorCodeConfig;
  /** 标题 */
  header?: EditorHeaderConfig;
  /** 表格 */
  table?: EditorTableConfig;
  /** 引用 */
  quote?: EditorQuoteConfig;
  /** 原始 */
  raw?: EditorRawConfig;
}

export interface EditorProps {
  value: OutputData;
  onChange?: (data: OutputData) => void;
  bordered?: boolean;
  readOnly?: boolean;
  id?: string;
  tools?: EditorToolsConfig;
  placeholder?: string;
}
