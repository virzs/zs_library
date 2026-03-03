import type {
  ExifData,
  ExifParamsForm,
  HtmlRenderParams,
  TemplateConfig,
  TemplateRenderParams,
} from "../types";
import {
  jsxElementToLayout,
  renderHtmlLayoutToCanvas,
} from "../utils/html-canvas";
import { getBrandUrl, loadImage } from "../utils";

const xiaomiLeicaBase: Omit<TemplateConfig, "render"> = {
  name: "小米徕卡风格",
  description: "小米13 Ultra徕卡风格水印",
  style: {
    scale: 0.8,
    fontSize: "normal",
    fontWeight: "bold",
    fontFamily: "misans",
  },
  layout: {
    padding: 20,
    bannerHeight: 39,
    margin: 6,
    titleSize: 18,
    textSize: 12,
    splitBorder: "2px solid #ddd",
    textColor: "#333",
    subtextColor: "#aaa",
  },
  fonts: {
    default:
      "system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    misans: '"MiSans", system-ui',
  },
  defaultData: {
    model: "XIAOMI 13 ULTRA",
    date: "2024.02.28 12:00",
    gps: "41°12'47\"N 124°00'16\"W",
    device: "75mm f/1.8 1/33s ISO800",
    brand: "leica",
    brand_url: getBrandUrl("leica"),
  },
};

const parseSplitBorder = (splitBorder: string | undefined) => {
  if (!splitBorder) return { width: 2, color: "#ddd" };
  const parts = splitBorder
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);
  const widthPart = parts.find((part) => part.endsWith("px"));
  return {
    width: widthPart ? parseFloat(widthPart) : 2,
    color:
      parts.find((part) => part.startsWith("#")) ||
      parts[parts.length - 1] ||
      "#ddd",
  };
};

const resolveIconWidth = async (src: string | undefined, iconHeight: number) => {
  if (!src) return iconHeight;
  try {
    const img = await loadImage(src);
    const ratio =
      (img.naturalWidth || img.width) / (img.naturalHeight || img.height || 1);
    return ratio > 0 ? iconHeight * ratio : iconHeight;
  } catch {
    return iconHeight;
  }
};

export const formatXiaomiLeicaExifData = (
  parsedExif: Partial<ExifParamsForm>,
): Partial<ExifParamsForm> => {
  const next: Partial<ExifParamsForm> = {
    model: parsedExif.model?.trim(),
    date: parsedExif.date?.trim(),
    gps: parsedExif.gps?.trim(),
    showGps: parsedExif.showGps,
    showBrandIcon: parsedExif.showBrandIcon,
    device: parsedExif.device?.trim(),
    brand: parsedExif.brand?.trim().toLowerCase(),
  };

  if (next.model) {
    next.model = next.model.toUpperCase();
  }

  return next;
};

const transformXiaomiLeicaExif = ({
  parsedExif,
}: {
  rawExif: ExifData[];
  parsedExif: Partial<ExifParamsForm>;
}) => formatXiaomiLeicaExifData(parsedExif);

