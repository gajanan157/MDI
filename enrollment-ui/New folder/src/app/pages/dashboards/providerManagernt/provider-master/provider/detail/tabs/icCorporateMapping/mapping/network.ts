import { readFieldValue } from "../../../utils/readFieldValue";
import { isApiRecord } from "../../../utils/sectionMerges/apiPayloadHelpers";
import { mapApiStatusToDisplay } from "../../agreement/utils/providerAgreementHelpers";
import type { ItemWithIdName } from "../types";

/** Field keys for `GET /v1/provider/{providerId}/network-mapping`. */
export const NETWORK_MAPPING_KEYS = {
  providerNetworkMappingId: "providerNetworkMappingId",
  providerId: "providerId",
  tpaId: "tpaId",
  insurerId: "insurerId",
  providerNetworkIsActive: "providerNetworkIsActive",
  corporateId: "corporateId",
  corporateName: "corporateName",
  insurerName: "insurerName",
  insurerType: "insurerType",
  providerAgreementStatus: "providerAgreementStatus",
  providerAgreementId: "providerAgreementId",
  providerAgreementName: "providerAgreementName",
  providerNetworkSource: "providerNetworkSource",
  providerNetworkMode: "providerNetworkMode",
  providerNetworkTariffType: "providerNetworkTariffType",
  providerNetworkEffectiveFrom: "providerNetworkEffectiveFrom",
  providerNetworkEffectiveTo: "providerNetworkEffectiveTo",
  supportingFileMetadataId: "supportingFileMetadataId",
  inwardNo: "inwardNo",
  insurerProviderCode: "insurerProviderCode",
  remark: "remark",
  providerRestrictionApplicableFor: "providerRestrictionApplicableFor",
  providerRestrictionId: "providerRestrictionId",
  providerBankMatchWithIC: "providerBankMatchWithIC",
  agreementStatus: "agreementStatus",
} as const;

const KEYS = NETWORK_MAPPING_KEYS;

export type NormalizedBankMatchStatus = "matched" | "mismatch" | "pending";

export type NormalizedAgreementStatus = "completed" | "pending" | "active" | "other";

export type NormalizedProviderNetworkMapping = {
  id: string;
  providerNetworkMappingId: string;
  providerId: string;
  tpaId: string;
  insurerId: string;
  providerNetworkIsActive: boolean;
  corporateId: string;
  corporateName: string;
  insurerName: string;
  insurerType: string;
  providerNetworkSource: string;
  networkSource: string;
  providerNetworkMode: string;
  providerNetworkTariffType: string;
  providerNetworkEffectiveFrom: string;
  providerNetworkEffectiveTo: string;
  supportingFileMetadataId: string;
  inwardNo: string;
  insurerProviderCode: string;
  remark: string;
  providerRestrictionApplicableFor: string;
  providerRestrictionId: string;
  providerBankMatchWithIC: string;
  bankMatch: NormalizedBankMatchStatus;
  agreementStatus: NormalizedAgreementStatus;
  agreement: string;
  providerAgreementId: string;
  providerAgreementName: string;
  cashless: boolean;
  reimbursement: boolean;
};

/** Field keys for GET `/v1/provider/{providerId}/identifier`. */
export const PROVIDER_IDENTIFIER_KEYS = {
  identifierValue: "identifierValue",
} as const;

export const PROVIDER_IDENTIFIER_TYPE_INSURER_PROVIDER_CODE = "INSURER_PROVIDER_CODE";

function getString(item: Record<string, unknown>, key: string): string {
  const value = readFieldValue(item, [key]);
  if (value == null) return "";
  return String(value).trim();
}

function parseBoolean(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  const text = String(value ?? "").trim().toLowerCase();
  return text === "true" || text === "yes" || text === "y" || text === "1";
}

export function normalizeBankMatchStatus(raw: string): NormalizedBankMatchStatus {
  const value = raw.trim().toLowerCase().replaceAll("_", " ");
  if (value === "matched") return "matched";
  if (value === "mismatch" || value === "not matched") return "mismatch";
  return "pending";
}

