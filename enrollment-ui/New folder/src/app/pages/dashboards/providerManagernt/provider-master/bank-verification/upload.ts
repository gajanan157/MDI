import { uploadInwardWithDocuments } from "@/app/pages/dashboards/enrollmentsystem/PolicyDetails/services/inwardUploadService";
import { postApi, providerApi } from "@/app/api/apiService";
import {
  extractFileMetadataIdFromScanUpload,
  extractInwardNoFromScanUpload,
} from "@/store/features/providerRohini/providerRohiniAPI";
import { sanitizeApiErrorMessage } from "@/utils/sanitizeApiErrorMessage";
import {
  BANK_VERIFICATION_DOCUMENT_TYPE,
  BANK_VERIFICATION_EMAIL_DOCUMENT_TYPE,
  BANK_VERIFICATION_INWARD_PRIORITY,
  BANK_VERIFICATION_INWARD_RECEIVED_CHANNEL,
  BANK_VERIFICATION_PROVIDER_JOB_LAUNCH_PATH,
  BANK_VERIFICATION_S3_BUCKET,
  BANK_VERIFICATION_S3_SUB_BUCKET,
} from "./config";

export type BulkBankDetailsScanUploadContext = {
  insurerId: string;
  inwardReceivedTpaBranchId: string;
  departmentId: string;
};

export type BulkBankDetailsProviderJobLaunchPayload = {
  insurerId: string;
  inwardNo: string;
  fileMetadataId: string;
};

const BULK_BANK_DETAILS_CONTEXT_STORAGE_PREFIX = "bulk-bank-details-context:";

export function persistBulkBankDetailsContext(
  inwardNo: string,
  insurerId: string,
): void {
  const key = inwardNo.trim();
  const id = insurerId.trim();
  if (!key || !id) return;
  try {
    sessionStorage.setItem(
      `${BULK_BANK_DETAILS_CONTEXT_STORAGE_PREFIX}${key}`,
      JSON.stringify({ insurerId: id }),
    );
  } catch {
    // sessionStorage may be unavailable
  }
}

export function readBulkBankDetailsPersistedInsurerId(inwardNo: string): string {
  const key = inwardNo.trim();
  if (!key) return "";
  try {
    const raw = sessionStorage.getItem(`${BULK_BANK_DETAILS_CONTEXT_STORAGE_PREFIX}${key}`);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { insurerId?: string };
    return String(parsed.insurerId ?? "").trim();
  } catch {
    return "";
  }
}

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

function readScanUploadFailureMessage(response: {
  success: boolean;
  data?: unknown;
  message?: string | null;
  error?: unknown;
  errorPayload?: unknown;
}): string | undefined {
  if (!response.success) {
    return (
      extractApiMessage(response.errorPayload) ??
      extractApiMessage(response.error) ??
      extractApiMessage(response.data) ??
      (typeof response.message === "string" ? response.message : undefined)
    );
  }

  const body = response.data as { success?: boolean; message?: string } | undefined;
  if (body && typeof body.success === "boolean" && body.success === false) {
    return extractApiMessage(body);
  }

  return undefined;
}

function buildBulkBankDetailsScanUploadPayload(
  context: BulkBankDetailsScanUploadContext,
  extras?: { documentType?: string; inwardNo?: string },
) {
  const payload: Record<string, string> = {
    inwardReceivedChannel: BANK_VERIFICATION_INWARD_RECEIVED_CHANNEL,
    s3SubBucketName: BANK_VERIFICATION_S3_SUB_BUCKET,
    documentType: extras?.documentType ?? BANK_VERIFICATION_DOCUMENT_TYPE,
    s3BucketName: BANK_VERIFICATION_S3_BUCKET,
    inwardPriority: BANK_VERIFICATION_INWARD_PRIORITY,
    inwardReceivedTpaBranchId: context.inwardReceivedTpaBranchId,
    departmentId: context.departmentId,
  };

  const inwardNo = extras?.inwardNo?.trim();
  if (inwardNo) {
    payload.inwardNo = inwardNo;
  }

  const insurerId = context.insurerId.trim();
  if (insurerId) {
    payload.entityId = insurerId;
    payload.entityType = "INSURER";
  }

  return payload;
}

