import { uploadInwardWithDocuments } from "@/app/pages/dashboards/enrollmentsystem/PolicyDetails/services/inwardUploadService";
import {
    extractFileMetadataIdFromScanUpload,
    extractInwardNoFromScanUpload,
} from "@/store/features/providerRohini/providerRohiniAPI";
import {
    postBlacklistJobLaunch,
    postProviderBlacklistRestrictionTemp,
} from "@/store/features/excludedProvider/excludedProviderAPI";
import { sanitizeApiErrorMessage } from "@/utils/sanitizeApiErrorMessage";
import { toProviderRestrictionApplicableFor } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/tabs/icCorporateMapping/restriction/utils";
import {
    EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION,
    EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST,
    EXCLUDED_PROVIDER_INWARD_PRIORITY,
    EXCLUDED_PROVIDER_INWARD_RECEIVED_CHANNEL,
    EXCLUDED_PROVIDER_S3_BUCKET,
    EXCLUDED_PROVIDER_S3_SUB_BUCKET,
    EXCLUDED_PROVIDER_SUPPORTING_DOCUMENT_TYPE,
    isExcludedProviderWatchlist,
    resolveExcludedProviderOcrRequired,
    type ExcludedProviderListingType,
} from "./config";

export type ExcludedProviderScanUploadContext = {
    listingType: ExcludedProviderListingType;
    blacklistedBy: string;
    insurerId?: string;
    inwardReceivedTpaBranchId: string;
    departmentId: string;
};

