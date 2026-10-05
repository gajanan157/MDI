import type { RefObject } from "react";
import type { TFunction } from "i18next";
import type { UseFormReturn } from "react-hook-form";
import { createSocApplicableIcScopeOptions } from "../../../../../../../shared/providerMasterI18n";
import type { ProviderAuditLogContext, ProviderAuditLogTabId } from "../../../../shared/providerAuditLog";
import { extractProviderIdFromPath } from "../../../../utils/viewHospitalHelpers";
import {
  encodeSocRouteSegmentFromInternalId,
  type SocApplicableIc,
  type SocGipsaSocVariant,
  type SocDetailRecord,
  type SocVersionItem,
} from "../data/socListData";

export type { SocGipsaSocVariant, SocVersionItem } from "../data/socListData";
export { DISCOUNT_CATEGORY_OPTIONS } from "../../../../../../ic-corporate-mapping/discountOptions";

export interface DiscountFormValues {
  discountType: string;
  discountCategories: string[];
  ppnDiscount: string;
  billInclusion: string[];
  billExclusion: string[];
  ipdEnabled: boolean;
  ipdList: string[];
  opdEnabled: boolean;
  opdList: string[];
  additionalDiscountEnabled: boolean;
  additionalDiscountList: string[];
  tatForDiscount: string;
  discountApplicableOn: string;
  effectiveFrom: string;
  remarks: string;
}

export const DISCOUNT_FORM_DEFAULTS: DiscountFormValues = {
  discountType: "",
  discountCategories: [],
  ppnDiscount: "",
  billInclusion: [],
  billExclusion: [],
  ipdEnabled: false,
  ipdList: [],
  opdEnabled: false,
  opdList: [],
  additionalDiscountEnabled: false,
  additionalDiscountList: [],
  tatForDiscount: "",
  discountApplicableOn: "",
  effectiveFrom: "",
  remarks: "",
};

export type SocAgreementNavInsurerMapping = {
  insurerId: string;
  insurerName?: string;
  mappingEffectiveFrom?: string;
};

export type SocAgreementNavigationPayload = {
  agreementName: string;
  insurerMappings?: SocAgreementNavInsurerMapping[];
};

export type SocCorporateSelection = {
  id: string;
  name: string;
};

export type SocCorporateOption = { value: string; label: string };

export const SOC_APPLICABLE_IC_SCOPE_OPTIONS = [
  { value: "selectIc", label: "Select IC" },
  { value: "allIcs", label: "All ICs" },
  { value: "gipsa", label: "GIPSA" },
  { value: "gic", label: "GIC" },
  { value: "psu", label: "PSU" },
] as const;

export type SocApplicableIcScope =
  (typeof SOC_APPLICABLE_IC_SCOPE_OPTIONS)[number]["value"];

export type SocInsurerOption = {
  value: string;
  label: string;
  insurerType: string;
};

export const SOC_DOCUMENT_S3_BUCKET = "provider";
export const SOC_DOCUMENT_S3_SUB_BUCKET = "SOC";
export const SOC_DOCUMENT_ACCEPT = ".pdf,application/pdf";
export const SOC_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

export function isSocDocumentPdf(file: File): boolean {
  const name = file.name.toLowerCase();
  return file.type === "application/pdf" || name.endsWith(".pdf");
}

export function formatFileSizeKb(size: number): string {
  return `${(size / 1024).toFixed(1)} KB`;
}

export const SOC_AUDIT_TAB_ID = "soc" as const;
export const DISCOUNT_AUDIT_TAB_ID = "hospital-discount" as const;

export type SocHospitalSummary = {
  id?: string;
  status?: string;
  blacklistedByIcNames?: string[];
} | null;

export type SocStatusBarConfig = {
  providerStatus: string;
  blacklistedByIcs: string[];
  canWrite: boolean;
  canVerify?: boolean;
  verifyDisabled: boolean;
  verifyDisabledTitle?: string;
  auditLog: ProviderAuditLogContext;
};

export function resolveSocBlacklistedByIcs(
  icNames: string[] | undefined,
  t: TFunction,
): string[] {
  return icNames?.length ? icNames : [t("providerMaster.soc.applicableIc.noIcInfo")];
}

export function buildSocStatusBarConfig(input: {
  hospital: SocHospitalSummary;
  canWrite: boolean;
  canVerify?: boolean;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
  t: TFunction;
  auditTabId?: ProviderAuditLogTabId;
}): SocStatusBarConfig {
  return {
    providerStatus: (input.hospital?.status ?? "").trim(),
    blacklistedByIcs: resolveSocBlacklistedByIcs(
      input.hospital?.blacklistedByIcNames,
      input.t,
    ),
    canWrite: input.canWrite,
    canVerify: input.canVerify,
    verifyDisabled: input.verifyDisabled ?? false,
    verifyDisabledTitle: input.verifyDisabledTitle,
    auditLog: {
      providerId: input.hospital?.id,
      tabId: input.auditTabId ?? SOC_AUDIT_TAB_ID,
    },
  };
}