function normalizeAgreementStatus(raw: string): NormalizedAgreementStatus {
  const value = raw.trim().toLowerCase();
  if (!value) return "pending";
  if (value === "completed" || value === "complete") return "completed";
  if (value === "pending") return "pending";
  if (value === "active") return "active";
  return "other";
}

function formatAgreementStatusDisplay(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const mapped = mapApiStatusToDisplay(trimmed);
  if (mapped !== trimmed) return mapped;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function resolveAgreementDisplay(
  apiAgreementStatus: string,
): { agreementStatus: NormalizedAgreementStatus; agreement: string } {
  const status = normalizeAgreementStatus(apiAgreementStatus);
  if (apiAgreementStatus.trim()) {
    return {
      agreementStatus: status,
      agreement: formatAgreementStatusDisplay(apiAgreementStatus),
    };
  }
  return { agreementStatus: "pending", agreement: "" };
}

function readNetworkMappingAgreementStatus(raw: Record<string, unknown>): string {
  const primary = getString(raw, KEYS.agreementStatus);
  if (primary) return primary;
  return getString(raw, KEYS.providerAgreementStatus);
}

/**
 * Grid booleans: `true` = green (available), `false` = red (restricted).
 * `providerRestrictionApplicableFor` marks which claim types the restriction blocks.
 */
function parseRestrictionApplicableForFlags(
  applicableFor: string,
): { cashless: boolean; reimbursement: boolean } {
  const value = applicableFor.trim().toUpperCase();
  if (!value) {
    return { cashless: true, reimbursement: true };
  }
  if (value === "BOTH") {
    return { cashless: false, reimbursement: false };
  }
  if (value === "CASHLESS") {
    return { cashless: false, reimbursement: true };
  }
  if (value === "REIMBURSEMENT") {
    return { cashless: true, reimbursement: false };
  }
  return { cashless: true, reimbursement: true };
}

export function normalizeProviderNetworkMappingRow(
  raw: unknown,
  index: number,
): NormalizedProviderNetworkMapping | null {
  if (!isApiRecord(raw)) return null;

  const providerNetworkMappingId = getString(raw, KEYS.providerNetworkMappingId);
  const insurerId = getString(raw, KEYS.insurerId);
  if (!providerNetworkMappingId && !insurerId) return null;

  const providerNetworkSource = getString(raw, KEYS.providerNetworkSource);
  const providerBankMatchWithIC = getString(raw, KEYS.providerBankMatchWithIC);
  const agreementFields = resolveAgreementDisplay(readNetworkMappingAgreementStatus(raw));
  const providerRestrictionApplicableFor = getString(
    raw,
    KEYS.providerRestrictionApplicableFor,
  );
  const restrictionFlags = parseRestrictionApplicableForFlags(providerRestrictionApplicableFor);

  return {
    id: providerNetworkMappingId || insurerId || `network-mapping-${index}`,
    providerNetworkMappingId,
    providerId: getString(raw, KEYS.providerId),
    tpaId: getString(raw, KEYS.tpaId),
    insurerId,
    providerNetworkIsActive: parseBoolean(readFieldValue(raw, [KEYS.providerNetworkIsActive])),
    corporateId: getString(raw, KEYS.corporateId),
    corporateName: getString(raw, KEYS.corporateName),
    insurerName: getString(raw, KEYS.insurerName),
    insurerType: getString(raw, KEYS.insurerType),
    providerNetworkSource,
    networkSource: providerNetworkSource,
    providerNetworkMode: getString(raw, KEYS.providerNetworkMode),
    providerNetworkTariffType: getString(raw, KEYS.providerNetworkTariffType),
    providerNetworkEffectiveFrom: getString(raw, KEYS.providerNetworkEffectiveFrom),
    providerNetworkEffectiveTo: getString(raw, KEYS.providerNetworkEffectiveTo),
    supportingFileMetadataId: getString(raw, KEYS.supportingFileMetadataId),
    inwardNo: getString(raw, KEYS.inwardNo),
    insurerProviderCode: getString(raw, KEYS.insurerProviderCode),
    remark: getString(raw, KEYS.remark),
    providerRestrictionApplicableFor,
    providerRestrictionId: getString(raw, KEYS.providerRestrictionId),
    providerBankMatchWithIC,
    bankMatch: normalizeBankMatchStatus(providerBankMatchWithIC),
    agreementStatus: agreementFields.agreementStatus,
    agreement: agreementFields.agreement,
    providerAgreementId: getString(raw, KEYS.providerAgreementId),
    providerAgreementName: getString(raw, KEYS.providerAgreementName),
    cashless: restrictionFlags.cashless,
    reimbursement: restrictionFlags.reimbursement,
  };
}

export function normalizeProviderNetworkMappingList(
  items: unknown[],
): NormalizedProviderNetworkMapping[] {
  return items
    .map((item, index) => normalizeProviderNetworkMappingRow(item, index))
    .filter((row): row is NormalizedProviderNetworkMapping => row != null);
}

export function mapNetworkMappingToGridRow(
  row: NormalizedProviderNetworkMapping,
): ItemWithIdName {
  return {
    id: row.id,
    insurerId: row.insurerId,
    insurerType: row.insurerType,
    name: row.insurerName,
    icProviderCode: row.insurerProviderCode,
    networkSource: row.networkSource,
    networkMode: row.providerNetworkMode,
    tariffType: row.providerNetworkTariffType,
    providerNetworkIsActive: row.providerNetworkIsActive,
    cashless: row.cashless,
    reimbursement: row.reimbursement,
    agreement: row.agreement,
    agreementStatus: row.agreementStatus,
    providerAgreementId: row.providerAgreementId,
    providerAgreementName: row.providerAgreementName,
    bankMatch: row.bankMatch,
    providerRestrictionId: row.providerRestrictionId,
    providerNetworkMappingId: row.providerNetworkMappingId,
    providerRestrictionApplicableFor: row.providerRestrictionApplicableFor,
    supportingFileMetadataId: row.supportingFileMetadataId,
    inwardNo: row.inwardNo,
  };
}

export function mapCorporateNetworkMappingToGridRow(
  row: NormalizedProviderNetworkMapping,
): ItemWithIdName {
  return {
    id: row.corporateId || row.providerNetworkMappingId || row.id,
    insurerId: row.insurerId,
    insurerType: row.insurerType,
    name: row.corporateName,
    insuranceCompanyName: row.insurerName,
    icProviderCode: row.insurerProviderCode,
    networkSource: row.networkSource,
    networkMode: row.providerNetworkMode,
    tariffType: row.providerNetworkTariffType,
    providerNetworkIsActive: row.providerNetworkIsActive,
    cashless: row.cashless,
    reimbursement: row.reimbursement,
    agreement: row.agreement,
    agreementStatus: row.agreementStatus,
    providerAgreementId: row.providerAgreementId,
    providerAgreementName: row.providerAgreementName,
    bankMatch: row.bankMatch,
    providerRestrictionId: row.providerRestrictionId,
    providerNetworkMappingId: row.providerNetworkMappingId,
    providerRestrictionApplicableFor: row.providerRestrictionApplicableFor,
    supportingFileMetadataId: row.supportingFileMetadataId,
    inwardNo: row.inwardNo,
  };
}

export function mapCorporateNetworkMappingListToGridRows(
  rows: NormalizedProviderNetworkMapping[],
): ItemWithIdName[] {
  return rows.map((row) => mapCorporateNetworkMappingToGridRow(row));
}

export function mapNetworkMappingListToGridRows(
  rows: NormalizedProviderNetworkMapping[],
): ItemWithIdName[] {
  return rows.map((row) => mapNetworkMappingToGridRow(row));
}

export {
  getNetworkDisplayStatus,
  getNetworkDisplayStatusFromFlags,
  NETWORK_DISPLAY_STATUS,
} from "./networkDisplayStatus";
