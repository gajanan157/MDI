import {
  STAGING_ADDITIONAL_DATA_ROW_TYPE_KEYS,
  STAGING_PROVIDER_INSURER_ADDITIONAL_DATA_KEYS as COUNT_KEYS,
  STAGING_PROVIDER_INSURER_API_KEYS as KEYS,
} from "./keys";
import type { BulkIcMappingRowType } from "../types";

export type NormalizedStagingProviderInsurerRow = {
  id: string;
  insurerId: string;
  providerName: string;
  providerIibRohiniCode: string;
  providerStatus: string;
  providerStatusReason: string;
  providerAddress: string;
  providerAddressCity: string;
  providerAddressState: string;
  providerAddressPostalCode: string;
  rowType: string;
  providerNetworkEffectiveFrom: string;
};

export type BulkIcMappingStagingGridRow = NormalizedStagingProviderInsurerRow & {
  uiSerialNo: number;
};

export type NormalizedStagingProviderInsurerCounts = {
  totalReceived: number;
  validCount: number;
  invalidCount: number;
  pendingCount: number;
  processedCount: number;
  validationFailedCount: number;
  processingFailedCount: number;
  mappedCount: number;
  alreadyMappedCount: number;
  createdCount: number;
  /** De-empanelment: providers missing from master (`notFoundForDeEmpanelmentCount`). */
  notFoundForDeEmpanelmentCount: number;
  deEmpanelledCount: number;
  alreadyDeEmpanelledCount: number;
};

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) return "";
  return String(value).trim();
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value = Number(record[key]);
  return Number.isFinite(value) ? value : 0;
}

function hasDeEmpanelmentCountKeys(record: Record<string, unknown>): boolean {
  return (
    record[COUNT_KEYS.deEmpanelledCount] != null ||
    record[COUNT_KEYS.notFoundForDeEmpanelmentCount] != null ||
    record[COUNT_KEYS.alreadyDeEmpanelledCount] != null
  );
}

/** De-empanel counts often sit on `additionalData` root; empanel counts use nested `empanelment`. */
function resolveStagingCountSource(
  additionalData: Record<string, unknown>,
  rowType: BulkIcMappingRowType,
): Record<string, unknown> {
  const nestedKey =
    rowType === "DE_EMPANELMENT"
      ? STAGING_ADDITIONAL_DATA_ROW_TYPE_KEYS.deEmpanelment
      : STAGING_ADDITIONAL_DATA_ROW_TYPE_KEYS.empanelment;
  const nested = additionalData[nestedKey];
  const nestedRecord = isApiRecord(nested) ? nested : null;

  if (rowType === "DE_EMPANELMENT") {
    if (hasDeEmpanelmentCountKeys(additionalData)) {
      return nestedRecord ? { ...additionalData, ...nestedRecord } : additionalData;
    }
    return nestedRecord ?? additionalData;
  }

  return nestedRecord ?? additionalData;
}

export function normalizeStagingProviderInsurerRow(
  item: unknown,
): NormalizedStagingProviderInsurerRow | null {
  if (!isApiRecord(item)) return null;

  const id = readString(item, KEYS.stagingProviderInsurerId);
  if (!id) return null;

  return {
    id,
    insurerId: readString(item, KEYS.insurerId),
    providerName: readString(item, KEYS.providerName),
    providerIibRohiniCode: readString(item, KEYS.providerIibRohiniCode),
    providerStatus: readString(item, KEYS.providerStatus),
    providerStatusReason: readString(item, KEYS.providerStatusReason),
    providerAddress: readString(item, KEYS.providerAddress),
    providerAddressCity: readString(item, KEYS.providerAddressCity),
    providerAddressState: readString(item, KEYS.providerAddressState),
    providerAddressPostalCode: readString(item, KEYS.providerAddressPostalCode),
    rowType: readString(item, KEYS.rowType),
    providerNetworkEffectiveFrom: readString(item, KEYS.providerNetworkEffectiveFrom),
  };
}

export function normalizeStagingProviderInsurerList(
  items: unknown[],
): NormalizedStagingProviderInsurerRow[] {
  return items
    .map((item) => normalizeStagingProviderInsurerRow(item))
    .filter((row): row is NormalizedStagingProviderInsurerRow => row != null);
}

export function normalizeStagingProviderInsurerCounts(
  additionalData: unknown,
  rowType: BulkIcMappingRowType = "EMPANELMENT",
): NormalizedStagingProviderInsurerCounts {
  const empty: NormalizedStagingProviderInsurerCounts = {
    totalReceived: 0,
    validCount: 0,
    invalidCount: 0,
    pendingCount: 0,
    processedCount: 0,
    validationFailedCount: 0,
    processingFailedCount: 0,
    mappedCount: 0,
    alreadyMappedCount: 0,
    createdCount: 0,
    notFoundForDeEmpanelmentCount: 0,
    deEmpanelledCount: 0,
    alreadyDeEmpanelledCount: 0,
  };

  if (!isApiRecord(additionalData)) {
    return empty;
  }

  const source = resolveStagingCountSource(additionalData, rowType);

  const base = {
    totalReceived: readNumber(source, COUNT_KEYS.totalReceived),
    validCount: readNumber(source, COUNT_KEYS.validCount),
    invalidCount: readNumber(source, COUNT_KEYS.invalidCount),
    pendingCount: readNumber(source, COUNT_KEYS.pendingCount),
    processedCount: readNumber(source, COUNT_KEYS.processedCount),
    validationFailedCount: readNumber(source, COUNT_KEYS.validationFailedCount),
    processingFailedCount: readNumber(source, COUNT_KEYS.processingFailedCount),
    mappedCount: readNumber(source, COUNT_KEYS.mappedCount),
    alreadyMappedCount: readNumber(source, COUNT_KEYS.alreadyMappedCount),
    createdCount: readNumber(source, COUNT_KEYS.createdCount),
  };

  if (rowType !== "DE_EMPANELMENT") {
    return {
      ...base,
      notFoundForDeEmpanelmentCount: 0,
      deEmpanelledCount: 0,
      alreadyDeEmpanelledCount: 0,
    };
  }

  return {
    ...base,
    notFoundForDeEmpanelmentCount: readNumber(
      source,
      COUNT_KEYS.notFoundForDeEmpanelmentCount,
    ),
    deEmpanelledCount: readNumber(source, COUNT_KEYS.deEmpanelledCount),
    alreadyDeEmpanelledCount: readNumber(source, COUNT_KEYS.alreadyDeEmpanelledCount),
  };
}
