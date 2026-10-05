import { uploadInwardWithDocuments } from "@/app/pages/dashboards/enrollmentsystem/PolicyDetails/services/inwardUploadService";
import { postApi, providerApi } from "@/app/api/apiService";
import {
    extractFileMetadataIdFromScanUpload,
    extractInwardNoFromScanUpload,
} from "@/store/features/providerRohini/providerRohiniAPI";
import {
    getPresignDownloadList,
    parsePresignListResponse,
} from "@/services/presignFilesApi";
import { sanitizeApiErrorMessage } from "@/utils/sanitizeApiErrorMessage";
import type { BulkIcMappingType } from "./types";

export const BULK_IC_MAPPING_S3_BUCKET = "provider";
/** Same maintenance subcategory used by exclusion / watchlist provider inwards. */
export const BULK_IC_MAPPING_S3_SUB_BUCKET = "MAINTENANCE NETWORK & MAPPING RECORDS";
/** Legacy S3 sub-bucket — still accepted when resolving files for older inwards. */
export const BULK_IC_MAPPING_S3_SUB_BUCKET_LEGACY = "IC_PROVIDER_MAPPING";
/** Document type for IC network bulk uploads (scan upload + provider inward list). */
export const BULK_IC_MAPPING_DOCUMENT_TYPE = "PROVIDER_IC_NETWORK_RECORDS";
/** @deprecated Alias — prefer `BULK_IC_MAPPING_DOCUMENT_TYPE`. */
export const BULK_IC_MAPPING_PROVIDER_DOCUMENT_TYPE = BULK_IC_MAPPING_DOCUMENT_TYPE;
/** Legacy document type still returned for older bulk uploads. */
export const BULK_IC_MAPPING_DOCUMENT_TYPE_LEGACY = "bulkmapping";
export const BULK_IC_MAPPING_ERROR_FILE_DOCUMENT_TYPE = "Error-File";

export function isBulkIcMappingDocumentType(
    documentType: string | null | undefined,
): boolean {
    const value = String(documentType ?? "").trim();
    return (
        value === BULK_IC_MAPPING_DOCUMENT_TYPE ||
        value === BULK_IC_MAPPING_DOCUMENT_TYPE_LEGACY ||
        value.toLowerCase() === BULK_IC_MAPPING_DOCUMENT_TYPE_LEGACY
    );
}

export const BULK_IC_MAPPING_INWARD_RECEIVED_CHANNEL = "EMAIL";
export const BULK_IC_MAPPING_INWARD_PRIORITY = "HIGH";
export const BULK_IC_MAPPING_PROVIDER_JOB_LAUNCH_PATH = "/v1/provider-job/launch";



export const BULK_IC_MAPPING_HOSPITAL_LIST_MIME = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/csv",
    "text/comma-separated-values",
] as const;

export const BULK_IC_MAPPING_HOSPITAL_LIST_ACCEPT =
    ".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv";

function isHospitalListFileByName(file: File): boolean {
    const name = file.name.toLowerCase();
    return name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv");
}

export function isBulkIcMappingHospitalListFile(file: File): boolean {
    if (isHospitalListFileByName(file)) return true;
    if (
        file.type &&
        BULK_IC_MAPPING_HOSPITAL_LIST_MIME.includes(
            file.type as (typeof BULK_IC_MAPPING_HOSPITAL_LIST_MIME)[number],
        )
    ) {
        return true;
    }
    return false;
}

export type BulkIcMappingEntityTab = "ic" | "corporate";

export type BulkIcMappingPersistedContext = {
    entityType: BulkIcMappingEntityTab;
    entityId: string;
    insurerId: string;
    mappingType?: BulkIcMappingType;
};

const BULK_IC_MAPPING_CONTEXT_STORAGE_PREFIX = "bulk-ic-mapping-context:";

/** Bulk mapping scan upload is always insurer-scoped (`entityType` + `entityId`). */
export function toBulkIcMappingScanEntityType(): string {
    return "INSURER";
}

export function resolveBulkIcMappingScanEntityId(context: BulkIcMappingScanUploadContext): string {
    return context.insurerId.trim();
}

export function persistBulkIcMappingContext(
    inwardNo: string,
    context: BulkIcMappingPersistedContext,
): void {
    const key = inwardNo.trim();
    const entityId = context.entityId.trim();
    const insurerId = context.insurerId.trim();
    if (!key || !entityId || !insurerId) return;

    try {
        sessionStorage.setItem(
            `${BULK_IC_MAPPING_CONTEXT_STORAGE_PREFIX}${key}`,
            JSON.stringify({
                entityType: context.entityType,
                entityId,
                insurerId,
                ...(context.mappingType ? { mappingType: context.mappingType } : {}),
            }),
        );
    } catch {
        // sessionStorage may be unavailable
    }
}