export type ExcludedProviderUploadInput = ExcludedProviderScanUploadContext & {
    primaryFile: File;
    supportingFile: File;
    effectiveFrom: string;
    remark: string;
    insurerName?: string;
    /** Lock For — multi-select when restriction type is watchlisted. */
    status?: string[];
    investigationRequired?: boolean;
    emergencyExceptionAllowed?: boolean;
    investigationApplicableFor?: string[];
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
    if (record.data && typeof record.data === "object") {
        return extractApiMessage(record.data);
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

function applyRestrictedByEntity(
    payload: Record<string, string>,
    context: ExcludedProviderScanUploadContext,
): void {
    const restrictedBy = context.blacklistedBy.trim().toUpperCase();
    const insurerId = context.insurerId?.trim();
    if ((restrictedBy === "INSURER" || restrictedBy === "GLOBAL") && insurerId) {
        payload.entityId = insurerId;
        payload.entityType = "INSURER";
    }
}

function buildExcludedProviderScanUploadPayload(
    context: ExcludedProviderScanUploadContext,
    file: File,
): Record<string, string> {
    const payload: Record<string, string> = {
        inwardReceivedChannel: EXCLUDED_PROVIDER_INWARD_RECEIVED_CHANNEL,
        s3SubBucketName: EXCLUDED_PROVIDER_S3_SUB_BUCKET,
        documentType: context.listingType,
        s3BucketName: EXCLUDED_PROVIDER_S3_BUCKET,
        inwardPriority: EXCLUDED_PROVIDER_INWARD_PRIORITY,
        inwardReceivedTpaBranchId: context.inwardReceivedTpaBranchId,
        departmentId: context.departmentId,
        ocrRequired: resolveExcludedProviderOcrRequired(context.listingType, file),
    };
    applyRestrictedByEntity(payload, context);
    return payload;
}

function buildExcludedProviderSupportingUploadPayload(
    inwardNo: string,
    context: ExcludedProviderScanUploadContext,
): Record<string, string> {
    const payload: Record<string, string> = {
        inwardReceivedChannel: EXCLUDED_PROVIDER_INWARD_RECEIVED_CHANNEL,
        s3SubBucketName: EXCLUDED_PROVIDER_S3_SUB_BUCKET,
        documentType: EXCLUDED_PROVIDER_SUPPORTING_DOCUMENT_TYPE,
        s3BucketName: EXCLUDED_PROVIDER_S3_BUCKET,
        inwardPriority: EXCLUDED_PROVIDER_INWARD_PRIORITY,
        inwardReceivedTpaBranchId: context.inwardReceivedTpaBranchId,
        departmentId: context.departmentId,
        inwardNo: inwardNo.trim(),
    };
    applyRestrictedByEntity(payload, context);
    return payload;
}

/** Document type for blacklist job launch. */
function toProviderBlacklistJobRestrictionType(
    listingType: ExcludedProviderListingType,
): ExcludedProviderListingType {
    return listingType === EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST
        ? EXCLUDED_PROVIDER_DOCUMENT_TYPE_WATCHLIST
        : EXCLUDED_PROVIDER_DOCUMENT_TYPE_EXCLUSION;
}

/** API enum for restriction-temp `providerBlacklistRestrictionType`. */
function toProviderBlacklistRestrictionTempType(
    listingType: ExcludedProviderListingType,
): "BLACKLIST" | "WATCHLIST" {
    return isExcludedProviderWatchlist(listingType) ? "WATCHLIST" : "BLACKLIST";
}

function resolveRestrictionApplicableFor(
    restrictionType: string,
    status: string[] | undefined,
): string {
    if (restrictionType.trim().toUpperCase() === "BLACKLIST") {
        return "BOTH";
    }

    const applicableFor = toProviderRestrictionApplicableFor(
        Array.isArray(status) ? status : [],
    );
    return applicableFor || "CASHLESS";
}

function resolveInvestigationRequiredFlag(
    listingType: ExcludedProviderListingType,
    investigationRequired: boolean | undefined,
): string {
    if (isExcludedProviderWatchlist(listingType)) {
        return investigationRequired ? "true" : "false";
    }
    return "true";
}

function resolveEmergencyExceptionFlag(
    listingType: ExcludedProviderListingType,
    emergencyExceptionAllowed: boolean | undefined,
): string {
    if (isExcludedProviderWatchlist(listingType)) {
        return emergencyExceptionAllowed ? "true" : "false";
    }
    return "false";
}

async function uploadExcludedProviderPrimaryList(
    file: File,
    context: ExcludedProviderScanUploadContext,
) {
    const payload = buildExcludedProviderScanUploadPayload(context, file);
    const response = await uploadInwardWithDocuments({
        files: [file],
        payload,
    });

    const failureMessage = readScanUploadFailureMessage(response);

    if (failureMessage) {
        return { ok: false as const, message: failureMessage, data: response.data };
    }

    return { ok: true as const, data: response.data, message: extractApiMessage(response.data) };
}

async function uploadExcludedProviderSupportingDocument(
    file: File,
    inwardNo: string,
    context: ExcludedProviderScanUploadContext,
) {
    const payload = buildExcludedProviderSupportingUploadPayload(inwardNo, context);
    const response = await uploadInwardWithDocuments({
        files: [file],
        payload,
    });

    const failureMessage = readScanUploadFailureMessage(response);

    if (failureMessage) {
        return { ok: false as const, message: failureMessage };
    }

    return {
        ok: true as const,
        data: response.data,
        message: extractApiMessage(response.data),
    };
}

/**
 * Primary list + supporting document via scan upload,
 * then blacklist-job launch, then restriction-temp.
 */
export async function submitExcludedProviderListUpload(input: ExcludedProviderUploadInput) {
    const remark = input.remark.trim();
    if (!remark) {
        return { ok: false as const, message: "Remark is required." };
    }
    if (!input.effectiveFrom.trim()) {
        return { ok: false as const, message: "Effective from is required." };
    }

    const uploadResult = await uploadExcludedProviderPrimaryList(input.primaryFile, input);
    if (!uploadResult.ok) {
        return { ok: false as const, message: uploadResult.message };
    }

    const inwardNo = extractInwardNoFromScanUpload(uploadResult.data);
    if (!inwardNo) {
        return {
            ok: false as const,
            message: uploadResult.message ?? "Inward number was not returned from upload.",
        };
    }

    const supportingResult = await uploadExcludedProviderSupportingDocument(
        input.supportingFile,
        inwardNo,
        input,
    );

    if (!supportingResult.ok) {
        return { ok: false as const, message: supportingResult.message, inwardNo };
    }

    const fileMetadataId = extractFileMetadataIdFromScanUpload(uploadResult.data);
    if (!fileMetadataId) {
        return {
            ok: false as const,
            inwardNo,
            message: "File metadata id was not returned from upload.",
        };
    }

    const supportingFileMetadataId = extractFileMetadataIdFromScanUpload(
        supportingResult.data,
    );
    if (!supportingFileMetadataId) {
        return {
            ok: false as const,
            inwardNo,
            message: "Supporting file metadata id was not returned from upload.",
        };
    }

    const effectiveFrom = input.effectiveFrom.trim();
    const blacklistedBy = input.blacklistedBy.trim().toUpperCase();
    const jobRestrictionType = toProviderBlacklistJobRestrictionType(input.listingType);
    const tempRestrictionType = toProviderBlacklistRestrictionTempType(input.listingType);

    const launchResult = await postBlacklistJobLaunch({
        inwardNo,
        fileMetadataId,
        restrictionType: jobRestrictionType,
        blacklistedBy,
        effectiveFrom,
        insurerId: input.insurerId?.trim() || undefined,
        insurerName: input.insurerName?.trim() || undefined,
        remark,
    });
    if (!launchResult.ok) {
        return {
            ok: false as const,
            inwardNo,
            message: launchResult.message,
        };
    }

    const restrictionResult = await postProviderBlacklistRestrictionTemp({
        providerBlacklistRestrictionType: tempRestrictionType,
        providerBlacklistRestrictedBy: blacklistedBy,
        providerBlacklistRestrictionEffectiveFrom: effectiveFrom,
        inwardNo,
        fileMetadataId,
        supportingFileMetadataId,
        providerRestrictionApplicableFor: resolveRestrictionApplicableFor(
            tempRestrictionType,
            input.status,
        ),
        investigationRequiredFlag: resolveInvestigationRequiredFlag(
            input.listingType,
            input.investigationRequired,
        ),
        emergencyExceptionAllowedFlag: resolveEmergencyExceptionFlag(
            input.listingType,
            input.emergencyExceptionAllowed,
        ),
        ...(input.investigationRequired
            ? {
                investigationApplicableFor: toProviderRestrictionApplicableFor(
                    Array.isArray(input.investigationApplicableFor)
                        ? input.investigationApplicableFor
                        : [],
                ),
            }
            : {}),
        remark,
    });

    if (!restrictionResult.ok) {
        return {
            ok: false as const,
            inwardNo,
            message: restrictionResult.message ?? "Failed to create blacklist restriction.",
        };
    }

    return {
        ok: true as const,
        inwardNo,
        message:
            restrictionResult.message ??
            launchResult.message ??
            supportingResult.message ??
            uploadResult.message ??
            "File uploaded successfully",
    };
}
