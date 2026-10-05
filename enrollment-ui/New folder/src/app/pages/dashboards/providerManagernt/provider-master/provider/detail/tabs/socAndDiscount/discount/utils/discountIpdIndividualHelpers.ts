import type { DiscountSubtypeMasterRecord } from "@/store/features/discountSubtypeMaster/discountSubtypeMasterTypes";
import type {
  PatchProviderDiscountConfigurationSubtypeDetail,
  ProviderDiscountTypeDetail,
} from "@/store/features/providerDiscountConfiguration/providerDiscountConfigurationTypes";
import type { DiscountComponentRow, DiscountFormValues } from "../types/discountTypes";
import { resolveDiscountFormTypeValue } from "./mapProviderDiscountConfigurationToListRow";
import {
  buildOpdSubtypeAliasMap,
  enrichOpdAliasMapFromSource,
  resolveOpdSubtypeMasterIdForFormKey,
  resolveSourceSubtypeMasterId,
  type OpdFormBaselineSnapshot,
} from "./discountOpdHelpers";

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

function percentChanged(
  originalRaw: string | undefined,
  currentRaw: string | undefined,
): boolean {
  const left = normalizePercentNumber(parsePercentNumber(originalRaw));
  const right = normalizePercentNumber(parsePercentNumber(currentRaw));
  if (left == null && right == null) return false;
  if (left == null || right == null) return true;
  return left !== right;
}

export function isIndividualDiscountTypeDetail(detail: ProviderDiscountTypeDetail): boolean {
  const typeValue = resolveDiscountFormTypeValue(
    detail.providerDiscountTypeName,
    detail.providerDiscountTypeMasterId,
  );
  if (typeValue === "individual") return true;
  return detail.providerDiscountTypeName.trim().toLowerCase().includes("individual");
}

export function findIndividualTypeDetail(
  details: ProviderDiscountTypeDetail[],
  individualMasterId = "",
): ProviderDiscountTypeDetail | undefined {
  const explicit = details.find((detail) => isIndividualDiscountTypeDetail(detail));
  if (explicit) return explicit;

  const trimmedMasterId = individualMasterId.trim();
  if (!trimmedMasterId) return undefined;

  return details.find(
    (detail) => detail.providerDiscountTypeMasterId.trim() === trimmedMasterId,
  );
}

function resolveBaselinePercentForComponent(
  masterId: string,
  baseline: OpdFormBaselineSnapshot | null | undefined,
  aliasMap: Map<string, Set<string>>,
): string | undefined {
  if (!baseline?.componentDiscounts?.length) return undefined;
  const row = baseline.componentDiscounts.find(
    (entry) => resolveOpdSubtypeMasterIdForFormKey(entry.component, aliasMap) === masterId,
  );
  return row?.discountPercent;
}

function isComponentInBaseline(
  masterId: string,
  baseline: OpdFormBaselineSnapshot | null | undefined,
  aliasMap: Map<string, Set<string>>,
): boolean {
  if (!baseline?.componentDiscounts?.length) return false;
  return baseline.componentDiscounts.some(
    (entry) => resolveOpdSubtypeMasterIdForFormKey(entry.component, aliasMap) === masterId,
  );
}

/** Builds individual IPD subtype PATCH rows by diffing component rows vs the edit-session baseline. */
export function buildIndividualSubtypePatchDetails(
  detail: ProviderDiscountTypeDetail,
  values: DiscountFormValues,
  componentDiscounts: DiscountComponentRow[],
  baseline: OpdFormBaselineSnapshot | null | undefined,
  subtypeMasterRecords: DiscountSubtypeMasterRecord[],
): PatchProviderDiscountConfigurationSubtypeDetail[] {
  if (!values.discountTypes.includes("individual")) return [];

  const aliasMap = enrichOpdAliasMapFromSource(
    [detail],
    buildOpdSubtypeAliasMap(subtypeMasterRecords),
  );
  const patches: PatchProviderDiscountConfigurationSubtypeDetail[] = [];
  const sourceByMasterId = new Map<string, (typeof detail.subtypeDetails)[number]>();
  detail.subtypeDetails.forEach((subtype) => {
    const masterId = resolveSourceSubtypeMasterId(subtype, aliasMap);
    if (masterId) sourceByMasterId.set(masterId, subtype);
  });

  const seenMasterIds = new Set<string>();
  const individualNewlySelected =
    values.discountTypes.includes("individual") &&
    !baseline?.discountTypes?.includes("individual");

  componentDiscounts
    .filter((row) => String(row.component ?? "").trim())
    .forEach((row) => {
      const masterId = resolveOpdSubtypeMasterIdForFormKey(row.component, aliasMap);
      if (!masterId || seenMasterIds.has(masterId)) return;
      seenMasterIds.add(masterId);

      const currentPercentStr = row.discountPercent;
      const baselinePercentStr = resolveBaselinePercentForComponent(masterId, baseline, aliasMap);
      const sourceSubtype = sourceByMasterId.get(masterId);
      const originalPercentStr =
        baselinePercentStr ??
        (sourceSubtype ? String(sourceSubtype.providerDiscountPercentage ?? "") : "");
      const isNewComponent =
        individualNewlySelected || !isComponentInBaseline(masterId, baseline, aliasMap);

      if (!percentChanged(originalPercentStr, currentPercentStr) && !isNewComponent) return;

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

export function createEmptyIndividualTypeDetail(
  individualMasterId: string,
): ProviderDiscountTypeDetail {
  return {
    providerDiscountTypeDetailId: "",
    providerDiscountTypeMasterId: individualMasterId,
    providerDiscountTypeName: "Individual",
    providerServiceType: "IPD",
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
