import type { BulkIcMappingRowType } from "../types";

export type BulkIcMappingStagingMainTab = "total" | "process";

export type BulkIcMappingStagingSubTab =
  | "success"
  | "fail"
  | "notFound"
  | "alreadyExist"
  | "newAdd"
  | "newMap"
  | "processingFail";

/** Wire values for `GET /v1/staging-provider-insurer` status filters. */
export const STAGING_PROVIDER_API_STATUS = {
  COMPLETED: "COMPLETED",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  PROCESSING_FAILED: "PROCESSING_FAILED",
  PROCESSED: "PROCESSED",
  MAPPED: "MAPPED",
  ALREADY_MAPPED: "ALREADY_MAPPED",
  CREATED: "CREATED",
  DE_EMPANELLED: "DE_EMPANELLED",
  ALREADY_DE_EMPANELLED: "ALREADY_DE_EMPANELLED",
  NOT_FOUND_FOR_DE_EMPANELMENT: "NOT_FOUND_FOR_DE_EMPANELMENT",
} as const;

export type StagingProviderInsurerListFilter = {
  providerStatus?: string;
  stagingStatus?: string;
};

export function isStagingTotalFailView(
  mainTab: BulkIcMappingStagingMainTab,
  subTab: BulkIcMappingStagingSubTab,
): boolean {
  return mainTab === "total" && subTab === "fail";
}

/** Show Reason column for validation-failed and processing-failed row lists. */
export function shouldShowStagingReasonColumn(
  mainTab: BulkIcMappingStagingMainTab,
  subTab: BulkIcMappingStagingSubTab,
): boolean {
  return (
    isStagingTotalFailView(mainTab, subTab) ||
    (mainTab === "process" && subTab === "processingFail")
  );
}

export function getStagingProviderStatusFilter(
  mainTab: BulkIcMappingStagingMainTab,
  subTab: BulkIcMappingStagingSubTab,
  rowType: BulkIcMappingRowType = "EMPANELMENT",
): StagingProviderInsurerListFilter | undefined {
  const isDeEmpanelment = rowType === "DE_EMPANELMENT";

  if (mainTab === "total") {
    if (subTab === "success") {
      return { stagingStatus: STAGING_PROVIDER_API_STATUS.COMPLETED };
    }
    if (subTab === "fail") {
      return {
        providerStatus: STAGING_PROVIDER_API_STATUS.VALIDATION_FAILED,
      };
    }
    return undefined;
  }

  if (subTab === "notFound") {
    return {
      providerStatus: STAGING_PROVIDER_API_STATUS.NOT_FOUND_FOR_DE_EMPANELMENT,
    };
  }

  if (subTab === "alreadyExist") {
    return {
      providerStatus: isDeEmpanelment
        ? STAGING_PROVIDER_API_STATUS.ALREADY_DE_EMPANELLED
        : STAGING_PROVIDER_API_STATUS.ALREADY_MAPPED,
    };
  }
  if (subTab === "newAdd") {
    return { providerStatus: STAGING_PROVIDER_API_STATUS.CREATED };
  }
  if (subTab === "newMap") {
    return {
      providerStatus: isDeEmpanelment
        ? STAGING_PROVIDER_API_STATUS.DE_EMPANELLED
        : STAGING_PROVIDER_API_STATUS.MAPPED,
    };
  }
  if (subTab === "processingFail") {
    return { providerStatus: STAGING_PROVIDER_API_STATUS.PROCESSING_FAILED };
  }

  return {
    providerStatus: isDeEmpanelment
      ? STAGING_PROVIDER_API_STATUS.DE_EMPANELLED
      : STAGING_PROVIDER_API_STATUS.MAPPED,
  };
}
