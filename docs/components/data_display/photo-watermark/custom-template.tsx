import React, { useState } from "react";
import { PhotoWatermark } from "zs_library";
import { DEFAULT_PREVIEW_IMAGE } from "./image-options";
import PreviewImageSelector from "./preview-image-selector";

export default () => {
  const [image, setImage] = useState(DEFAULT_PREVIEW_IMAGE);

  const customTemplate = {
    name: "Minimal Style",
    description: "极简风格水印",
    style: {
      scale: 0.7,
      fontSize: "small",
      fontWeight: "normal",
      fontFamily: "default"
    },
    layout: {
      padding: 16,
      bannerHeight: 32,
      margin: 4,
      titleSize: 14,
      textSize: 10,
      splitBorder: "1px solid #f0f0f0",
      textColor: "#666",
      subtextColor: "#999"
    },
    fonts: {
      default: "system-ui, Arial, sans-serif",
      helvetica: "\"Helvetica Neue\", Arial, sans-serif"
    },
    defaultData: {
      model: "CUSTOM CAMERA",
      date: "2024.02.28 14:30",
      gps: "39°54'26\"N 116°23'44\"E",
      device: "50mm f/1.8 1/250s ISO200",
      brand: "custom"
    }
  } as const;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <PreviewImageSelector value={image} onChange={setImage} />
      </div>
      <PhotoWatermark
        image={image}
        template={customTemplate}
      />
    </div>
  );
};
