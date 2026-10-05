import {
  getPresignDownloadList,
  parsePresignListResponse,
} from "@/services/presignFilesApi";
import { postBlacklistJobLaunch } from "@/store/features/excludedProvider/excludedProviderAPI";
import {
  EXCLUDED_PROVIDER_S3_BUCKET,
  EXCLUDED_PROVIDER_S3_SUB_BUCKET,
  isExcludedProviderListingType,
  type ExcludedProviderListingType,
} from "../config";

export type ProviderExclusionDetailsFormValues = {
  listingType: ExcludedProviderListingType | "";
  blacklistedBy: string;
  uploadIcId: string;
  status: string[];
  investigationRequired: boolean;
  emergencyExceptionAllowed: boolean;
  investigationApplicableFor: string[];
  effectiveFrom: string;
  remark: string;
};

export type ProviderExclusionDetailsSaved = {
  inwardNo: string;
  listingType: ExcludedProviderListingType;
  blacklistedBy: string;
  insurerId: string;
  insurerName: string;
  effectiveFrom: string;
  status: string[];
  investigationRequired: boolean;
  emergencyExceptionAllowed: boolean;
  investigationApplicableFor: string[];
  remark: string;
  sourceEntity: string;
  workflowStatus: string;
};

const STORAGE_PREFIX = "provider-exclusion-inward:";

