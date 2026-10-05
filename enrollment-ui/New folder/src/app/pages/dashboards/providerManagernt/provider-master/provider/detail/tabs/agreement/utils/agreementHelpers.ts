import { useCallback, useMemo, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import {
  fetchProviderGipsaPpnCityOptions,
  fetchProviderGipsaPpnStateOptions,
} from "@/store/features/providerAgreement/providerAgreementSlice";
import type { InsurerDropdownOption } from "../hooks/useAgreementInsurer";
import {
  buildTripartiteInsurerOptions,
  normalizeSelectedIcIds,
} from "../hooks/useAgreementInsurer";

export const BIPARTITE_AGREEMENT_NAMES = new Set([
  "INSURER_PROVIDER_BIPARTITE",
  "TPA_PROVIDER_BIPARTITE",
]);

const TRIPARTITE_AGREEMENT_NAME_KEYS = new Set([
  "PSU_TRIPARTITE",
  "GIPSA_PPN_TRIPARTITE",
  "GIC_STANDARD_AGREEMENT",
  "PRIVATE_INSURER_TRIPARTITE",
]);

const AGREEMENT_NAME_SUFFIX = "_AGREEMENT";

function isKnownAgreementNameKey(key: string): boolean {
  return BIPARTITE_AGREEMENT_NAMES.has(key) || TRIPARTITE_AGREEMENT_NAME_KEYS.has(key);
}

/**
 * Dropdown options append `_AGREEMENT` (e.g. GIPSA_PPN_TRIPARTITE_AGREEMENT) while
 * scope rules use canonical keys (GIPSA_PPN_TRIPARTITE). Normalize once here.
 */
export function normalizeAgreementNameKey(
  agreementName: string | undefined,
): string {
  const key = String(agreementName ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s–—-]+/g, "_")
    .replace(/_+/g, "_");
  if (
    key.endsWith(`${AGREEMENT_NAME_SUFFIX}${AGREEMENT_NAME_SUFFIX}`)
  ) {
    return key.slice(0, -AGREEMENT_NAME_SUFFIX.length);
  }
  if (key.endsWith(AGREEMENT_NAME_SUFFIX)) {
    const withoutSuffix = key.slice(0, -AGREEMENT_NAME_SUFFIX.length);
    if (isKnownAgreementNameKey(withoutSuffix)) {
      return withoutSuffix;
    }
  }
  return key;
}

export type AgreementNameFlags = {
  agreementNameKey: string;
  isTpaBipartite: boolean;
  isInsurerBipartite: boolean;
  isPsuTripartite: boolean;
  isGipsaPpnTripartite: boolean;
  isGicStandard: boolean;
  isPrivateInsurerTripartite: boolean;
  selectedIcSingleMode: boolean;
};

export function getAgreementNameFlags(
  agreementName: string | undefined,
): AgreementNameFlags {
  const agreementNameKey = normalizeAgreementNameKey(agreementName);
  const isInsurerBipartite = agreementNameKey === "INSURER_PROVIDER_BIPARTITE";

  return {
    agreementNameKey,
    isTpaBipartite: agreementNameKey === "TPA_PROVIDER_BIPARTITE",
    isInsurerBipartite,
    isPsuTripartite: agreementNameKey === "PSU_TRIPARTITE",
    isGipsaPpnTripartite: agreementNameKey === "GIPSA_PPN_TRIPARTITE",
    isGicStandard: agreementNameKey === "GIC_STANDARD_AGREEMENT",
    isPrivateInsurerTripartite: agreementNameKey === "PRIVATE_INSURER_TRIPARTITE",
    selectedIcSingleMode: isInsurerBipartite,
  };
}

/**
 * SOC: Insurer–Provider Bipartite and Private Insurer Tripartite do not require
 * a separate insurer-company selection before continuing.
 */
export function isSocIcSelectionOptional(agreementName: string | undefined): boolean {
  const flags = getAgreementNameFlags(agreementName);
  return flags.isInsurerBipartite || flags.isPrivateInsurerTripartite;
}

