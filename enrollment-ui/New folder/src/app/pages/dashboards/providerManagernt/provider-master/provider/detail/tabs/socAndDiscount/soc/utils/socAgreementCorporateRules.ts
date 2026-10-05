import type { TFunction } from "i18next";
import { parseProviderDate } from "@/app/pages/dashboards/providerManagernt/shared/dateFormat";
import {
  getAgreementNameFlags,
  isSocIcSelectionOptional,
  normalizeAgreementNameKey,
} from "../../../agreement/utils/agreementHelpers";
import type { SocApplicableIc } from "../data/socListData";
import type {
  SocAgreementCorporateValidationInput,
  SocAgreementNavInsurerMapping,
} from "./socConfig";

export type {
  SocAgreementCorporateValidationInput,
  SocCorporateSelection,
} from "./socConfig";

/** Corporate SOC can be checked only for these agreement types. */
export function isSocCorporateEligible(agreementName: string | undefined): boolean {
  const flags = getAgreementNameFlags(agreementName);
  return (
    flags.isTpaBipartite ||
    flags.isInsurerBipartite ||
    flags.isPrivateInsurerTripartite
  );
}

/** Insurer dropdown in SOC Details is shown only when Corporate SOC is checked. */
export function shouldShowSocDetailsInsurerDropdown(
  agreementName: string | undefined,
  isCorporateSoc: boolean,
): boolean {
  return isCorporateSoc && isSocCorporateEligible(agreementName);
}

/** Auto-fill Applicable Insurer table from agreement insurerMappings when present. */
export function shouldAutoPopulateApplicableIcsFromAgreement(): boolean {
  return true;
}

/**
 * Corporate off → all agreement mappings.
 * Corporate on + insurer selected → only that insurer.
 * Corporate on + no insurer → empty (wait for selection).
 */
export function resolveApplicableIcsForCorporateMode(
  mappings: SocAgreementNavInsurerMapping[],
  args: {
    isCorporateSoc: boolean;
    selectedInsurerId: string;
    fallbackEffectiveFrom?: string;
  },
): SocApplicableIc[] {
  const normalized = normalizeSocAgreementInsurerMappings(mappings);
  if (!args.isCorporateSoc) {
    return buildApplicableIcsFromInsurerMappings(
      normalized,
      args.fallbackEffectiveFrom,
    );
  }
  const selectedId = args.selectedInsurerId.trim();
  if (!selectedId) return [];
  return buildApplicableIcsFromInsurerMappings(
    normalized.filter((mapping) => mapping.insurerId === selectedId),
    args.fallbackEffectiveFrom,
  );
}

export function buildApplicableIcsSummaryFromRows(
  rows: SocApplicableIc[],
  t: TFunction,
): string {
  if (rows.length === 1) {
    return t("providerMaster.soc.applicableIc.oneIcSelected");
  }
  if (rows.length > 1) {
    return t("providerMaster.soc.applicableIc.icsSelected", { count: rows.length });
  }
  return "";
}

/**
 * For TPA / Insurer bipartite / Private tripartite, collect insurerMappings from
 * every agreement row with the same agreement name so the insurer dropdown and
 * Applicable IC list are not limited to a single agreement record.
 *
 * Always keeps the selected row's mappings as a baseline so a name-mismatch on
 * siblings cannot wipe the Applicable IC table.
 */
export function collectInsurerMappingsForSelectedAgreement(args: {
  agreementName: string;
  selectedRowMappings: SocAgreementNavInsurerMapping[];
  siblingRows?: Array<{
    agreementName?: string;
    insurerMappings?: SocAgreementNavInsurerMapping[];
    agreementEffectiveFrom?: string;
  }>;
}): SocAgreementNavInsurerMapping[] {
  const trimmedName = args.agreementName.trim();
  const selectedKey = normalizeAgreementNameKey(trimmedName);
  const flags = getAgreementNameFlags(trimmedName);
  const shouldAggregate =
    flags.isTpaBipartite ||
    flags.isInsurerBipartite ||
    flags.isPrivateInsurerTripartite;

  const byId = new Map<string, SocAgreementNavInsurerMapping>();

  const pushMappings = (
    mappings: SocAgreementNavInsurerMapping[] | undefined,
    agreementEffectiveFrom?: string,
  ) => {
    for (const mapping of normalizeSocAgreementInsurerMappings(mappings)) {
      if (byId.has(mapping.insurerId)) continue;
      byId.set(mapping.insurerId, {
        ...mapping,
        mappingEffectiveFrom:
          mapping.mappingEffectiveFrom ||
          agreementEffectiveFrom?.trim() ||
          undefined,
      });
    }
  };

  pushMappings(args.selectedRowMappings);

  if (shouldAggregate) {
    for (const row of args.siblingRows ?? []) {
      const rowName = String(row.agreementName ?? "").trim();
      if (!rowName) continue;
      const sameName =
        rowName === trimmedName ||
        normalizeAgreementNameKey(rowName) === selectedKey;
      if (!sameName) continue;
      pushMappings(row.insurerMappings, row.agreementEffectiveFrom);
    }
  }

  return [...byId.values()];
}

