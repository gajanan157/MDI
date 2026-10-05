export const DOCUMENT_UPLOAD_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,image/*,application/pdf";

export const DOCUMENTS_AUDIT_TAB_ID = "hospital-document" as const;

export const DOCUMENT_STATUS_COLOR_CLASS: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Blacklisted: "bg-red-100 text-red-800",
  Inactive: "bg-gray-100 text-gray-800",
  Empaneled: "bg-blue-100 text-blue-800",
  "De-paneled": "bg-red-100 text-red-800",
  "Cashless on hold": "bg-amber-100 text-amber-800",
  "Cashless On Hold": "bg-amber-100 text-amber-800",
};

export function formatOptionalDocumentDate(value: string | undefined): string {
  return value && value !== "-" ? value : "";
}

export function toDocumentDisplayDate(value: string): string {
  return value.trim() || "-";
}
