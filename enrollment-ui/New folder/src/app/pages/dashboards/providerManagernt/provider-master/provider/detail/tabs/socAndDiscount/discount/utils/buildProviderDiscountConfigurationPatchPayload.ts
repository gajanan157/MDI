import type { DiscountInclusionExclusionMasterRecord } from "@/store/features/discountInclusionExclusionMaster/discountInclusionExclusionMasterTypes";
import type { DiscountSubtypeMasterRecord } from "@/store/features/discountSubtypeMaster/discountSubtypeMasterTypes";
import type {
  NormalizedProviderDiscountConfiguration,
  PatchProviderDiscountConfigurationBody,
  PatchProviderDiscountConfigurationInsurerCorporateMapping,
  PatchProviderDiscountConfigurationTypeDetail,
  ProviderDiscountTypeDetail,
} from "@/store/features/providerDiscountConfiguration/providerDiscountConfigurationTypes";
import type { DiscountComponentRow, DiscountFormValues } from "../types/discountTypes";
import { DISCOUNT_OPD_INCL_EXCL_KEY, resolveMasterIdsFromSelected } from "./discountInclusionExclusionHelpers";
import { toProviderPpnFlag } from "./discountBulkConfig";
import {
  inferSourceCorporateApplicability,
  inferSourceInsurerApplicability,
  resolveCorporateApplicability,
  resolveInsurerApplicability,
} from "./discountInsurerScopeHelpers";
import { excludeInsurersWithConfiguredCorporates } from "./discountScopeHelpers";
import { resolveDiscountFormTypeValue } from "./mapProviderDiscountConfigurationToListRow";
import {
  buildOpdSubtypeAliasMap,
  buildOpdSubtypePatchDetails,
  enrichOpdAliasMapFromSource,
  findOpdTypeDetail,
  isOpdDiscountTypeDetail,
  resolveBaselinePercentForOpdSubtype,
  resolveFormPercentForOpdSubtype,
  type OpdFormBaselineSnapshot,
} from "./discountOpdHelpers";
import {
  buildIndividualSubtypePatchDetails,
  createEmptyIndividualTypeDetail,
  findIndividualTypeDetail,
} from "./discountIpdIndividualHelpers";
import {
  type IpdDiscountTypeOption,
  isSourceIpdTypeDetailSelected,
  resolveBulkDiscountFormKey,
  supplementBulkIpdTypeDetailPatches,
} from "./discountIpdBulkHelpers";

export type BuildProviderDiscountConfigurationPatchPayloadArgs = {
  values: DiscountFormValues;
  componentDiscounts: DiscountComponentRow[];
  opdPercentByKey: Record<string, string>;
  ipdPercentByKey: Record<string, string>;
  inclusionExclusionMasterRecords: DiscountInclusionExclusionMasterRecord[];
  opdSubtypeMasterRecords: DiscountSubtypeMasterRecord[];
  individualSubtypeMasterRecords: DiscountSubtypeMasterRecord[];
  opdBaseline?: OpdFormBaselineSnapshot | null;
  ipdTypeIds?: readonly string[];
  opdMasterId?: string;
  individualMasterId?: string;
  ipdDiscountTypeOptions?: IpdDiscountTypeOption[];
  supportingFileMetadataId?: string;
};

function parsePercent(raw: string | undefined): number | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed || trimmed === ".") return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizePercentNumber(value: number | null): number | null {
  if (value == null) return null;
  return Math.round(value * 100) / 100;
}

function percentChanged(
  original: number | null,
  current: number | null,
): boolean {
  const left = normalizePercentNumber(original);
  const right = normalizePercentNumber(current);
  if (left == null && right == null) return false;
  if (left == null || right == null) return true;
  return left !== right;
}

function percentChangedFromStrings(
  originalRaw: string | undefined,
  currentRaw: string | undefined,
): boolean {
  return percentChanged(parsePercent(originalRaw), parsePercent(currentRaw));
}

function corporateKey(insurerId: string, corporateId: string): string {
  return `${insurerId.trim()}|${corporateId.trim()}`;
}

function buildCurrentCorporateKeys(values: DiscountFormValues): Set<string> {
  const keys = new Set<string>();
  if (values.corporateAll) return keys;
  Object.entries(values.corporateIdsByInsurer).forEach(([insurerId, corporateIds]) => {
    corporateIds.forEach((corporateId) => {
      const key = corporateKey(insurerId, corporateId);
      if (key !== "|") keys.add(key);
    });
  });
  return keys;
}

