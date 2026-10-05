/** Maintenance network & mapping records — excluded / watchlist bulk uploads. */
export const EXCLUDED_PROVIDER_S3_BUCKET = "provider";

/** Parent bucket for provider exclusion / watchlist list uploads. */
export const EXCLUDED_PROVIDER_S3_SUB_BUCKET = "MAINTENANCE NETWORK & MAPPING RECORDS";

export const EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION = "PROVIDER_EXCLUSION_RECORDS";
export const EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST = "PROVIDER_WATCHLIST_RECORDS";

/** Supporting document type for excluded-provider bulk upload. */
export const EXCLUDED_PROVIDER_SUPPORTING_DOCUMENT_TYPE = "SUPPLIMENTRY_DOCUMENT";

export const EXCLUDED_PROVIDER_INWARD_PRIORITY = "HIGH";
export const EXCLUDED_PROVIDER_INWARD_RECEIVED_CHANNEL = "EMAIL";

export const EXCLUDED_PROVIDER_LIST_ACCEPT =
  ".csv,.pdf,.xlsx,.xls,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const EXCLUDED_PROVIDER_LIST_EXTENSIONS = [".csv", ".pdf", ".xlsx", ".xls"] as const;

export type ExcludedProviderListingType =
  | typeof EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION
  | typeof EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST;

export function isExcludedProviderWatchlist(
  listingType: string | null | undefined,
): boolean {
  return String(listingType ?? "").trim() === EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST;
}

export function isExcludedProviderListingType(
  listingType: string | null | undefined,
): listingType is ExcludedProviderListingType {
  const value = String(listingType ?? "").trim();
  return (
    value === EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION ||
    value === EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST
  );
}

function isExcludedListFileByName(file: File): boolean {
  const name = file.name.toLowerCase();
  return EXCLUDED_PROVIDER_LIST_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function isExcludedProviderListFile(file: File): boolean {
  if (isExcludedListFileByName(file)) return true;
  const type = file.type.toLowerCase();
  return (
    type.includes("pdf") ||
    type.includes("csv") ||
    type.includes("spreadsheet") ||
    type.includes("excel")
  );
}

export const OCR_REQUIRED = "OCR_REQUIRED";
export const OCR_NOT_REQUIRED = "OCR_NOT_REQUIRED";

export type OcrRequiredValue = typeof OCR_REQUIRED | typeof OCR_NOT_REQUIRED;

function isPdfFile(file: File | null | undefined): boolean {
  if (!file) return false;
  return (
    file.type.toLowerCase() === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

/**
 * OCR is required only for exclusion/watchlist list uploads when the file is a PDF.
 */
export function resolveExcludedProviderOcrRequired(
  documentType: string | null | undefined,
  file: File | null | undefined,
): OcrRequiredValue {
  if (isExcludedProviderListingType(documentType) && isPdfFile(file)) {
    return OCR_REQUIRED;
  }
  return OCR_NOT_REQUIRED;
}