/** PPN State/City row is shown only for PSU and GIPSA PPN tripartite agreements. */
export function usesPpnStateCityFields(
  flags: Pick<AgreementNameFlags, "isGipsaPpnTripartite" | "isPsuTripartite">,
): boolean {
  return flags.isGipsaPpnTripartite || flags.isPsuTripartite;
}

/** Discount Step 1 labels insurers as PSU (not IC) for GIPSA PPN and PSU Tripartite. */
export function usesPsuInsurerScopeLabels(agreementName: string | undefined): boolean {
  return usesPpnStateCityFields(getAgreementNameFlags(agreementName));
}

/** GIPSA PPN Tripartite discount: All PSU + All policyholders only. */
export function isGipsaPpnDiscountScopeLocked(agreementName: string | undefined): boolean {
  return getAgreementNameFlags(agreementName).isGipsaPpnTripartite;
}

/**
 * GIC Standard discount: the insurer step (All IC / Selected IC) is shown, but
 * the corporate step is hidden and forced to All policyholders.
 */
export function isGicStandardDiscountScopeHidden(
  agreementName: string | undefined,
): boolean {
  return getAgreementNameFlags(agreementName).isGicStandard;
}

/** Discount corporate step (Step 2) is hidden — GIC Standard is All policyholders only. */
export function isDiscountCorporateStepHidden(
  agreementName: string | undefined,
): boolean {
  return getAgreementNameFlags(agreementName).isGicStandard;
}

/** GIPSA PPN forces All insurers + All policyholders (both scope steps locked). */
export function isAllInsurerAllPolicyholderDiscountScope(
  agreementName: string | undefined,
): boolean {
  return getAgreementNameFlags(agreementName).isGipsaPpnTripartite;
}

/** GIC Standard forces All policyholders only; the insurer step stays user-selectable. */
export function isAllPolicyholderOnlyDiscountScope(
  agreementName: string | undefined,
): boolean {
  return getAgreementNameFlags(agreementName).isGicStandard;
}

/** Insurer–Provider Bipartite has a single IC; discount Step 1 is hidden and auto-filled. */
export function isInsurerBipartiteDiscountScopeHidden(
  agreementName: string | undefined,
): boolean {
  return getAgreementNameFlags(agreementName).isInsurerBipartite;
}

/** Post-create confirmation when GIC/GIPSA auto-mapping of active ICs succeeded. */
export type GicGipsaMappingSuccessKind = "gic" | "gipsa";

export function resolveGicGipsaMappingSuccessKind(
  agreementName: string | undefined,
  insurerMappingCount: number,
): GicGipsaMappingSuccessKind | null {
  if (insurerMappingCount <= 0) return null;

  const flags = getAgreementNameFlags(agreementName);
  if (flags.isGicStandard) return "gic";
  if (flags.isGipsaPpnTripartite) return "gipsa";
  return null;
}

/** POST/PATCH include `providerGipsaPpnCity` / `providerGipsaPpnState` only for these agreements. */
export function shouldSendProviderGipsaPpnFields(
  agreementName: string | undefined,
): boolean {
  return usesPpnStateCityFields(getAgreementNameFlags(agreementName));
}

/** PSU Tripartite sends PPN state only — never include PPN city in the API payload. */
export function shouldSendProviderGipsaPpnCity(
  agreementName: string | undefined,
): boolean {
  const flags = getAgreementNameFlags(agreementName);
  return flags.isGipsaPpnTripartite && !flags.isPsuTripartite;
}

/** PSU Tripartite sends PPN state. GIPSA sends state only when a value is present; otherwise null. */
export function shouldSendProviderGipsaPpnState(
  agreementName: string | undefined,
): boolean {
  const flags = getAgreementNameFlags(agreementName);
  return flags.isPsuTripartite && !flags.isGipsaPpnTripartite;
}

export type PpnCheckValidationScope = "both" | "state-only" | "city-only";

/** PSU tripartite validates PPN state only; GIPSA validates PPN city only. */
export function resolvePpnCheckValidationScope(
  flags: Pick<AgreementNameFlags, "isGipsaPpnTripartite" | "isPsuTripartite">,
): PpnCheckValidationScope {
  if (flags.isPsuTripartite && !flags.isGipsaPpnTripartite) {
    return "state-only";
  }
  if (flags.isGipsaPpnTripartite) {
    return "city-only";
  }
  return "both";
}

