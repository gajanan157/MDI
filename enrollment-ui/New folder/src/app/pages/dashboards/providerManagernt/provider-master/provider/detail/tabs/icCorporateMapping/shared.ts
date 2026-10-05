export const SUPPORTING_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".eml",
] as const;

/**
 * MIME types for the same set of formats. `.eml` (message/rfc822) and `.docx`
 * are not reliably offered by the browser file picker from an extension token
 * alone on every OS, so the corresponding MIME types are listed explicitly.
 */
export const SUPPORTING_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "message/rfc822",
] as const;

export const SUPPORTING_DOCUMENT_ACCEPT = [
  ...SUPPORTING_DOCUMENT_EXTENSIONS,
  ...SUPPORTING_DOCUMENT_MIME_TYPES,
].join(",");

export const SUPPORTING_DOCUMENT_INVALID_MESSAGE =
  "Only PDF, DOCX, PNG, JPG, JPEG, and EML files are allowed.";

export const REMARK_REQUIRED_MESSAGE = "Remark is required";
export const SUPPORTING_DOCUMENT_REQUIRED_MESSAGE = "Supporting document is required";

export function isAllowedSupportingDocument(file: File): boolean {
  const fileName = file.name.toLowerCase();
  if (SUPPORTING_DOCUMENT_EXTENSIONS.some((extension) => fileName.endsWith(extension))) {
    return true;
  }
  // Fall back to the MIME type when the name carries no usable extension
  // (e.g. an .eml dragged in from a mail client that reports message/rfc822).
  const mimeType = file.type.trim().toLowerCase();
  return (
    mimeType !== "" &&
    SUPPORTING_DOCUMENT_MIME_TYPES.some((allowed) => allowed === mimeType)
  );
}

export function isRemarkFilled(remark: string | null | undefined): boolean {
  return Boolean(String(remark ?? "").trim());
}

export function hasSupportingDocumentPresent(source: {
  supportingDocument?: File | null;
  supportingFileMetadataId?: string | null;
  supportingDocumentName?: string | null;
}): boolean {
  if (source.supportingDocument) return true;
  if (String(source.supportingFileMetadataId ?? "").trim()) return true;
  if (String(source.supportingDocumentName ?? "").trim()) return true;
  return false;
}

/** Provider POST contracts expect null (not "") for optional empty fields. */
export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
