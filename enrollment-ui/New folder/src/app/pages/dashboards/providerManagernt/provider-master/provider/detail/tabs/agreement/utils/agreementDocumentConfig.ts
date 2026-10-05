/** S3 bucket for provider agreement documents (scan upload API). */
export const AGREEMENT_DOCUMENT_S3_BUCKET = "provider";

/** Agreement document upload: same scan API params as supporting doc, different sub-bucket. */
export const AGREEMENT_DOCUMENT_S3_SUB_BUCKET = "AGREEMENT";

/** Supporting document upload: `v1/scan/files/upload?s3SubBucketName=SUPPLIMENTRY_DOCUMENT&entityType=PROVIDER`. */
export const AGREEMENT_SUPPORTING_DOCUMENT_S3_SUB_BUCKET = "SUPPLIMENTRY_DOCUMENT";

export const AGREEMENT_DOCUMENT_ENTITY_TYPE = "PROVIDER";

export const AGREEMENT_DOCUMENT_ACCEPT = ".pdf,application/pdf";

export const AGREEMENT_DOCUMENT_INVALID_TYPE_MESSAGE =
  "Only PDF files allowed.";

export function isAgreementPdfFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return true;
  return file.type.toLowerCase() === "application/pdf";
}

export const SUPPORTING_DOCUMENT_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.eml,application/pdf,image/png,image/jpeg,message/rfc822";

export const SUPPORTING_DOCUMENT_INVALID_TYPE_MESSAGE =
  "Only PDF, DOCX, PNG, JPG, JPEG, and EML files are allowed.";

const SUPPORTING_DOCUMENT_EXTENSIONS = new Set(["pdf", "png", "jpg", "jpeg", "eml"]);

const SUPPORTING_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "message/rfc822",
]);

export function isAgreementSupportingDocumentFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (SUPPORTING_DOCUMENT_EXTENSIONS.has(ext)) return true;
  const type = file.type.toLowerCase();
  return type !== "" && SUPPORTING_DOCUMENT_MIME_TYPES.has(type);
}
