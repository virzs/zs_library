import React, { useState, useEffect, useMemo } from "react";
import type {
  ExifData,
  ExifExtractResult,
  ExifParamsForm,
  WatermarkComponentProps,
} from "./types";
import CanvasRenderer from "./CanvasRenderer";
import HtmlRenderer from "./HtmlRenderer";
import { availableTemplates, type TemplateKey } from "./templates";
import { loadImage, loadFileAsImage, getBrandUrl } from "./utils";
import { extractExifData, parseExifData } from "./utils/exif";

const PhotoWatermark: React.FC<WatermarkComponentProps> = ({
  image,
  template = "xiaomiLeica",
  renderer = "canvas",
  exif,
  autoExtractExif = true,
  data = {},
  width = 800,
  height,
  className,
  loadingComponent,
  errorComponent,
  onExifExtracted,
  onRenderComplete,
}) => {
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [autoExifData, setAutoExifData] = useState<Partial<ExifParamsForm>>({});

  const currentTemplate = useMemo(
    () =>
      typeof template === "string"
        ? availableTemplates[template as TemplateKey]
        : template,
    [template],
  );

  const exifData = useMemo<Partial<ExifParamsForm>>(() => {
    if (!currentTemplate) return data;
    const merged = {
      ...currentTemplate.defaultData,
      ...autoExifData,
      ...data,
    };
    const brand = merged.brand || currentTemplate.defaultData.brand;
    const customBrandUrl =
      typeof data.brand_url === "string" && data.brand_url.trim().length > 0
        ? data.brand_url
        : undefined;
    const resolvedBrandUrl = customBrandUrl || getBrandUrl(brand);

    const result = {
      ...merged,
      brand_url: resolvedBrandUrl,
    };

    console.log(
      "[PhotoWatermark] merged watermark data:",
      JSON.stringify(result, null, 2),
    );
    return result;
  }, [autoExifData, data, currentTemplate]);

  useEffect(() => {
    const applyTemplateExif = (
      rawExif: ExifData[],
      parsedExif: Partial<ExifParamsForm>,
    ): Partial<ExifParamsForm> => {
      if (!currentTemplate?.transformExif) {
        return parsedExif;
      }
      return currentTemplate.transformExif({ rawExif, parsedExif });
    };

    const emitExifEvent = (
      rawExif: ExifData[],
      parsedExif: Partial<ExifParamsForm>,
      templateExifData: Partial<ExifParamsForm>,
    ) => {
      const payload: ExifExtractResult = {
        rawExif,
        parsedExif,
        templateExifData,
      };
      onExifExtracted?.(payload);
    };

    const readExifAsync = async () => {
      if (exif && exif.length) {
        const parsedExif = parseExifData(exif);
        const templateExifData = applyTemplateExif(exif, parsedExif);
        setAutoExifData(templateExifData);
        emitExifEvent(exif, parsedExif, templateExifData);
        return;
      }

      if (!autoExtractExif || !image) {
        setAutoExifData({});
        return;
      }

      try {
        const source =
          typeof image === "string"
            ? image
            : image instanceof File
              ? image
              : image.src;

        if (!source) {
          setAutoExifData({});
          return;
        }

        const rawExif = await extractExifData(source);
        const parsedExif = parseExifData(rawExif);
        const templateExifData = applyTemplateExif(rawExif, parsedExif);
        console.log(
          "[PhotoWatermark] EXIF raw list (component):",
          JSON.stringify(rawExif, null, 2),
          {
            sourceType:
              typeof image === "string"
                ? "url"
                : image instanceof File
                  ? "file"
                  : "html-image",
          },
        );
        console.log(
          "[PhotoWatermark] EXIF parsed for watermark (component):",
          JSON.stringify(templateExifData, null, 2),
        );
        if (
          templateExifData.brand === "unknown" ||
          templateExifData.model === "PICSEAL CAMERA"
        ) {
          console.warn(
            "[PhotoWatermark] EXIF may be missing or unmatched for this file. Parsed result is using fallback-compatible values.",
          );
        }
        setAutoExifData(templateExifData);
        emitExifEvent(rawExif, parsedExif, templateExifData);
      } catch (error) {
        console.warn("[PhotoWatermark] EXIF read failed (component):", error);
        setAutoExifData({});
      }
    };

    readExifAsync();
  }, [autoExtractExif, currentTemplate, exif, image, onExifExtracted]);

  // 处理图片加载
  useEffect(() => {
    const loadImageAsync = async () => {
      if (!image) return;

      setIsLoading(true);
      setLoadError(null);
      try {
        let img: HTMLImageElement;

        if (typeof image === "string") {
          img = await loadImage(image);
        } else if (image instanceof File) {
          img = await loadFileAsImage(image);
        } else if (image instanceof HTMLImageElement) {
          img = image;
        } else {
          throw new Error("Unsupported image type");
        }

        setCurrentImage(img);
      } catch (error) {
        console.error("Failed to load image:", error);
        setLoadError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImageAsync();
  }, [image]);

  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div className={`photo-watermark-loading ${className || ""}`}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!currentImage) {
    return errorComponent ? (
      <>{errorComponent}</>
    ) : (
      <div className={`photo-watermark-empty ${className || ""}`}>
        <div>{loadError?.message || "No image provided"}</div>
      </div>
    );
  }

  const Renderer = renderer === "html" ? HtmlRenderer : CanvasRenderer;

  return (
    <div className={`photo-watermark ${className || ""}`}>
      <Renderer
        image={currentImage}
        template={currentTemplate}
        data={exifData}
        width={width}
        height={height}
        onRenderComplete={onRenderComplete}
      />
    </div>
  );
};

export { PhotoWatermark };

// 导出组件和类型
export type {
  ExifData,
  ExifExtractResult,
  ExifParamsForm,
  TemplateConfig,
  WatermarkComponentProps,
  WatermarkComponentProps as PhotoWatermarkProps,
} from "./types";
export { availableTemplates, type TemplateKey } from "./templates";
export { extractExifData, parseExifData } from "./utils/exif";
export { formatXiaomiLeicaExifData } from "./templates";
export { default as HtmlRenderer } from "./HtmlRenderer";

export default PhotoWatermark;
