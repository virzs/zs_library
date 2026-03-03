import React, { useState } from "react";
import { PhotoWatermark } from "zs_library";
import {
  DEFAULT_PREVIEW_IMAGE,
} from "./image-options";
import PreviewImageSelector from "./preview-image-selector";

export default () => {
  const [imageUrl, setImageUrl] = useState(DEFAULT_PREVIEW_IMAGE);

  const handleUpload = async (file: any) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const url = e.target?.result;
      setImageUrl(url as string);
      
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handlePreviewImageChange = (url: string) => {
    setImageUrl(url);
  };

  if (!imageUrl) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleUpload(file);
            }
          }}
          style={{
            display: 'none'
          }}
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          style={{
            display: 'inline-block',
            border: "2px dashed #d9d9d9",
            borderRadius: "8px",
            padding: "40px",
            cursor: "pointer"
          }}
        >
          <p>点击或拖拽上传图片</p>
          <p>支持自动提取EXIF信息</p>
        </label>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <PreviewImageSelector
          value={imageUrl}
          onChange={handlePreviewImageChange}
          style={{
            marginRight: 8,
            padding: "4px 8px",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleUpload(file);
            }
          }}
          style={{
            display: 'none'
          }}
          id="file-reupload"
        />
        <label
          htmlFor="file-reupload"
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#1890ff',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          重新上传图片
        </label>
      </div>
      
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <PhotoWatermark
          image={imageUrl}
          template="xiaomiLeica"
        />
      </div>
    </div>
  );
};
