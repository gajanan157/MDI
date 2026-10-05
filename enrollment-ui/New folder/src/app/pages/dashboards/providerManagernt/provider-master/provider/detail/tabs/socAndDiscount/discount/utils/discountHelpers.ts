import type {
  BulkDiscountTypeConfig,
  DiscountComponentRow,
  DiscountDetailRecord,
  DiscountFormValues,
  DiscountListFilters,
  DiscountListRow,
} from "../types/discountTypes";
import {
  hasSupportingDocumentPresent,
} from "../../../icCorporateMapping/shared";
import { usesPsuInsurerScopeLabels, getAgreementNameFlags } from "../../../agreement/utils/agreementHelpers";
import { looksLikeUuid } from "./discountDisplayLabel";
import { DISCOUNT_FORM_DEFAULTS } from "./discountConfig";
import {
  getSelectedBulkDiscountTypes,
  hasConflictingExclusiveIpdDiscountTypes,
  isIpdSelectDiscountType,
  migrateLegacyBulkDiscount,
  normalizeDiscountTypes,
} from "./discountBulkConfig";
import { cloneStringArrayRecord } from "./discountInclusionExclusionHelpers";

function hasSelectedInsurerScope(values: DiscountFormValues): boolean {
  const seen = new Set<string>();
  (values.insurerIds ?? []).forEach((id) => {
    const trimmed = String(id).trim();
    if (trimmed) seen.add(trimmed);
  });
  Object.entries(values.corporateIdsByInsurer ?? {}).forEach(([insurerId, corporateIds]) => {
    const trimmedInsurerId = String(insurerId).trim();
    if (!trimmedInsurerId) return;
    if ((corporateIds ?? []).some((corporateId) => String(corporateId ?? "").trim())) {
      seen.add(trimmedInsurerId);
    }
  });
  return seen.size > 0;
}

function getIpdDiscountTypes(discountTypes: string[], ipdTypeIds?: readonly string[]): string[] {
  return discountTypes.filter((type) => isIpdSelectDiscountType(type, ipdTypeIds));
}

function hasValidPercent(percentRaw: string | undefined): boolean {
  const percent = String(percentRaw ?? "").trim();
  if (!percent || percent === ".") return false;
  const numeric = Number(percent);
  return !Number.isNaN(numeric) && numeric > 0 && numeric <= 100;
}

/** True when the raw string is a complete number that equals zero ("0", "0.0", "0."). */
export function isZeroPercent(percentRaw: string | undefined): boolean {
  const percent = String(percentRaw ?? "").trim();
  if (!percent || percent === ".") return false;
  const numeric = Number(percent);
  return !Number.isNaN(numeric) && numeric === 0;
}

function hasZeroDiscountPercent(
  values: DiscountFormValues,
  componentDiscounts: DiscountComponentRow[],
  opdPercentByKey: Record<string, string>,
): boolean {
  if (
    componentDiscounts.some(
      (row) => row.component.trim() !== "" && isZeroPercent(row.discountPercent),
    )
  ) {
    return true;
  }
  if (
    Object.values(values.bulkDiscountByType ?? {}).some((config) =>
      isZeroPercent(config?.discountPercent),
    )
  ) {
    return true;
  }
  return Object.values(opdPercentByKey ?? {}).some((percent) => isZeroPercent(percent));
}

function getOpdDiscountTypes(
  discountTypes: string[],
  ipdTypeIds?: readonly string[],
): string[] {
  return (discountTypes ?? []).filter(
    (type) =>
      Boolean(type?.trim()) &&
      type !== "individual" &&
      !isIpdSelectDiscountType(type, ipdTypeIds),
  );
}

function collectOpdDiscountTypeKeys(
  values: DiscountFormValues,
  typeSets?: DiscountTypeIdSets,
  opdPercentByKey: Record<string, string> = {},
): string[] {
  const keys = new Set(getOpdDiscountTypes(values.discountTypes, typeSets?.ipdTypeIds));
  const considerKey = (type: string) => {
    const trimmed = type.trim();
    if (!trimmed || trimmed === "individual") return;
    if (isIpdSelectDiscountType(trimmed, typeSets?.ipdTypeIds)) return;
    keys.add(trimmed);
  };
  Object.keys(values.bulkDiscountByType ?? {}).forEach(considerKey);
  Object.keys(opdPercentByKey).forEach(considerKey);
  return Array.from(keys);
}