function deactivateMappingPatch(
  providerInsurerCorporateDiscountId: string,
): PatchProviderDiscountConfigurationInsurerCorporateMapping {
  return {
    providerInsurerCorporateDiscountId,
    insurerId: null,
    corporateId: null,
    isActive: false,
  };
}

/**
 * Insurer ids selected at Step 1 (insurer-level scope, no specific corporate).
 * These are carried as corporate-less `insurerCorporateMappings` rows — the PATCH
 * body never sends a separate `insurerIds` array.
 */
function buildCurrentInsurerOnlyIds(values: DiscountFormValues): Set<string> {
  if (values.insurerAll) return new Set<string>();
  const ids = excludeInsurersWithConfiguredCorporates(
    values.insurerIds ?? [],
    values.corporateIdsByInsurer,
  );
  return new Set(ids);
}

function buildInsurerCorporateMappingPatches(
  source: NormalizedProviderDiscountConfiguration,
  values: DiscountFormValues,
): PatchProviderDiscountConfigurationInsurerCorporateMapping[] {
  const patches: PatchProviderDiscountConfigurationInsurerCorporateMapping[] = [];
  const trackedMappings = source.insurerCorporateMappings.filter(
    (mapping) =>
      mapping.providerInsurerCorporateDiscountId.trim() && mapping.insurerId.trim(),
  );

  // --- Corporate-level rows (insurer + specific corporate) ---
  const originalCorporateMappings = trackedMappings.filter((mapping) =>
    mapping.corporateId.trim(),
  );
  const originalCorporateKeys = new Set(
    originalCorporateMappings.map((mapping) =>
      corporateKey(mapping.insurerId, mapping.corporateId),
    ),
  );
  const currentCorporateKeys = buildCurrentCorporateKeys(values);

  originalCorporateMappings.forEach((mapping) => {
    const key = corporateKey(mapping.insurerId, mapping.corporateId);
    if (!currentCorporateKeys.has(key)) {
      patches.push(
        deactivateMappingPatch(mapping.providerInsurerCorporateDiscountId.trim()),
      );
    }
  });
  currentCorporateKeys.forEach((key) => {
    if (originalCorporateKeys.has(key)) return;
    const [insurerId, corporateId] = key.split("|");
    if (!insurerId || !corporateId) return;
    patches.push({
      providerInsurerCorporateDiscountId: null,
      insurerId,
      corporateId,
      isActive: true,
    });
  });

  // --- Insurer-level rows (insurer only, no corporate) ---
  const originalInsurerOnlyMappings = trackedMappings.filter(
    (mapping) => !mapping.corporateId.trim(),
  );
  const originalInsurerOnlyIds = new Set(
    originalInsurerOnlyMappings.map((mapping) => mapping.insurerId.trim()),
  );
  const currentInsurerOnlyIds = buildCurrentInsurerOnlyIds(values);

  originalInsurerOnlyMappings.forEach((mapping) => {
    if (!currentInsurerOnlyIds.has(mapping.insurerId.trim())) {
      patches.push(
        deactivateMappingPatch(mapping.providerInsurerCorporateDiscountId.trim()),
      );
    }
  });
  currentInsurerOnlyIds.forEach((insurerId) => {
    if (originalInsurerOnlyIds.has(insurerId)) return;
    patches.push({
      providerInsurerCorporateDiscountId: null,
      insurerId,
      corporateId: null,
      isActive: true,
    });
  });

  return patches;
}

function resolveSelectedMasterIds(
  selected: string[],
  records: DiscountInclusionExclusionMasterRecord[],
): Set<string> {
  return new Set(resolveMasterIdsFromSelected(selected, records));
}

function toMasterIdSet(
  selectedMasterIds: Iterable<string> | Set<string> | null | undefined,
): Set<string> {
  if (selectedMasterIds instanceof Set) return selectedMasterIds;
  return new Set(selectedMasterIds ?? []);
}

