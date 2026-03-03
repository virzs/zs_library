import React, { useEffect, useState } from "react";
import { PhotoWatermark } from "../../../../src/components/photo-watermark";
import { DEFAULT_PREVIEW_IMAGE } from "./image-options";
import PreviewImageSelector from "./preview-image-selector";
import {
  extractExifData,
  parseExifData,
} from "../../../../src/components/photo-watermark/utils/exif";
import { formatXiaomiLeicaExifData } from "../../../../src/components/photo-watermark/templates";

export default () => {
  const [renderer, setRenderer] = useState<"canvas" | "html">("canvas");
  const [renderedUrl, setRenderedUrl] = useState("");
  const [formData, setFormData] = useState({
    model: "XIAOMI 14 ULTRA",
    date: "2026.03.02 12:00",
    gps: "31°13'46\"N 121°28'36\"E",
    showGps: true,
    showBrandIcon: true,
    brand_url: "",
    device: "23mm f/1.6 1/250s ISO100",
    brand: "leica",
  });
  const [imageUrl, setImageUrl] = useState(DEFAULT_PREVIEW_IMAGE);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleGps = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, showGps: checked }));
  };

  const handleToggleBrandIcon = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, showBrandIcon: checked }));
  };

  const handleDownload = () => {
    if (!renderedUrl) return;
    const link = document.createElement("a");
    link.href = renderedUrl;
    link.download = `watermark-${Date.now()}.png`;
    link.click();
  };

  const handleFileChange = async (file: File | undefined) => {
    if (!file) {
      setImageUrl(DEFAULT_PREVIEW_IMAGE);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);

    try {
      const rawExif = await extractExifData(file);
      const parsedExif = parseExifData(rawExif);
      const formattedExif = formatXiaomiLeicaExifData(parsedExif);
      setFormData((prev) => ({ ...prev, ...formattedExif }));
    } catch (error) {
      console.warn("上传图片读取 EXIF 失败", error);
    }
  };

  const handlePreviewImageChange = async (url: string) => {
    if (imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(url);

    try {
      const rawExif = await extractExifData(url);
      const parsedExif = parseExifData(rawExif);
      const formattedExif = formatXiaomiLeicaExifData(parsedExif);
      setFormData((prev) => ({ ...prev, ...formattedExif }));
    } catch (error) {
      console.warn("切换预览图读取 EXIF 失败", error);
    }
  };

  useEffect(() => {
    return () => {
      if (imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <form
        style={{
          display: "grid",
          gap: 10,
          padding: 12,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        <label>
          渲染模式
          <select
            value={renderer}
            onChange={(e) => setRenderer(e.target.value as "canvas" | "html")}
            style={{ width: "100%" }}
          >
            <option value="canvas">canvas</option>
            <option value="html">html</option>
          </select>
        </label>
        <label>
          选择预览素材
          <PreviewImageSelector
            value={imageUrl}
            onChange={(nextUrl) => {
              handlePreviewImageChange(nextUrl);
            }}
            style={{ width: "100%" }}
          />
        </label>
        <label>
          选择照片（可选）
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            style={{ width: "100%" }}
          />
        </label>
        <label>
          相机型号
          <input
            value={formData.model}
            onChange={(e) => handleChange("model", e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        <label>
          拍摄时间
          <input
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        <label>
          拍摄参数
          <input
            value={formData.device}
            onChange={(e) => handleChange("device", e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        <label>
          显示 GPS
          <input
            type="checkbox"
            checked={formData.showGps}
            onChange={(e) => handleToggleGps(e.target.checked)}
            style={{ marginLeft: 8 }}
          />
        </label>
        <label>
          显示品牌图标
          <input
            type="checkbox"
            checked={formData.showBrandIcon}
            onChange={(e) => handleToggleBrandIcon(e.target.checked)}
            style={{ marginLeft: 8 }}
          />
        </label>
        <label>
          自定义品牌图标 URL（可选）
          <input
            value={formData.brand_url}
            onChange={(e) => handleChange("brand_url", e.target.value)}
            placeholder="https://example.com/brand.svg"
            style={{ width: "100%" }}
          />
        </label>
        <label>
          拍摄地点
          <input
            value={formData.gps}
            onChange={(e) => handleChange("gps", e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
      </form>

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!renderedUrl}
          style={{ marginBottom: 12 }}
        >
          导出当前合成图片
        </button>
        <PhotoWatermark
          image={imageUrl}
          template="xiaomiLeica"
          renderer={renderer}
          onRenderComplete={setRenderedUrl}
          data={formData}
        />
      </div>
    </div>
  );
};