function hasValidOpdPercentForType(
  type: string,
  bulkDiscountByType: Record<string, BulkDiscountTypeConfig>,
  opdPercentByKey: Record<string, string>,
): boolean {
  return (
    hasValidPercent(bulkDiscountByType[type]?.discountPercent) ||
    hasValidPercent(opdPercentByKey[type])
  );
}

function hasOpdDiscountReady(
  values: DiscountFormValues,
  typeSets?: DiscountTypeIdSets,
  opdPercentByKey: Record<string, string> = {},
): boolean {
  if (!values.opdEnabled) return true;
  const opdTypes = collectOpdDiscountTypeKeys(values, typeSets, opdPercentByKey);
  if (opdTypes.length > 0) {
    return opdTypes.every((type) =>
      hasValidOpdPercentForType(type, values.bulkDiscountByType, opdPercentByKey),
    );
  }
  return (
    hasSavedOpdPercents(values, typeSets) ||
    Object.values(opdPercentByKey).some((percent) => hasValidPercent(percent))
  );
}

function hasIndividualDiscountType(discountTypes: string[]): boolean {
  return discountTypes.includes("individual");
}

/** Digits/decimal only; max 100. Allows intermediate values like "10.". */
export function sanitizeDiscountPercentInput(raw: string): string {
  let cleaned = String(raw ?? "").replaceAll(/[^\d.]/g, "");
  const dotIndex = cleaned.indexOf(".");
  if (dotIndex !== -1) {
    cleaned =
      cleaned.slice(0, dotIndex + 1) + cleaned.slice(dotIndex + 1).replaceAll(".", "");
  }
  if (cleaned === "" || cleaned === ".") return cleaned;

  const numeric = Number(cleaned);
  if (!Number.isNaN(numeric) && numeric > 100) return "100";
  return cleaned;
}

/** Digits only for TAT days. */
export function sanitizeDaysInput(raw: string): string {
  return String(raw ?? "").replaceAll(/\D/g, "");
}

function hasValidComponentDiscountRows(rows: DiscountComponentRow[]): boolean {
  const selected = rows.filter((row) => row.component.trim() !== "");
  if (selected.length === 0) return false;
  return selected.every((row) => {
    const percent = row.discountPercent.trim();
    if (!percent || percent === ".") return false;
    const numeric = Number(percent);
    return !Number.isNaN(numeric) && numeric > 0 && numeric <= 100;
  });
}

function hasValidBulkDiscountConfig(
  discountTypes: string[],
  bulkDiscountByType: Record<string, BulkDiscountTypeConfig>,
  typeSets?: DiscountTypeIdSets,
  agreementName?: string,
): boolean {
  const bulkTypes = getSelectedBulkDiscountTypes(discountTypes).filter((type) =>
    isIpdSelectDiscountType(type, typeSets?.ipdTypeIds),
  );
  if (bulkTypes.length === 0) return true;
  return bulkTypes.every((type) => {
    const config = bulkDiscountByType[type];
    const percent = String(config?.discountPercent ?? "").trim();
    if (!percent || percent === ".") return false;
    const numeric = Number(percent);
    if (Number.isNaN(numeric) || numeric <= 0 || numeric > 100) return false;
    if (type === "package" && !String(config?.applicableOn ?? "").trim()) return false;
    if (
      type === "package" &&
      getAgreementNameFlags(agreementName).isGipsaPpnTripartite &&
      config?.ppnVariant !== "ppn" &&
      config?.ppnVariant !== "nonPpn"
    ) {
      return false;
    }
    return true;
  });
}

function formatDiscountTypesForList(
  discountTypes: string[],
  labelByValue: Record<string, string>,
): string {
  if (discountTypes.length === 0) return "—";
  return discountTypes
    .map((type) => labelByValue[type] ?? type)
    .filter(Boolean)
    .join(", ");
}

