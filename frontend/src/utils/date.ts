// Date formatting utilities

export type DateFormat = "long" | "short";

export interface DateFormatOptions {
  format?: DateFormat;
  includeTime?: boolean;
  locale?: string;
}

/**
 * Format a date string into a human-readable format
 * @param dateString - ISO date string or Date object
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | Date,
  options: DateFormatOptions = {}
): string => {
  const { format = "long", includeTime = true, locale = "en-US" } = options;

  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;

  // Check for invalid date
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: format === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
  };

  if (includeTime) {
    dateOptions.hour = "2-digit";
    dateOptions.minute = "2-digit";
  }

  return date.toLocaleDateString(locale, dateOptions);
};

/**
 * Format a date for display in a compact format (e.g., "Jan 15, 2025")
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export const formatDateCompact = (dateString: string | Date): string => {
  return formatDate(dateString, { format: "short", includeTime: false });
};

/**
 * Format a date with full details (e.g., "January 15, 2025, 03:30 PM")
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export const formatDateFull = (dateString: string | Date): string => {
  return formatDate(dateString, { format: "long", includeTime: true });
};
