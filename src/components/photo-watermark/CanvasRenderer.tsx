import React, { useEffect, useRef } from "react";
import type { CanvasRenderProps } from "./types";

const CanvasRenderer: React.FC<CanvasRenderProps> = ({
  image,
  template,
  data,
  width = 800,
  height = 600,
  onRenderComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !image || !template) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;

    const render = async () => {
      canvas.width = width;
      canvas.height = height || 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (template.render) {
        await template.render({
          canvas,
          ctx,
          image,
          data,
          width,
          height,
        });
      } else {
        const drawHeight = height || image.height;
        ctx.drawImage(image, 0, 0, width, drawHeight);
      }

      const dataUrl = canvas.toDataURL("image/png");
      if (!cancelled) onRenderComplete?.(dataUrl);
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [image, template, data, width, height, onRenderComplete]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto" }} />
    </div>
  );
};

export default CanvasRenderer;
