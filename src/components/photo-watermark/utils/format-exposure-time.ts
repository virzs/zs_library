export function formatExposureTime(exposureTime: string | undefined): string {
  if (!exposureTime) return "";
  const [numerator, denominator] = exposureTime
    .split("/")
    .filter(Boolean)
    .map((item) => Math.floor(Number(item)));
  return [numerator, denominator].join("/");
}