export function readBulkIcMappingPersistedContext(
    inwardNo: string,
): BulkIcMappingPersistedContext | null {
    const key = inwardNo.trim();
    if (!key) return null;

    try {
        const raw = sessionStorage.getItem(`${BULK_IC_MAPPING_CONTEXT_STORAGE_PREFIX}${key}`);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as Partial<BulkIcMappingPersistedContext>;
        const entityId = String(parsed.entityId ?? "").trim();
        const insurerId = String(parsed.insurerId ?? "").trim();
        if (!entityId || !insurerId) return null;

        return {
            entityType: parsed.entityType === "corporate" ? "corporate" : "ic",
            entityId,
            insurerId,
            mappingType:
                parsed.mappingType === "depanelled" || parsed.mappingType === "empanel"
                    ? parsed.mappingType
                    : undefined,
        };
    } catch {
        return null;
    }
}

export type BulkIcMappingScanUploadContext = {
    entityType: BulkIcMappingEntityTab;
    entityId: string;
    insurerId: string;
    inwardReceivedTpaBranchId: string;
    departmentId: string;
    mappingType?: BulkIcMappingType;
    /** Re-upload against an existing inward (`parentInwardNo` on scan upload). */
    parentInwardNo?: string;
};

export type BulkIcMappingProviderJobLaunchPayload = {
    insurerId: string;
    inwardNo: string;
    fileMetadataId: string;
    parentInwardNo?: string;
    isCorrection?: boolean;
    forcefullyAdd?: boolean;
};

