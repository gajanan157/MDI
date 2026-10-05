import { documentApi, postApi } from "@/app/api/apiService";
import {
  extractDownloadUrlFromRegisterResponse,
  extractFileMetadataIdFromScanUpload,
} from "@/store/features/providerRohini/providerRohiniAPI";
import {
  SOC_DOCUMENT_S3_BUCKET,
  SOC_DOCUMENT_S3_SUB_BUCKET,
} from "./socConfig";

export type UploadSocDocumentParams = {
  file: File;
  providerId: string;
  socId: string;
};

export type UploadSocDocumentResult =
  | {
      ok: true;
      downloadUrl: string;
      fileMetadataId?: string;
      message?: string;
      data: unknown;
    }
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

/** Uploads a SOC PDF via `v1/scan/files/upload` (provider bucket). */
export async function uploadSocDocument(
  params: UploadSocDocumentParams,
): Promise<UploadSocDocumentResult> {
  const formData = new FormData();
  formData.append("file", params.file);

  const response = await postApi<unknown, FormData>(
    documentApi,
    "v1/scan/files/upload",
    formData,
    {
      params: {
        s3BucketName: SOC_DOCUMENT_S3_BUCKET,
        s3SubBucketName: SOC_DOCUMENT_S3_SUB_BUCKET,
        entityId: params.providerId,
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

  const downloadUrl = extractDownloadUrlFromRegisterResponse(response.data);
  const fileMetadataId = extractFileMetadataIdFromScanUpload(response.data);
  const previewUrl = downloadUrl ?? URL.createObjectURL(params.file);

  return {
    ok: true,
    data: response.data,
    downloadUrl: previewUrl,
    fileMetadataId,
    message: extractApiMessage(response.data),
  };
}