export function resolveEmpanelmentDateLabelKey(
  flags: Pick<AgreementNameFlags, "isGicStandard" | "isGipsaPpnTripartite">,
):
  | "providerMaster.agreement.fields.gicInceptionDate"
  | "providerMaster.agreement.fields.ppnInceptionDate"
  | "providerMaster.agreement.fields.dateOfEmpanelment" {
  if (flags.isGicStandard) {
    return "providerMaster.agreement.fields.gicInceptionDate";
  }
  if (flags.isGipsaPpnTripartite) {
    return "providerMaster.agreement.fields.ppnInceptionDate";
  }
  return "providerMaster.agreement.fields.dateOfEmpanelment";
}

export function shouldDisableEmpanelmentDateEditing(mode: "create" | "edit"): boolean {
  return mode === "edit";
}

/** Selected ICs radio + dropdown only for these agreement names. */
export function usesSelectedIcScopeSelection(
  flags: Pick<
    AgreementNameFlags,
    "isPsuTripartite" | "isInsurerBipartite" | "isPrivateInsurerTripartite"
  >,
): boolean {
  return (
    flags.isPsuTripartite ||
    flags.isInsurerBipartite ||
    flags.isPrivateInsurerTripartite
  );
}

/** PSU Tripartite and GIC Standard show remarks in the next column beside applicable scope. */
export function shouldShowRemarksBesideApplicableScope(
  flags: Pick<AgreementNameFlags, "isPsuTripartite" | "isGicStandard">,
): boolean {
  return flags.isPsuTripartite || flags.isGicStandard;
}

/** GIPSA PPN, Private Insurer Tripartite, and Insurer–Provider Bipartite show remarks full width below the form columns. */
export function shouldShowRemarksFullWidth(
  flags: Pick<
    AgreementNameFlags,
    "isGipsaPpnTripartite" | "isInsurerBipartite" | "isPrivateInsurerTripartite"
  >,
): boolean {
  return (
    flags.isGipsaPpnTripartite ||
    flags.isInsurerBipartite ||
    flags.isPrivateInsurerTripartite
  );
}

/**
 * Hide Applicable Scope IC involvement list in create/edit unless the agreement
 * already has mapped ICs (from API `insurerMappings` / selected ids).
 */
export function shouldHideScopeIcList(
  mode: "create" | "edit" = "create",
  flags?: Pick<AgreementNameFlags, "isGicStandard">,
  mappedIcCount = 0,
): boolean {
  if (mode === "edit" && mappedIcCount > 0) return false;
  if (mode === "edit" && flags?.isGicStandard) return false;
  return true;
}

/** Hide Applicable Scope on new agreement until agreement name is chosen, or for auto-scoped names. */
export function shouldHideApplicableScopeSection(
  mode: "create" | "edit",
  flags: Pick<
    AgreementNameFlags,
    "isTpaBipartite" | "isGipsaPpnTripartite" | "isGicStandard"
  >,
  agreementName?: string,
): boolean {
  if (mode !== "create") return false;
  if (!String(agreementName ?? "").trim()) return true;
  return (
    flags.isTpaBipartite ||
    flags.isGipsaPpnTripartite ||
    flags.isGicStandard
  );
}

export function resolveAgreementTypeFromName(
  agreementName: string | undefined,
): "bipartite" | "tripartite" {
  const key = normalizeAgreementNameKey(agreementName);
  if (!key) return "bipartite";
  if (key === "GIC_STANDARD_AGREEMENT") return "bipartite";
  return BIPARTITE_AGREEMENT_NAMES.has(key) ? "bipartite" : "tripartite";
}

export function isPsuInsurerLabel(label: string): boolean {
  const normalized = label.toLowerCase();
  return (
    normalized.includes("national insurance") ||
    normalized.includes("new india assurance") ||
    normalized.includes("oriental insurance") ||
    normalized.includes("united india")
  );
}