function matchesText(value: string, filter: string): boolean {
  const q = filter.trim().toLowerCase();
  if (!q) return true;
  return value.toLowerCase().includes(q);
}

function cloneBulkDiscountByType(
  source: Record<string, BulkDiscountTypeConfig> | undefined,
): Record<string, BulkDiscountTypeConfig> {
  const next: Record<string, BulkDiscountTypeConfig> = {};
  Object.entries(source ?? {}).forEach(([type, config]) => {
    next[type] = { ...config };
  });
  return next;
}

export function toDiscountListRow(
  detail: DiscountDetailRecord,
  labelByValue: Record<string, string> = {},
): DiscountListRow {
  return {
    id: detail.id,
    agreementName: detail.agreementName || detail.agreementType || "—",
    agreementType: detail.agreementType || detail.agreementName || "—",
    insuranceCo: detail.insurerAll
      ? usesPsuInsurerScopeLabels(detail.agreementName)
        ? "All PSUs"
        : "All ICs"
      : detail.insurerNames || "—",
    corporate: detail.corporateAll
      ? "All policyholders"
      : detail.corporates || "—",
    discountTypes: formatDiscountTypesForList(detail.discountTypes, labelByValue),
    effectiveFrom: detail.effectiveFrom,
    status: detail.status,
    insuranceNames: detail.insurerItems?.map((item) => item.name).filter(Boolean),
    corporateItems: detail.corporateItems?.map((item) => ({
      name: item.name,
      insurerName: item.insurerName ?? "",
    })),
  };
}

export function filterDiscountRows(
  rows: DiscountListRow[],
  filters: DiscountListFilters,
): DiscountListRow[] {
  return rows.filter((row) => {
    const agreementQuery = filters.agreementName || filters.agreementType;
    if (!matchesText(`${row.agreementName} ${row.agreementType}`, agreementQuery)) return false;
    if (!matchesText(row.insuranceCo, filters.insuranceCo)) return false;
    if (!matchesText(row.corporate, filters.corporate)) return false;
    if (!matchesText(row.discountTypes, filters.discountTypes)) return false;
    const status = filters.status.trim();
    if (status && row.status !== status) return false;
    return true;
  });
}

export function formValuesFromDetail(detail: DiscountDetailRecord): DiscountFormValues {
  const corporateIdsByInsurer: Record<string, string[]> = {};
  Object.entries(detail.corporateIdsByInsurer ?? {}).forEach(([insurerId, ids]) => {
    corporateIdsByInsurer[insurerId] = [...ids];
  });

  const legacyDetail = detail as DiscountDetailRecord & {
    discountType?: string | string[];
    discountPercentSingle?: string;
    discountApplicableOn?: string;
  };

  const discountTypes = normalizeDiscountTypes(
    detail.discountTypes ?? legacyDetail.discountType,
  );
  const namedSubtypeIds = new Set<string>();
  (detail.discountTypeGroups ?? []).forEach((group) => {
    group.subtypes.forEach((subtype) => {
      if (subtype.id) namedSubtypeIds.add(subtype.id);
    });
  });
  (detail.componentDiscounts ?? []).forEach((row) => {
    if (row.component) namedSubtypeIds.add(row.component);
  });
  if (detail.opdEnabled) {
    Object.keys(detail.bulkDiscountByType ?? {}).forEach((typeKey) => {
      if (typeKey.trim()) namedSubtypeIds.add(typeKey);
    });
    Object.keys(detail.opdPercentByKey ?? {}).forEach((typeKey) => {
      if (typeKey.trim()) namedSubtypeIds.add(typeKey);
    });
  }
  const selectedDiscountTypes = discountTypes.filter((type) => {
    if (!looksLikeUuid(type)) return true;
    return namedSubtypeIds.has(type);
  });
  const socId = detail.socId ?? "";
  const bulkDiscountByType = migrateLegacyBulkDiscount(
    selectedDiscountTypes,
    legacyDetail.discountPercentSingle,
    legacyDetail.discountApplicableOn,
    detail.bulkDiscountByType,
  );
  if (selectedDiscountTypes.includes("package") && socId && !String(bulkDiscountByType.package?.applicableOn ?? "").trim()) {
    bulkDiscountByType.package = {
      ...(bulkDiscountByType.package ?? { discountPercent: "" }),
      applicableOn: socId,
    };
  }

  return {
    agreementId: detail.agreementId ?? "",
    agreementName: detail.agreementName,
    agreementType: detail.agreementType,
    socId,
    insurerAll: detail.insurerAll ?? false,
    insurerIds: [...detail.insurerIds],
    corporateInsurerIds: [...(detail.corporateInsurerIds ?? [])],
    corporateIdsByInsurer,
    corporateAll: detail.corporateAll,
    discountTypes: selectedDiscountTypes,
    bulkDiscountByType,
    ppnDiscount: detail.ppnDiscount,
    inclusionByType: cloneStringArrayRecord(detail.inclusionByType),
    exclusionByType: cloneStringArrayRecord(detail.exclusionByType),
    opdEnabled: detail.opdEnabled,
    opdList: [...detail.opdList],
    ipdEnabled: detail.ipdEnabled ?? false,
    ipdList: [...(detail.ipdList ?? [])],
    additionalDiscountEnabled: detail.additionalDiscountEnabled,
    additionalDiscountList: [...detail.additionalDiscountList],
    effectiveFrom: detail.effectiveFrom,
    effectiveTo: detail.effectiveTo ?? "",
    remarks: detail.remarks,
    supportingDocumentName: detail.supportingDocumentName ?? "",
    supportingFileMetadataId: detail.supportingFileMetadataId ?? "",
  };
}

