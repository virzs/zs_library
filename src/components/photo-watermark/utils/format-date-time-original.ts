import { format } from "date-fns";

const OUTPUT_FORMAT = "yyyy.MM.dd HH:mm";

const formatNow = () => format(new Date(), OUTPUT_FORMAT);

export function formatDateTimeOriginal(
  dateTimeOriginal: string | undefined,
): string {
  if (!dateTimeOriginal) {
    return formatNow();
  }

  const date = new Date(dateTimeOriginal);
  if (Number.isNaN(date.getTime())) {
    return formatNow();
  }

  return format(date, OUTPUT_FORMAT);
}
