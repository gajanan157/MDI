import type { DiscountSubtypeMasterRecord } from "@/store/features/discountSubtypeMaster/discountSubtypeMasterTypes";
import type {
  PatchProviderDiscountConfigurationSubtypeDetail,
  ProviderDiscountSubtypeDetail,
} from "@/store/features/providerDiscountConfiguration/providerDiscountConfigurationTypes";
import type { ProviderDiscountTypeDetail } from "@/store/features/providerDiscountConfiguration/providerDiscountConfigurationTypes";
import type { DiscountComponentRow, DiscountFormValues } from "../types/discountTypes";
import { isIpdSelectDiscountType } from "./discountBulkConfig";
import { looksLikeUuid } from "./discountDisplayLabel";
import { resolveDiscountFormTypeValue } from "./mapProviderDiscountConfigurationToListRow";

export type OpdFormBaselineSnapshot = {
  bulkDiscountByType: DiscountFormValues["bulkDiscountByType"];
  opdPercentByKey: Record<string, string>;
  discountTypes: string[];
  opdEnabled: boolean;
  componentDiscounts: DiscountComponentRow[];
};

/** Maps subtype master id → all form keys that refer to the same OPD line item. */
export function buildOpdSubtypeAliasMap(
  records: DiscountSubtypeMasterRecord[],
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  (records ?? []).forEach((row) => {
    const masterId = String(row.id ?? "").trim();
    if (!masterId) return;
    const aliases = new Set<string>([masterId]);
    [row.code, row.value, row.name].forEach((entry) => {
      const trimmed = String(entry ?? "").trim();
      if (trimmed) aliases.add(trimmed);
    });
    map.set(masterId, aliases);
  });
  return map;
}

export function isOpdDiscountTypeDetail(detail: ProviderDiscountTypeDetail): boolean {
  const serviceType = detail.providerServiceType.trim().toUpperCase();
  if (serviceType === "OPD") return true;

  const typeValue = resolveDiscountFormTypeValue(
    detail.providerDiscountTypeName,
    detail.providerDiscountTypeMasterId,
  );
  if (typeValue === "opd") return true;

  return detail.providerDiscountTypeName.trim().toLowerCase().includes("opd");
}

export function enrichOpdAliasMapFromSource(
  details: ProviderDiscountTypeDetail[],
  baseMap: Map<string, Set<string>>,
): Map<string, Set<string>> {
  const map = new Map(baseMap);
  details.forEach((detail) => {
    if (!isOpdDiscountTypeDetail(detail)) return;

    const typeMasterId = detail.providerDiscountTypeMasterId.trim();
    if (typeMasterId && detail.subtypeDetails.length === 0) {
      const aliases = new Set(map.get(typeMasterId) ?? [typeMasterId]);
      aliases.add(detail.providerDiscountTypeName.trim());
      map.set(typeMasterId, aliases);
    }

    detail.subtypeDetails.forEach((subtype) => {
      const masterId = subtype.providerDiscountSubtypeMasterId.trim();
      if (!masterId) return;
      const aliases = new Set(map.get(masterId) ?? [masterId]);
      aliases.add(subtype.providerDiscountSubtypeDetailId.trim());
      aliases.add(subtype.providerDiscountSubtypeName.trim());
      map.set(masterId, aliases);
    });
  });
  return map;
}

export function resolveOpdSubtypeMasterIdForFormKey(
  formKey: string,
  aliasMap: Map<string, Set<string>>,
): string {
  const trimmed = formKey.trim();
  if (!trimmed) return "";
  for (const [masterId, aliases] of aliasMap.entries()) {
    if (aliases.has(trimmed)) return masterId;
  }
  return trimmed;
}

function keysRelatedToOpdMaster(
  masterId: string,
  key: string,
  aliasMap: Map<string, Set<string>>,
): boolean {
  const trimmedKey = key.trim();
  const trimmedMasterId = masterId.trim();
  if (!trimmedKey || !trimmedMasterId) return false;
  if (trimmedKey === trimmedMasterId) return true;
  if (aliasMap.get(trimmedMasterId)?.has(trimmedKey)) return true;
  return resolveOpdSubtypeMasterIdForFormKey(trimmedKey, aliasMap) === trimmedMasterId;
}

/** First non-empty percent among the given alias keys (bulk config, then OPD map). */
function firstAliasPercent(
  aliasKeys: Iterable<string>,
  values: DiscountFormValues,
  opdPercentByKey: Record<string, string>,
): string | undefined {
  for (const key of aliasKeys) {
    const fromBulk = values.bulkDiscountByType[key]?.discountPercent;
    if (String(fromBulk ?? "").trim()) return fromBulk;
    const fromOpd = opdPercentByKey[key];
    if (String(fromOpd ?? "").trim()) return fromOpd;
  }
  return undefined;
}

