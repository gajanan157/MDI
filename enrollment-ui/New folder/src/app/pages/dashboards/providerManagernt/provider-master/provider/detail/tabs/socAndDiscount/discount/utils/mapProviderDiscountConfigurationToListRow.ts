import { mapApiAgreementTypeToDisplay } from "../../../agreement/utils/providerAgreementHelpers";
import { formatAgreementNameForDisplay } from "../../../../shared/agreementTypeChip.helpers";
import type {
  BulkDiscountTypeConfig,
  DiscountComponentRow,
  DiscountDetailRecord,
  DiscountListRow,
  DiscountNamedItem,
  DiscountTypeViewGroup,
} from "../types/discountTypes";
import type {
  NormalizedProviderDiscountConfiguration,
  ProviderDiscountInclusionExclusion,
  ProviderDiscountTypeDetail,
} from "@/store/features/providerDiscountConfiguration/providerDiscountConfigurationTypes";
import { humanDiscountLabel } from "./discountDisplayLabel";
import { normalizeDiscountStatus } from "./discountStatus";
import { fromProviderPpnFlag } from "./discountBulkConfig";
import {
  CORPORATE_LEVEL_ALL_CORPORATE,
  CORPORATE_LEVEL_ALL_POLICYHOLDER,
  CORPORATE_LEVEL_SELECTED,
  inferInsurerAllFromMappings,
  isAllInsurerLevel,
} from "./discountInsurerScopeHelpers";

function inferInsurerAllFromRow(
  row: NormalizedProviderDiscountConfiguration,
): boolean {
  if (isAllInsurerLevel(row.insurerLevel)) return true;
  if (String(row.insurerLevel ?? "").trim().toUpperCase() === "SELECTED_INSURER") {
    return false;
  }
  return inferInsurerAllFromMappings(row.insurerCorporateMappings);
}

function inferCorporateAllFromRow(
  row: NormalizedProviderDiscountConfiguration,
  hasCorporateSelection: boolean,
): boolean {
  const level = String(row.corporateLevel ?? "").trim().toUpperCase();
  if (level === CORPORATE_LEVEL_SELECTED) return false;
  if (
    level === CORPORATE_LEVEL_ALL_CORPORATE ||
    level === CORPORATE_LEVEL_ALL_POLICYHOLDER
  ) {
    return true;
  }
  return !row.corporateSpecificFlag && !hasCorporateSelection;
}

