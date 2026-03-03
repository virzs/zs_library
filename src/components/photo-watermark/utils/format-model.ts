export function formatModel(model: string, brand: string): string {
  const cameraModel = model.replace(/[",]/g, "");
  if (brand === "sony") {
    return cameraModel
      .replace(/[",]/g, "")
      .replace("ILCE-", "α")
      .toLowerCase();
  }
  if (brand === "nikon corporation") {
    return cameraModel.replace(/Z/gi, "ℤ");
  }
  if (brand === "panasonic") {
    if (cameraModel.startsWith("DMC-") || cameraModel.startsWith("DC-")) {
      return `LUMIX ${cameraModel}`;
    }
  }
  return cameraModel;
}
