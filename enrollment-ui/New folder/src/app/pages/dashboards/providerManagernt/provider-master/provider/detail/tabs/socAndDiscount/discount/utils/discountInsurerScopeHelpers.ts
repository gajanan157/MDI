import { usesPsuInsurerScopeLabels } from "../../../agreement/utils/agreementHelpers";
import type { NormalizedProviderDiscountConfiguration } from "@/store/features/providerDiscountConfiguration/providerDiscountConfigurationTypes";
import type { DiscountFormValues } from "../types/discountTypes";
import {
  excludeInsurersWithConfiguredCorporates,
  mergeInsurerScopeIds,
} from "./discountScopeHelpers";

export const INSURER_LEVEL_ALL_INSURER = "ALL_INSURER";
export const INSURER_LEVEL_ALL_PSU = "ALL_PSU";
export const INSURER_LEVEL_SELECTED = "SELECTED_INSURER";
export const CORPORATE_LEVEL_SELECTED = "SELECTED_CORPORATE";
export const CORPORATE_LEVEL_ALL_CORPORATE = "ALL_CORPORATE";
/** @deprecated Use CORPORATE_LEVEL_ALL_CORPORATE — kept for legacy API responses. */
export const CORPORATE_LEVEL_ALL_POLICYHOLDER = "ALL_POLICYHOLDER";

function uniqueTrimmedIds(values: string[] | undefined): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  (values ?? []).forEach((value) => {
    const trimmed = String(value ?? "").trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    ids.push(trimmed);
  });
  return ids;
}

export function isAllInsurerLevel(level: string | undefined): boolean {
  const normalized = String(level ?? "").trim().toUpperCase();
  return normalized === INSURER_LEVEL_ALL_INSURER || normalized === INSURER_LEVEL_ALL_PSU;
}

export function resolveInsurerApplicability(values: DiscountFormValues): string {
  if (values.insurerAll) {
    return usesPsuInsurerScopeLabels(values.agreementName)
      ? INSURER_LEVEL_ALL_PSU
      : INSURER_LEVEL_ALL_INSURER;
  }
  return INSURER_LEVEL_SELECTED;
}

export function resolveInsurerLevel(values: DiscountFormValues): string {
  return resolveInsurerApplicability(values);
}

export function resolveInsurerIds(values: DiscountFormValues): string[] {
  // ALL scope: the id list is informational — keep the full merged set.
  if (values.insurerAll) {
    return uniqueTrimmedIds(
      mergeInsurerScopeIds(values.insurerIds, values.corporateIdsByInsurer),
    );
  }
  // SELECTED_INSURER: send only the insurer-level ids. Insurers that have
  // specific corporates are carried by `providerInsurerCorporateDiscount`
  // (create) / corporate-level `insurerCorporateMappings` (patch), never here.
  return uniqueTrimmedIds(
    excludeInsurersWithConfiguredCorporates(
      values.insurerIds,
      values.corporateIdsByInsurer,
    ),
  );
}

export function resolveCorporateApplicability(values: DiscountFormValues): string {
  if (values.corporateAll) return CORPORATE_LEVEL_ALL_CORPORATE;
  return CORPORATE_LEVEL_SELECTED;
}

export function resolveCorporateLevel(values: DiscountFormValues): string {
  return resolveCorporateApplicability(values);
}

export function inferInsurerAllFromMappings(
  mappings: NormalizedProviderDiscountConfiguration["insurerCorporateMappings"],
): boolean {
  return mappings.some((mapping) =>
    isAllInsurerLevel(mapping.insurerCorporateDiscountMappingLevel),
  );
}

export function inferSourceInsurerApplicability(
  source: NormalizedProviderDiscountConfiguration,
  agreementName?: string,
): string {
  if (isAllInsurerLevel(source.insurerLevel)) {
    return String(source.insurerLevel).trim().toUpperCase();
  }
  const normalized = String(source.insurerLevel ?? "").trim().toUpperCase();
  if (normalized === INSURER_LEVEL_SELECTED) return INSURER_LEVEL_SELECTED;
  if (inferInsurerAllFromMappings(source.insurerCorporateMappings)) {
    return usesPsuInsurerScopeLabels(agreementName)
      ? INSURER_LEVEL_ALL_PSU
      : INSURER_LEVEL_ALL_INSURER;
  }
  return INSURER_LEVEL_SELECTED;
}

export function inferSourceInsurerLevel(
  source: NormalizedProviderDiscountConfiguration,
  agreementName?: string,
): string {
  return inferSourceInsurerApplicability(source, agreementName);
}

export function inferSourceInsurerIds(
  source: NormalizedProviderDiscountConfiguration,
): string[] {
  if (source.insurerIds.length > 0) return uniqueTrimmedIds(source.insurerIds);
  return uniqueTrimmedIds(
    source.insurerCorporateMappings.map((mapping) => mapping.insurerId),
  );
}

export function inferSourceCorporateLevel(
  source: NormalizedProviderDiscountConfiguration,
): string {
  return inferSourceCorporateApplicability(source);
}

export function inferSourceCorporateApplicability(
  source: NormalizedProviderDiscountConfiguration,
): string {
  const normalized = String(source.corporateLevel ?? "").trim().toUpperCase();
  if (normalized === CORPORATE_LEVEL_SELECTED) return CORPORATE_LEVEL_SELECTED;
  if (
    normalized === CORPORATE_LEVEL_ALL_CORPORATE ||
    normalized === CORPORATE_LEVEL_ALL_POLICYHOLDER
  ) {
    return CORPORATE_LEVEL_ALL_CORPORATE;
  }
  return source.corporateSpecificFlag
    ? CORPORATE_LEVEL_SELECTED
    : CORPORATE_LEVEL_ALL_CORPORATE;
}

export function insurerIdListsEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((id) => rightSet.has(id));
}
