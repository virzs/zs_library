import React, { useState } from "react";
import { PhotoWatermark } from "zs_library";
import { DEFAULT_PREVIEW_IMAGE } from "./image-options";
import PreviewImageSelector from "./preview-image-selector";

export default () => {
  const [image, setImage] = useState(DEFAULT_PREVIEW_IMAGE);

  const customData = {
    model: "Canon EOS R5",
    date: "2024.02.28 14:30",
    gps: "39°54'26\"N 116°23'44\"E",
    device: "85mm f/1.2 1/500s ISO100",
    brand: "canon"
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <PreviewImageSelector value={image} onChange={setImage} />
      </div>
      <PhotoWatermark
        image={image}
        template="xiaomiLeica"
        data={customData}
      />
    </div>
  );
};
