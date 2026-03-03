import type {
  HtmlWatermarkElement,
  HtmlWatermarkLayout,
  HtmlWatermarkStyle,
} from "../types";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();

const toAbsoluteNumber = (
  value: number | undefined,
  fallback = 0,
): number => value ?? fallback;

const withTextAlign = (align: HtmlWatermarkStyle["textAlign"]) => {
  if (align === "center") return "center" as const;
  if (align === "right") return "right" as const;
  return "left" as const;
};

const parseBorderLeft = (
  borderLeft: string | undefined,
): Pick<HtmlWatermarkStyle, "borderLeftWidth" | "borderLeftColor"> => {
  if (!borderLeft) return {};
  const parts = borderLeft
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);
  const widthPart = parts.find((part) => part.endsWith("px"));
  const borderLeftWidth = widthPart ? parseFloat(widthPart) : undefined;
  const borderLeftColor =
    parts.find((part) => part.startsWith("#")) || parts[parts.length - 1];
  return { borderLeftWidth, borderLeftColor };
};

const normalizeStyle = (
  style: Record<string, unknown> | undefined,
): HtmlWatermarkStyle => {
  if (!style) return {};
  const borderFromString =
    typeof style.borderLeft === "string"
      ? parseBorderLeft(style.borderLeft)
      : {};

  return {
    left: typeof style.left === "number" ? style.left : undefined,
    top: typeof style.top === "number" ? style.top : undefined,
    width: typeof style.width === "number" ? style.width : undefined,
    height: typeof style.height === "number" ? style.height : undefined,
    color: typeof style.color === "string" ? style.color : undefined,
    backgroundColor:
      typeof style.backgroundColor === "string"
        ? style.backgroundColor
        : undefined,
    fontSize: typeof style.fontSize === "number" ? style.fontSize : undefined,
    fontWeight:
      typeof style.fontWeight === "number" ? style.fontWeight : undefined,
    fontFamily:
      typeof style.fontFamily === "string" ? style.fontFamily : undefined,
    textAlign:
      style.textAlign === "left" ||
      style.textAlign === "center" ||
      style.textAlign === "right"
        ? style.textAlign
        : undefined,
    lineHeight:
      typeof style.lineHeight === "number" ? style.lineHeight : undefined,
    borderLeftWidth:
      typeof style.borderLeftWidth === "number"
        ? style.borderLeftWidth
        : borderFromString.borderLeftWidth,
    borderLeftColor:
      typeof style.borderLeftColor === "string"
        ? style.borderLeftColor
        : borderFromString.borderLeftColor,
  };
};

const readTextChild = (children: ReactNode): string | undefined => {
  const chunks: string[] = [];
  Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      chunks.push(String(child));
    }
  });
  const text = chunks.join("").trim();
  return text || undefined;
};

const reactNodeToElement = (node: ReactNode): HtmlWatermarkElement | null => {
  if (!isValidElement(node)) {
    return null;
  }

  if (typeof node.type !== "string") {
    return null;
  }

  if (node.type !== "div" && node.type !== "span" && node.type !== "img") {
    return null;
  }

  const props = node.props as {
    style?: Record<string, unknown>;
    children?: ReactNode;
    src?: string;
  };

  const children = Children.toArray(props.children)
    .map((child) => reactNodeToElement(child))
    .filter((child): child is HtmlWatermarkElement => child !== null);

  return {
    tag: node.type,
    style: normalizeStyle(props.style),
    text: readTextChild(props.children),
    src: node.type === "img" ? props.src : undefined,
    children,
  };
};

export const jsxElementToLayout = ({
  root,
  width,
  height,
  backgroundColor,
}: {
  root: ReactElement;
  width: number;
  height: number;
  backgroundColor?: string;
}): HtmlWatermarkLayout => {
  const rootProps = root.props as {
    children?: ReactNode;
    style?: Record<string, unknown>;
  };

  const resolvedBg =
    backgroundColor ||
    (typeof rootProps.style?.backgroundColor === "string"
      ? rootProps.style.backgroundColor
      : undefined);

  const elements = Children.toArray(rootProps.children)
    .map((child) => reactNodeToElement(child))
    .filter((child): child is HtmlWatermarkElement => child !== null);

  return {
    width,
    height,
    backgroundColor: resolvedBg,
    elements,
  };
};

const loadImage = (src: string) => {
  if (imageCache.has(src)) {
    return imageCache.get(src)!;
  }
  const task = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  imageCache.set(src, task);
  return task;
};

const drawElement = async (
  ctx: CanvasRenderingContext2D,
  element: HtmlWatermarkElement,
  offsetX = 0,
  offsetY = 0,
): Promise<void> => {
  const style = element.style || {};
  const left = offsetX + toAbsoluteNumber(style.left);
  const top = offsetY + toAbsoluteNumber(style.top);
  const width = toAbsoluteNumber(style.width);
  const height = toAbsoluteNumber(style.height);

  if (style.backgroundColor && width > 0 && height > 0) {
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(left, top, width, height);
  }

  if (style.borderLeftWidth && style.borderLeftWidth > 0) {
    const borderHeight = height > 0 ? height : 0;
    if (borderHeight > 0) {
      ctx.strokeStyle = style.borderLeftColor || "#ddd";
      ctx.lineWidth = style.borderLeftWidth;
      ctx.beginPath();
      ctx.moveTo(left + style.borderLeftWidth / 2, top);
      ctx.lineTo(left + style.borderLeftWidth / 2, top + borderHeight);
      ctx.stroke();
    }
  }

  if ((element.tag === "div" || element.tag === "span") && element.text) {
    const fontSize = style.fontSize ?? 14;
    const fontWeight = style.fontWeight ?? 400;
    const fontFamily = style.fontFamily || "system-ui";
    const textAlign = withTextAlign(style.textAlign);
    const baseX =
      textAlign === "center" ? left + width / 2 : textAlign === "right" ? left + width : left;
    const lineHeight = style.lineHeight ?? fontSize;

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = style.color || "#333";
    ctx.fillText(element.text, baseX, top + lineHeight);
  }

  if (element.tag === "img" && element.src && width > 0 && height > 0) {
    const img = await loadImage(element.src);
    if (img) {
      ctx.drawImage(img, left, top, width, height);
    }
  }

  if (element.children && element.children.length > 0) {
    for (const child of element.children) {
      await drawElement(ctx, child, left, top);
    }
  }
};

export const renderHtmlLayoutToCanvas = async (
  ctx: CanvasRenderingContext2D,
  layout: HtmlWatermarkLayout,
  offsetX = 0,
  offsetY = 0,
) => {
  if (layout.backgroundColor) {
    ctx.fillStyle = layout.backgroundColor;
    ctx.fillRect(offsetX, offsetY, layout.width, layout.height);
  }

  for (const element of layout.elements) {
    await drawElement(ctx, element, offsetX, offsetY);
  }
};
