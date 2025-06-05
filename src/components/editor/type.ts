import { UseCompletionOptions } from "@ai-sdk/react";
import { EditorInstance, JSONContent, UploadFn } from "novel";
import { RefObject } from "react";

export interface EditorUploadImageProps {
  /**
   * 上传图片的地址
   */
  action: string;
  /**
   * 上传请求头
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: Record<string, any>;
  /**
   * 上传图片的方法
   * @default post
   */
  method?: string;
  /**
   * 发到后台的文件参数名
   * @default file
   */
  name?: string;
  /**
   * 上传文件之前的钩子，参数为上传的文件，若返回 false 停止上传
   * @param file
   * @returns
   */
  beforeUpload?: (file: File) => boolean;
  /**
   * 覆盖默认的上传行为，使用 `createImageUpload` 创建
   */
  customUpload?: UploadFn;
  /**
   * 上传图片的最大大小
   */
  maxSize?: number;
  /**
   * 上传图片成功后的回调，返回图片地址
   */
  onSuccess?: (res: Response) => string;
  /**
   * 上传图片失败后的回调
   */
  onError?: (e: Error) => void;  /**
   * 完全自定义的上传函数，相当于 fetch 的 Promise
   * @param file 要上传的文件
   * @returns Promise，resolve时返回响应数据（可以是Response对象、URL字符串或包含url字段的对象）
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customUploadFn?: (file: File) => Promise<any>;
}

export interface EditorProps {
  className?: string;
  /**
   * 初始内容
   */
  initialContent?: JSONContent;
  onChange?: (content: JSONContent) => void;
  /**
   * 缓存键
   */
  cacheKey?: string;
  /**
   * 是否启用缓存
   */
  enableCache?: boolean;
  /**
   * 是否显示保存状态
   */
  showSaveStatus?: boolean;
  /**
   * 是否显示字数统计
   */
  showWordCount?: boolean;
  /**
   * 上传图片
   */
  uploadImageProps?: EditorUploadImageProps;
  /**
   * 编辑器实例
   */
  editorRef?: RefObject<EditorInstance | null>;
  /**
   * 是否启用AI
   */
  enableAI?: boolean;
  /**
   * AI选项
   */
  aiOptions?: UseCompletionOptions;
}
