import { documentApi, postApi } from "@/app/api/apiService";
import {
  getPresignDownloadList,
  parsePresignListResponse,
} from "@/services/presignFilesApi";
import {
  extractDownloadUrlFromRegisterResponse,
  extractFileMetadataIdFromScanUpload,
  extractInwardNoFromScanUpload,
} from "@/store/features/providerRohini/providerRohiniAPI";
import {
  BANK_DOCUMENT_ENTITY_TYPE,
  BANK_DOCUMENT_OCR_REQUIRED,
  BANK_DOCUMENT_S3_BUCKET,
  BANK_DOCUMENT_S3_SUB_BUCKET,
  BANK_DOCUMENT_TYPE_CANCEL_CHEQUE,
  BANK_DOCUMENT_TYPE_PAN_CARD,
} from "./bankDocumentConfig";

export type UploadBankDocumentResult =
  | {
      ok: true;
      fileMetadataId: string;
      inwardNo?: string;
      previewUrl?: string;
      message?: string;
    }
  | { ok: false; message?: string };

function extractApiMessage(payload: unknown): string | undefined {
  if (payload == null) return undefined;
  if (typeof payload === "string") {
    const value = payload.trim();
    return value || undefined;
  }
  if (typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }
  if (typeof record.error === "string" && record.error.trim()) {
    return record.error.trim();
  }
  if (record.error && typeof record.error === "object") {
    const nestedErrorMessage = extractApiMessage(record.error);
    if (nestedErrorMessage) return nestedErrorMessage;
  }
  if (record.data && typeof record.data === "object") {
    const nestedDataMessage = extractApiMessage(record.data);
    if (nestedDataMessage) return nestedDataMessage;
  }
  return undefined;
}

async function uploadBankScanFile(
  file: File,
  providerId: string,
  documentType: string,
  inwardNo?: string,
): Promise<UploadBankDocumentResult> {
  const formData = new FormData();
  formData.append("file", file);

  const trimmedInwardNo = inwardNo?.trim() ?? "";

  const response = await postApi<unknown, FormData>(
    documentApi,
    "v1/scan/files/upload",
    formData,
    {
      params: {
        s3BucketName: BANK_DOCUMENT_S3_BUCKET,
        s3SubBucketName: BANK_DOCUMENT_S3_SUB_BUCKET,
        documentType,
        entityType: BANK_DOCUMENT_ENTITY_TYPE,
        entityId: providerId,
        ocrRequired: BANK_DOCUMENT_OCR_REQUIRED,
        // Attach to the inward created by the first bank document upload so
        // both the cancel cheque and PAN card land on a single inward.
        ...(trimmedInwardNo ? { inwardNo: trimmedInwardNo } : {}),
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        extractApiMessage(response.data),
    };
  }

  const fileMetadataId = extractFileMetadataIdFromScanUpload(response.data);
  if (!fileMetadataId) {
    return {
      ok: false,
      message: extractApiMessage(response.data),
    };
  }

  const previewUrl = extractDownloadUrlFromRegisterResponse(response.data);

  return {
    ok: true,
    fileMetadataId,
    inwardNo:
      extractInwardNoFromScanUpload(response.data) ?? (trimmedInwardNo || undefined),
    previewUrl,
    message: extractApiMessage(response.data),
  };
}

/**
 * Uploads cancel cheque via `v1/scan/files/upload` (`PROVIDER_CANCELLED_CHEQUE`).
 * Pass `inwardNo` to attach it to an inward created by an earlier bank upload.
 */
export async function uploadCancelChequeDocument(
  file: File,
  providerId: string,
  inwardNo?: string,
): Promise<UploadBankDocumentResult> {
  return uploadBankScanFile(
    file,
    providerId,
    BANK_DOCUMENT_TYPE_CANCEL_CHEQUE,
    inwardNo,
  );
}

/**
 * Uploads PAN card via `v1/scan/files/upload` (`PROVIDER_PAN_CARD`).
 * Pass `inwardNo` to attach it to an inward created by an earlier bank upload.
 */
export async function uploadPanCardDocument(
  file: File,
  providerId: string,
  inwardNo?: string,
): Promise<UploadBankDocumentResult> {
  return uploadBankScanFile(file, providerId, BANK_DOCUMENT_TYPE_PAN_CARD, inwardNo);
}

export type FetchBankDocumentResult =
  | { ok: true; fileName: string; presignedUrl: string }
  | { ok: false; message?: string };

function readPresignedUrl(record: Record<string, unknown>): string {
  const url = record.presignedUrl ?? record.url ?? record.downloadUrl;
  return typeof url === "string" ? url.trim() : "";
}

function readFileName(record: Record<string, unknown>, fallback: string): string {
  const name = record.originalFileName ?? record.fileName ?? record.name;
  if (typeof name === "string" && name.trim()) return name.trim();
  return fallback;
}

async function fetchPresignByFileMetadataId(
  fileMetadataId: string,
  fallbackFileName: string,
): Promise<FetchBankDocumentResult> {
  const response = await getPresignDownloadList({
    s3BucketName: BANK_DOCUMENT_S3_BUCKET,
    fileMetadataId,
    page: 0,
    size: 1,
  });

  if (!response.success || response.data == null) {
    const message =
      (typeof response.error === "string" ? response.error : undefined) ??
      (typeof response.message === "string" ? response.message : undefined);
    return { ok: false, message };
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
    fileName: readFileName(record, fallbackFileName),
    presignedUrl,
  };
}

/** GET `/v1/files/presigned-url` for a bank document by `fileMetadataId`. */
export async function fetchBankDocumentPresign(
  fileMetadataId: string,
  fallbackFileName = "Bank Document",
): Promise<FetchBankDocumentResult> {
  const trimmedId = fileMetadataId.trim();
  if (!trimmedId) {
    return { ok: false, message: "File metadata id is required." };
  }

  // Resolve by fileMetadataId only — do not send s3SubBucketName.
  return fetchPresignByFileMetadataId(trimmedId, fallbackFileName);
}
