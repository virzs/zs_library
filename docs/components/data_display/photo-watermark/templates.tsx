import React, { useState } from "react";
import { PhotoWatermark, availableTemplates } from "zs_library";
import { DEFAULT_PREVIEW_IMAGE } from "./image-options";
import PreviewImageSelector from "./preview-image-selector";

export default () => {
  const [template, setTemplate] = useState("xiaomiLeica");
  const [image, setImage] = useState(DEFAULT_PREVIEW_IMAGE);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          style={{ 
            width: 200, 
            padding: '4px 8px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          {Object.entries(availableTemplates).map(([key, tmpl]) => (
            <option key={key} value={key}>
              {(tmpl as any).name}
            </option>
          ))}
        </select>
        <PreviewImageSelector
          value={image}
          onChange={setImage}
          style={{
            marginLeft: 8,
            width: 200,
            padding: "4px 8px",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />
      </div>
      
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <PhotoWatermark
          image={image}
          template={template}
        />
      </div>
    </div>
  );
};