function buildInclExclPatches(
  detail: ProviderDiscountTypeDetail,
  selectedMasterIdsInput: Iterable<string> | Set<string> | null | undefined,
  kind: "inclusions" | "exclusions",
): NonNullable<PatchProviderDiscountConfigurationTypeDetail["inclusions"]> {
  const selectedMasterIds = toMasterIdSet(selectedMasterIdsInput);
  const patches: NonNullable<
    PatchProviderDiscountConfigurationTypeDetail["inclusions"]
  > = [];
  const existingMasterIds = new Set<string>();
  const isInclusion = kind === "inclusions";

  detail[kind].forEach((item) => {
    const typeId = isInclusion
      ? item.providerDiscountInclusionTypeId.trim()
      : item.providerDiscountExclusionTypeId.trim();
    const masterId = item.providerInclusionExclusionMasterId.trim();
    if (masterId) existingMasterIds.add(masterId);
    if (!typeId || !masterId) return;
    if (selectedMasterIds.has(masterId)) return;
    patches.push(
      isInclusion
        ? {
            providerDiscountInclusionTypeId: typeId,
            providerInclusionExclusionMasterId: null,
            isActive: false,
          }
        : {
            providerDiscountExclusionTypeId: typeId,
            providerInclusionExclusionMasterId: null,
            isActive: false,
          },
    );
  });

  selectedMasterIds.forEach((masterId) => {
    if (existingMasterIds.has(masterId)) return;
    patches.push(
      isInclusion
        ? {
            providerDiscountInclusionTypeId: null,
            providerInclusionExclusionMasterId: masterId,
            isActive: true,
          }
        : {
            providerDiscountExclusionTypeId: null,
            providerInclusionExclusionMasterId: masterId,
            isActive: true,
          },
    );
  });

  return patches;
}

function resolveTypeInclExclKey(detail: ProviderDiscountTypeDetail): string {
  if (isOpdDiscountTypeDetail(detail)) return DISCOUNT_OPD_INCL_EXCL_KEY;
  return (
    resolveDiscountFormTypeValue(
      detail.providerDiscountTypeName,
      detail.providerDiscountTypeMasterId,
    ) || detail.providerDiscountTypeMasterId.trim()
  );
}

function createDeactivatedTypeDetailPatch(
  typeDetailId: string,
): PatchProviderDiscountConfigurationTypeDetail {
  return {
    providerDiscountTypeDetailId: typeDetailId,
    providerDiscountTypeMasterId: null,
    providerDiscountPercentage: null,
    providerSocId: null,
    isActive: false,
    subtypeDetails: null,
    inclusions: null,
    exclusions: null,
  };
}

function createEmptyOpdTypeDetail(opdMasterId: string): ProviderDiscountTypeDetail {
  return {
    providerDiscountTypeDetailId: "",
    providerDiscountTypeMasterId: opdMasterId,
    providerDiscountTypeName: "OPD",
    providerServiceType: "OPD",
    providerDiscountPercentage: null,
    providerDiscountAmount: null,
    providerSocId: "",
    providerSocName: "",
    providerSocCode: "",
    isActive: true,
    subtypeDetails: [],
    inclusions: [],
    exclusions: [],
  };
}

/** Fill the activation fields left `undefined` on a reused type-detail patch. */
function normalizeReusedTypeDetailPatch(
  patch: PatchProviderDiscountConfigurationTypeDetail,
): void {
  patch.providerDiscountTypeMasterId = null;
  if (patch.providerDiscountPercentage === undefined) {
    patch.providerDiscountPercentage = null;
  }
  if (patch.providerSocId === undefined) patch.providerSocId = null;
  patch.isActive = true;
  if (patch.inclusions === undefined) patch.inclusions = null;
  if (patch.exclusions === undefined) patch.exclusions = null;
}

/**
 * Merge freshly built subtype patches into an existing type-detail patch for the
 * same detail/master, or push a new activation patch when there is none.
 */
function mergeSubtypePatchesIntoTypeDetail(
  patches: PatchProviderDiscountConfigurationTypeDetail[],
  masterId: string,
  typeDetailId: string,
  subtypePatches: NonNullable<
    PatchProviderDiscountConfigurationTypeDetail["subtypeDetails"]
  >,
): void {
  const existingPatch = patches.find((patch) => {
    if (typeDetailId && patch.providerDiscountTypeDetailId === typeDetailId) return true;
    return (
      patch.providerDiscountTypeDetailId === null &&
      "providerDiscountTypeMasterId" in patch &&
      patch.providerDiscountTypeMasterId === masterId
    );
  });

  if (existingPatch) {
    if (!existingPatch.subtypeDetails?.length) {
      existingPatch.subtypeDetails = subtypePatches;
    }
    if (existingPatch.providerDiscountTypeDetailId !== null) {
      normalizeReusedTypeDetailPatch(existingPatch);
    }
    return;
  }

  if (!typeDetailId && !masterId) return;

  patches.push({
    providerDiscountTypeDetailId: typeDetailId || null,
    providerDiscountTypeMasterId: typeDetailId ? null : masterId,
    providerDiscountPercentage: null,
    providerSocId: null,
    isActive: true,
    subtypeDetails: subtypePatches,
    inclusions: null,
    exclusions: null,
  });
}