export function createEmptyDiscountDetail(id = "new"): DiscountDetailRecord {
  const now = new Date().toISOString();
  return {
    id,
    ...DISCOUNT_FORM_DEFAULTS,
    insurerNames: "",
    corporates: "",
    componentDiscounts: [],
    opdPercentByKey: {},
    ipdPercentByKey: {},
    additionalDiscountPercentByKey: {},
    status: "Pending",
    createdAt: now,
    updatedAt: now,
  };
}

export type DiscountTypeIdSets = {
  ipdTypeIds?: readonly string[];
  opdTypeIds?: readonly string[];
};

function hasSavedOpdPercents(
  values: DiscountFormValues,
  typeSets?: DiscountTypeIdSets,
): boolean {
  return Object.entries(values.bulkDiscountByType ?? {}).some(([type, config]) => {
    if (isIpdSelectDiscountType(type, typeSets?.ipdTypeIds)) return false;
    return hasValidPercent(config?.discountPercent);
  });
}

function isDiscountServiceSelectionIncomplete(
  values: DiscountFormValues,
  typeSets?: DiscountTypeIdSets,
  opdPercentByKey: Record<string, string> = {},
  componentDiscounts: DiscountComponentRow[] = [],
): boolean {
  if (values.ipdEnabled) {
    const ipdTypes = getIpdDiscountTypes(values.discountTypes, typeSets?.ipdTypeIds);
    const hasIndividual =
      hasIndividualDiscountType(values.discountTypes) ||
      componentDiscounts.some((row) => row.component.trim() !== "");
    const hasIpdBulk = Object.keys(values.bulkDiscountByType ?? {}).some((type) =>
      isIpdSelectDiscountType(type, typeSets?.ipdTypeIds),
    );
    const hasIpdSubtypePercents = Object.entries(values.bulkDiscountByType ?? {}).some(
      ([type, config]) =>
        isIpdSelectDiscountType(type, typeSets?.ipdTypeIds) &&
        hasValidPercent(config?.discountPercent),
    );
    if (ipdTypes.length === 0 && !hasIndividual && !hasIpdBulk && !hasIpdSubtypePercents) {
      return true;
    }
  }
  if (values.opdEnabled && !hasOpdDiscountReady(values, typeSets, opdPercentByKey)) {
    return true;
  }
  if (!values.ipdEnabled && !values.opdEnabled) {
    return true;
  }
  return false;
}

