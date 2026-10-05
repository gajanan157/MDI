import { deleteApi, documentApi, documentApi2, postApi } from "@/app/api/apiService";
import {
  extractFileMetadataIdFromScanUpload,
  extractInwardNoFromScanUpload,
} from "@/store/features/providerRohini/providerRohiniAPI";
import {
  getPresignDownloadList,
  parsePresignListResponse,
} from "@/services/presignFilesApi";
import { sanitizeApiErrorMessage } from "@/utils/sanitizeApiErrorMessage";
import { fetchRestrictionSupportingDocumentPresign } from "../../icCorporateMapping/restriction/documents";
import {
  AGREEMENT_DOCUMENT_ENTITY_TYPE,
  AGREEMENT_DOCUMENT_INVALID_TYPE_MESSAGE,
  AGREEMENT_DOCUMENT_S3_BUCKET,
  AGREEMENT_DOCUMENT_S3_SUB_BUCKET,
  AGREEMENT_SUPPORTING_DOCUMENT_S3_SUB_BUCKET,
  isAgreementPdfFile,
  isAgreementSupportingDocumentFile,
  SUPPORTING_DOCUMENT_INVALID_TYPE_MESSAGE,
} from "./agreementDocumentConfig";
import type { AgreementFullFormValues } from "./agreementFormConfig";
import type { NormalizedProviderAgreement } from "@/store/features/providerAgreement/providerAgreementTypes";

export type UploadAgreementDocumentResult =
  | { ok: true; fileMetadataId: string; inwardNo?: string; message?: string }
  | { ok: false; message?: string };

export type ResolvedAgreementDocuments = {
  fileMetadataId: string;
  supportingFileMetadataId: string;
  inwardNo: string;
};

function extractApiMessage(payload: unknown): string | undefined {
  if (payload == null) return undefined;
  if (typeof payload === "string") {
    const value = sanitizeApiErrorMessage(payload, "").trim();
    return value || undefined;
  }
  if (typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) {
    return sanitizeApiErrorMessage(record.message).trim() || undefined;
  }
  if (typeof record.error === "string" && record.error.trim()) {
    return sanitizeApiErrorMessage(record.error).trim() || undefined;
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

async function uploadAgreementScanFile(
  file: File,
  providerId: string,
  s3SubBucketName: string,
): Promise<UploadAgreementDocumentResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await postApi<unknown, FormData>(
    documentApi,
    "v1/scan/files/upload",
    formData,
    {
      params: {
        s3BucketName: AGREEMENT_DOCUMENT_S3_BUCKET,
        s3SubBucketName,
        entityType: AGREEMENT_DOCUMENT_ENTITY_TYPE,
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
    };
  }

  const fileMetadataId = extractFileMetadataIdFromScanUpload(response.data);
  if (!fileMetadataId) {
    return {
      ok: false,
      message: extractApiMessage(response.data),
    };
  }

  return {
    ok: true,
    fileMetadataId,
    inwardNo: extractInwardNoFromScanUpload(response.data),
    message: extractApiMessage(response.data),
  };
}

export type DeleteAgreementDocumentResult =
  | { ok: true; message?: string }
  | { ok: false; message?: string };

/** DELETE `/v1/files/{fileMetadataId}` on document-upload-management-service. */
export async function deleteAgreementDocumentFile(
  fileMetadataId: string,
): Promise<DeleteAgreementDocumentResult> {
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

/** Uploads the main agreement document via `v1/scan/files/upload` (`AGREEMENT` sub-bucket). */
export async function uploadAgreementDocument(
  file: File,
  providerId: string,
): Promise<UploadAgreementDocumentResult> {
  if (!isAgreementPdfFile(file)) {
    return { ok: false, message: AGREEMENT_DOCUMENT_INVALID_TYPE_MESSAGE };
  }
  return uploadAgreementScanFile(file, providerId, AGREEMENT_DOCUMENT_S3_SUB_BUCKET);
}

/** Uploads the agreement supporting document via `v1/scan/files/upload` (`SUPPLIMENTRY_DOCUMENT` sub-bucket). */
export async function uploadAgreementSupportingDocument(
  file: File,
  providerId: string,
): Promise<UploadAgreementDocumentResult> {
  if (!isAgreementSupportingDocumentFile(file)) {
    return { ok: false, message: SUPPORTING_DOCUMENT_INVALID_TYPE_MESSAGE };
  }
  return uploadAgreementScanFile(
    file,
    providerId,
    AGREEMENT_SUPPORTING_DOCUMENT_S3_SUB_BUCKET,
  );
}

export type FetchAgreementDocumentResult =
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

/** Fetches a presigned download URL for the main agreement document. */
export async function fetchAgreementDocumentPresign(
  fileMetadataId: string,
): Promise<FetchAgreementDocumentResult> {
  const trimmedId = fileMetadataId.trim();
  if (!trimmedId) {
    return { ok: false, message: "File metadata id is required." };
  }

  const response = await getPresignDownloadList({
    s3BucketName: AGREEMENT_DOCUMENT_S3_BUCKET,
    s3SubBucketName: AGREEMENT_DOCUMENT_S3_SUB_BUCKET,
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
    fileName: readFileName(record, "Agreement Document"),
    presignedUrl,
  };
}

/** Fetches a presigned download URL for the agreement supporting document. */
export async function fetchAgreementSupportingDocumentPresign(
  fileMetadataId: string,
): Promise<FetchAgreementDocumentResult> {
  return fetchRestrictionSupportingDocumentPresign(fileMetadataId);
}

export type ResolveAgreementDocumentsResult =
  | { ok: true; documents: ResolvedAgreementDocuments }
  | { ok: false; message?: string };

/** Uploads pending files and returns metadata ids to send on create/update. */
export async function resolveAgreementDocumentsForSave(
  providerId: string,
  values: Pick<
    AgreementFullFormValues,
    | "pendingAgreementDocumentFile"
    | "pendingSupportingDocumentFile"
    | "fileMetadataId"
    | "supportingFileMetadataId"
    | "inwardNo"
  >,
  original?: Pick<
    NormalizedProviderAgreement,
    "fileMetadataId" | "supportingFileMetadataId" | "inwardNo"
  >,
): Promise<ResolveAgreementDocumentsResult> {
  let fileMetadataId = values.fileMetadataId.trim() || original?.fileMetadataId.trim() || "";
  let supportingFileMetadataId =
    values.supportingFileMetadataId.trim() || original?.supportingFileMetadataId.trim() || "";
  let inwardNo = values.inwardNo.trim() || original?.inwardNo.trim() || "";

  if (values.pendingAgreementDocumentFile) {
    const uploadResult = await uploadAgreementDocument(
      values.pendingAgreementDocumentFile,
      providerId,
    );
    if (!uploadResult.ok) {
      return { ok: false, message: uploadResult.message };
    }
    fileMetadataId = uploadResult.fileMetadataId;
    if (uploadResult.inwardNo?.trim()) {
      inwardNo = uploadResult.inwardNo.trim();
    }
  }

  if (values.pendingSupportingDocumentFile) {
    const uploadResult = await uploadAgreementSupportingDocument(
      values.pendingSupportingDocumentFile,
      providerId,
    );
    if (!uploadResult.ok) {
      return { ok: false, message: uploadResult.message };
    }
    supportingFileMetadataId = uploadResult.fileMetadataId;
    if (uploadResult.inwardNo?.trim()) {
      inwardNo = uploadResult.inwardNo.trim();
    }
  }

  return {
    ok: true,
    documents: {
      fileMetadataId,
      supportingFileMetadataId,
      inwardNo,
    },
  };
}