function supplementOpdTypeDetailPatches(
  patches: PatchProviderDiscountConfigurationTypeDetail[],
  source: NormalizedProviderDiscountConfiguration,
  args: BuildProviderDiscountConfigurationPatchPayloadArgs,
  opdAliasMap: Map<string, Set<string>>,
): void {
  if (!args.values.opdEnabled) return;

  const opdMasterId = String(args.opdMasterId ?? "").trim();
  const opdDetail =
    findOpdTypeDetail(source.discountTypeDetails, opdMasterId) ??
    (opdMasterId ? createEmptyOpdTypeDetail(opdMasterId) : undefined);
  if (!opdDetail) return;

  const subtypePatches = buildOpdSubtypePatchDetails(
    opdDetail,
    args.values,
    args.opdPercentByKey,
    args.opdBaseline,
    opdAliasMap,
    args.ipdTypeIds ?? [],
  );
  if (subtypePatches.length === 0) return;

  mergeSubtypePatchesIntoTypeDetail(
    patches,
    opdMasterId,
    opdDetail.providerDiscountTypeDetailId.trim(),
    subtypePatches,
  );
}

function supplementIndividualTypeDetailPatches(
  patches: PatchProviderDiscountConfigurationTypeDetail[],
  source: NormalizedProviderDiscountConfiguration,
  args: BuildProviderDiscountConfigurationPatchPayloadArgs,
): void {
  if (!args.values.discountTypes.includes("individual")) return;

  const individualMasterId = String(args.individualMasterId ?? "").trim();
  const individualDetail =
    findIndividualTypeDetail(source.discountTypeDetails, individualMasterId) ??
    (individualMasterId ? createEmptyIndividualTypeDetail(individualMasterId) : undefined);
  if (!individualDetail) return;

  const subtypePatches = buildIndividualSubtypePatchDetails(
    individualDetail,
    args.values,
    args.componentDiscounts,
    args.opdBaseline,
    args.individualSubtypeMasterRecords,
  );
  if (subtypePatches.length === 0) return;

  mergeSubtypePatchesIntoTypeDetail(
    patches,
    individualMasterId,
    individualDetail.providerDiscountTypeDetailId.trim(),
    subtypePatches,
  );
}

type BulkTypeDetailChanges = {
  nextPercent: number | null | undefined;
  nextSocId: string | null | undefined;
  nextPpnFlag: boolean | undefined;
  hasChanges: boolean;
};

/** Package-only SOC / PPN diffing, folded into `result`. */
function applyPackageSocPpnChanges(
  detail: ProviderDiscountTypeDetail,
  args: BuildProviderDiscountConfigurationPatchPayloadArgs,
  result: BulkTypeDetailChanges,
): void {
  const currentSoc = String(
    args.values.bulkDiscountByType.package?.applicableOn ?? args.values.socId ?? "",
  ).trim();
  if (currentSoc !== detail.providerSocId.trim()) {
    result.nextSocId = currentSoc || null;
    result.hasChanges = true;
  }
  const currentPpnFlag = toProviderPpnFlag(
    args.values.bulkDiscountByType.package?.ppnVariant,
  );
  if (currentPpnFlag !== undefined && currentPpnFlag !== detail.providerPpnFlag) {
    result.nextPpnFlag = currentPpnFlag;
    result.hasChanges = true;
  }
}

