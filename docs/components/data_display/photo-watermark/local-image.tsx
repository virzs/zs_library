import React, { useState } from "react";
import { PhotoWatermark } from "zs_library";
import { DEFAULT_PREVIEW_IMAGE } from "./image-options";
import PreviewImageSelector from "./preview-image-selector";

export default () => {
  const [image, setImage] = useState(DEFAULT_PREVIEW_IMAGE);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <PreviewImageSelector value={image} onChange={setImage} />
      </div>
      <PhotoWatermark
        image={image}
        template="xiaomiLeica"
      />
    </div>
  );
};