function uniqueLabels(values: string[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  values.forEach((value) => {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    labels.push(trimmed);
  });
  return labels;
}

function uniqueJoined(values: string[]): string {
  return uniqueLabels(values).join(", ");
}


function lettersOnly(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function resolveDiscountFormTypeValue(name: string, masterId: string): string {
  const nameNorm = lettersOnly(name);
  if (nameNorm.includes("individual")) return "individual";
  if (nameNorm.includes("netbill")) return "netBill";
  if (nameNorm.includes("approvedamount")) return "approvedAmountDiscount";
  if (nameNorm.includes("packagediscount") || nameNorm === "package") return "package";
  if (nameNorm.includes("opd")) return "opd";
  return masterId || name;
}

function formatPercent(value: number | null): string {
  if (value == null) return "";
  return String(value);
}

function isActiveTypeDetail(detail: ProviderDiscountTypeDetail): boolean {
  return detail.isActive !== false;
}

function activeTypeDetails(
  details: ProviderDiscountTypeDetail[],
): ProviderDiscountTypeDetail[] {
  return details.filter(isActiveTypeDetail);
}

function collectInclusionExclusionItemsFromDetail(
  detail: ProviderDiscountTypeDetail,
  kind: "inclusions" | "exclusions",
): DiscountNamedItem[] {
  return collectInclusionExclusionItems([detail], kind);
}

function collectInclusionExclusionByType(
  details: ProviderDiscountTypeDetail[],
  kind: "inclusions" | "exclusions",
): Record<string, string[]> {
  const next: Record<string, string[]> = {};
  details.forEach((detail) => {
    const typeKey = resolveDiscountFormTypeValue(
      detail.providerDiscountTypeName,
      detail.providerDiscountTypeMasterId,
    );
    if (
      !typeKey ||
      typeKey === "individual" ||
      detail.providerServiceType.trim().toUpperCase() === "OPD"
    ) {
      return;
    }
    next[typeKey] = collectInclusionExclusionItemsFromDetail(detail, kind).map(
      (item) => item.id,
    );
  });
  return next;
}

function collectInclusionExclusionItems(
  details: ProviderDiscountTypeDetail[],
  kind: "inclusions" | "exclusions",
): DiscountNamedItem[] {
  const items: DiscountNamedItem[] = [];
  const seen = new Set<string>();
  details.forEach((detail) => {
    detail[kind].forEach((item: ProviderDiscountInclusionExclusion) => {
      const id = item.providerInclusionExclusionMasterId.trim();
      const name = humanDiscountLabel(item.providerInclusionExclusionName, id);
      const key = id || name;
      if (!key || seen.has(key)) return;
      seen.add(key);
      items.push({ id: id || name, name: name || id });
    });
  });
  return items;
}

function toDiscountTypeGroups(
  details: ProviderDiscountTypeDetail[],
): DiscountTypeViewGroup[] {
  return details.map((detail) => {
    const typeName = humanDiscountLabel(
      detail.providerDiscountTypeName,
      detail.providerDiscountTypeMasterId,
    );
    const typeKey = resolveDiscountFormTypeValue(
      detail.providerDiscountTypeName,
      detail.providerDiscountTypeMasterId,
    );
    return {
      serviceType: detail.providerServiceType.trim().toUpperCase(),
      typeKey,
      typeName: typeName || typeKey,
      percent: formatPercent(detail.providerDiscountPercentage),
      subtypes: detail.subtypeDetails.map((subtype) => {
        const subtypeId =
          subtype.providerDiscountSubtypeMasterId.trim() ||
          subtype.providerDiscountSubtypeDetailId.trim();
        const name = humanDiscountLabel(
          subtype.providerDiscountSubtypeName,
          subtypeId,
        );
        return {
          id: subtypeId || name,
          name: name || subtypeId,
          percent: formatPercent(subtype.providerDiscountPercentage),
        };
      }),
      inclusionItems:
        typeKey === "individual" ||
        detail.providerServiceType.trim().toUpperCase() === "OPD"
          ? []
          : collectInclusionExclusionItemsFromDetail(detail, "inclusions"),
      exclusionItems:
        typeKey === "individual" ||
        detail.providerServiceType.trim().toUpperCase() === "OPD"
          ? []
          : collectInclusionExclusionItemsFromDetail(detail, "exclusions"),
      ppnVariant:
        typeKey === "package" ? fromProviderPpnFlag(detail.providerPpnFlag) : "",
      socId: detail.providerSocId.trim(),
      socName:
        humanDiscountLabel(detail.providerSocName, detail.providerSocCode) ||
        detail.providerSocName.trim() ||
        detail.providerSocCode.trim(),
    };
  });
}

export function mapProviderDiscountConfigurationToListRow(
  row: NormalizedProviderDiscountConfiguration,
): DiscountListRow {
  const agreementType = row.providerAgreementType.trim();
  const agreementName =
    formatAgreementNameForDisplay(row.providerAgreementName) ||
    (agreementType ? mapApiAgreementTypeToDisplay(agreementType) : "") ||
    "—";
  // The Insurance Company column lists insurer-level mappings only. Insurers that
  // have a specific corporate mapped are shown in the Corporate column instead.
  const insuranceNames = uniqueLabels(
    row.insurerCorporateMappings
      .filter((mapping) => !mapping.corporateId.trim())
      .map((mapping) => mapping.insurerName),
  ).filter((name) => Boolean(humanDiscountLabel(name)));
  const corporateItems: { name: string; insurerName: string }[] = [];
  const seenCorporate = new Set<string>();
  row.insurerCorporateMappings.forEach((mapping) => {
    const name = mapping.corporateName.trim();
    if (!name) return;
    const key = `${mapping.corporateId || name}|${mapping.insurerId || mapping.insurerName}`;
    if (seenCorporate.has(key)) return;
    seenCorporate.add(key);
    corporateItems.push({
      name,
      insurerName: mapping.insurerName.trim(),
    });
  });

  return {
    id: row.providerDiscountConfigurationId,
    agreementName,
    agreementType: agreementType ? mapApiAgreementTypeToDisplay(agreementType) : "—",
    insuranceCo: insuranceNames.join(", ") || "—",
    insuranceNames,
    corporate: corporateItems.map((item) => item.name).join(", ") || "—",
    corporateItems,
    discountTypes: uniqueJoined(
      activeTypeDetails(row.discountTypeDetails).map(
        (detail) => detail.providerDiscountTypeName,
      ),
    ),
    effectiveFrom: row.providerDiscountEffectiveFrom,
    status: normalizeDiscountStatus(row.providerDiscountStatus),
  };
}

type DiscountDetailAccumulator = {
  discountTypes: string[];
  bulkDiscountByType: Record<string, BulkDiscountTypeConfig>;
  componentDiscounts: DiscountComponentRow[];
  ipdPercentByKey: Record<string, string>;
  opdPercentByKey: Record<string, string>;
};

/** Fold one subtype row into the detail accumulator (IPD component vs OPD type). */
function applySubtypeDetail(
  subtype: ProviderDiscountTypeDetail["subtypeDetails"][number],
  serviceType: string,
  typeValue: string,
  acc: DiscountDetailAccumulator,
): void {
  const subtypeId =
    subtype.providerDiscountSubtypeMasterId.trim() ||
    subtype.providerDiscountSubtypeDetailId.trim();
  const percent = formatPercent(subtype.providerDiscountPercentage);
  if (!subtypeId) return;

  if (serviceType === "OPD") {
    if (!acc.discountTypes.includes(subtypeId)) acc.discountTypes.push(subtypeId);
    acc.opdPercentByKey[subtypeId] = percent;
    if (percent) {
      acc.bulkDiscountByType[subtypeId] = {
        discountPercent: percent,
        applicableOn: "",
      };
    }
    return;
  }

  acc.ipdPercentByKey[subtypeId] = percent;
  if (typeValue === "individual") {
    acc.componentDiscounts.push({
      id: subtype.providerDiscountSubtypeDetailId || subtypeId,
      component: subtypeId,
      discountPercent: percent,
      applicableOn: "",
    });
  }
}

/** Fold one OPD type detail that has no subtypes into the accumulator. */
function applyOpdTypeWithoutSubtypes(
  detail: ProviderDiscountTypeDetail,
  typeValue: string,
  typePercent: string,
  acc: DiscountDetailAccumulator,
): void {
  const opdTypeKey = detail.providerDiscountTypeMasterId.trim() || typeValue;
  if (opdTypeKey && !acc.discountTypes.includes(opdTypeKey)) {
    acc.discountTypes.push(opdTypeKey);
  }
  acc.opdPercentByKey[opdTypeKey] = typePercent;
  acc.bulkDiscountByType[opdTypeKey] = {
    discountPercent: typePercent,
    applicableOn: "",
  };
}

export function mapProviderDiscountConfigurationToDetail(
  row: NormalizedProviderDiscountConfiguration,
): DiscountDetailRecord {
  const insurerAll = inferInsurerAllFromRow(row);
  // Insurers that have a specific corporate mapped belong to the corporate scope
  // (Step 2), not the insurer-company list (Step 1) — keep the two disjoint.
  const insurerIdsWithCorporates = new Set(
    row.insurerCorporateMappings
      .filter((mapping) => mapping.insurerId.trim() && mapping.corporateId.trim())
      .map((mapping) => mapping.insurerId.trim()),
  );
  const insurerIdsFromMappings = row.insurerCorporateMappings.map(
    (mapping) => mapping.insurerId,
  );
  const selectedInsurerIds = (
    row.insurerIds.length > 0 ? row.insurerIds : insurerIdsFromMappings
  ).filter((insurerId) => !insurerIdsWithCorporates.has(String(insurerId).trim()));
  const insurerIds = uniqueLabels(selectedInsurerIds);
  const insuranceNames = uniqueLabels(
    row.insurerCorporateMappings
      .filter((mapping) => !mapping.corporateId.trim())
      .map((mapping) => mapping.insurerName),
  );
  const corporateIdsByInsurer: Record<string, string[]> = {};
  const corporateLabels: string[] = [];
  row.insurerCorporateMappings.forEach((mapping) => {
    const corporateId = mapping.corporateId.trim();
    const insurerId = mapping.insurerId.trim();
    if (!corporateId || !insurerId) return;
    const existing = corporateIdsByInsurer[insurerId] ?? [];
    if (!existing.includes(corporateId)) {
      corporateIdsByInsurer[insurerId] = [...existing, corporateId];
    }
    const corporateName = mapping.corporateName.trim();
    if (corporateName) corporateLabels.push(corporateName);
  });
  const hasCorporateSelection = Object.values(corporateIdsByInsurer).some(
    (ids) => ids.length > 0,
  );
  const discountTypeDetails = activeTypeDetails(row.discountTypeDetails);

  const acc: DiscountDetailAccumulator = {
    discountTypes: [],
    bulkDiscountByType: {},
    componentDiscounts: [],
    ipdPercentByKey: {},
    opdPercentByKey: {},
  };
  let ipdEnabled = false;
  let opdEnabled = false;
  let socId = "";

  discountTypeDetails.forEach((detail) => {
    const serviceType = detail.providerServiceType.trim().toUpperCase();
    const isOpd = serviceType === "OPD";
    const typeValue = resolveDiscountFormTypeValue(
      detail.providerDiscountTypeName,
      detail.providerDiscountTypeMasterId,
    );
    if (isOpd) opdEnabled = true;
    if (serviceType === "IPD") ipdEnabled = true;
    if (!isOpd && typeValue && !acc.discountTypes.includes(typeValue)) {
      acc.discountTypes.push(typeValue);
    }
    if (!socId) socId = detail.providerSocId.trim();

    const typePercent = formatPercent(detail.providerDiscountPercentage);
    if (!isOpd && typeValue !== "individual" && typePercent) {
      acc.bulkDiscountByType[typeValue] = {
        discountPercent: typePercent,
        applicableOn: typeValue === "package" ? detail.providerSocId.trim() : "",
        ppnVariant:
          typeValue === "package" ? fromProviderPpnFlag(detail.providerPpnFlag) : "",
      };
    }
    if (isOpd && detail.subtypeDetails.length === 0 && typePercent) {
      applyOpdTypeWithoutSubtypes(detail, typeValue, typePercent, acc);
    }

    detail.subtypeDetails.forEach((subtype) =>
      applySubtypeDetail(subtype, serviceType, typeValue, acc),
    );
  });

  const {
    discountTypes,
    bulkDiscountByType,
    componentDiscounts,
    ipdPercentByKey,
    opdPercentByKey,
  } = acc;

  const ipdList = discountTypeDetails
    .filter((detail) => detail.providerServiceType.trim().toUpperCase() === "IPD")
    .map((detail) =>
      resolveDiscountFormTypeValue(
        detail.providerDiscountTypeName,
        detail.providerDiscountTypeMasterId,
      ),
    )
    .filter(Boolean);

  const inclusionByType = collectInclusionExclusionByType(
    discountTypeDetails,
    "inclusions",
  );
  const exclusionByType = collectInclusionExclusionByType(
    discountTypeDetails,
    "exclusions",
  );
  const insurerItems = uniqueLabels(
    row.insurerIds.length > 0
      ? row.insurerIds
      : row.insurerCorporateMappings.map((mapping) => mapping.insurerId),
  )
    .filter((insurerId) => !insurerIdsWithCorporates.has(String(insurerId).trim()))
    .map((insurerId) => {
      const mapping = row.insurerCorporateMappings.find(
        (entry) => entry.insurerId.trim() === insurerId,
      );
      const name = humanDiscountLabel(mapping?.insurerName, insurerId);
      return name ? { id: insurerId, name } : { id: insurerId, name: insurerId };
    })
    .filter((item) => Boolean(item.id));
  const corporateItems: DiscountDetailRecord["corporateItems"] = [];
  const seenCorporate = new Set<string>();
  row.insurerCorporateMappings.forEach((mapping) => {
    const corporateId = mapping.corporateId.trim();
    const name = humanDiscountLabel(mapping.corporateName, corporateId);
    if (!name) return;
    const key = `${corporateId || name}|${mapping.insurerId || mapping.insurerName}`;
    if (seenCorporate.has(key)) return;
    seenCorporate.add(key);
    corporateItems.push({
      id: corporateId || name,
      name,
      insurerId: mapping.insurerId.trim(),
      insurerName: humanDiscountLabel(mapping.insurerName, mapping.insurerId),
    });
  });

  const agreementType = row.providerAgreementType.trim();
  const agreementDisplayName = agreementType ? mapApiAgreementTypeToDisplay(agreementType) : "";
  const now = new Date().toISOString();

  return {
    id: row.providerDiscountConfigurationId,
    agreementId: row.providerAgreementId,
    agreementName: row.providerAgreementName.trim() || agreementDisplayName,
    agreementType: agreementDisplayName,
    socId,
    insurerAll,
    insurerIds,
    insurerNames: insuranceNames.join(", "),
    insurerItems,
    corporateInsurerIds: Object.keys(corporateIdsByInsurer),
    corporateIdsByInsurer,
    corporates: uniqueJoined(corporateLabels),
    corporateItems,
    corporateAll: inferCorporateAllFromRow(row, hasCorporateSelection),
    discountTypes,
    bulkDiscountByType,
    ppnDiscount: "",
    inclusionByType,
    exclusionByType,
    discountTypeGroups: toDiscountTypeGroups(discountTypeDetails),
    ipdEnabled,
    ipdList,
    opdEnabled,
    opdList: [],
    additionalDiscountEnabled: false,
    additionalDiscountList: [],
    additionalDiscountPercentByKey: {},
    componentDiscounts,
    ipdPercentByKey,
    opdPercentByKey,
    effectiveFrom: row.providerDiscountEffectiveFrom,
    effectiveTo: row.providerDiscountEffectiveTo,
    remarks: row.remark,
    supportingDocumentName: row.supportingDocumentName || "",
    supportingFileMetadataId: row.supportingFileMetadataId || "",
    status: normalizeDiscountStatus(row.providerDiscountStatus),
    createdAt: now,
    updatedAt: now,
  };
}
