import type { ReactNode } from "react";

/** 单项验证状态 */
export type ValidationStatus = "pass" | "fail" | "warning" | "pending";

/** 单项验证结果 */
export interface ValidationItem {
  /** 验证规则唯一标识 */
  key: string;
  /** 验证状态 */
  status: ValidationStatus;
  /** 提示消息 */
  message: string;
}

/** 综合验证结果 */
export interface ValidationResult {
  /** 是否全部通过 */
  isValid: boolean;
  /** 各项验证结果 */
  items: ValidationItem[];
  /** 检测到的人脸数量 */
  faceCount: number;
  /** 人脸置信度分数（0-1） */
  faceScore: number;
}

/** 验证规则配置 */
export interface ValidationRuleConfig {
  /** 是否启用边框检测 */
  checkBounds?: boolean;
  /** 是否启用帽子检测 */
  checkHat?: boolean;
  /** 是否启用眼镜检测 */
  checkGlasses?: boolean;
  /** 是否启用面部遮挡检测 */
  checkOcclusion?: boolean;
  /** 是否启用面部朝向检测（要求正面） */
  checkOrientation?: boolean;
}

/** 边框区域配置（相对于容器的比例，0-1） */
export interface BoundsConfig {
  /** 距左边界比例 */
  left: number;
  /** 距顶部边界比例 */
  top: number;
  /** 宽度比例 */
  width: number;
  /** 高度比例 */
  height: number;
}

/** 检测阈值配置 */
export interface ThresholdConfig {
  /** 面部检测最小置信度（默认 0.5） */
  minFaceScore?: number;
  /** 面部边框重叠度阈值——面部在边框内的最小比例（默认 0.7） */
  minBoundsOverlap?: number;
  /** 帽子检测阈值——额头上方像素占 face box 高度比例（默认 0.15） */
  hatHeadRatio?: number;
  /** 眼镜检测阈值——眼部关键点 z 轴偏移阈值（默认 0.02） */
  glassesZThreshold?: number;
  /** 面部遮挡检测阈值——mesh score 最低值（默认 0.8） */
  minMeshScore?: number;
  /** 偏转角阈值（度）——超过此值认为不正面（默认 15） */
  maxYawAngle?: number;
  /** 俯仰角阈值（度）——超过此值认为不正面（默认 15） */
  maxPitchAngle?: number;
}

/** 摄像头配置 */
export interface CameraConfig {
  /** 优先使用前置/后置摄像头（默认 "user"） */
  facingMode?: "user" | "environment";
  /** 视频宽度（默认 640） */
  width?: number;
  /** 视频高度（默认 480） */
  height?: number;
}

/** 提示文案配置 */
export interface MessageConfig {
  /** 未检测到人脸 */
  noFace?: string;
  /** 检测到多张人脸 */
  multipleFaces?: string;
  /** 面部偏离边框 */
  outOfBounds?: string;
  /** 疑似戴帽子 */
  hatDetected?: string;
  /** 疑似戴眼镜 */
  glassesDetected?: string;
  /** 面部有遮挡 */
  occlusionDetected?: string;
  /** 面部未正对镜头 */
  notFacing?: string;
  /** 全部通过 */
  allPassed?: string;
  /** 正在加载模型 */
  loading?: string;
  /** 摄像头权限被拒绝 */
  cameraPermissionDenied?: string;
}

/** IdPhotoChecker 组件属性 */
export interface IdPhotoCheckerProps {
  /** 自定义类名 */
  className?: string;
  /** 容器宽度（默认 400） */
  width?: number;
  /** 容器高度（默认 500） */
  height?: number;
  /** 验证规则配置 */
  rules?: ValidationRuleConfig;
  /** 边框区域配置 */
  bounds?: BoundsConfig;
  /** 检测阈值配置 */
  thresholds?: ThresholdConfig;
  /** 摄像头配置 */
  camera?: CameraConfig;
  /** 提示文案配置 */
  messages?: MessageConfig;
  /** @vladmandic/human 模型文件基础路径（默认 CDN） */
  modelBasePath?: string;
  /** 检测间隔毫秒数（默认 200） */
  detectInterval?: number;
  /** 是否显示调试信息 */
  debug?: boolean;
  /** 是否自动开启摄像头（默认 true） */
  autoStart?: boolean;
  /** 边框颜色——通过时 */
  guideBorderPassColor?: string;
  /** 边框颜色——不通过时 */
  guideBorderFailColor?: string;
  guideShape?: "bust" | ReactNode;
  /** 自定义加载态组件 */
  loadingComponent?: ReactNode;
  /**
   * 当前值（base64 图片字符串），用于 antd Form 受控模式。
   * 当传入 value 时组件进入受控模式，拍照结果由外部 onChange 管理。
   */
  value?: string;
  /**
   * 值变化回调，用于 antd Form 受控模式。
   * 拍照成功时触发，参数为 base64 图片字符串；清除时触发，参数为 undefined。
   */
  onChange?: (value: string | undefined) => void;
  /** 验证结果变化回调 */
  onValidationChange?: (result: ValidationResult) => void;
  /** 拍照回调——用户主动拍照时触发，返回 base64 图片 */
  onCapture?: (imageData: string, result: ValidationResult) => void;
  /** 准备就绪回调——模型加载完毕 */
  onReady?: () => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /**
   * 自定义错误展示组件。
   * - 传入 ReactNode 时直接渲染；
   * - 传入函数时以 Error 对象为参数调用并渲染返回值；
   * - 不传则使用默认样式。
   */
  errorComponent?: ReactNode | ((error: Error) => ReactNode);
}

/** hook 返回值 */
export interface UseIdPhotoCheckerReturn {
  /** 视频元素引用 */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** canvas 元素引用（调试叠加用） */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** 当前验证结果 */
  validation: ValidationResult;
  /** 模型是否加载中 */
  isLoading: boolean;
  /** 模型加载进度（0-100） */
  loadingProgress: number;
  /** 摄像头是否就绪 */
  isCameraReady: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 手动开始检测 */
  start: () => Promise<void>;
  /** 手动停止检测 */
  stop: () => void;
  /** 拍照（返回 base64 图片） */
  capture: () => string | null;
  /** 对静态图片执行一次检测，返回验证结果 */
  validateImage: (image: ValidatableImage) => Promise<ValidationResult>;
}

/** validateIdPhoto 的输入图片类型 */
export type ValidatableImage =
  | File
  | Blob
  | HTMLImageElement
  | HTMLCanvasElement
  | ImageData
  | string;