export function isStandaloneScopeRadiosDisabled(
  isTripartite: boolean,
  gic: string,
  gipsaPpn: string,
): boolean {
  return (
    isTripartite && (gic === "Yes" || (gic === "No" && gipsaPpn === "Yes"))
  );
}

export function isScopeOptionDisabledForAgreement(
  value: string,
  flags: Pick<AgreementNameFlags, "isGipsaPpnTripartite">,
  scopeRadiosDisabled: boolean,
): boolean {
  if (scopeRadiosDisabled) return true;
  if (flags.isGipsaPpnTripartite && value !== "ALL_PSU") return true;
  return false;
}

/** Fields touched by shared scope / IC / type effect hooks. */
export type AgreementScopeEffectFields = {
  agreementName: string;
  agreementType: string;
  applicableScope: string;
  selectedIcIds: string[];
  agreementCopyAvailable: string;
};

export function resolveAgreementTypeUpdate(
  agreementName: string,
  agreementType: string,
): string | null {
  const normalizedName = String(agreementName ?? "").trim();
  if (!normalizedName) return null;
  const nextType = resolveAgreementTypeFromName(agreementName);
  return agreementType !== nextType ? nextType : null;
}

export function resolveApplicableScopeFromFlags(
  flags: AgreementNameFlags,
  applicableScope: string,
): string | null {
  /** GIC auto-maps active ICs on save; scope UI is hidden on create. */
  if (flags.isGicStandard) {
    return applicableScope !== "ALL_INSURER" ? "ALL_INSURER" : null;
  }

  /** GIPSA PPN Tripartite always applies to all PSU insurers. */
  if (flags.isGipsaPpnTripartite) {
    return applicableScope !== "ALL_PSU" ? "ALL_PSU" : null;
  }

  if (usesSelectedIcScopeSelection(flags)) {
    return applicableScope !== "SELECTED_INSURER" ? "SELECTED_INSURER" : null;
  }

  return applicableScope !== "ALL_INSURER" ? "ALL_INSURER" : null;
}

export function resolveGicScopeUpdate(
  isTripartite: boolean,
  gic: string,
  gipsaPpn: string,
): { applicableScope?: string; gipsaPpn?: string } | null {
  if (!isTripartite) return null;
  if (gic === "Yes") {
    return { applicableScope: "ALL_INSURER", gipsaPpn: "No" };
  }
  if (gic === "No" && gipsaPpn === "Yes") {
    return { applicableScope: "ALL_PSU" };
  }
  return null;
}

export function resolveBipartiteGicReset(
  agreementType: string,
): { gic: string; gipsaPpn: string } | null {
  return agreementType === "bipartite" ? { gic: "No", gipsaPpn: "No" } : null;
}

export function resolveGicScopeOnBipartite(
  agreementType: string,
  applicableScope: string,
): string | null {
  return agreementType === "bipartite" && applicableScope === "gic"
    ? "ALL_INSURER"
    : null;
}

export function resolveAutoSelectedIcIds(): string[] | null {
  return null;
}

export function resolveSingleModeSelectedIcIds(
  selectedIcSingleMode: boolean,
  currentIds: string[],
): string[] | null {
  if (!selectedIcSingleMode) return null;
  const ids = normalizeSelectedIcIds(currentIds);
  return ids.length > 1 ? [String(ids[0])] : null;
}

export function resolveAllowedSelectedIcIds(
  effectiveIcOptions: InsurerDropdownOption[],
  currentIds: string[],
  /** IDs from API `insurerMappings` — never drop these even if not in the dropdown yet. */
  protectedIds: string[] = [],
): string[] | null {
  if (effectiveIcOptions.length === 0) return null;
  const allowedIds = new Set(effectiveIcOptions.map((o) => String(o.value)));
  const protectedSet = new Set(normalizeSelectedIcIds(protectedIds));
  const current = normalizeSelectedIcIds(currentIds);
  const next = current.filter((id) => allowedIds.has(id) || protectedSet.has(id));
  return JSON.stringify(current) !== JSON.stringify(next) ? next : null;
}

