import { Image as TiptapImage } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageNode as ImageNodeComponent } from "./image-node";

type ImageAlign = "left" | "center" | "right";

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function toCssSize(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return `${value}px`;
  const str = String(value).trim();
  return str.length ? str : null;
}

function buildImageStyle(align: ImageAlign | null, width: unknown, height: unknown) {
  const styles: string[] = ["display:block"];

  const widthCss = toCssSize(width);
  if (widthCss) styles.push(`width:${widthCss}`);

  const heightCss = toCssSize(height);
  if (heightCss) styles.push(`height:${heightCss}`);

  if (align === "left") {
    styles.push("margin-left:0", "margin-right:auto");
  } else if (align === "right") {
    styles.push("margin-left:auto", "margin-right:0");
  } else {
    styles.push("margin-left:auto", "margin-right:auto");
  }

  return styles.join(";");
}

export interface ImageNodeOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageNode: {
      /**
       * Set the image alignment
       */
      setImageAlign: (align: "left" | "center" | "right") => ReturnType;
      /**
       * Set the image width
       */
      setImageWidth: (width: string | number) => ReturnType;
    };
  }
}

export const ImageNode = TiptapImage.extend<ImageNodeOptions>({
  name: "image",

  renderMarkdown: (node: { attrs?: Record<string, unknown> } | null | undefined) => {
    const attrs = (node?.attrs || {}) as Record<string, unknown>;
    const src = typeof attrs.src === "string" ? attrs.src : "";
    if (!src) return "";

    const alt = typeof attrs.alt === "string" ? attrs.alt : "";
    const title = typeof attrs.title === "string" ? attrs.title : "";
    const width = attrs.width;
    const height = attrs.height;
    const textAlign = (attrs.textAlign as ImageAlign | undefined) ?? "center";

    const hasCustomAlign = textAlign !== "center";
    const hasCustomSize = width !== null && width !== undefined && String(width).trim() !== "";
    const hasCustomHeight = height !== null && height !== undefined && String(height).trim() !== "";

    if (!hasCustomAlign && !hasCustomSize && !hasCustomHeight) {
      const safeAlt = alt.replace(/\]/g, "\\]");
      const safeTitle = title ? ` "${title.replace(/"/g, '\\"')}"` : "";
      return `![${safeAlt}](${src}${safeTitle})`;
    }

    const parts: string[] = [`src="${escapeHtmlAttribute(src)}"`];
    if (alt) parts.push(`alt="${escapeHtmlAttribute(alt)}"`);
    if (title) parts.push(`title="${escapeHtmlAttribute(title)}"`);
    if (width !== null && width !== undefined && String(width).trim() !== "") parts.push(`width="${escapeHtmlAttribute(String(width))}"`);
    if (height !== null && height !== undefined && String(height).trim() !== "")
      parts.push(`height="${escapeHtmlAttribute(String(height))}"`);

    parts.push(`data-align="${escapeHtmlAttribute(textAlign)}"`);
    parts.push(`style="${escapeHtmlAttribute(buildImageStyle(textAlign, width, height))}"`);

    return `<img ${parts.join(" ")} />`;
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
      textAlign: {
        default: "center",
        parseHTML: (element) => element.style.textAlign || element.getAttribute("data-align"),
        renderHTML: (attributes) => {
          if (!attributes.textAlign) {
            return {};
          }
          return {
            "data-align": attributes.textAlign,
            style: `text-align: ${attributes.textAlign}`,
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeComponent);
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageAlign:
        (align) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { textAlign: align });
        },
      setImageWidth:
        (width) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { width });
        },
    };
  },
});

export default ImageNode;
