import { deleteApi, documentApi, documentApi2, postApi } from "@/app/api/apiService";
import {
  extractFileMetadataIdFromScanUpload,
  extractInwardNoFromScanUpload,
} from "@/store/features/providerRohini/providerRohiniAPI";
import {
  getPresignDownloadList,
  parsePresignListResponse,
} from "@/services/presignFilesApi";
import {
  RESTRICTION_DOCUMENT_ENTITY_TYPE,
  RESTRICTION_DOCUMENT_S3_BUCKET,
  RESTRICTION_DOCUMENT_S3_SUB_BUCKET,
} from "./config";

export type UploadRestrictionDocumentResult =
  | { ok: true; fileMetadataId: string; inwardNo?: string; message?: string; data: unknown }
  | { ok: false; message?: string; data?: unknown };

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

/** Uploads restriction supporting document via `v1/scan/files/upload`. */
export async function uploadRestrictionSupportingDocument(
  file: File,
  providerId: string,
): Promise<UploadRestrictionDocumentResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await postApi<unknown, FormData>(
    documentApi,
    "v1/scan/files/upload",
    formData,
    {
      params: {
        s3BucketName: RESTRICTION_DOCUMENT_S3_BUCKET,
        s3SubBucketName: RESTRICTION_DOCUMENT_S3_SUB_BUCKET,
        entityType: RESTRICTION_DOCUMENT_ENTITY_TYPE,
        entityId: providerId,
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
      data: response.data,
    };
  }

  const fileMetadataId = extractFileMetadataIdFromScanUpload(response.data);
  if (!fileMetadataId) {
    return {
      ok: false,
      message: extractApiMessage(response.data),
      data: response.data,
    };
  }

  return {
    ok: true,
    fileMetadataId,
    inwardNo: extractInwardNoFromScanUpload(response.data),
    data: response.data,
    message: extractApiMessage(response.data),
  };
}

export type FetchRestrictionDocumentResult =
  | { ok: true; fileName: string; presignedUrl: string }
  | { ok: false; message?: string };

function readPresignedUrl(record: Record<string, unknown>): string {
  const url = record.presignedUrl ?? record.url ?? record.downloadUrl;
  return typeof url === "string" ? url.trim() : "";
}

function readFileName(record: Record<string, unknown>): string {
  const name = record.originalFileName ?? record.fileName ?? record.name;
  if (typeof name === "string" && name.trim()) return name.trim();
  return "Supporting Document";
}

/** GET `/v1/files/presigned-url` on document-upload-management-service by fileMetadataId. */
export async function fetchRestrictionSupportingDocumentPresign(
  fileMetadataId: string,
): Promise<FetchRestrictionDocumentResult> {
  const trimmedId = fileMetadataId.trim();
  if (!trimmedId) {
    return { ok: false, message: "File metadata id is required." };
  }

  const response = await getPresignDownloadList({
    s3BucketName: RESTRICTION_DOCUMENT_S3_BUCKET,
    s3SubBucketName: RESTRICTION_DOCUMENT_S3_SUB_BUCKET,
    fileMetadataId: trimmedId,
    page: 0,
    size: 1,
  });

  if (!response.success || response.data == null) {
    const message =
      (typeof response.error === "string" ? response.error : undefined) ??
      (typeof response.message === "string" ? response.message : undefined);
    const normalized = message?.trim().toLowerCase() ?? "";
    if (
      normalized.includes("no files found") ||
      normalized.includes("no file found")
    ) {
      return { ok: false };
    }
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
    fileName: readFileName(record),
    presignedUrl,
  };
}

export type DeleteRestrictionDocumentResult =
  | { ok: true; message?: string }
  | { ok: false; message?: string };

/** DELETE `/v1/files/{fileMetadataId}` on document-upload-management-service. */
export async function deleteRestrictionSupportingDocumentFile(
  fileMetadataId: string,
): Promise<DeleteRestrictionDocumentResult> {
  const trimmedId = fileMetadataId.trim();
  if (!trimmedId) {
    return { ok: false, message: "File id is required to delete." };
  }

  const response = await deleteApi<unknown>(
    documentApi2,
    `v1/files/${encodeURIComponent(trimmedId)}`,
  );

  if (!response.success) {
    return {
      ok: false,
      message:
        extractApiMessage(response.errorPayload) ??
        extractApiMessage(response.error) ??
        extractApiMessage(response.data) ??
        "Failed to delete document.",
    };
  }

  return { ok: true, message: extractApiMessage(response.data) };
}