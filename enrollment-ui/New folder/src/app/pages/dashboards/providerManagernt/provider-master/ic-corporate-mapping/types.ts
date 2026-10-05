/** Bulk IC Mapping upload type — empanel vs de-empanelment. */
export type BulkIcMappingType = "empanel" | "depanelled";

export function resolveBulkIcMappingType(isDepanel: boolean): BulkIcMappingType {
  return isDepanel ? "depanelled" : "empanel";
}

/** API `rowType` for staging list — empanel vs de-empanel rows. */
export type BulkIcMappingRowType = "EMPANELMENT" | "DE_EMPANELMENT";

export function resolveBulkIcMappingRowType(
  mappingType: BulkIcMappingType,
): BulkIcMappingRowType {
  return mappingType === "depanelled" ? "DE_EMPANELMENT" : "EMPANELMENT";
}

export function resolveBulkIcMappingTypeFromRowType(
  rowType: BulkIcMappingRowType,
): BulkIcMappingType {
  return rowType === "DE_EMPANELMENT" ? "depanelled" : "empanel";
}

/** Flat grid rows for IC & Corp Provider Mapping landing. */
export type IcWiseGridRow = {
  id: string;
  providerId: string;
  icId: string;
  icName: string;
  providerName: string;
  providerCode: string;
  rohiniRegistryCode: string;
  category: string;
  providerNetworkSource: string;
  providerNetworkIsActive: string;
  providerNetworkMode: string;
  bankMatch: "matched" | "mismatch" | "pending";
};