export function saveProviderExclusionDetails(
  details: ProviderExclusionDetailsSaved,
): void {
  try {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${details.inwardNo}`,
      JSON.stringify(details),
    );
  } catch {
    // ignore
  }
}

export type SubmitProviderExclusionDetailsInput = {
  inwardNo: string;
  form: ProviderExclusionDetailsFormValues;
  insurerName: string;
  sourceEntity: string;
  s3BucketName?: string;
  s3SubBucketName?: string;
  /** Explicit status from StepNavigation (QC reassign / approve). */
  actionType?: "PROCESSOR_PENDING" | "QC_PENDING" | "COMPLETED" | "REASSIGNED";
};

function resolveWorkflowStatus(
  actionType: SubmitProviderExclusionDetailsInput["actionType"],
  isProcessor: boolean,
  isQC: boolean,
): string {
  if (actionType === "PROCESSOR_PENDING") return "PROCESSOR_PENDING";
  if (actionType === "QC_PENDING") return "QC_PENDING";
  if (actionType === "REASSIGNED") return "REASSIGNED";
  if (actionType === "COMPLETED") return "COMPLETED";
  if (isProcessor) return "QC_PENDING";
  if (isQC) return "COMPLETED";
  return "PROCESSOR_PENDING";
}

function readPresignFileMetadataId(record: Record<string, unknown>): string {
  const id = record.fileMetadataId ?? record.id;
  if (typeof id === "string" && id.trim()) return id.trim();
  if (typeof id === "number" && Number.isFinite(id)) return String(id);
  return "";
}

async function resolveExcludedProviderFileMetadataId(
  inwardNo: string,
  s3BucketName?: string,
  s3SubBucketName?: string,
): Promise<{ ok: true; fileMetadataId: string } | { ok: false; message?: string }> {
  const primaryBucket = s3BucketName?.trim() || EXCLUDED_PROVIDER_S3_BUCKET;
  const primarySubBucket = s3SubBucketName?.trim() || EXCLUDED_PROVIDER_S3_SUB_BUCKET;

  const attempts: Array<{
    s3BucketName: string;
    s3SubBucketName?: string;
  }> = [
    { s3BucketName: primaryBucket, s3SubBucketName: primarySubBucket },
    {
      s3BucketName: EXCLUDED_PROVIDER_S3_BUCKET,
      s3SubBucketName: EXCLUDED_PROVIDER_S3_SUB_BUCKET,
    },
    { s3BucketName: EXCLUDED_PROVIDER_S3_BUCKET },
  ];

  const tried = new Set<string>();
  let lastMessage: string | undefined;

  for (const attempt of attempts) {
    const key = `${attempt.s3BucketName}::${attempt.s3SubBucketName ?? ""}`;
    if (tried.has(key)) continue;
    tried.add(key);

    const response = await getPresignDownloadList({
      s3BucketName: attempt.s3BucketName,
      s3SubBucketName: attempt.s3SubBucketName,
      inwardNo,
      page: 0,
      size: 20,
    });

    if (!response.success || response.data == null) {
      lastMessage =
        (typeof response.error === "string" ? response.error : undefined) ??
        (typeof response.message === "string" ? response.message : undefined) ??
        lastMessage;
      continue;
    }

    const parsed = parsePresignListResponse(response.data);
    const firstItem = parsed.items[0];
    if (!firstItem) {
      lastMessage = "No file found for this inward number.";
      continue;
    }

    const fileMetadataId = readPresignFileMetadataId(firstItem);
    if (!fileMetadataId) {
      lastMessage = "File metadata id not found for this inward.";
      continue;
    }

    return { ok: true, fileMetadataId };
  }

  return {
    ok: false,
    message: lastMessage ?? "Failed to load inward file for job launch.",
  };
}

/**
 * Same pattern as IC bulk process Submit:
 * resolve fileMetadataId → POST `/v1/blacklist-job/launch`
 */
export async function submitProviderExclusionDetails(
  input: SubmitProviderExclusionDetailsInput,
  roles: { isProcessor: boolean; isQC: boolean },
) {
  const listingType = String(input.form.listingType ?? "").trim();
  if (!isExcludedProviderListingType(listingType)) {
    return { ok: false as const, message: "Restriction type is required." };
  }
  if (!String(input.form.blacklistedBy ?? "").trim()) {
    return { ok: false as const, message: "Restricted by is required." };
  }
  if (!String(input.form.effectiveFrom ?? "").trim()) {
    return { ok: false as const, message: "Effective from is required." };
  }
  const remark = String(input.form.remark ?? "").trim();
  if (!remark) {
    return { ok: false as const, message: "Remark is required." };
  }

  const blacklistedBy = String(input.form.blacklistedBy).trim().toUpperCase();
  const insurerId = String(input.form.uploadIcId ?? "").trim();
  if (
    (blacklistedBy === "INSURER" || blacklistedBy === "GLOBAL") &&
    !insurerId
  ) {
    return { ok: false as const, message: "Insurer Company is required." };
  }

  const workflowStatus = resolveWorkflowStatus(
    input.actionType,
    roles.isProcessor,
    roles.isQC,
  );

  const fileResult = await resolveExcludedProviderFileMetadataId(
    input.inwardNo,
    input.s3BucketName,
    input.s3SubBucketName,
  );
  if (!fileResult.ok) {
    return {
      ok: false as const,
      message: fileResult.message ?? "Failed to resolve inward file for job launch.",
    };
  }

  const launchResult = await postBlacklistJobLaunch({
    inwardNo: input.inwardNo,
    fileMetadataId: fileResult.fileMetadataId,
    restrictionType: listingType,
    blacklistedBy,
    effectiveFrom: String(input.form.effectiveFrom).trim(),
    insurerId: insurerId || undefined,
    insurerName: input.insurerName || undefined,
    remark,
  });
  if (!launchResult.ok) {
    return {
      ok: false as const,
      message: launchResult.message ?? "Failed to launch blacklist job.",
    };
  }

  return {
    ok: true as const,
    workflowStatus,
    listingType,
    blacklistedBy,
    insurerId,
    insurerName: input.insurerName,
    effectiveFrom: String(input.form.effectiveFrom).trim(),
    status: Array.isArray(input.form.status) ? input.form.status : [],
    investigationRequired: Boolean(input.form.investigationRequired),
    emergencyExceptionAllowed: Boolean(input.form.emergencyExceptionAllowed),
    investigationApplicableFor: Array.isArray(input.form.investigationApplicableFor)
      ? input.form.investigationApplicableFor
      : [],
    remark,
    sourceEntity: input.sourceEntity,
    message: launchResult.message ?? "Blacklist job launched successfully.",
  };
}
