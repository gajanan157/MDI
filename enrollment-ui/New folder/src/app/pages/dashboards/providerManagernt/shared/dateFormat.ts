import { format } from "date-fns";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Shared picker format — matches enrolment `DateInput` (`05 Feb 2024`). */
export const PROVIDER_DATE_PICKER_FORMAT = "dd MMM yyyy";

/** Inward grid datetime — matches Corporate Inward (`22 Jul 2026 06:33 PM`). */
export const INWARD_DATE_TIME_DISPLAY_FORMAT = "dd MMM yyyy hh:mm a";

/** Compact grid/toolbar format (`21/Jul/2026`). */
export const PROVIDER_DATE_PICKER_COMPACT_FORMAT = "dd/MMM/yyyy";

function asValidDate(date: Date): Date | null {
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthIndexFromAbbrev(abbrev: string): number {
  return MONTHS.findIndex((month) => month.toLowerCase() === abbrev.toLowerCase());
}

function parseIsoDateOnly(trimmed: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return asValidDate(new Date(`${trimmed}T00:00:00`));
}

function parseDayMonthAbbrevYear(trimmed: string, pattern: RegExp): Date | null {
  const match = pattern.exec(trimmed);
  if (!match) return null;
  const monthIndex = monthIndexFromAbbrev(match[2]);
  if (monthIndex < 0) return null;
  return asValidDate(new Date(Number(match[3]), monthIndex, Number(match[1])));
}

function parseDayMonthYearNumeric(trimmed: string): Date | null {
  const match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(trimmed);
  if (!match) return null;
  return asValidDate(new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])));
}

function parseNativeDate(trimmed: string): Date | null {
  return asValidDate(new Date(trimmed));
}

export function formatToDDMMMYYYY(input?: string): string {
  if (!input) return "—";

  const parsed = parseProviderDate(input);
  if (!parsed) {
    return String(input).trim() || "—";
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = MONTHS[parsed.getMonth()];
  const year = parsed.getFullYear();

  return `${day} ${month} ${year}`;
}

/** Compact display matching `PROVIDER_DATE_PICKER_COMPACT_FORMAT` (`20/Jul/2026`). */
export function formatToCompactDDMMMYYYY(input?: string): string {
  if (!input) return "—";

  const parsed = parseProviderDate(input);
  if (!parsed) {
    return String(input).trim() || "—";
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = MONTHS[parsed.getMonth()];
  const year = parsed.getFullYear();

  return `${day}/${month}/${year}`;
}

/** Parse common API/UI date strings into a local Date. */
export function parseProviderDate(input?: string | null): Date | null {
  if (input == null) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;

  return (
    parseIsoDateOnly(trimmed) ??
    parseDayMonthAbbrevYear(trimmed, /^(\d{1,2})[/-]([A-Za-z]{3})[/-](\d{4})$/) ??
    parseDayMonthYearNumeric(trimmed) ??
    parseDayMonthAbbrevYear(trimmed, /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/) ??
    parseNativeDate(trimmed)
  );
}

/** Store form/API values as `yyyy-MM-dd`. */
export function toProviderDateStorageValue(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalCalendarDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Shift a stored/display date by `days` and return `yyyy-MM-dd`, or `""` if unparsable. */
export function shiftProviderDate(
  input: string | undefined | null,
  days: number,
): string {
  const parsed = parseProviderDate(input);
  if (!parsed) return "";
  const next = toLocalCalendarDay(parsed);
  next.setDate(next.getDate() + days);
  return toProviderDateStorageValue(next);
}

/**
 * True when either date is empty/unparsable, or `from` is strictly before `to`
 * (calendar day).
 */
export function isProviderDateStrictlyBefore(
  from: string | undefined | null,
  to: string | undefined | null,
): boolean {
  const fromDate = parseProviderDate(from);
  const toDate = parseProviderDate(to);
  if (!fromDate || !toDate) return true;
  return toLocalCalendarDay(fromDate).getTime() < toLocalCalendarDay(toDate).getTime();
}

/** Date+time display aligned with Corporate Inward grid (`22 Jul 2026 06:33 PM`). */
export function formatInwardDateTimeDisplay(input?: string | null): string {
  if (input == null) return "—";
  const trimmed = String(input).trim();
  if (!trimmed) return "—";

  const parsed = parseProviderDate(trimmed);
  const date = parsed ?? asValidDate(new Date(trimmed));
  if (!date) return trimmed;

  return format(date, INWARD_DATE_TIME_DISPLAY_FORMAT);
}

/**
 * Date+time display for grids/logs — always `29 Jul 2026 11:30 AM`.
 */
export function formatProviderDateTimeDisplay(input?: string | null): string {
  return formatInwardDateTimeDisplay(input);
}

/** Alias for AG Grid columns — same as {@link formatProviderDateTimeDisplay}. */
export function formatProviderGridDateTime(input?: string | null): string {
  return formatProviderDateTimeDisplay(input);
}