/** Percent / SOC / PPN diff for a bulk IPD type (not OPD, not Individual). */
function resolveBulkTypeDetailChanges(
  detail: ProviderDiscountTypeDetail,
  typeValue: string,
  isOpd: boolean,
  args: BuildProviderDiscountConfigurationPatchPayloadArgs,
): BulkTypeDetailChanges {
  const result: BulkTypeDetailChanges = {
    nextPercent: undefined,
    nextSocId: undefined,
    nextPpnFlag: undefined,
    hasChanges: false,
  };
  if (isOpd || typeValue === "individual") return result;

  const formTypeKey = resolveBulkDiscountFormKey(
    typeValue,
    detail.providerDiscountTypeMasterId,
    args.values.bulkDiscountByType,
    args.ipdDiscountTypeOptions ?? [],
  );
  const currentPercent = parsePercent(
    args.values.bulkDiscountByType[formTypeKey]?.discountPercent,
  );
  if (
    percentChanged(detail.providerDiscountPercentage, currentPercent) &&
    currentPercent != null
  ) {
    result.nextPercent = currentPercent;
    result.hasChanges = true;
  }
  if (formTypeKey === "package") {
    applyPackageSocPpnChanges(detail, args, result);
  }
  return result;
}

/** Percent diff for an OPD type that carries its percent directly (no subtypes). */
function resolveOpdNoSubtypePercent(
  detail: ProviderDiscountTypeDetail,
  isOpd: boolean,
  opdAliasMap: Map<string, Set<string>>,
  args: BuildProviderDiscountConfigurationPatchPayloadArgs,
): { nextPercent: number | undefined; hasChanges: boolean } {
  if (!isOpd || detail.subtypeDetails.length !== 0) {
    return { nextPercent: undefined, hasChanges: false };
  }
  const masterId = detail.providerDiscountTypeMasterId.trim();
  const currentPercentStr = resolveFormPercentForOpdSubtype(
    masterId,
    args.values,
    args.opdPercentByKey,
    opdAliasMap,
  );
  const baselinePercentStr =
    resolveBaselinePercentForOpdSubtype(masterId, args.opdBaseline, opdAliasMap) ??
    String(detail.providerDiscountPercentage ?? "");
  const currentPercent = parsePercent(currentPercentStr);
  if (
    percentChangedFromStrings(baselinePercentStr, currentPercentStr) &&
    currentPercent != null
  ) {
    return { nextPercent: currentPercent, hasChanges: true };
  }
  return { nextPercent: undefined, hasChanges: false };
}

/** Current form percent for one source IPD subtype (component row or IPD map). */
function resolveIpdSubtypeCurrentPercent(
  subtype: ProviderDiscountTypeDetail["subtypeDetails"][number],
  typeValue: string,
  args: BuildProviderDiscountConfigurationPatchPayloadArgs,
): string | undefined {
  const subtypeMasterId = subtype.providerDiscountSubtypeMasterId.trim();
  if (typeValue === "individual") {
    const row = args.componentDiscounts.find(
      (entry) =>
        entry.component.trim() === subtypeMasterId ||
        entry.id.trim() === subtype.providerDiscountSubtypeDetailId.trim(),
    );
    if (row?.discountPercent) return row.discountPercent;
  }
  return args.ipdPercentByKey[subtypeMasterId];
}

/** PATCH rows for changed IPD subtype percentages. */
function buildIpdSubtypePatches(
  detail: ProviderDiscountTypeDetail,
  typeValue: string,
  args: BuildProviderDiscountConfigurationPatchPayloadArgs,
): NonNullable<PatchProviderDiscountConfigurationTypeDetail["subtypeDetails"]> {
  const patches: NonNullable<
    PatchProviderDiscountConfigurationTypeDetail["subtypeDetails"]
  > = [];
  detail.subtypeDetails.forEach((subtype) => {
    const subtypeDetailId = subtype.providerDiscountSubtypeDetailId.trim();
    const lookupMasterId =
      subtype.providerDiscountSubtypeMasterId.trim() || subtypeDetailId;
    if (!lookupMasterId || !subtypeDetailId) return;

    const currentPercentStr = resolveIpdSubtypeCurrentPercent(subtype, typeValue, args);
    const originalPercentStr = String(subtype.providerDiscountPercentage ?? "");
    if (!percentChangedFromStrings(originalPercentStr, currentPercentStr)) return;

    const currentPercent = parsePercent(currentPercentStr);
    if (currentPercent == null) return;
    patches.push({
      providerDiscountSubtypeDetailId: subtypeDetailId,
      providerDiscountSubTypeMasterId: null,
      providerDiscountPercentage: currentPercent,
    });
  });
  return patches;
}

