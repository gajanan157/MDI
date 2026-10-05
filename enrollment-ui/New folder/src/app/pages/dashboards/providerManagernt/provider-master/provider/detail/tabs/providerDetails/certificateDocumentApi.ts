import {
  getPresignDownloadList,
  parsePresignListResponse,
} from "@/services/presignFilesApi";
import { showProviderError } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { sanitizeApiErrorMessage } from "@/utils/sanitizeApiErrorMessage";

const CERTIFICATE_DOCUMENT_S3_BUCKET = "provider";

export type FetchCertificateDocumentResult =
  | { ok: true; fileName: string; presignedUrl: string }
  | { ok: false; message?: string };

function readPresignedUrl(record: Record<string, unknown>): string {
  const url = record.presignedUrl ?? record.url ?? record.downloadUrl;
  return typeof url === "string" ? url.trim() : "";
}

function readFileName(record: Record<string, unknown>): string {
  const name = record.originalFileName ?? record.fileName ?? record.name;
  if (typeof name === "string" && name.trim()) return name.trim();
  return "Certificate";
}

/** GET `/v1/files/presigned-url` for a provider certificate by `fileMetadataId`. */
export async function fetchCertificateDocumentPresign(
  fileMetadataId: string,
): Promise<FetchCertificateDocumentResult> {
  const trimmedId = fileMetadataId.trim();
  if (!trimmedId) {
    return { ok: false, message: "File metadata id is required." };
  }

  const response = await getPresignDownloadList({
    s3BucketName: CERTIFICATE_DOCUMENT_S3_BUCKET,
    fileMetadataId: trimmedId,
    page: 0,
    size: 1,
  });

  if (!response.success || response.data == null) {
    const message =
      (typeof response.error === "string" ? response.error : undefined) ??
      (typeof response.message === "string" ? response.message : undefined);
    return {
      ok: false,
      message: message ? sanitizeApiErrorMessage(message) : undefined,
    };
  }

  const parsed = parsePresignListResponse(response.data);
  const firstItem = parsed.items[0];
  if (!firstItem || typeof firstItem !== "object") {
    return { ok: false };
  }

  const record = firstItem as Record<string, unknown>;
  const presignedUrl = readPresignedUrl(record);
  if (!presignedUrl) {
    return { ok: false, message: "Download URL not available for this document." };
  }

  return {
    ok: true,
    fileName: readFileName(record),
    presignedUrl,
  };
}

export async function viewProviderCertificate(
  fileMetadataId: string | undefined | null,
  missingFileMessage: string,
): Promise<void> {
  const trimmedId = String(fileMetadataId ?? "").trim();
  if (!trimmedId) {
    showProviderError(missingFileMessage, 404);
    return;
  }

  const result = await fetchCertificateDocumentPresign(trimmedId);
  if (!result.ok) {
    showProviderError(result.message?.trim() || missingFileMessage, 404);
    return;
  }

  window.open(result.presignedUrl, "_blank", "noopener,noreferrer");
}