export function resolveTripartiteTransitionSelectedIcIds(
  prevAgreementType: string,
  agreementType: string,
  rawRows: unknown[],
  currentIds: string[],
): string[] | null {
  if (!(prevAgreementType === "bipartite" && agreementType === "tripartite")) {
    return null;
  }
  const allowed = new Set(
    buildTripartiteInsurerOptions(rawRows).map((o) => String(o.value)),
  );
  const next = normalizeSelectedIcIds(currentIds).filter((id) =>
    allowed.has(String(id)),
  );
  const current = normalizeSelectedIcIds(currentIds);
  return JSON.stringify(current) !== JSON.stringify(next) ? next : null;
}

type BuildEffectiveIcOptionsParams = {
  agreementType: string;
  applicableScope: string;
  insurerIcOptions: InsurerDropdownOption[];
  rawRows: unknown[];
  flags: Pick<
    AgreementNameFlags,
    | "isGipsaPpnTripartite"
    | "isPsuTripartite"
    | "isPrivateInsurerTripartite"
    | "isGicStandard"
  >;
};

/** Ensures network-mapping insurer appears in dropdown before master list loads. */
export function withMappingInsurerOption(
  options: InsurerDropdownOption[],
  mapping?: { insurerId?: string; insurerName?: string } | null,
): InsurerDropdownOption[] {
  const id = String(mapping?.insurerId ?? "").trim();
  if (!id) return options;
  if (options.some((o) => String(o.value) === id)) return options;
  const label = String(mapping?.insurerName ?? "").trim() || id;
  return [{ value: id, label }, ...options];
}

export function buildEffectiveIcOptions({
  agreementType,
  applicableScope,
  insurerIcOptions,
  rawRows,
  flags,
}: BuildEffectiveIcOptionsParams): InsurerDropdownOption[] {
  const {
    isGipsaPpnTripartite,
    isPsuTripartite,
    isPrivateInsurerTripartite,
    isGicStandard,
  } = flags;

  if (
    agreementType === "tripartite" &&
    (applicableScope === "SELECTED_PSU")
  ) {
    if (isGipsaPpnTripartite || isPsuTripartite) {
      return insurerIcOptions.filter((o) =>
        isPsuInsurerLabel(String(o.label)),
      );
    }
  }

  if (agreementType === "tripartite" && applicableScope === "SELECTED_INSURER") {
    const tripartiteOptions = buildTripartiteInsurerOptions(rawRows);
    if (isGicStandard || isPsuTripartite) {
      return tripartiteOptions.filter((o) =>
        isPsuInsurerLabel(String(o.label)),
      );
    }
    if (isPrivateInsurerTripartite) {
      return tripartiteOptions.filter((o) =>
        String(o.label).toLowerCase().includes("magma"),
      );
    }
    return tripartiteOptions;
  }

  if (isGicStandard && applicableScope === "SELECTED_INSURER") {
    return buildTripartiteInsurerOptions(rawRows).filter((o) =>
      isPsuInsurerLabel(String(o.label)),
    );
  }

  if (isPrivateInsurerTripartite) {
    return insurerIcOptions.filter((o) =>
      String(o.label).toLowerCase().includes("magma"),
    );
  }

  if (isPsuTripartite) {
    return insurerIcOptions.filter((o) => isPsuInsurerLabel(String(o.label)));
  }

  return insurerIcOptions;
}

export function buildScopeRadioOptions(
  _isTripartite: boolean,
  flags: Pick<
    AgreementNameFlags,
    | "isInsurerBipartite"
    | "isPsuTripartite"
    | "isPrivateInsurerTripartite"
    | "isGicStandard"
  >,
) {
  if (!usesSelectedIcScopeSelection(flags)) {
    return [];
  }

  return [{ value: "SELECTED_INSURER", label: "SELECTED_INSURER" }];
}
export type AgreementListRow = {
  id: string;
  providerId: string;
  agreementName: string;
  type: string;
  scope: string;
  effectiveFromDisplay: string;
  status: string;
  /** Pending | Complete — clickable link to the Soc tab */
  socDiscountStatus: string;
  /** From API `insurerMappings` — used to prefill SOC Applicable ICs. */
  insurerMappings: Array<{
    insurerId: string;
    insurerName?: string;
    mappingEffectiveFrom?: string;
  }>;
};