/** Inclusion / exclusion PATCH rows for one type detail (skipped for Individual / OPD). */
function resolveTypeInclExclPatches(
  detail: ProviderDiscountTypeDetail,
  args: BuildProviderDiscountConfigurationPatchPayloadArgs,
): {
  inclusionPatches: NonNullable<
    PatchProviderDiscountConfigurationTypeDetail["inclusions"]
  >;
  exclusionPatches: NonNullable<
    PatchProviderDiscountConfigurationTypeDetail["exclusions"]
  >;
} {
  const typeKey = resolveTypeInclExclKey(detail);
  const skip =
    typeKey === "individual" || typeKey === DISCOUNT_OPD_INCL_EXCL_KEY;
  const selectedInclusionIds = skip
    ? new Set<string>()
    : resolveSelectedMasterIds(
        args.values.inclusionByType?.[typeKey] ?? [],
        args.inclusionExclusionMasterRecords,
      );
  const selectedExclusionIds = skip
    ? new Set<string>()
    : resolveSelectedMasterIds(
        args.values.exclusionByType?.[typeKey] ?? [],
        args.inclusionExclusionMasterRecords,
      );
  return {
    inclusionPatches: buildInclExclPatches(detail, selectedInclusionIds, "inclusions"),
    exclusionPatches: buildInclExclPatches(detail, selectedExclusionIds, "exclusions"),
  };
}

/** Final PATCH object for an active type detail with at least one change. */
function assembleTypeDetailPatch(
  typeDetailId: string,
  parts: {
    nextPercent: number | null | undefined;
    nextSocId: string | null | undefined;
    nextPpnFlag: boolean | undefined;
    subtypeDetails: NonNullable<
      PatchProviderDiscountConfigurationTypeDetail["subtypeDetails"]
    >;
    inclusionPatches: NonNullable<
      PatchProviderDiscountConfigurationTypeDetail["inclusions"]
    >;
    exclusionPatches: NonNullable<
      PatchProviderDiscountConfigurationTypeDetail["exclusions"]
    >;
  },
): PatchProviderDiscountConfigurationTypeDetail {
  return {
    providerDiscountTypeDetailId: typeDetailId,
    providerDiscountTypeMasterId: null,
    providerDiscountPercentage:
      parts.nextPercent === undefined ? null : parts.nextPercent,
    providerSocId: parts.nextSocId === undefined ? null : parts.nextSocId,
    isActive: true,
    subtypeDetails: parts.subtypeDetails.length ? parts.subtypeDetails : null,
    inclusions: parts.inclusionPatches.length > 0 ? parts.inclusionPatches : null,
    exclusions: parts.exclusionPatches.length > 0 ? parts.exclusionPatches : null,
    ...(parts.nextPpnFlag === undefined
      ? {}
      : { providerPpnFlag: parts.nextPpnFlag }),
  };
}

/** PATCH row for a single source type detail, or null when nothing changed. */
function buildTypeDetailPatch(
  detail: ProviderDiscountTypeDetail,
  args: BuildProviderDiscountConfigurationPatchPayloadArgs,
  opdAliasMap: Map<string, Set<string>>,
): PatchProviderDiscountConfigurationTypeDetail | null {
  const typeDetailId = detail.providerDiscountTypeDetailId.trim();
  if (!typeDetailId) return null;

  const typeValue = resolveDiscountFormTypeValue(
    detail.providerDiscountTypeName,
    detail.providerDiscountTypeMasterId,
  );
  const isOpd = isOpdDiscountTypeDetail(detail);
  const currentlySelected = isOpd
    ? Boolean(args.values.opdEnabled)
    : isSourceIpdTypeDetailSelected(
        detail,
        typeValue,
        args.values.discountTypes,
        args.ipdDiscountTypeOptions ?? [],
      );

  if (!currentlySelected) {
    if (detail.isActive === false) return null;
    return createDeactivatedTypeDetailPatch(typeDetailId);
  }

  const bulk = resolveBulkTypeDetailChanges(detail, typeValue, isOpd, args);
  const opdPercent = resolveOpdNoSubtypePercent(detail, isOpd, opdAliasMap, args);
  const opdSubtypeDetails = isOpd
    ? buildOpdSubtypePatchDetails(
        detail,
        args.values,
        args.opdPercentByKey,
        args.opdBaseline,
        opdAliasMap,
        args.ipdTypeIds ?? [],
      )
    : [];
  const ipdSubtypePatches = isOpd
    ? []
    : buildIpdSubtypePatches(detail, typeValue, args);
  const { inclusionPatches, exclusionPatches } = resolveTypeInclExclPatches(
    detail,
    args,
  );

  const hasChanges =
    detail.isActive === false ||
    bulk.hasChanges ||
    opdPercent.hasChanges ||
    opdSubtypeDetails.length > 0 ||
    ipdSubtypePatches.length > 0 ||
    inclusionPatches.length > 0 ||
    exclusionPatches.length > 0;
  if (!hasChanges) return null;

  return assembleTypeDetailPatch(typeDetailId, {
    nextPercent:
      opdPercent.nextPercent !== undefined ? opdPercent.nextPercent : bulk.nextPercent,
    nextSocId: bulk.nextSocId,
    nextPpnFlag: bulk.nextPpnFlag,
    subtypeDetails:
      ipdSubtypePatches.length > 0 ? ipdSubtypePatches : opdSubtypeDetails,
    inclusionPatches,
    exclusionPatches,
  });
}

