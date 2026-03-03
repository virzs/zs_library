import React from "react";
import type { CanvasRenderProps } from "./types";

const HtmlRenderer: React.FC<CanvasRenderProps> = ({
  image,
  template,
  data,
  width,
  height,
}) => {
  const content = template.renderHtml?.({
    image,
    data,
    width: width || 800,
    height,
  });

  return (
    <div>{content || <img src={image.src} alt="Preview" style={{ maxWidth: "100%", height: "auto", display: "block" }} />}</div>
  );
};

export default HtmlRenderer;