export type BulkIcMappingSubmitSuccess = {
    inwardNo: string;
    fileMetadataId: string;
    launchData: unknown;
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

/** FormData fields for `v1/scan/files/upload` — same pattern as Rohini inward upload. */
export function buildBulkIcMappingScanUploadPayload(context: BulkIcMappingScanUploadContext) {
    const payload: Record<string, string> = {
        inwardReceivedChannel: BULK_IC_MAPPING_INWARD_RECEIVED_CHANNEL,
        s3SubBucketName: BULK_IC_MAPPING_S3_SUB_BUCKET,
        documentType: BULK_IC_MAPPING_DOCUMENT_TYPE,
        s3BucketName: BULK_IC_MAPPING_S3_BUCKET,
        inwardPriority: BULK_IC_MAPPING_INWARD_PRIORITY,
        inwardReceivedTpaBranchId: context.inwardReceivedTpaBranchId,
        departmentId: context.departmentId,
    };

    const parentInwardNo = context.parentInwardNo?.trim();
    if (parentInwardNo) {
        payload.parentInwardNo = parentInwardNo;
    }

    const entityId = resolveBulkIcMappingScanEntityId(context);
    if (entityId) {
        payload.entityId = entityId;
        payload.entityType = toBulkIcMappingScanEntityType();
    }

    return payload;
}

export async function uploadBulkIcMappingHospitalList(
    file: File,
    context: BulkIcMappingScanUploadContext,
) {
    const payload = buildBulkIcMappingScanUploadPayload(context);
    const response = await uploadInwardWithDocuments({
        files: [file],
        payload,
    });

    if (!response.success) {
        const apiMessage =
            extractApiMessage(response.errorPayload) ??
            extractApiMessage(response.error) ??
            extractApiMessage(response.data) ??
            (typeof response.message === "string" ? response.message : undefined);
        return { ok: false as const, message: apiMessage, data: response.data };
    }

    const body = response.data as { success?: boolean; message?: string } | undefined;
    if (body && typeof body.success === "boolean" && body.success === false) {
        return {
            ok: false as const,
            message: extractApiMessage(body),
            data: response.data,
        };
    }

    return { ok: true as const, data: response.data, message: extractApiMessage(response.data) };
}

export function buildBulkIcMappingProviderJobLaunchPayload(
    input: BulkIcMappingProviderJobLaunchPayload,
): BulkIcMappingProviderJobLaunchPayload {
    const payload: BulkIcMappingProviderJobLaunchPayload = {
        insurerId: input.insurerId,
        inwardNo: input.inwardNo,
        fileMetadataId: input.fileMetadataId,
    };

    const parentInwardNo = input.parentInwardNo?.trim();
    if (parentInwardNo) {
        payload.parentInwardNo = parentInwardNo;
    }

    if (input.isCorrection) {
        payload.isCorrection = true;
    }

    if (input.forcefullyAdd) {
        payload.forcefullyAdd = true;
    }

    return payload;
}

export async function launchBulkIcMappingProviderJob(
    payload: BulkIcMappingProviderJobLaunchPayload,
) {
    const response = await postApi<unknown, BulkIcMappingProviderJobLaunchPayload>(
        providerApi,
        BULK_IC_MAPPING_PROVIDER_JOB_LAUNCH_PATH,
        buildBulkIcMappingProviderJobLaunchPayload(payload),
    );

    if (!response.success) {
        const apiMessage =
            extractApiMessage(response.errorPayload) ??
            extractApiMessage(response.error) ??
            extractApiMessage(response.data) ??
            (typeof response.message === "string" ? response.message : undefined);
        return { ok: false as const, message: apiMessage, data: response.data };
    }

    const body = response.data as { success?: boolean; message?: string } | undefined;
    if (body && typeof body.success === "boolean" && body.success === false) {
        return {
            ok: false as const,
            message: extractApiMessage(body),
            data: response.data,
        };
    }

    return { ok: true as const, data: response.data, message: extractApiMessage(response.data) };
}

/** Scan upload → extract inward/file ids → launch provider job. */
export async function submitBulkIcMappingHospitalList(
    file: File,
    context: BulkIcMappingScanUploadContext,
) {
    const uploadResult = await uploadBulkIcMappingHospitalList(file, context);
    if (!uploadResult.ok) {
        return { ok: false as const, message: uploadResult.message };
    }

    const inwardNo = extractInwardNoFromScanUpload(uploadResult.data);
    const fileMetadataId = extractFileMetadataIdFromScanUpload(uploadResult.data);

    if (!inwardNo) {
        return {
            ok: false as const,
            message: extractApiMessage(uploadResult.data),
        };
    }

    if (!fileMetadataId) {
        return {
            ok: false as const,
            message: extractApiMessage(uploadResult.data),
        };
    }

    const launchResult = await launchBulkIcMappingProviderJob({
        insurerId: context.insurerId,
        inwardNo,
        fileMetadataId,
    });

    if (!launchResult.ok) {
        return { ok: false as const, message: launchResult.message, inwardNo, fileMetadataId };
    }

    persistBulkIcMappingContext(inwardNo, {
        entityType: context.entityType,
        entityId: context.entityId,
        insurerId: context.insurerId,
        mappingType: context.mappingType,
    });

    return {
        ok: true as const,
        inwardNo,
        fileMetadataId,
        launchData: launchResult.data,
        message: launchResult.message ?? uploadResult.message,
    };
}

export type BulkIcMappingStagingReuploadInput = {
    parentInwardNo: string;
    entityType: BulkIcMappingEntityTab;
    entityId: string;
    insurerId: string;
    inwardReceivedTpaBranchId: string;
    departmentId: string;
    forcefullyAdd: boolean;
};

/** Re-upload hospital list against the same inward (`parentInwardNo`) and launch provider job. */
export async function submitBulkIcMappingStagingReupload(
    file: File,
    input: BulkIcMappingStagingReuploadInput,
) {
    const parentInwardNo = input.parentInwardNo.trim();
    if (!parentInwardNo) {
        return { ok: false as const, message: "Inward number is required." };
    }

    const uploadResult = await uploadBulkIcMappingHospitalList(file, {
        entityType: input.entityType,
        entityId: input.entityId,
        insurerId: input.insurerId,
        inwardReceivedTpaBranchId: input.inwardReceivedTpaBranchId,
        departmentId: input.departmentId,
        parentInwardNo,
    });

    if (!uploadResult.ok) {
        return { ok: false as const, message: uploadResult.message };
    }

    const inwardNo = extractInwardNoFromScanUpload(uploadResult.data);
    const fileMetadataId = extractFileMetadataIdFromScanUpload(uploadResult.data);

    if (!inwardNo) {
        return {
            ok: false as const,
            message: extractApiMessage(uploadResult.data),
        };
    }

    if (!fileMetadataId) {
        return {
            ok: false as const,
            message: extractApiMessage(uploadResult.data),
        };
    }

    const launchResult = await launchBulkIcMappingProviderJob({
        insurerId: input.insurerId,
        inwardNo,
        fileMetadataId,
        parentInwardNo,
        isCorrection: true,
        forcefullyAdd: input.forcefullyAdd,
    });

    if (!launchResult.ok) {
        return {
            ok: false as const,
            message: launchResult.message,
            inwardNo,
            fileMetadataId,
        };
    }

    persistBulkIcMappingContext(parentInwardNo, {
        entityType: input.entityType,
        entityId: input.entityId,
        insurerId: input.insurerId,
    });

    return {
        ok: true as const,
        inwardNo,
        fileMetadataId,
        launchData: launchResult.data,
        message: launchResult.message ?? uploadResult.message,
    };
}

function readPresignFileMetadataId(record: Record<string, unknown>): string {
    const id = record.fileMetadataId ?? record.id;
    if (typeof id === "string" && id.trim()) return id.trim();
    if (typeof id === "number" && Number.isFinite(id)) return String(id);
    return "";
}

export type ProcessBulkIcMappingExistingInwardInput = {
    inwardNo: string;
    entityType: BulkIcMappingEntityTab;
    entityId: string;
    insurerId: string;
    mappingType?: BulkIcMappingType;
    s3BucketName?: string;
    s3SubBucketName?: string;
};

async function resolveBulkIcMappingFileMetadataId(
    inwardNo: string,
    s3BucketName: string,
    s3SubBucketName: string,
): Promise<{ ok: true; fileMetadataId: string } | { ok: false; message?: string }> {
    const response = await getPresignDownloadList({
        s3BucketName,
        s3SubBucketName,
        inwardNo,
        page: 0,
        size: 20,
    });

    if (!response.success || response.data == null) {
        return {
            ok: false,
            message:
                extractApiMessage(response.errorPayload) ??
                extractApiMessage(response.error) ??
                (typeof response.message === "string" ? response.message : undefined),
        };
    }

    const parsed = parsePresignListResponse(response.data);
    const firstItem = parsed.items[0];
    if (!firstItem) {
        return { ok: false, message: "No file found for this inward number." };
    }

    const fileMetadataId = readPresignFileMetadataId(firstItem);
    if (!fileMetadataId) {
        return { ok: false, message: "File metadata id not found for this inward." };
    }

    return { ok: true, fileMetadataId };
}

/**
 * Process an existing dashboard inward: resolve uploaded file → launch provider job.
 * Does not create a new inward / scan upload.
 */
export async function processBulkIcMappingExistingInward(
    input: ProcessBulkIcMappingExistingInwardInput,
) {
    const inwardNo = input.inwardNo.trim();
    const insurerId = input.insurerId.trim();
    const entityId = input.entityId.trim();
    if (!inwardNo || !insurerId || !entityId) {
        return { ok: false as const, message: "Inward number and insurer are required." };
    }

    const primaryBucket = input.s3BucketName?.trim() || BULK_IC_MAPPING_S3_BUCKET;
    const primarySubBucket =
        input.s3SubBucketName?.trim() || BULK_IC_MAPPING_S3_SUB_BUCKET;

    let fileResult = await resolveBulkIcMappingFileMetadataId(
        inwardNo,
        primaryBucket,
        primarySubBucket,
    );

    const tried = new Set([`${primaryBucket}::${primarySubBucket}`]);
    const fallbacks: Array<{ bucket: string; subBucket: string }> = [
        { bucket: BULK_IC_MAPPING_S3_BUCKET, subBucket: BULK_IC_MAPPING_S3_SUB_BUCKET },
        {
            bucket: BULK_IC_MAPPING_S3_BUCKET,
            subBucket: BULK_IC_MAPPING_S3_SUB_BUCKET_LEGACY,
        },
    ];

    for (const fallback of fallbacks) {
        if (fileResult.ok) break;
        const key = `${fallback.bucket}::${fallback.subBucket}`;
        if (tried.has(key)) continue;
        tried.add(key);
        fileResult = await resolveBulkIcMappingFileMetadataId(
            inwardNo,
            fallback.bucket,
            fallback.subBucket,
        );
    }

    if (!fileResult.ok) {
        return { ok: false as const, message: fileResult.message };
    }

    const { fileMetadataId } = fileResult;
    const launchResult = await launchBulkIcMappingProviderJob({
        insurerId,
        inwardNo,
        fileMetadataId,
    });

    if (!launchResult.ok) {
        return {
            ok: false as const,
            message: launchResult.message,
            inwardNo,
            fileMetadataId,
        };
    }

    persistBulkIcMappingContext(inwardNo, {
        entityType: input.entityType,
        entityId,
        insurerId,
        mappingType: input.mappingType,
    });

    return {
        ok: true as const,
        inwardNo,
        fileMetadataId,
        launchData: launchResult.data,
        message: launchResult.message,
    };
}
