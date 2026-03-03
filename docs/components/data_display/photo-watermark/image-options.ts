export const PREVIEW_IMAGES = [
  "apple",
  "canon",
  "dji",
  "fujifilm",
  "huawei",
  "insta360",
  "leica",
  "nikon",
  "olympus",
  "panasonic",
  "ricoh",
  "sony",
  "xiaomi",
] as const;

export const DEFAULT_PREVIEW_IMAGE =
  "/photo-watermark/exhibition/xiaomi.jpg";

export const getPreviewImageUrl = (name: (typeof PREVIEW_IMAGES)[number]) =>
  `/photo-watermark/exhibition/${name}.jpg`;