/** Full agreement record for detail view. */
export type AgreementDetailRecord = {
  id: string;
  form: Record<string, string>;
  pdfUrl?: string;
};

export const AGREEMENT_TYPE_FILTER = [
  { value: "", label: "All Types" },
  { value: "bipartite", label: "Bipartite" },
  { value: "tripartite", label: "Tripartite" },
];

export const AGREEMENT_SCOPE_FILTER = [
  { value: "", label: "All Scopes" },
  { value: "SELECTED_PSU", label: "SELECTED_PSU" },
  { value: "ALL_PSU", label: "ALL_PSU" },
  { value: "SELECTED_INSURER", label: "SELECTED_INSURER" },
  { value: "ALL_INSURER", label: "ALL_INSURER" },
];

// export const AGREEMENT_STATUS_FILTER = [
//   { value: "", label: "All Status" },
//   { value: "active", label: "Active" },
//   { value: "terminated", label: "Terminated" },
//   { value: "expired", label: "Expired" },
//   // { value: "draft", label: "Draft" },
// ];

const AGREEMENT_ID_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Maps URL param to agreement id when it is a provider-agreement UUID. */
export function resolveAgreementIdFromRouteParam(
  param: string | undefined,
): string | null {
  if (!param?.trim()) return null;
  const trimmed = decodeURIComponent(param).trim();
  if (AGREEMENT_ID_UUID_REGEX.test(trimmed)) return trimmed;
  return null;
}

/** Builds route segment for provider agreement routes (UUID). */
export function encodeAgreementRouteSegmentFromInternalId(
  internalId: string,
): string {
  return encodeURIComponent(internalId);
}

/**
 * Optional API payload: per–selected-IC involvement date (and display name when known without insurer list).
 * JSON array of `{ insurerId, effectiveFrom, insurerName? }`.
 */
export type SelectedIcInvolvementRow = {
  insurerId: string;
  effectiveFrom: string;
  insurerName?: string;
};

