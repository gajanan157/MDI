import { readFieldValue } from "../../utils/readFieldValue";
import {
  extractNestedApiRows,
  isApiRecord,
} from "../../utils/sectionMerges/apiPayloadHelpers";
import {
  PROVIDER_AGREEMENT_KEYS as KEYS,
  PROVIDER_AGREEMENT_INSURER_MAPPING_KEYS as MAPPING_KEYS,
} from "@/store/features/providerAgreement/providerAgreementTypes";
import type {
  NormalizedProviderAgreement,
  ProviderAgreementInsurerMapping,
} from "@/store/features/providerAgreement/providerAgreementTypes";

function getString(item: Record<string, unknown>, key: string): string {
  const value = readFieldValue(item, [key]);
  if (value == null) return "";
  return String(value).trim();
}

function getNumber(item: Record<string, unknown>, key: string): number {
  const value = readFieldValue(item, [key]);
  if (value == null || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getBoolean(item: Record<string, unknown>, key: string): boolean {
  const value = readFieldValue(item, [key]);
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1) return true;
  if (value === "false" || value === 0) return false;
  return false;
}

/** Maps API SOC/discount flags into Pending | Complete for the agreements grid. */
export function normalizeAgreementSocDiscountStatus(raw: Record<string, unknown>): string {
  const direct = getString(raw, KEYS.socDiscountStatus)
    || getString(raw, "socAndDiscountStatus")
    || getString(raw, "providerSocDiscountStatus")
    || getString(raw, "socStatus");
  const normalized = direct.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (
    normalized === "COMPLETE" ||
    normalized === "COMPLETED" ||
    normalized === "DONE"
  ) {
    return "Complete";
  }
  if (normalized === "PENDING" || normalized === "IN_PROGRESS" || normalized === "INPROGRESS") {
    return "Pending";
  }

  const completedFlag =
    getBoolean(raw, "socDiscountCompleted") ||
    getBoolean(raw, "socAndDiscountCompleted") ||
    getBoolean(raw, "isSocDiscountComplete");
  if (completedFlag) return "Complete";

  return "Pending";
}

function getPpnDisplayName(
  raw: Record<string, unknown>,
  nameKey: string,
  relationKey: string,
): string {
  const directName = getString(raw, nameKey);
  if (directName) return directName;

  const relation = readFieldValue(raw, [relationKey]);
  if (!isApiRecord(relation)) return "";

  return getString(relation, nameKey);
}

function normalizeInsurerMappings(raw: unknown): ProviderAgreementInsurerMapping[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!isApiRecord(entry)) return null;
      const insurerId = getString(entry, MAPPING_KEYS.insurerId);
      if (!insurerId) return null;

      const mappingEffectiveFrom = getString(entry, MAPPING_KEYS.mappingEffectiveFrom);
      const mappingEffectiveTo = getString(entry, MAPPING_KEYS.mappingEffectiveTo);
      const insurerName = getString(entry, MAPPING_KEYS.insurerName);
      const providerAgreementInsurerMappingId = getString(
        entry,
        MAPPING_KEYS.providerAgreementInsurerMappingId,
      );

      return {
        insurerId,
        insurerName: insurerName || undefined,
        mappingEffectiveFrom: mappingEffectiveFrom || undefined,
        mappingEffectiveTo: mappingEffectiveTo || null,
        providerAgreementInsurerMappingId:
          providerAgreementInsurerMappingId || undefined,
        mappingIsActive: getBoolean(entry, MAPPING_KEYS.mappingIsActive),
      };
    })
    .filter((entry): entry is ProviderAgreementInsurerMapping => entry != null);
}

export function normalizeProviderAgreement(raw: unknown): NormalizedProviderAgreement | null {
  if (!isApiRecord(raw)) return null;

  const providerAgreementId = getString(raw, KEYS.providerAgreementId);
  if (!providerAgreementId) return null;

  return {
    providerAgreementId,
    providerId: getString(raw, KEYS.providerId),
    providerGipsaPpnCity: getString(raw, KEYS.providerGipsaPpnCity),
    providerGipsaPpnState: getString(raw, KEYS.providerGipsaPpnState),
    providerGipsaPpnCityName: getPpnDisplayName(
      raw,
      KEYS.providerGipsaPpnCityName,
      KEYS.providerGipsaPpnCity,
    ),
    providerGipsaPpnStateName: getPpnDisplayName(
      raw,
      KEYS.providerGipsaPpnStateName,
      KEYS.providerGipsaPpnState,
    ),
    tpaId: getString(raw, KEYS.tpaId),
    providerAgreementName: getString(raw, KEYS.providerAgreementName),
    providerAgreementType: getString(raw, KEYS.providerAgreementType),
    applicableScope: getString(raw, KEYS.applicableScope),
    providerAgreementStatus: getString(raw, KEYS.providerAgreementStatus),
    providerAgreementEffectiveFrom: getString(raw, KEYS.providerAgreementEffectiveFrom),
    providerAgreementEffectiveTo: getString(raw, KEYS.providerAgreementEffectiveTo),
    providerEmpanellmentDate: getString(raw, KEYS.providerEmpanellmentDate),
    providerAgreementSignedDate: getString(raw, KEYS.providerAgreementSignedDate),
    providerSignatoryName: getString(raw, KEYS.providerSignatoryName),
    providerSignatoryDesignation: getString(raw, KEYS.providerSignatoryDesignation),
    providerAgreementCreditPeriod: getNumber(raw, KEYS.providerAgreementCreditPeriod),
    providerAgreementServicePeriod: getNumber(raw, KEYS.providerAgreementServicePeriod),
    providerAgreementDuration: getNumber(raw, KEYS.providerAgreementDuration),
    providerAgreementVersion: getString(raw, KEYS.providerAgreementVersion),
    providerAgreementCopyAvailableFlag: getBoolean(
      raw,
      KEYS.providerAgreementCopyAvailableFlag,
    ),
    infraAuditDoneFlag: getBoolean(raw, KEYS.infraAuditDoneFlag),
    remark: getString(raw, KEYS.remark),
    fileMetadataId: getString(raw, KEYS.fileMetadataId),
    supportingFileMetadataId: getString(raw, KEYS.supportingFileMetadataId),
    inwardNo: getString(raw, KEYS.inwardNo),
    insurerMappings: normalizeInsurerMappings(
      raw[KEYS.insurerMappings] ??
        raw.providerAgreementInsurerMappings ??
        raw.insurerMappingList,
    ),
    socDiscountStatus: normalizeAgreementSocDiscountStatus(raw),
  };
}

function extractProviderAgreementListItems(raw: unknown): unknown[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (!isApiRecord(raw)) return [];

  if (Array.isArray(raw.data)) return raw.data;

  const dataNode = raw.data;
  if (isApiRecord(dataNode)) {
    if (Array.isArray(dataNode.content)) return dataNode.content;
    if (Array.isArray(dataNode.items)) return dataNode.items;
    if (Array.isArray(dataNode.list)) return dataNode.list;
  }

  return extractNestedApiRows(raw);
}

export function normalizeProviderAgreementList(raw: unknown): NormalizedProviderAgreement[] {
  const items = extractProviderAgreementListItems(raw);
  return items
    .map(normalizeProviderAgreement)
    .filter((row): row is NormalizedProviderAgreement => row != null);
}
