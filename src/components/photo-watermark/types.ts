import type { ReactNode } from "react";

export interface ExifData {
  tag: string;
  value: string;
  value_with_unit: string;
}

export interface ExifExtractResult {
  rawExif: ExifData[];
  parsedExif: Partial<ExifParamsForm>;
  templateExifData: Partial<ExifParamsForm>;
}

export interface ExifParamsForm {
  model: string;
  date: string;
  gps: string;
  showGps?: boolean;
  showBrandIcon?: boolean;
  device: string;
  brand: string;
  brand_url: string;
  scale: number;
  fontSize: "small" | "normal" | "large";
  fontWeight: "normal" | "bold" | "black";
  fontFamily: string;
}

export interface CanvasRenderProps {
  image: HTMLImageElement;
  template: TemplateConfig;
  data: Partial<ExifParamsForm>;
  width?: number;
  height?: number;
  onRenderComplete?: (dataUrl: string) => void;
}

export interface TemplateRenderParams {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  image: HTMLImageElement;
  data: Partial<ExifParamsForm>;
  width: number;
  height?: number;
}

export interface HtmlRenderParams {
  image: HTMLImageElement;
  data: Partial<ExifParamsForm>;
  width: number;
  height?: number;
}

export interface HtmlWatermarkStyle {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  borderLeftWidth?: number;
  borderLeftColor?: string;
}

export interface HtmlWatermarkElement {
  tag: "div" | "span" | "img";
  style?: HtmlWatermarkStyle;
  text?: string;
  src?: string;
  children?: HtmlWatermarkElement[];
}

export interface HtmlWatermarkLayout {
  width: number;
  height: number;
  backgroundColor?: string;
  elements: HtmlWatermarkElement[];
}

export interface TemplateConfig {
  name: string;
  description: string;
  style: {
    scale: number;
    fontSize: "small" | "normal" | "large";
    fontWeight: "normal" | "bold" | "black";
    fontFamily: string;
  };
  layout: {
    padding: number;
    bannerHeight: number;
    margin: number;
    titleSize: number;
    textSize: number;
    splitBorder: string;
    textColor: string;
    subtextColor: string;
  };
  fonts: {
    [key: string]: string;
  };
  defaultData: {
    model: string;
    date: string;
    gps: string;
    device: string;
    brand: string;
    brand_url?: string;
  };
  transformExif?: (params: {
    rawExif: ExifData[];
    parsedExif: Partial<ExifParamsForm>;
  }) => Partial<ExifParamsForm>;
  render?: (params: TemplateRenderParams) => void | Promise<void>;
  renderHtml?: (params: HtmlRenderParams) => ReactNode;
}

export interface WatermarkComponentProps {
  image?: string | HTMLImageElement | File;
  template?: string | TemplateConfig;
  renderer?: "canvas" | "html";
  exif?: ExifData[];
  autoExtractExif?: boolean;
  data?: Partial<ExifParamsForm>;
  width?: number;
  height?: number;
  className?: string;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  onExifExtracted?: (result: ExifExtractResult) => void;
  onRenderComplete?: (dataUrl: string) => void;
}