/** First non-empty percent among `[key, percent]` entries whose key maps to `masterId`. */
function firstRelatedPercent(
  masterId: string,
  entries: Array<[string, string | undefined]>,
  aliasMap: Map<string, Set<string>>,
): string | undefined {
  for (const [key, percent] of entries) {
    if (!keysRelatedToOpdMaster(masterId, key, aliasMap)) continue;
    if (String(percent ?? "").trim()) return percent;
  }
  return undefined;
}

export function resolveFormPercentForOpdSubtype(
  subtypeMasterId: string,
  values: DiscountFormValues,
  opdPercentByKey: Record<string, string>,
  aliasMap: Map<string, Set<string>>,
): string | undefined {
  const masterId = subtypeMasterId.trim();
  if (!masterId) return undefined;

  const aliasKeys = new Set<string>(aliasMap.get(masterId) ?? [masterId]);
  (values.discountTypes ?? []).forEach((typeKey) => {
    if (keysRelatedToOpdMaster(masterId, typeKey, aliasMap)) {
      aliasKeys.add(typeKey.trim());
    }
  });

  const fromAliases = firstAliasPercent(aliasKeys, values, opdPercentByKey);
  if (fromAliases != null) return fromAliases;

  const fromBulk = firstRelatedPercent(
    masterId,
    Object.entries(values.bulkDiscountByType ?? {}).map(
      ([key, config]) => [key, config?.discountPercent] as [string, string | undefined],
    ),
    aliasMap,
  );
  if (fromBulk != null) return fromBulk;

  return firstRelatedPercent(
    masterId,
    Object.entries(opdPercentByKey ?? {}),
    aliasMap,
  );
}

export function resolveBaselinePercentForOpdSubtype(
  subtypeMasterId: string,
  baseline: OpdFormBaselineSnapshot | null | undefined,
  aliasMap: Map<string, Set<string>>,
): string | undefined {
  if (!baseline) return undefined;
  return resolveFormPercentForOpdSubtype(
    subtypeMasterId,
    {
      bulkDiscountByType: baseline.bulkDiscountByType,
      discountTypes: baseline.discountTypes,
      opdEnabled: true,
    } as DiscountFormValues,
    baseline.opdPercentByKey,
    aliasMap,
  );
}

export function isOpdSubtypeFormKey(
  typeKey: string,
  ipdTypeIds: readonly string[],
  aliasMap: Map<string, Set<string>>,
  opdEnabled: boolean,
): boolean {
  const trimmed = typeKey.trim();
  if (!trimmed || !opdEnabled) return false;
  if (trimmed === "individual") return false;
  if (isIpdSelectDiscountType(trimmed, ipdTypeIds)) return false;

  for (const aliases of aliasMap.values()) {
    if (aliases.has(trimmed)) return true;
  }

  if (aliasMap.size === 0) return true;
  if (looksLikeUuid(trimmed)) {
    return !isIpdSelectDiscountType(trimmed, ipdTypeIds);
  }
  return true;
}

export function getSelectedOpdSubtypeFormKeys(
  values: DiscountFormValues,
  ipdTypeIds: readonly string[],
  aliasMap: Map<string, Set<string>>,
): string[] {
  const selected: string[] = [];
  const seenMasterIds = new Set<string>();

  (values.discountTypes ?? []).forEach((typeKey) => {
    if (!isOpdSubtypeFormKey(typeKey, ipdTypeIds, aliasMap, values.opdEnabled)) return;
    const masterId = resolveOpdSubtypeMasterIdForFormKey(typeKey, aliasMap);
    if (!masterId || seenMasterIds.has(masterId)) return;
    seenMasterIds.add(masterId);
    selected.push(typeKey);
  });

  return selected;
}

/** Collects every form key that currently carries OPD subtype selection or percent data. */
export function collectAllOpdFormKeys(
  values: DiscountFormValues,
  opdPercentByKey: Record<string, string>,
  ipdTypeIds: readonly string[],
  aliasMap: Map<string, Set<string>>,
): string[] {
  if (!values.opdEnabled) return [];

  const keys = new Set(getSelectedOpdSubtypeFormKeys(values, ipdTypeIds, aliasMap));
  const considerKey = (typeKey: string) => {
    if (!isOpdSubtypeFormKey(typeKey, ipdTypeIds, aliasMap, values.opdEnabled)) return;
    keys.add(typeKey.trim());
  };

  Object.keys(values.bulkDiscountByType ?? {}).forEach(considerKey);
  Object.keys(opdPercentByKey ?? {}).forEach(considerKey);
  return Array.from(keys);
}

function isOpdSubtypeSelectedAtBaseline(
  masterId: string,
  opdBaseline: OpdFormBaselineSnapshot | null | undefined,
  ipdTypeIds: readonly string[],
  aliasMap: Map<string, Set<string>>,
): boolean {
  if (!opdBaseline?.opdEnabled) return false;
  const baselineKeys = collectAllOpdFormKeys(
    {
      bulkDiscountByType: opdBaseline.bulkDiscountByType,
      discountTypes: opdBaseline.discountTypes,
      opdEnabled: true,
    } as DiscountFormValues,
    opdBaseline.opdPercentByKey,
    ipdTypeIds,
    aliasMap,
  );
  return baselineKeys.some(
    (key) => resolveOpdSubtypeMasterIdForFormKey(key, aliasMap) === masterId,
  );
}

