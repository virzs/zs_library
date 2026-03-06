import type { ExifData, ExifParamsForm } from "../types";
import {
  formatBrand,
  formatGPS,
  formatExposureTime,
  formatDateTimeOriginal,
  formatModel,
} from "./index";
import { parseImageExif } from "../wasm/index";

export async function extractExifData(
  imageSource: string | File,
): Promise<ExifData[]> {
  try {
    return await parseImageExif(imageSource);
  } catch (error) {
    console.warn("Failed to extract EXIF data, return empty list:", error);
    return [];
  }
}

export function parseExifData(data: ExifData[]): Partial<ExifParamsForm> {
  if (!data.length) {
    return {};
  }

  const exifValues = new Map(data.map((item) => [item.tag, item.value]));
  const exifValuesWithUnit = new Map(
    data.map((item) => [item.tag, item.value_with_unit]),
  );
  const make: string = (exifValues.get("Make") || "").replace(/[",]/g, "");
  const brand: string = formatBrand(make || "unknown");

  const exif = {
    GPSLatitude: "",
    GPSLatitudeRef: "",
    GPSLongitude: "",
    GPSLongitudeRef: "",
    FocalLengthIn35mmFilm: "",
    FocalLength: "",
    FNumber: "",
    ExposureTime: "",
    PhotographicSensitivity: "",
    Model: "",
    Make: "",
    DateTimeOriginal: "",
  };

  exif.Make = make;
  exif.Model = `${formatModel(exifValues.get("Model") || "", brand)}`;
  exif.GPSLatitude = exifValues.get("GPSLatitude") || "";
  exif.GPSLatitudeRef = exifValues.get("GPSLatitudeRef") || "";
  exif.GPSLongitude = exifValues.get("GPSLongitude") || "";
  exif.GPSLongitudeRef = exifValues.get("GPSLongitudeRef") || "";
  exif.FocalLengthIn35mmFilm =
    exifValuesWithUnit.get("FocalLengthIn35mmFilm") || "";
  exif.FocalLength = exifValuesWithUnit.get("FocalLength") || "";
  exif.FNumber = exifValuesWithUnit.get("FNumber") || "";
  exif.ExposureTime = exifValues.get("ExposureTime") || "";
  exif.PhotographicSensitivity =
    exifValues.get("PhotographicSensitivity") || "";
  exif.DateTimeOriginal = exifValues.get("DateTimeOriginal") || "";

  const gps = [
    formatGPS(exif.GPSLatitude, exif.GPSLatitudeRef),
    formatGPS(exif.GPSLongitude, exif.GPSLongitudeRef),
  ]
    .filter(Boolean)
    .join(" ");
  const device = [
    `${(exif.FocalLengthIn35mmFilm || exif.FocalLength).replace(/\s+/g, "")}`,
    exif.FNumber?.split("/")
      ?.map((n, i) => (i ? (+n).toFixed(1) : n))
      .join("/"),
    exif.ExposureTime ? `${formatExposureTime(exif.ExposureTime)}s` : "",
    exif.PhotographicSensitivity ? `ISO${exif.PhotographicSensitivity}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    model: exif.Model || "PICSEAL",
    date: `${formatDateTimeOriginal(exif.DateTimeOriginal)}`,
    gps,
    device,
    brand,
  };
}