const renderXiaomiLeicaHtml = ({
  image,
  data,
  width,
}: HtmlRenderParams) => {
  const { style, layout, fonts, defaultData } = xiaomiLeicaBase;
  const fontScale =
    style.fontSize === "small" ? 0.85 : style.fontSize === "large" ? 1.15 : 1;
  const fontWeight =
    style.fontWeight === "normal" ? 400 : style.fontWeight === "bold" ? 700 : 900;
  const fontFamily = fonts[style.fontFamily] || fonts.default;

  const padding = layout.padding * style.scale;
  const margin = layout.margin * style.scale;
  const titleSize = layout.titleSize * style.scale * fontScale;
  const textSize = layout.textSize * style.scale * fontScale;
  const bannerHeight = padding * 2 + titleSize + margin + textSize;
  const imageRatio =
    (image.naturalWidth || image.width) / (image.naturalHeight || image.height || 1);
  const imgHeight = width / imageRatio;

  const showGps = data.showGps !== false;
  const showBrandIcon = data.showBrandIcon !== false;
  const modelText = data.model ?? defaultData.model;
  const dateText = data.date ?? defaultData.date;
  const deviceText = data.device ?? defaultData.device;
  const gpsText = (showGps ? (data.gps ?? defaultData.gps) : "").trim();
  const showGpsRow = showGps && gpsText.length > 0;
  const brandIconSrc =
    data.brand_url ?? defaultData.brand_url ?? getBrandUrl(data.brand || defaultData.brand);

  return (
    <div style={{ width, maxWidth: "100%" }}>
      <img
        src={image.src}
        alt="Preview"
        style={{ width: "100%", height: imgHeight, objectFit: "cover", display: "block" }}
      />
      <div
        style={{
          boxSizing: "border-box",
          height: bannerHeight,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${padding}px`,
          gap: margin * 2,
        }}
      >
        <div style={{ minWidth: 0, display: "flex", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: layout.textColor,
                fontSize: titleSize,
                fontWeight,
                fontFamily,
                lineHeight: `${titleSize}px`,
              }}
            >
              {modelText}
            </div>
            <div
              style={{
                marginTop: margin,
                color: layout.subtextColor,
                fontSize: textSize,
                fontWeight,
                fontFamily,
                lineHeight: `${textSize}px`,
              }}
            >
              {dateText}
            </div>
          </div>
          {showBrandIcon && brandIconSrc ? (
            <img
              src={brandIconSrc}
              alt="Brand"
              style={{
                height: layout.bannerHeight * style.scale,
                width: "auto",
                marginLeft: margin * 2,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          ) : null}
        </div>

        <div
          style={{
            width: 1,
            alignSelf: "stretch",
            margin: `${(bannerHeight - layout.bannerHeight * style.scale) / 2}px 0`,
            background: "#ddd",
            flexShrink: 0,
          }}
        />

        <div style={{ minWidth: 0, textAlign: "left", display: "flex", alignItems: showGpsRow ? "flex-start" : "center", height: "100%" }}>
          <div>
            <div
              style={{
                color: layout.textColor,
                fontSize: titleSize,
                fontWeight,
                fontFamily,
                lineHeight: `${titleSize}px`,
                marginTop: showGpsRow ? padding : 0,
              }}
            >
              {deviceText}
            </div>
            {showGpsRow ? (
              <div
                style={{
                  marginTop: margin,
                  color: layout.subtextColor,
                  fontSize: textSize,
                  fontWeight,
                  fontFamily,
                  lineHeight: `${textSize}px`,
                }}
              >
                {gpsText}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const renderXiaomiLeica = async ({
  canvas,
  ctx,
  image,
  data,
  width,
  height,
}: TemplateRenderParams) => {
  const { style, layout, fonts, defaultData } = xiaomiLeicaBase;
  const fontScale =
    style.fontSize === "small" ? 0.85 : style.fontSize === "large" ? 1.15 : 1;
  const fontWeight = style.fontWeight === "normal" ? 400 : style.fontWeight === "bold" ? 700 : 900;
  const fontFamily = fonts[style.fontFamily] || fonts.default;

  const padding = layout.padding * style.scale;
  const margin = layout.margin * style.scale;
  const titleSize = layout.titleSize * style.scale * fontScale;
  const textSize = layout.textSize * style.scale * fontScale;
  const bannerHeight = padding * 2 + titleSize + margin + textSize;

  const imageRatio = (image.naturalWidth || image.width) / (image.naturalHeight || image.height);
  const imgHeight = width / imageRatio;
  const outputHeight = Math.max(bannerHeight + imgHeight, height || 0);

  const showGps = data.showGps !== false;
  const showBrandIcon = data.showBrandIcon !== false;
  const modelText = data.model ?? defaultData.model;
  const dateText = data.date ?? defaultData.date;
  const deviceText = data.device ?? defaultData.device;
  const gpsRawText = showGps ? (data.gps ?? defaultData.gps) : "";
  const gpsText = gpsRawText.trim();
  const showGpsRow = showGps && gpsText.length > 0;
  const deviceTop = showGpsRow ? padding : (bannerHeight - titleSize) / 2;
  const brandIconSrc =
    data.brand_url ?? defaultData.brand_url ?? getBrandUrl(data.brand || defaultData.brand);

  ctx.font = `${fontWeight} ${titleSize}px ${fontFamily}`;
  const deviceWidth = ctx.measureText(deviceText).width;
  ctx.font = `${fontWeight} ${textSize}px ${fontFamily}`;
  const gpsWidth = ctx.measureText(gpsText).width;
  const rightBlockWidth = Math.max(deviceWidth, showGpsRow ? gpsWidth : 0);

  const { width: splitLineWidth, color: splitColor } = parseSplitBorder(layout.splitBorder);
  const splitMargin = margin * 2;
  const rightBlockX = width - padding - rightBlockWidth;
  const splitX = rightBlockX - splitMargin - splitLineWidth / 2;
  const leftStartX = padding;
  const splitHeight = layout.bannerHeight * style.scale;
  const splitTop = (bannerHeight - splitHeight) / 2;

  const iconHeight = layout.bannerHeight * style.scale;
  const iconWidth = showBrandIcon
    ? await resolveIconWidth(brandIconSrc, iconHeight)
    : iconHeight;
  const leftBlockRightX = splitX - splitMargin;
  const iconX = Math.max(leftStartX, leftBlockRightX - iconWidth);
  const iconY = (bannerHeight - iconHeight) / 2;
  const row2Top = padding + titleSize + margin;

  canvas.width = width;
  canvas.height = outputHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, width, imgHeight);

  const root = (
    <div style={{ width, height: bannerHeight, backgroundColor: "#ffffff" }}>
      <span style={{ left: leftStartX, top: padding, color: layout.textColor, fontSize: titleSize, fontWeight, fontFamily, lineHeight: titleSize }}>{modelText}</span>
      <span style={{ left: leftStartX, top: row2Top, color: layout.subtextColor, fontSize: textSize, fontWeight, fontFamily, lineHeight: textSize }}>{dateText}</span>
      <span style={{ left: rightBlockX, top: deviceTop, width: rightBlockWidth, color: layout.textColor, fontSize: titleSize, fontWeight, fontFamily, lineHeight: titleSize }}>{deviceText}</span>
      {showGpsRow ? (
        <span style={{ left: rightBlockX, top: row2Top, width: rightBlockWidth, color: layout.subtextColor, fontSize: textSize, fontWeight, fontFamily, lineHeight: textSize }}>{gpsText}</span>
      ) : null}
      <div style={{ left: splitX, top: splitTop, width: splitLineWidth, height: splitHeight, borderLeft: `${splitLineWidth}px solid ${splitColor}` }} />
      {showBrandIcon && brandIconSrc ? <img src={brandIconSrc} style={{ left: iconX, top: iconY, width: iconWidth, height: iconHeight }} /> : null}
    </div>
  );

  const watermarkLayout = jsxElementToLayout({
    root,
    width,
    height: bannerHeight,
    backgroundColor: "#ffffff",
  });

  await renderHtmlLayoutToCanvas(ctx, watermarkLayout, 0, imgHeight);
};

export const xiaomiLeica: TemplateConfig = {
  ...xiaomiLeicaBase,
  transformExif: transformXiaomiLeicaExif,
  render: renderXiaomiLeica,
  renderHtml: renderXiaomiLeicaHtml,
};