export function isDiscountSaveDisabled(
  values: DiscountFormValues,
  componentDiscounts: DiscountComponentRow[] = [],
  typeSets?: DiscountTypeIdSets,
  opdPercentByKey: Record<string, string> = {},
  supportingDocumentFile: File | null = null,
  supportingDocumentUploading = false,
): boolean {
  return (
    getDiscountSaveBlockMessage(
      values,
      componentDiscounts,
      typeSets,
      opdPercentByKey,
      supportingDocumentFile,
      supportingDocumentUploading,
    ) != null
  );
}

/** Discount-type / percentage validation portion of the save-block cascade. */
function getDiscountServiceBlockMessage(
  values: DiscountFormValues,
  componentDiscounts: DiscountComponentRow[],
  typeSets: DiscountTypeIdSets | undefined,
  opdPercentByKey: Record<string, string>,
): string | null {
  if (hasZeroDiscountPercent(values, componentDiscounts, opdPercentByKey)) {
    return "Discount percentage must be greater than 0%.";
  }
  if (
    isDiscountServiceSelectionIncomplete(
      values,
      typeSets,
      opdPercentByKey,
      componentDiscounts,
    )
  ) {
    if (!values.ipdEnabled && !values.opdEnabled) {
      return "Select at least one service type (IPD or OPD).";
    }
    return "Enter a discount percentage for every selected discount type.";
  }
  if (hasConflictingExclusiveIpdDiscountTypes(values.discountTypes)) {
    return "Net Bill, Approved Amount and Package discounts cannot be selected together — choose one.";
  }
  if (
    hasIndividualDiscountType(values.discountTypes) &&
    !hasValidComponentDiscountRows(componentDiscounts)
  ) {
    return "Add at least one component with a discount percentage for Individual Discount.";
  }
  if (
    !hasValidBulkDiscountConfig(
      values.discountTypes,
      values.bulkDiscountByType,
      typeSets,
      values.agreementName,
    )
  ) {
    return "Complete the discount percentage (and SOC / PPN where required) for every selected discount type.";
  }
  return null;
}

/** Insurer / corporate scope validation portion of the save-block cascade. */
function getDiscountScopeBlockMessage(values: DiscountFormValues): string | null {
  if (!values.insurerAll && !hasSelectedInsurerScope(values)) {
    return "Select at least one insurance company in Step 1, or configure a corporate for one in Step 2.";
  }
  if (!values.corporateAll) {
    const hasAnyCorporate = Object.values(values.corporateIdsByInsurer ?? {}).some(
      (corporateIds) => (corporateIds ?? []).some((id) => String(id ?? "").trim()),
    );
    if (!hasAnyCorporate) {
      return "Select an insurance company and at least one corporate under it in Step 2.";
    }
  }
  return null;
}

/**
 * Human-readable reason the discount form can't be saved yet, or null when it
 * can. Mirrors {@link isDiscountSaveDisabled} so the two never disagree.
 */
export function getDiscountSaveBlockMessage(
  values: DiscountFormValues,
  componentDiscounts: DiscountComponentRow[] = [],
  typeSets?: DiscountTypeIdSets,
  opdPercentByKey: Record<string, string> = {},
  supportingDocumentFile: File | null = null,
  supportingDocumentUploading = false,
): string | null {
  if (supportingDocumentUploading) {
    return "Please wait for the supporting document upload to finish.";
  }
  if (!values.agreementId.trim()) {
    return "Select an agreement name.";
  }

  const serviceMessage = getDiscountServiceBlockMessage(
    values,
    componentDiscounts,
    typeSets,
    opdPercentByKey,
  );
  if (serviceMessage) return serviceMessage;

  if (!values.effectiveFrom.trim()) {
    return "Select the effective from date.";
  }
  if (!values.remarks.trim()) {
    return "Add remarks.";
  }
  if (
    !hasSupportingDocumentPresent({
      supportingDocument: supportingDocumentFile,
      supportingFileMetadataId: values.supportingFileMetadataId,
      supportingDocumentName: values.supportingDocumentName,
    })
  ) {
    return "Upload a supporting document.";
  }

  return getDiscountScopeBlockMessage(values);
}

export function cloneBulkDiscountByTypeForStore(
  source: Record<string, BulkDiscountTypeConfig> | undefined,
): Record<string, BulkDiscountTypeConfig> {
  return cloneBulkDiscountByType(source);
}
