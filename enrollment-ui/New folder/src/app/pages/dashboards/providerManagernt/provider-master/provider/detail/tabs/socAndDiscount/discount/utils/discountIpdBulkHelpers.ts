import type {
  NormalizedProviderDiscountConfiguration,
  PatchProviderDiscountConfigurationTypeDetail,
  ProviderDiscountTypeDetail,
} from "@/store/features/providerDiscountConfiguration/providerDiscountConfigurationTypes";
import type { DiscountFormValues } from "../types/discountTypes";
import {
  getSelectedBulkDiscountTypes,
  isIpdSelectDiscountType,
  toProviderPpnFlag,
} from "./discountBulkConfig";
import { looksLikeUuid } from "./discountDisplayLabel";
import { resolveDiscountFormTypeValue } from "./mapProviderDiscountConfigurationToListRow";
import { isOpdDiscountTypeDetail, type OpdFormBaselineSnapshot } from "./discountOpdHelpers";

export type IpdDiscountTypeOption = { value: string; label: string; masterId?: string };

function parsePercent(raw: string | undefined): number | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed || trimmed === ".") return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

export function resolveDiscountTypeMasterId(
  typeValue: string,
  options: IpdDiscountTypeOption[],
): string {
  const match = options.find((option) => option.value === typeValue);
  const masterId = String(match?.masterId ?? "").trim();
  if (masterId) return masterId;
  return looksLikeUuid(typeValue) ? typeValue : "";
}

export function resolveBulkDiscountFormKey(
  typeValue: string,
  masterId: string,
  bulkDiscountByType: DiscountFormValues["bulkDiscountByType"],
  options: IpdDiscountTypeOption[],
): string {
  if (bulkDiscountByType?.[typeValue]) return typeValue;

  const option = options.find(
    (entry) =>
      entry.value === typeValue ||
      entry.masterId === typeValue ||
      entry.masterId === masterId,
  );
  if (option?.value && bulkDiscountByType?.[option.value]) return option.value;

  const canonical = resolveDiscountFormTypeValue("", masterId);
  if (canonical && bulkDiscountByType?.[canonical]) return canonical;

  return typeValue;
}

export function isSourceIpdTypeDetailSelected(
  detail: ProviderDiscountTypeDetail,
  typeValue: string,
  selectedTypes: string[],
  options: IpdDiscountTypeOption[],
): boolean {
  const selected = selectedTypes ?? [];
  if (typeValue === "individual") return selected.includes("individual");
  if (selected.includes(typeValue)) return true;

  const masterId = detail.providerDiscountTypeMasterId.trim();
  if (masterId && selected.includes(masterId)) return true;

  const option = options.find(
    (entry) =>
      entry.value === typeValue ||
      (masterId !== "" && entry.masterId === masterId),
  );
  return Boolean(option?.value && selected.includes(option.value));
}

export function findBulkIpdTypeDetail(
  details: ProviderDiscountTypeDetail[],
  typeValue: string,
  options: IpdDiscountTypeOption[],
): ProviderDiscountTypeDetail | undefined {
  const typeMasterId = resolveDiscountTypeMasterId(typeValue, options);

  return details.find((detail) => {
    if (isOpdDiscountTypeDetail(detail)) return false;
    if (detail.providerServiceType.trim().toUpperCase() === "OPD") return false;

    const detailMasterId = detail.providerDiscountTypeMasterId.trim();
    const resolved = resolveDiscountFormTypeValue(
      detail.providerDiscountTypeName,
      detailMasterId,
    );
    if (resolved === typeValue) return true;
    if (typeMasterId && detailMasterId === typeMasterId) return true;
    return false;
  });
}

function bulkTypeMatchesBaseline(
  typeValue: string,
  values: DiscountFormValues,
  baseline: OpdFormBaselineSnapshot | null | undefined,
): boolean {
  if (!baseline?.discountTypes.includes(typeValue)) return false;

  const currentConfig = values.bulkDiscountByType[typeValue];
  const baselineConfig = baseline.bulkDiscountByType[typeValue];
  const currentPercent = parsePercent(currentConfig?.discountPercent);
  const baselinePercent = parsePercent(baselineConfig?.discountPercent);
  if (currentPercent !== baselinePercent) return false;

  if (typeValue === "package") {
    const currentSoc = String(
      currentConfig?.applicableOn ?? values.socId ?? "",
    ).trim();
    const baselineSoc = String(baselineConfig?.applicableOn ?? "").trim();
    return currentSoc === baselineSoc;
  }

  return true;
}

export function supplementBulkIpdTypeDetailPatches(
  patches: PatchProviderDiscountConfigurationTypeDetail[],
  source: NormalizedProviderDiscountConfiguration,
  args: {
    values: DiscountFormValues;
    ipdDiscountTypeOptions?: IpdDiscountTypeOption[];
    ipdTypeIds?: readonly string[];
    opdBaseline?: OpdFormBaselineSnapshot | null;
  },
): void {
  const options = args.ipdDiscountTypeOptions ?? [];
  const ipdTypeIds = args.ipdTypeIds ?? [];
  const selectedBulkTypes = getSelectedBulkDiscountTypes(args.values.discountTypes).filter(
    (type) => isIpdSelectDiscountType(type, ipdTypeIds),
  );

  selectedBulkTypes.forEach((typeValue) => {
    const existing = findBulkIpdTypeDetail(source.discountTypeDetails, typeValue, options);
    if (existing?.providerDiscountTypeDetailId.trim()) return;

    const bulkConfig = args.values.bulkDiscountByType[typeValue];
    const currentPercent = parsePercent(bulkConfig?.discountPercent);
    if (currentPercent == null) return;

    if (
      typeValue === "package" &&
      !String(bulkConfig?.applicableOn ?? args.values.socId ?? "").trim()
    ) {
      return;
    }

    if (bulkTypeMatchesBaseline(typeValue, args.values, args.opdBaseline)) return;

    const masterId = resolveDiscountTypeMasterId(typeValue, options);
    if (!masterId) return;

    const alreadyPatched = patches.some(
      (patch) =>
        patch.providerDiscountTypeDetailId === null &&
        "providerDiscountTypeMasterId" in patch &&
        patch.providerDiscountTypeMasterId === masterId,
    );
    if (alreadyPatched) return;

    const patch: PatchProviderDiscountConfigurationTypeDetail = {
      providerDiscountTypeDetailId: null,
      providerDiscountTypeMasterId: masterId,
      providerDiscountPercentage: currentPercent,
      providerSocId: null,
      isActive: true,
      subtypeDetails: null,
      inclusions: null,
      exclusions: null,
    };

    if (typeValue === "package") {
      patch.providerSocId =
        String(bulkConfig?.applicableOn ?? args.values.socId ?? "").trim() || null;
      const providerPpnFlag = toProviderPpnFlag(bulkConfig?.ppnVariant);
      if (providerPpnFlag !== undefined) {
        patch.providerPpnFlag = providerPpnFlag;
      }
    }

    patches.push(patch);
  });
}
