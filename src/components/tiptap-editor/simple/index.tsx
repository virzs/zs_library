import "./styles/_variables.scss";
import "./styles/_keyframe-animations.scss";

/**
 * Simple Tiptap Editor
 *
 * A pre-configured Tiptap editor component with a simple toolbar and essential extensions.
 * Includes support for:
 * - Basic text formatting (Bold, Italic, Strike, Underline, etc.)
 * - Headings (H1-H6)
 * - Lists (Bullet, Ordered, Task)
 * - Code blocks
 * - Blockquotes
 * - Links
 * - Images (Upload & Display)
 * - Text alignment
 * - Undo/Redo
 *
 * @component
 * @example
 * ```tsx
 * import SimpleEditor from "@/components/tiptap-editor/simple";
 *
 * function MyEditor() {
 *   return (
 *     <SimpleEditor />
 *   );
 * }
 * ```
 */
export { SimpleEditor as default, SimpleEditor } from "./simple-editor";
