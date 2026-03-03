export function formatGPS(
  gps: string | undefined,
  gpsRef: string | undefined,
): string {
  if (!gps) return "";
  const matches = gps.match(/(\d+\.?\d*)|([NSWE]$)/gim);
  if (!matches || matches.length < 3) return "";
  const [degrees, minutes, seconds, dir] = matches.map((item) =>
    !Number.isNaN(Number(item)) ? `${~~item}`.padStart(2, "0") : item,
  );
  if (gpsRef) return `${degrees}°${minutes}'${seconds}"${gpsRef}`;
  if (dir) return `${degrees}°${minutes}'${seconds}"${dir}`;
  return `${degrees}°${minutes}'${seconds}"`;
}
