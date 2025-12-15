import { Image as TiptapImage } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageNode as ImageNodeComponent } from "./image-node";

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