export function normalizeSocAgreementInsurerMappings(
  mappings: SocAgreementNavInsurerMapping[] | undefined,
): SocAgreementNavInsurerMapping[] {
  return (mappings ?? [])
    .map((mapping) => ({
      insurerId: String(mapping.insurerId ?? "").trim(),
      insurerName: String(mapping.insurerName ?? "").trim() || undefined,
      mappingEffectiveFrom:
        String(mapping.mappingEffectiveFrom ?? "").trim() || undefined,
    }))
    .filter((mapping) => mapping.insurerId);
}

export function buildApplicableIcsFromInsurerMappings(
  mappings: SocAgreementNavInsurerMapping[],
  fallbackEffectiveFrom = "",
): SocApplicableIc[] {
  return normalizeSocAgreementInsurerMappings(mappings).map((mapping) => ({
    insurerId: mapping.insurerId,
    insurerName: mapping.insurerName || mapping.insurerId,
    effectiveFrom: mapping.mappingEffectiveFrom || fallbackEffectiveFrom,
  }));
}

export function mapInsurerMappingsToDropdownOptions(
  mappings: SocAgreementNavInsurerMapping[],
): { value: string; label: string }[] {
  return normalizeSocAgreementInsurerMappings(mappings).map((mapping) => ({
    value: mapping.insurerId,
    label: mapping.insurerName || mapping.insurerId,
  }));
}

/** End date is optional; when both set, end must be >= start. */
export function getSocDateRangeError(
  startDate: string,
  endDate: string,
  t: TFunction,
): string | null {
  const D = "providerMaster.soc.details";
  const start = startDate.trim();
  const end = endDate.trim();
  if (!end) return null;
  if (!start) return null;

  const startParsed = parseProviderDate(start);
  const endParsed = parseProviderDate(end);
  if (!startParsed || !endParsed) return null;

  if (endParsed.getTime() < startParsed.getTime()) {
    return t(`${D}.validation.endDateBeforeStart`);
  }
  return null;
}

export type SocSaveValidationInput = SocAgreementCorporateValidationInput & {
  socStartDate: string;
  socEndDate: string;
};

export function validateSocAgreementCorporateSelection(
  input: SocAgreementCorporateValidationInput,
  t: TFunction,
): { ok: true } | { ok: false; message: string } {
  const D = "providerMaster.soc.details";
  const agreementName = input.agreementName.trim();
  if (!agreementName) {
    return { ok: false, message: t(`${D}.validation.agreementRequired`) };
  }

  const hasIc = input.selectedApplicableIcIds.some((id) => id.trim());
  if (!isSocIcSelectionOptional(agreementName) && !hasIc) {
    return { ok: false, message: t(`${D}.validation.insurerRequired`) };
  }

  if (!input.isCorporateSoc) {
    return { ok: true };
  }

  if (!isSocCorporateEligible(agreementName)) {
    return { ok: false, message: t(`${D}.validation.corporateNotAllowed`) };
  }
  if (!input.selectedCorporateInsurerId.trim()) {
    return { ok: false, message: t(`${D}.validation.insurerRequiredForCorporate`) };
  }
  if (input.selectedCorporates.length === 0) {
    return { ok: false, message: t(`${D}.validation.corporateRequired`) };
  }

  return { ok: true };
}

export function validateSocSave(
  input: SocSaveValidationInput,
  t: TFunction,
): { ok: true } | { ok: false; message: string } {
  const D = "providerMaster.soc.details";
  if (!input.socStartDate.trim()) {
    return { ok: false, message: t(`${D}.validation.startDateRequired`) };
  }
  const dateError = getSocDateRangeError(input.socStartDate, input.socEndDate, t);
  if (dateError) {
    return { ok: false, message: dateError };
  }
  return validateSocAgreementCorporateSelection(input, t);
}

export function isSocSaveDisabled(
  input: SocSaveValidationInput,
  t: TFunction,
): boolean {
  return !validateSocSave(input, t).ok;
}
