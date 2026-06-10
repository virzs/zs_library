import { useState } from "react";

interface IconImageProps {
  src: string;
  alt?: string;
  fallbackText?: string;
  fallbackBackground?: string;
  fallbackColor?: string;
  fallbackClassName?: string;
  fallbackRadiusClassName?: string;
  imageClassName?: string;
}

const getReadableTextColor = (background: string) => {
  const rgbMatch = background.match(/rgba?\(([^)]+)\)/i);
  if (!rgbMatch) return "#1f2937";

  const [r, g, b] = rgbMatch[1]
    .split(",")
    .slice(0, 3)
    .map((part) => Number(part.trim()));

  if ([r, g, b].some((value) => Number.isNaN(value))) return "#1f2937";

  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? "#1f2937" : "#ffffff";
};

const IconImage = ({
  src,
  alt = "",
  fallbackText = "?",
  fallbackBackground = "rgba(64, 148, 229, 0.9)",
  fallbackColor,
  fallbackClassName = "zs-text-xl zs-font-bold",
  fallbackRadiusClassName = "",
  imageClassName = "zs-w-full zs-h-full zs-object-cover",
}: IconImageProps) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`zs-w-full zs-h-full zs-flex zs-items-center zs-justify-center ${fallbackRadiusClassName} ${fallbackClassName}`}
        style={{
          background: fallbackBackground,
          color: fallbackColor ?? getReadableTextColor(fallbackBackground),
        }}
      >
        {fallbackText.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      crossOrigin="anonymous"
      className={imageClassName}
      onError={() => setFailed(true)}
    />
  );
};

export default IconImage;
