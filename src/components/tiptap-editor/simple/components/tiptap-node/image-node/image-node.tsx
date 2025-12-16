"use client";

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RiAlignLeft, RiAlignCenter, RiAlignRight } from "@remixicon/react";
import { Button } from "../../tiptap-ui-primitive/button";
import "./image-node.scss";

export const ImageNode: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, selected } = props;
  const { src, alt, title, width, textAlign } = node.attrs;

  const [isResizing, setIsResizing] = useState(false);
  const [resizeWidth, setResizeWidth] = useState<string | number | null>(width);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const latestResizeWidthRef = useRef<string | number | null>(width);
  const isResizingRef = useRef(false);

  useEffect(() => {
    setResizeWidth(width);
    latestResizeWidthRef.current = width;
  }, [width]);

  const selectImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const { editor, getPos } = props;
      const pos = getPos();
      if (typeof pos === "number") {
        editor.commands.setNodeSelection(pos);
      }
    },
    [props]
  );

  const handleWrapperClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      // If we clicked the toolbar or resize handle, ignore
      if (
        target.closest(".tiptap-image-toolbar") ||
        target.closest(".tiptap-image-resize-handle") ||
        isResizingRef.current
      ) {
        return;
      }

      // If we clicked the image itself, selectImage should have handled it (and stopped prop)
      // So if we are here, we clicked the "blank" area of the wrapper
      const { editor, getPos } = props;
      const pos = getPos();

      if (typeof pos === "number") {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const isLeft = e.clientX < rect.left + rect.width / 2;
          const newPos = isLeft ? pos : pos + props.node.nodeSize;
          editor.commands.setTextSelection(newPos);
        }
      }
    },
    [props]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      isResizingRef.current = true;

      const startX = e.clientX;
      const startWidth = imageRef.current?.offsetWidth || 0;
      const containerWidth = containerRef.current?.parentElement?.offsetWidth || 0;

      const onMouseMove = (e: MouseEvent) => {
        if (!containerWidth) return;

        const diff = e.clientX - startX;
        const newWidth = startWidth + diff;

        // Convert to percentage for responsiveness
        // Or keep pixel values if preferred. Let's try pixel first if width was pixel, or % if it was %.
        // For simplicity, let's stick to pixels for now or percentage logic.
        // Tiptap usually stores attributes as strings or numbers.

        // Let's constrain it
        const newWidthPercent = Math.min(Math.max((newWidth / containerWidth) * 100, 10), 100);

        const newWidthStr = `${newWidthPercent.toFixed(0)}%`;
        setResizeWidth(newWidthStr);
        latestResizeWidthRef.current = newWidthStr;
      };

      const onMouseUp = () => {
        setIsResizing(false);
        if (latestResizeWidthRef.current) {
          updateAttributes({ width: latestResizeWidthRef.current });
        }

        // Delay resetting isResizingRef to prevent click event from triggering selection change
        setTimeout(() => {
          isResizingRef.current = false;
        }, 100);

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes]
  );

  const alignStyles: Record<string, React.CSSProperties> = {
    left: { marginLeft: 0, marginRight: "auto" },
    center: { marginLeft: "auto", marginRight: "auto" },
    right: { marginLeft: "auto", marginRight: 0 },
  };

  const currentAlignStyle = alignStyles[textAlign] || alignStyles.center;

  return (
    <NodeViewWrapper
      className={`tiptap-image-view ${selected ? "is-selected" : ""}`}
      style={{
        textAlign: textAlign,
        // We use flex to align the container itself if needed, or just block with margins
        display: "flex",
        justifyContent: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
      }}
      ref={containerRef}
      onClick={handleWrapperClick}
    >
      <div
        className="tiptap-image-container"
        style={{
          width: resizeWidth || "100%",
          position: "relative",
          transition: isResizing ? "none" : "width 0.2s ease",
          ...currentAlignStyle,
        }}
      >
        <img ref={imageRef} src={src} alt={alt} title={title} className="tiptap-image" onClick={selectImage} />

        {selected && (
          <>
            <div className="tiptap-image-toolbar">
              <Button
                type="button"
                data-style="ghost"
                data-size="small"
                data-active-state={textAlign === "left" ? "on" : "off"}
                onClick={() => updateAttributes({ textAlign: "left" })}
              >
                <RiAlignLeft className="tiptap-button-icon" />
              </Button>
              <Button
                type="button"
                data-style="ghost"
                data-size="small"
                data-active-state={textAlign === "center" ? "on" : "off"}
                onClick={() => updateAttributes({ textAlign: "center" })}
              >
                <RiAlignCenter className="tiptap-button-icon" />
              </Button>
              <Button
                type="button"
                data-style="ghost"
                data-size="small"
                data-active-state={textAlign === "right" ? "on" : "off"}
                onClick={() => updateAttributes({ textAlign: "right" })}
              >
                <RiAlignRight className="tiptap-button-icon" />
              </Button>
            </div>

            <div className="tiptap-image-resize-handle" onMouseDown={handleMouseDown} />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};