function buildDiscountTypeDetailPatches(
  source: NormalizedProviderDiscountConfiguration,
  args: BuildProviderDiscountConfigurationPatchPayloadArgs,
): PatchProviderDiscountConfigurationTypeDetail[] {
  const patches: PatchProviderDiscountConfigurationTypeDetail[] = [];
  const opdAliasMap = enrichOpdAliasMapFromSource(
    source.discountTypeDetails,
    buildOpdSubtypeAliasMap(args.opdSubtypeMasterRecords),
  );

  source.discountTypeDetails.forEach((detail) => {
    const patch = buildTypeDetailPatch(detail, args, opdAliasMap);
    if (patch) patches.push(patch);
  });

  supplementOpdTypeDetailPatches(patches, source, args, opdAliasMap);
  supplementIndividualTypeDetailPatches(patches, source, args);
  supplementBulkIpdTypeDetailPatches(patches, source, args);

  return patches;
}

/** Builds a PATCH body with only fields that changed vs the loaded configuration row. */
export function buildProviderDiscountConfigurationPatchPayload(
  source: NormalizedProviderDiscountConfiguration,
  args: BuildProviderDiscountConfigurationPatchPayloadArgs,
): PatchProviderDiscountConfigurationBody | null {
  const patch: PatchProviderDiscountConfigurationBody = {};

  if (args.values.effectiveFrom.trim() !== source.providerDiscountEffectiveFrom.trim()) {
    patch.providerDiscountEffectiveFrom = args.values.effectiveFrom.trim();
  }
  if (args.values.effectiveTo.trim() !== source.providerDiscountEffectiveTo.trim()) {
    patch.providerDiscountEffectiveTo = args.values.effectiveTo.trim();
  }
  if (args.values.remarks.trim() !== source.remark.trim()) {
    patch.remark = args.values.remarks.trim();
  }

  const resolvedSupportingFileMetadataId = String(
    args.supportingFileMetadataId ?? args.values.supportingFileMetadataId ?? "",
  ).trim();
  if (
    resolvedSupportingFileMetadataId &&
    resolvedSupportingFileMetadataId !== source.supportingFileMetadataId.trim()
  ) {
    patch.supportingFileMetadataId = resolvedSupportingFileMetadataId;
  }

  // Insurer selection is carried entirely by `insurerCorporateMappings`; the
  // PATCH body never sends a separate `insurerIds` array.
  const insurerApplicability = resolveInsurerApplicability(args.values);
  const originalInsurerApplicability = inferSourceInsurerApplicability(
    source,
    args.values.agreementName,
  );
  if (insurerApplicability !== originalInsurerApplicability) {
    patch.insurerApplicability = insurerApplicability;
  }

  const corporateApplicability = resolveCorporateApplicability(args.values);
  const originalCorporateApplicability = inferSourceCorporateApplicability(source);
  const insurerCorporateMappings = buildInsurerCorporateMappingPatches(source, args.values);
  const discountTypeDetails = buildDiscountTypeDetailPatches(source, args);

  const hasNestedChanges =
    insurerCorporateMappings.length > 0 || discountTypeDetails.length > 0;
  if (
    corporateApplicability !== originalCorporateApplicability ||
    hasNestedChanges ||
    Object.keys(patch).length > 0
  ) {
    patch.corporateApplicability = corporateApplicability;
  }

  if (insurerCorporateMappings.length > 0) {
    patch.insurerCorporateMappings = insurerCorporateMappings;
  }
  if (discountTypeDetails.length > 0) {
    patch.discountTypeDetails = discountTypeDetails;
  }

  if (Object.keys(patch).length === 0) return null;
  return patch;
}