export function findOpdTypeDetail(
  details: ProviderDiscountTypeDetail[],
  opdMasterId = "",
): ProviderDiscountTypeDetail | undefined {
  const explicit = details.find((detail) => isOpdDiscountTypeDetail(detail));
  if (explicit) return explicit;

  const trimmedMasterId = opdMasterId.trim();
  if (!trimmedMasterId) return undefined;

  return details.find(
    (detail) => detail.providerDiscountTypeMasterId.trim() === trimmedMasterId,
  );
}

function parsePercentNumber(raw: string | undefined): number | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed || trimmed === ".") return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizePercentNumber(value: number | null): number | null {
  if (value == null) return null;
  return Math.round(value * 100) / 100;
}

function opdPercentChanged(
  originalRaw: string | undefined,
  currentRaw: string | undefined,
): boolean {
  const left = normalizePercentNumber(parsePercentNumber(originalRaw));
  const right = normalizePercentNumber(parsePercentNumber(currentRaw));
  if (left == null && right == null) return false;
  if (left == null || right == null) return true;
  return left !== right;
}

function resolveSourceSubtypeMasterId(
  subtype: ProviderDiscountSubtypeDetail,
  aliasMap: Map<string, Set<string>>,
): string {
  const masterId = subtype.providerDiscountSubtypeMasterId.trim();
  if (masterId) return masterId;
  return resolveOpdSubtypeMasterIdForFormKey(
    subtype.providerDiscountSubtypeDetailId.trim(),
    aliasMap,
  );
}

export { resolveSourceSubtypeMasterId };

/** Builds OPD subtype PATCH rows by diffing current form state vs the edit-session baseline. */
export function buildOpdSubtypePatchDetails(
  detail: ProviderDiscountTypeDetail,
  values: DiscountFormValues,
  opdPercentByKey: Record<string, string>,
  opdBaseline: OpdFormBaselineSnapshot | null | undefined,
  aliasMap: Map<string, Set<string>>,
  ipdTypeIds: readonly string[],
): PatchProviderDiscountConfigurationSubtypeDetail[] {
  if (!values.opdEnabled) return [];

  const patches: PatchProviderDiscountConfigurationSubtypeDetail[] = [];
  const sourceByMasterId = new Map<string, ProviderDiscountSubtypeDetail>();
  detail.subtypeDetails.forEach((subtype) => {
    const masterId = resolveSourceSubtypeMasterId(subtype, aliasMap);
    if (masterId) sourceByMasterId.set(masterId, subtype);
  });

  const seenMasterIds = new Set<string>();
  const selectedFormKeys = collectAllOpdFormKeys(
    values,
    opdPercentByKey,
    ipdTypeIds,
    aliasMap,
  );
  const opdNewlyEnabled = Boolean(values.opdEnabled && !opdBaseline?.opdEnabled);

  selectedFormKeys.forEach((formKey) => {
    const masterId = resolveOpdSubtypeMasterIdForFormKey(formKey, aliasMap);
    if (!masterId || seenMasterIds.has(masterId)) return;
    seenMasterIds.add(masterId);

    const currentPercentStr = resolveFormPercentForOpdSubtype(
      masterId,
      values,
      opdPercentByKey,
      aliasMap,
    );
    const baselinePercentStr = resolveBaselinePercentForOpdSubtype(
      masterId,
      opdBaseline,
      aliasMap,
    );
    const sourceSubtype = sourceByMasterId.get(masterId);
    const originalPercentStr =
      baselinePercentStr ??
      (sourceSubtype ? String(sourceSubtype.providerDiscountPercentage ?? "") : "");
    const isNewSelection =
      opdNewlyEnabled || !isOpdSubtypeSelectedAtBaseline(masterId, opdBaseline, ipdTypeIds, aliasMap);

    if (!opdPercentChanged(originalPercentStr, currentPercentStr) && !isNewSelection) return;

    const currentPercent = parsePercentNumber(currentPercentStr);
    if (currentPercent == null) return;

    const subtypeDetailId = sourceSubtype?.providerDiscountSubtypeDetailId.trim() ?? "";
    if (subtypeDetailId) {
      patches.push({
        providerDiscountSubtypeDetailId: subtypeDetailId,
        providerDiscountSubTypeMasterId: null,
        providerDiscountPercentage: currentPercent,
      });
      return;
    }

    patches.push({
      providerDiscountSubtypeDetailId: null,
      providerDiscountSubTypeMasterId: masterId,
      providerDiscountPercentage: currentPercent,
    });
  });

  return patches;
}