async function uploadBulkBankDetailsDataFile(
  file: File,
  context: BulkBankDetailsScanUploadContext,
) {
  const response = await uploadInwardWithDocuments({
    files: [file],
    payload: buildBulkBankDetailsScanUploadPayload(context),
  });

  const failureMessage = readScanUploadFailureMessage(response);
  if (failureMessage) {
    return { ok: false as const, message: failureMessage, data: response.data };
  }

  return {
    ok: true as const,
    data: response.data,
    message: extractApiMessage(response.data),
  };
}

async function uploadBulkBankDetailsEmailFile(
  file: File,
  inwardNo: string,
  context: BulkBankDetailsScanUploadContext,
) {
  const response = await uploadInwardWithDocuments({
    files: [file],
    payload: buildBulkBankDetailsScanUploadPayload(context, {
      documentType: BANK_VERIFICATION_EMAIL_DOCUMENT_TYPE,
      inwardNo,
    }),
  });

  const failureMessage = readScanUploadFailureMessage(response);
  if (failureMessage) {
    return { ok: false as const, message: failureMessage };
  }

  return { ok: true as const, data: response.data, message: extractApiMessage(response.data) };
}

export async function launchBulkBankDetailsProviderJob(
  payload: BulkBankDetailsProviderJobLaunchPayload,
) {
  const response = await postApi<unknown, BulkBankDetailsProviderJobLaunchPayload>(
    providerApi,
    BANK_VERIFICATION_PROVIDER_JOB_LAUNCH_PATH,
    {
      insurerId: payload.insurerId,
      inwardNo: payload.inwardNo,
      fileMetadataId: payload.fileMetadataId,
    },
  );

  const failureMessage = readScanUploadFailureMessage(response);
  if (failureMessage) {
    return { ok: false as const, message: failureMessage, data: response.data };
  }

  return {
    ok: true as const,
    data: response.data,
    message: extractApiMessage(response.data),
  };
}

/** Scan upload data file (+ optional .eml) → extract inward/file ids → launch provider job. */
export async function submitBulkBankDetailsUpload(
  dataFile: File,
  context: BulkBankDetailsScanUploadContext,
  emailFile?: File | null,
) {
  const uploadResult = await uploadBulkBankDetailsDataFile(dataFile, context);
  if (!uploadResult.ok) {
    return { ok: false as const, message: uploadResult.message };
  }

  const inwardNo = extractInwardNoFromScanUpload(uploadResult.data);
  const fileMetadataId = extractFileMetadataIdFromScanUpload(uploadResult.data);

  if (!inwardNo) {
    return { ok: false as const, message: extractApiMessage(uploadResult.data) };
  }

  if (!fileMetadataId) {
    return { ok: false as const, message: extractApiMessage(uploadResult.data), inwardNo };
  }

  if (emailFile) {
    const emailResult = await uploadBulkBankDetailsEmailFile(emailFile, inwardNo, context);
    if (!emailResult.ok) {
      return { ok: false as const, message: emailResult.message, inwardNo, fileMetadataId };
    }
  }

  const launchResult = await launchBulkBankDetailsProviderJob({
    insurerId: context.insurerId,
    inwardNo,
    fileMetadataId,
  });

  if (!launchResult.ok) {
    return { ok: false as const, message: launchResult.message, inwardNo, fileMetadataId };
  }

  persistBulkBankDetailsContext(inwardNo, context.insurerId);

  return {
    ok: true as const,
    inwardNo,
    fileMetadataId,
    launchData: launchResult.data,
    message: launchResult.message ?? uploadResult.message,
  };
}
