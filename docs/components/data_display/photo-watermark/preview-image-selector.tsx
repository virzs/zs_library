import React from "react";
import { getPreviewImageUrl, PREVIEW_IMAGES } from "./image-options";

interface PreviewImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  style?: React.CSSProperties;
}

export default function PreviewImageSelector({
  value,
  onChange,
  style,
}: PreviewImageSelectorProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={style}>
      {PREVIEW_IMAGES.map((name) => (
        <option key={name} value={getPreviewImageUrl(name)}>
          {name}
        </option>
      ))}
    </select>
  );
}