export function buildProviderSocPath(
  suffix: "view" | "edit",
  internalId: string,
  options: { providerBasePath?: string; pathname: string },
): string | null {
  const key = encodeSocRouteSegmentFromInternalId(internalId);
  if (options.providerBasePath) {
    return `${options.providerBasePath}/soc/${key}/${suffix}`;
  }
  const providerId = extractProviderIdFromPath(options.pathname);
  if (!providerId) return null;
  return `/provider-masters/providers/${providerId}/soc/${key}/${suffix}`;
}

function normalizeInsurerType(value: string): string {
  return value.trim().toUpperCase();
}

function resolveInsurerTypeFilter(
  scope: Exclude<SocApplicableIcScope, "allIcs" | "selectIc">,
): string {
  if (scope === "psu") return "PSU";
  if (scope === "gipsa") return "GIPSA";
  if (scope === "gic") return "GIC";
  return "";
}

export function resolvePresetIcIdsFromInsurers(
  scope: Exclude<SocApplicableIcScope, "selectIc">,
  insurerOptions: SocInsurerOption[],
): string[] {
  if (scope === "allIcs") return insurerOptions.map((row) => row.value);
  const typeFilter = resolveInsurerTypeFilter(scope);
  return insurerOptions
    .filter((row) => normalizeInsurerType(row.insurerType) === typeFilter)
    .map((row) => row.value);
}

export function buildApplicableIcsFromScope(
  scope: SocApplicableIcScope,
  selectedIcIds: string[],
  effectiveFrom: string,
  insurerOptions: SocInsurerOption[],
): SocApplicableIc[] {
  const ids =
    scope === "selectIc"
      ? selectedIcIds
      : resolvePresetIcIdsFromInsurers(scope, insurerOptions);
  return ids.map((insurerId) => {
    const match = insurerOptions.find((row) => row.value === insurerId);
    return {
      insurerId,
      insurerName: match ? match.label : insurerId,
      effectiveFrom,
    };
  });
}

export function buildApplicableIcsSummary(
  scope: SocApplicableIcScope,
  selectedIcIds: string[],
  insurerOptions: SocInsurerOption[],
  t: TFunction,
): string {
  const AI = "providerMaster.soc.applicableIc";
  if (scope === "selectIc") {
    if (selectedIcIds.length === 0) return "—";
    if (selectedIcIds.length === 1) {
      return (
        insurerOptions.find((row) => row.value === selectedIcIds[0])?.label ??
        t(`${AI}.oneIcSelected`)
      );
    }
    return t(`${AI}.icsSelected`, { count: selectedIcIds.length });
  }
  return createSocApplicableIcScopeOptions(t).find((o) => o.value === scope)?.label ?? "—";
}

export function inferSocApplicableIcScopeFromSummary(
  summary: string,
): SocApplicableIcScope {
  const normalized = summary.trim().toLowerCase();
  if (normalized.includes("gipsa")) return "gipsa";
  if (normalized === "gic") return "gic";
  if (normalized.includes("psu")) return "psu";
  if (normalized.includes("all")) return "allIcs";
  return "selectIc";
}

export function extractSelectedIcIdsFromApplicableIcs(
  applicableIcs: SocApplicableIc[],
): string[] {
  return applicableIcs.map((row) => row.insurerId);
}

export function filterPsuInsurerOptions(
  insurerOptions: SocInsurerOption[],
): { value: string; label: string }[] {
  return insurerOptions
    // .filter((row) => normalizeInsurerType(row.insurerType) === "PSU")
    .map(({ value, label }) => ({ value, label }));
}

export type SocAgreementCorporateValidationInput = {
  agreementName: string;
  selectedApplicableIcIds: string[];
  isCorporateSoc: boolean;
  selectedCorporateInsurerId: string;
  selectedCorporates: SocCorporateSelection[];
};

function parseSocListDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const date = new Date(trimmed.includes("T") ? trimmed : `${trimmed}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export function formatSocListDuration(startDate: string, endDate: string): string {
  const start = parseSocListDate(startDate);
  const end = parseSocListDate(endDate);
  if (!start || !end) return "—";
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return "—";
  return `${Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1} days`;
}

export const SOC_DETAIL_PANEL_CLASS =
  "min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50/80 shadow-sm";
export const SOC_DETAIL_PANEL_HEADER_CLASS =
  "flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-2.5 py-1";
export const SOC_DETAIL_BODY_PADDING = "px-2 pb-2 pt-2";
export const SOC_DETAIL_GRID_CLASS =
  "grid grid-cols-1 gap-2 lg:grid-cols-12 lg:items-stretch";
export const SOC_DETAIL_ROW_CARD_CLASS = "flex h-full min-h-0 flex-col";
export const SOC_DETAIL_ROW_CARD_BODY_CLASS =
  "flex min-h-0 flex-1 flex-col gap-1 px-2 py-1.5";
export const SOC_DETAIL_FIELDS_GRID_CLASS =
  "grid grid-cols-1 gap-x-2 gap-y-1.5 sm:grid-cols-2 lg:items-start";
export const SOC_DETAIL_FIELD_LABEL_CLASS =
  "input-label mb-0.5 block font-normal leading-4 text-black";
export const SOC_DETAIL_FIELD_LABEL_SYNC_CLASS =
  "[&_label.input-label]:!text-[11px] [&_label.input-label]:!font-normal [&_label.input-label]:!leading-4 [&_label.input-label]:!text-black [&_label.dropdown-label]:!text-[11px] [&_label.dropdown-label]:!font-normal [&_label.dropdown-label]:!leading-4 [&_label.dropdown-label]:!text-black";

export function getSocDetailFieldsGridClass(fieldCount = 5): string {
  const largeCols = fieldCount >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4";
  return `${SOC_DETAIL_FIELDS_GRID_CLASS} ${largeCols} ${SOC_DETAIL_FIELD_LABEL_SYNC_CLASS}`;
}

export function getSocDetailFieldClass(): string {
  return "min-w-0 [&_.input-root]:!min-h-0 [&_.mb-1]:!mb-0 [&_.mt-\\[3px\\]]:!mt-0.5";
}

export function getSocDetailFirstRowFieldClass(): string {
  return getSocDetailFieldClass();
}

export const SOC_DETAIL_SECOND_ROW_FIELD_CLASS = "min-w-0";
export const SOC_DETAIL_TABLE_ROW_CLASS =
  "flex flex-row items-center border-b border-slate-100 text-[11px] last:border-0";
export const SOC_DETAIL_TABLE_LABEL_CELL_CLASS =
  "bg-slate-50 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500";
export const SOC_DETAIL_TABLE_VALUE_CELL_CLASS =
  "min-w-0 break-words bg-white px-2 py-1.5 text-slate-800";
export const SOC_LINK_CLASS = "text-[11px] font-medium text-primary-600 hover:underline";
export const SOC_SECTION_LINK_CLASS =
  "text-[11px] font-medium text-primary-600 hover:underline";
export const SOC_APPLICABLE_IC_PREVIEW_COUNT = 5;
export const SOC_VERSION_HISTORY_PREVIEW_COUNT = 2;

export function getSocSecondRowColSpans() {
  return { versionHistory: "lg:col-span-5", applicableIc: "lg:col-span-7" };
}

export interface SocDetailPanelProps {
  socDetail: SocDetailRecord;
  socForm: UseFormReturn<{ socVersionId: string }>;
  isSocViewMode: boolean;
  socLastUpdatedOn: string;
  setSocLastUpdatedOn: (v: string) => void;
  socStartDate: string;
  setSocStartDate: (v: string) => void;
  socEndDate: string;
  setSocEndDate: (v: string) => void;
  socFileInputRef: RefObject<HTMLInputElement | null>;
  pendingSocDocumentFile: File | null;
  isSavingSocDocument: boolean;
  onSocFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearPendingSocDocument: () => void;
  socVersionHistory: SocVersionItem[];
  setSelectedSocPdfUrl: (v: string | undefined) => void;
  socSideBySide?: boolean;
  agreementName: string;
  setAgreementName: (v: string) => void;
  applyAgreementNameFromNavigation: (
    payload: string | SocAgreementNavigationPayload,
  ) => void;
  providerId?: string;
  agreementNameDisabled?: boolean;
  gipsaSocVariant: SocGipsaSocVariant;
  onGipsaSocVariantChange: (variant: SocGipsaSocVariant) => void;
  isCorporateSoc: boolean;
  onIsCorporateSocChange: (checked: boolean) => void;
  selectedCorporateInsurerId: string;
  onSelectedCorporateInsurerIdChange: (insurerId: string) => void;
  onDetailsInsurerChange: (insurerId: string) => void;
  agreementInsurerMappings: SocAgreementNavInsurerMapping[];
  lockApplicableIcsFromAgreement?: boolean;
  selectedCorporates: SocCorporateSelection[];
  onSelectedCorporatesChange: (items: SocCorporateSelection[]) => void;
  selectedApplicableIcIds: string[];
  onSelectedApplicableIcIdsChange: (ids: string[]) => void;
  applicableIcs: SocApplicableIc[];
  applicableIcsSummary: string;
  insurerMultiSelectOptions: { value: string; label: string }[];
  psuInsurerOptions: { value: string; label: string }[];
  insurerOptionsLoading?: boolean;
  socSaveDisabled?: boolean;
  canWrite: boolean;
}