export function parseSelectedIcInvolvementJson(
  raw: string | undefined | null,
): SelectedIcInvolvementRow[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const out: SelectedIcInvolvementRow[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const insurerId = String(o.insurerId ?? "").trim();
      // Dates may be null from API — still keep the IC so view can show the list.
      const effectiveFrom = String(o.effectiveFrom ?? "").trim();
      if (!insurerId) continue;
      out.push({
        insurerId,
        effectiveFrom,
        insurerName: typeof o.insurerName === "string" ? o.insurerName.trim() : undefined,
      });
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

export type ApplicableScopeIcDisplayRow = {
  insurerId: string;
  name: string;
  effectiveFromIso: string;
};

function mapInvolvementJsonToDisplayRows(
  involvementJson: string,
  selectedIcIds: string[],
  insurerLabels: string[],
): ApplicableScopeIcDisplayRow[] | null {
  const parsed = parseSelectedIcInvolvementJson(involvementJson);
  if (!parsed?.length) return null;

  // Prefer still-selected ids. Do not fall back to the full involvement JSON
  // when the filter is empty — that resurrects removed/stale insurers in the UI.
  const filtered =
    selectedIcIds.length > 0
      ? parsed.filter((row) => selectedIcIds.includes(row.insurerId))
      : parsed;
  if (selectedIcIds.length > 0 && filtered.length === 0) return null;
  const source = filtered;

  return source.map((row) => {
    const idx = selectedIcIds.indexOf(row.insurerId);
    const name =
      row.insurerName ||
      (idx >= 0 ? insurerLabels[idx] : undefined) ||
      row.insurerId;
    return {
      insurerId: row.insurerId,
      name,
      effectiveFromIso: row.effectiveFrom,
    };
  });
}

/** Read-only: ICs from agreement `insurerMappings` only — never count/summary text. */
export function buildSelectedIcInvolvementDisplayRows(args: {
  applicableScope: string;
  selectedIcIds: string[];
  insurerLabels: string[];
  agreementEffectiveFrom: string;
  involvementJson: string;
  applicableIcsSummary: string;
}): { rows: ApplicableScopeIcDisplayRow[]; fallbackSummary: string } {
  const fromAgreementMappings = mapInvolvementJsonToDisplayRows(
    args.involvementJson,
    args.selectedIcIds,
    args.insurerLabels,
  );
  if (fromAgreementMappings?.length) {
    return { rows: fromAgreementMappings, fallbackSummary: "" };
  }

  // Edit/create: selected ids without involvement JSON yet.
  if (args.selectedIcIds.length > 0) {
    const eff = args.agreementEffectiveFrom?.trim() || "";
    return {
      rows: args.selectedIcIds.map((id, i) => ({
        insurerId: id,
        name: args.insurerLabels[i] ?? id,
        effectiveFromIso: eff,
      })),
      fallbackSummary: "",
    };
  }

  return { rows: [], fallbackSummary: "" };
}

export {
  PROVIDER_GIPSA_PPN_CITY_KEYS,
  PROVIDER_GIPSA_PPN_STATE_KEYS,
  type GipsaPpnDropdownOption,
} from "./agreementGipsaPpnNormalizer";

import { formatPpnPlaceName } from "./agreementGipsaPpnNormalizer";

function mergeSelectedGipsaOption(
  options: import("./agreementGipsaPpnNormalizer").GipsaPpnDropdownOption[],
  selectedValue: string,
): import("./agreementGipsaPpnNormalizer").GipsaPpnDropdownOption[] {
  const trimmed = selectedValue.trim();
  const withFormattedLabels = options.map((option) => ({
    ...option,
    label: formatPpnPlaceName(option.label || option.value),
  }));
  if (!trimmed) return withFormattedLabels;
  if (withFormattedLabels.some((option) => option.value === trimmed)) {
    return withFormattedLabels;
  }
  return [{ value: trimmed, label: formatPpnPlaceName(trimmed) }, ...withFormattedLabels];
}

export function useAgreementGipsaPpnDropdowns(
  selectedPpnState: string,
  selectedPpnCity: string,
) {
  const dispatch = useAppDispatch();
  const [ppnStateOptions, setPpnStateOptions] = useState<
    import("./agreementGipsaPpnNormalizer").GipsaPpnDropdownOption[]
  >([]);
  const [ppnCityOptions, setPpnCityOptions] = useState<
    import("./agreementGipsaPpnNormalizer").GipsaPpnDropdownOption[]
  >([]);

  const searchPpnState = useCallback(
    async (query: string) => {
      try {
        const result = await dispatch(
          fetchProviderGipsaPpnStateOptions(query),
        ).unwrap();
        setPpnStateOptions(result.options);
      } catch {
        setPpnStateOptions([]);
      }
    },
    [dispatch],
  );

  const searchPpnCity = useCallback(
    async (query: string) => {
      try {
        const result = await dispatch(fetchProviderGipsaPpnCityOptions(query)).unwrap();
        setPpnCityOptions(result.options);
      } catch {
        setPpnCityOptions([]);
      }
    },
    [dispatch],
  );

  const stateDropdownOptions = useMemo(
    () => mergeSelectedGipsaOption(ppnStateOptions, selectedPpnState),
    [ppnStateOptions, selectedPpnState],
  );

  const cityDropdownOptions = useMemo(
    () => mergeSelectedGipsaOption(ppnCityOptions, selectedPpnCity),
    [ppnCityOptions, selectedPpnCity],
  );

  return {
    ppnStateOptions: stateDropdownOptions,
    ppnCityOptions: cityDropdownOptions,
    searchPpnState,
    searchPpnCity,
  };
}

/** Normalize create/update agreement mutation failures for ProviderAlertDialog. */
export function reportAgreementMutationError(
  error: unknown,
  showError: (message: string, title?: string, status?: number) => void,
): void {
  if (typeof error === "string") {
    if (error) showError(error, "Error");
    return;
  }
  if (!error || typeof error !== "object" || !("message" in error)) return;
  const payload = error as { message?: string; status?: number };
  if (typeof payload.message === "string" && payload.message) {
    showError(payload.message, "Error", payload.status);
  }
}
