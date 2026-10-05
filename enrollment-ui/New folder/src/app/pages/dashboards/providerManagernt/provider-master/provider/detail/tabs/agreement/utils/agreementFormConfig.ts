import {
  parseIsoDateOnlyLocal,
  EFFECTIVE_FROM_MUST_NOT_BE_AFTER_TO,
  EMPANELMENT_MUST_NOT_BE_AFTER_EFFECTIVE_FROM,
  isEffectiveFromOnOrBeforeEffectiveTo,
} from "../../../../../../shared/effectiveDateRange";
import * as yup from "yup";
import {
  ALPHABET_ONLY_PATTERN,
  ALPHABET_ONLY_VALIDATION_MESSAGE,
} from "../../../../../../shared/alphabetOnlyInput";
import { CONTACT_PHONE_NUMBERS_ONLY_MESSAGE } from "@/utils/contactFieldInput";
import {
  CONTACT_PERSON_DESIGNATION_NUMBER_ERROR,
  CONTACT_PERSON_NAME_NUMBER_ERROR,
} from "@/utils/contactPersonNameInput";
import { normalizeSelectedIcIds } from "../hooks/useAgreementInsurer";
import { normalizeAgreementNameKey } from "./agreementHelpers";

export const AGREEMENT_FORM_TYPE_OPTIONS = [
  { value: "bipartite", label: "Bipartite" },
  { value: "tripartite", label: "Tripartite" },
];

/** Options for read-only agreement type display; empty until synced from agreement name. */
export function getAgreementFormTypeOptions(agreementType: string) {
  const normalized = agreementType.trim().toLowerCase();
  if (!normalized) return [];
  return AGREEMENT_FORM_TYPE_OPTIONS.filter((option) => option.value === normalized);
}

export const AGREEMENT_NAME_OPTIONS = [
  {
    value: "TPA_PROVIDER_BIPARTITE_AGREEMENT",
    label: "TPA – Provider Bipartite Agreement",
  },
  {
    value: "INSURER_PROVIDER_BIPARTITE_AGREEMENT",
    label: "Insurer – Provider Bipartite Agreement",
  },
  {
    value: "PSU_TRIPARTITE_AGREEMENT",
    label: "PSU Tripartite Agreement ",
  },
  {
    value: "GIPSA_PPN_TRIPARTITE_AGREEMENT",
    label: "GIPSA PPN Tripartite Agreement",
  },
  {
    value: "GIC_STANDARD_AGREEMENT",
    label: "GIC Standard Agreement",
  },
  {
    value: "PRIVATE_INSURER_TRIPARTITE_AGREEMENT",
    label: "Private Insurer Tripartite Agreement",
  },
];

export const AGREEMENT_FORM_PARTY_3_OPTIONS = [
  { value: "", label: "Select Type" },
  { value: "3rd_party", label: "3rd Party" },
  { value: "insurer", label: "Insurer" },
  { value: "corporate", label: "Corporate" },
];

export const AGREEMENT_FORM_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

export const AGREEMENT_FORM_YES_NO = [
  { value: "No", label: "No" },
  { value: "Yes", label: "Yes" },
];

export const AGREEMENT_FORM_SCOPE_OPTIONS: {
  value: "ALL_INSURER" | "SELECTED_PSU" | "ALL_PSU" | "SELECTED_INSURER";
  label: string;
}[] = [
  { value: "ALL_INSURER", label: "ALL_INSURER" },
  { value: "SELECTED_PSU", label: "SELECTED_PSU" },
  { value: "ALL_PSU", label: "ALL_PSU" },
  { value: "SELECTED_INSURER", label: "SELECTED_INSURER" },
];

export type AgreementApplicableScopeValue =
  | "ALL_INSURER"
  | "SELECTED_PSU"
  | "ALL_PSU"
  | "SELECTED_INSURER";

export const AGREEMENT_FORM_SCOPE_OPTIONS_TRIPARTITE: {
  value: AgreementApplicableScopeValue;
  label: string;
}[] = [
  { value: "ALL_INSURER", label: "ALL_INSURER" },
  { value: "SELECTED_PSU", label: "SELECTED_PSU" },
  { value: "ALL_PSU", label: "ALL_PSU" },
  { value: "SELECTED_INSURER", label: "SELECTED_INSURER" },
];

export const TRIPARTITE_SELECTED_IC_WHITELIST_TOKENS = [
  "nic",
  "oic",
  "nia",
  "uiic",
  "magma",
] as const;

export const AGREEMENT_FORM_CARD_CLASS =
  "overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md";

export const AGREEMENT_FORM_SECTION_HEADER_CLASS =
  "flex flex-wrap items-center justify-between gap-1 border-b border-gray-200 bg-gray-200 px-2.5 py-1";

export const AGREEMENT_FORM_SECTION_TITLE_CLASS =
  "text-[11px] font-semibold text-gray-700";

export function getAgreementTermsLayoutClasses() {
  return {
    agreementTermsGridClass: "grid-cols-1 sm:grid-cols-2",
    // Always span the full terms grid so PPN State/City don't leave an empty cell.
    agreementTermsPpnRowClass:
      "col-span-full grid min-w-0 grid-cols-1 gap-x-3 gap-y-1.5 sm:grid-cols-2",
  };
}

/** @deprecated Use `parseIsoDateOnlyLocal` from `shared/effectiveDateRange` instead. */
export { parseIsoDateOnlyLocal as parseHtmlDate };

export function formatHtmlDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(date: Date, delta: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + delta);
  return result;
}

export function diffDaysExclusive(from: Date, to: Date): number {
  const fromMs = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const toMs = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((toMs - fromMs) / 86400000);
}

export function agreementDurationDaysFromRange(
  effectiveFrom: string,
  effectiveTo: string,
): string {
  const from = parseIsoDateOnlyLocal(effectiveFrom);
  const to = parseIsoDateOnlyLocal(effectiveTo);
  if (!from || !to) return "";
  const days = diffDaysExclusive(from, to);
  if (days < 0) return "";
  return String(days);
}

export type AgreementScopeRadio =
  | "ALL_INSURER"
  | "SELECTED_PSU"
  | "ALL_PSU"
  | "SELECTED_INSURER";

export type AgreementFullFormValues = {
  agreementName: string;
  agreementVersion: string;
  agreementType: string;
  effectiveFrom: string;
  effectiveTo: string;
  agreementDurationDays: string;
  status: string;
  remarks: string;
  applicableScope: AgreementScopeRadio;
  selectedIcIds: string[];
  applicableIcsSummary: string;
  selectedIcInvolvementJson: string;
  empanelmentDate: string;
  signAgreementSentDate: string;
  agreementCopyAvailable: string;
  hardCopySubmitted: string;
  infrastructureAuditDone: string;
  providerSignatoryName: string;
  providerSignatoryDesignation: string;
  /** GIPSA PPN state id — sent as `providerGipsaPpnState` on save. */
  ppnState: string;
  /** GIPSA PPN city id — sent as `providerGipsaPpnCity` on save. */
  ppnCity: string;
  /** Display labels from check-ppn-state-city (not sent on save). */
  ppnStateName: string;
  ppnCityName: string;
  agreementDocumentName: string;
  agreementDocumentUploadedOn: string;
  supportingDocumentName: string;
  supportingDocumentUploadedOn: string;
  fileMetadataId: string;
  supportingFileMetadataId: string;
  inwardNo: string;
  pendingAgreementDocumentFile: File | null;
  pendingSupportingDocumentFile: File | null;
};

export const AGREEMENT_FULL_FORM_DEFAULTS: AgreementFullFormValues = {
  agreementName: "",
  agreementVersion: "V1",
  agreementType: "",
  effectiveFrom: "",
  effectiveTo: "",
  agreementDurationDays: "",
  status: "Active",
  remarks: "",
  applicableScope: "ALL_INSURER",
  selectedIcIds: [],
  applicableIcsSummary: "",
  selectedIcInvolvementJson: "",
  empanelmentDate: "",
  signAgreementSentDate: "",
  agreementCopyAvailable: "No",
  hardCopySubmitted: "No",
  infrastructureAuditDone: "No",
  providerSignatoryName: "",
  providerSignatoryDesignation: "",
  ppnState: "",
  ppnCity: "",
  ppnStateName: "",
  ppnCityName: "",
  agreementDocumentName: "",
  agreementDocumentUploadedOn: "",
  supportingDocumentName: "",
  supportingDocumentUploadedOn: "",
  fileMetadataId: "",
  supportingFileMetadataId: "",
  inwardNo: "",
  pendingAgreementDocumentFile: null,
  pendingSupportingDocumentFile: null,
};

export type StandaloneAgreementFormValues = {
  agreementName: string;
  agreementVersion: string;
  agreementType: string;
  effectiveFrom: string;
  effectiveTo: string;
  agreementDurationDays: string;
  status: string;
  remarks: string;
  remarkCategory: string;
  applicableScope: AgreementApplicableScopeValue;
  selectedIcIds: string[];
  empanelmentDate: string;
  creditPeriodDays: string;
  interestPeriod: string;
  signAgreementSentDate: string;
  agreementCopyAvailable: string;
  hardCopySubmitted: string;
  infrastructureAuditDone: string;
  providerSignatoryName: string;
  providerSignatoryDesignation: string;
  gipsaPpn: string;
  gic: string;
  ppnState: string;
  ppnCity: string;
  documentFile?: FileList;
  supportingDocumentFile?: FileList;
  party3Type: string;
  party3Name: string;
};

export const STANDALONE_AGREEMENT_FORM_DEFAULTS: StandaloneAgreementFormValues = {
  agreementName: "",
  agreementVersion: "V1",
  agreementType: "",
  effectiveFrom: "",
  effectiveTo: "",
  agreementDurationDays: "",
  status: "Active",
  remarks: "",
  remarkCategory: "",
  applicableScope: "ALL_INSURER",
  selectedIcIds: [],
  empanelmentDate: "",
  creditPeriodDays: "",
  interestPeriod: "",
  signAgreementSentDate: "",
  agreementCopyAvailable: "No",
  hardCopySubmitted: "No",
  infrastructureAuditDone: "No",
  providerSignatoryName: "",
  providerSignatoryDesignation: "",
  gipsaPpn: "No",
  gic: "No",
  ppnState: "",
  ppnCity: "",
  party3Type: "",
  party3Name: "",
};

function parseInitialSelectedIcIds(rawIc: string[] | string | undefined): string[] {
  if (Array.isArray(rawIc)) return rawIc;
  if (typeof rawIc !== "string") return [];
  return rawIc
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const STANDARD_APPLICABLE_SCOPES = new Set<AgreementApplicableScopeValue>([
  "ALL_INSURER",
  "SELECTED_PSU",
  "ALL_PSU",
  "SELECTED_INSURER",
]);

function resolveApplicableScope(
  scope: string | undefined,
): AgreementApplicableScopeValue {
  const normalized = String(scope ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  if (STANDARD_APPLICABLE_SCOPES.has(normalized as AgreementApplicableScopeValue)) {
    return normalized as AgreementApplicableScopeValue;
  }
  return "ALL_INSURER";
}

export function buildStandaloneAgreementFormDefaults(
  initialValues?: Partial<Omit<StandaloneAgreementFormValues, "selectedIcIds">> & {
    selectedIcIds?: string[] | string;
  },
): StandaloneAgreementFormValues {
  if (!initialValues) return { ...STANDALONE_AGREEMENT_FORM_DEFAULTS };

  const selectedIcIds = parseInitialSelectedIcIds(initialValues.selectedIcIds);

  return {
    ...STANDALONE_AGREEMENT_FORM_DEFAULTS,
    ...initialValues,
    applicableScope: resolveApplicableScope(
      initialValues.applicableScope as string | undefined,
    ),
    selectedIcIds,
  };
}

const nonEmptyDate = (message: string) =>
  yup.string().test("non-empty", message, (v) => Boolean(v?.trim()));

const AGREEMENT_DOCUMENT_REQUIRED_MESSAGE = "Agreement document is required";
const REMARKS_REQUIRED_MESSAGE = "Remarks are required";
const SUPPORTING_DOCUMENT_REQUIRED_MESSAGE = "Supporting document is required";

function parentHasAgreementDocument(parent: {
  agreementDocumentName?: string;
  fileMetadataId?: string;
  pendingAgreementDocumentFile?: File | null;
}): boolean {
  if (String(parent.agreementDocumentName ?? "").trim()) return true;
  if (String(parent.fileMetadataId ?? "").trim()) return true;
  if (parent.pendingAgreementDocumentFile) return true;
  return false;
}

function parentHasSupportingDocument(parent: {
  supportingDocumentName?: string;
  supportingFileMetadataId?: string;
  pendingSupportingDocumentFile?: File | null;
}): boolean {
  if (String(parent.supportingDocumentName ?? "").trim()) return true;
  if (String(parent.supportingFileMetadataId ?? "").trim()) return true;
  if (parent.pendingSupportingDocumentFile) return true;
  return false;
}

function validateAgreementDocumentNameRequired(
  value: unknown,
  parent: AgreementFullFormValues,
): boolean {
  if (String(value ?? "").trim()) return true;
  return parentHasAgreementDocument(parent);
}

function validateSupportingDocumentNameRequired(
  value: unknown,
  parent: AgreementFullFormValues,
): boolean {
  if (String(value ?? "").trim()) return true;
  return parentHasSupportingDocument(parent);
}

const agreementDocumentNameField = yup
  .string()
  .default("")
  .when("agreementCopyAvailable", ([agreementCopyAvailable], schema) =>
    agreementCopyAvailable === "Yes"
      ? schema.test(
          "agreement-document-required",
          AGREEMENT_DOCUMENT_REQUIRED_MESSAGE,
          function validateAgreementDocumentName(value) {
            return validateAgreementDocumentNameRequired(
              value,
              this.parent as AgreementFullFormValues,
            );
          },
        )
      : schema,
  );

const supportingDocumentNameField = yup
  .string()
  .default("")
  .test(
    "supporting-document-required",
    SUPPORTING_DOCUMENT_REQUIRED_MESSAGE,
    function validateSupportingDocumentName(value) {
      return validateSupportingDocumentNameRequired(
        value,
        this.parent as AgreementFullFormValues,
      );
    },
  );

const isPpnCityRequiredAgreementName = (name: unknown) => {
  const key = normalizeAgreementNameKey(String(name ?? ""));
  return key === "GIPSA_PPN_TRIPARTITE";
};

const isPpnStateRequiredAgreementName = (name: unknown) => {
  const key = normalizeAgreementNameKey(String(name ?? ""));
  return key === "GIPSA_PPN_TRIPARTITE" || key === "PSU_TRIPARTITE";
};

function isInsurerProviderBipartiteAgreement(name: unknown): boolean {
  return (
    normalizeAgreementNameKey(String(name ?? "")) === "INSURER_PROVIDER_BIPARTITE"
  );
}

function validateEffectiveFromBeforeTo(
  effectiveFrom: unknown,
  effectiveTo: unknown,
): boolean {
  return isEffectiveFromOnOrBeforeEffectiveTo(
    String(effectiveFrom ?? ""),
    String(effectiveTo ?? ""),
  );
}

function validateEmpanelmentOnOrBeforeEffectiveFrom(
  empanelmentDate: unknown,
  effectiveFrom: unknown,
): boolean {
  return isEffectiveFromOnOrBeforeEffectiveTo(
    String(empanelmentDate ?? ""),
    String(effectiveFrom ?? ""),
  );
}

function validateSelectedIcIdsMinOne(
  value: unknown,
  applicableScope: unknown,
): boolean {
  if (applicableScope !== "SELECTED_INSURER") return true;
  return normalizeSelectedIcIds(value).length >= 1;
}

function validateSelectedIcIdsMaxOne(
  value: unknown,
  applicableScope: unknown,
  agreementName: unknown,
): boolean {
  if (applicableScope !== "SELECTED_INSURER") return true;
  if (!isInsurerProviderBipartiteAgreement(agreementName)) return true;
  return normalizeSelectedIcIds(value).length <= 1;
}

function validateStandaloneDocumentFile(
  value: unknown,
  agreementCopyAvailable: unknown,
): boolean {
  if (String(agreementCopyAvailable ?? "") !== "Yes") return true;
  return value instanceof FileList && value.length > 0;
}

function validateStandaloneSupportingDocumentFile(value: unknown): boolean {
  return value instanceof FileList && value.length > 0;
}

function requireTrimmedField(schema: yup.StringSchema, message: string) {
  return schema.trim().required(message);
}

function defaultEmptyString(schema: yup.StringSchema) {
  return schema.default("");
}

const effectiveFromField = nonEmptyDate("Effective from is required")
  .test(
    "before-effective-to",
    EFFECTIVE_FROM_MUST_NOT_BE_AFTER_TO,
    function validateEffectiveFrom(value) {
      const parent = this.parent as { effectiveTo?: string };
      return validateEffectiveFromBeforeTo(value, parent.effectiveTo);
    },
  )
  .test(
    "on-or-after-empanelment",
    EMPANELMENT_MUST_NOT_BE_AFTER_EFFECTIVE_FROM,
    function validateEffectiveFromVsEmpanelment(value) {
      const parent = this.parent as { empanelmentDate?: string };
      return validateEmpanelmentOnOrBeforeEffectiveFrom(
        parent.empanelmentDate,
        value,
      );
    },
  );

const empanelmentDateField = nonEmptyDate(
  "Date of empanelment is required",
).test(
  "on-or-before-effective-from",
  EMPANELMENT_MUST_NOT_BE_AFTER_EFFECTIVE_FROM,
  function validateEmpanelmentDate(value) {
    const parent = this.parent as { effectiveFrom?: string };
    return validateEmpanelmentOnOrBeforeEffectiveFrom(
      value,
      parent.effectiveFrom,
    );
  },
);

const selectedIcIdsField = yup
  .array(yup.string().defined())
  .default([])
  .transform((_value, originalValue) => normalizeSelectedIcIds(originalValue))
  .test("selected-ic-min-one", "Select at least one IC", function validateMinOne(value) {
    const parent = this.parent as { applicableScope?: string };
    return validateSelectedIcIdsMinOne(value, parent.applicableScope);
  })
  .test("selected-ic-max-one", "Select only one IC", function validateMaxOne(value) {
    const parent = this.parent as { applicableScope?: string; agreementName?: string };
    return validateSelectedIcIdsMaxOne(
      value,
      parent.applicableScope,
      parent.agreementName,
    );
  });

/** Required fields shared by Add/standalone agreement form and hospital Agreement tab (full form). */
const agreementCoreShape = {
  agreementName: yup.string().trim().required("Agreement name is required"),
  agreementType: yup.string().required("Agreement type is required"),
  empanelmentDate: empanelmentDateField,
  effectiveFrom: effectiveFromField,
  remarkCategory: yup.string().default(""),
  applicableScope: yup.string().required(),
  remarks: yup.string().trim().required(REMARKS_REQUIRED_MESSAGE),
  selectedIcIds: selectedIcIdsField,
};

const optionalStr = () => yup.string().default("");

export {
  ALPHABET_ONLY_PATTERN as PROVIDER_SIGNATORY_NAME_PATTERN,
  ALPHABET_ONLY_VALIDATION_MESSAGE as PROVIDER_SIGNATORY_NAME_ALPHABET_ONLY_MESSAGE,
  filterAlphabetOnlyInput,
} from "../../../../../../shared/alphabetOnlyInput";

const optionalSignatoryNameStr = () =>
  yup
    .string()
    .default("")
    .test("provider-signatory-name", function (value) {
      const v = value?.trim() ?? "";
      if (!v) return true;
      if (/\d/.test(v)) {
        return this.createError({ message: CONTACT_PERSON_NAME_NUMBER_ERROR });
      }
      if (!ALPHABET_ONLY_PATTERN.test(v)) {
        return this.createError({ message: ALPHABET_ONLY_VALIDATION_MESSAGE });
      }
      return true;
    });

const optionalSignatoryDesignationStr = () =>
  yup
    .string()
    .default("")
    .test("provider-signatory-designation", function (value) {
      const v = value?.trim() ?? "";
      if (!v) return true;
      if (/\d/.test(v)) {
        return this.createError({ message: CONTACT_PERSON_DESIGNATION_NUMBER_ERROR });
      }
      if (!ALPHABET_ONLY_PATTERN.test(v)) {
        return this.createError({ message: ALPHABET_ONLY_VALIDATION_MESSAGE });
      }
      return true;
    });

const optionalDurationDaysStr = () =>
  yup
    .string()
    .default("")
    .test("agreement-duration-days", function (value) {
      const v = value?.trim() ?? "";
      if (!v) return true;
      if (!/^\d+$/.test(v)) {
        return this.createError({ message: CONTACT_PHONE_NUMBERS_ONLY_MESSAGE });
      }
      return true;
    });

/** New agreement route (`AddNewAgreementForm`) — core fields + required agreement upload when copy available. */
export const agreementStandaloneFormSchema = yup.object({
  ...agreementCoreShape,
  agreementDurationDays: optionalDurationDaysStr(),
  ppnCity: yup.string().when("agreementName", ([agreementName], schema) =>
    isPpnCityRequiredAgreementName(agreementName)
      ? requireTrimmedField(schema, "PPN City is required")
      : defaultEmptyString(schema),
  ),
  ppnState: yup.string().when("agreementName", ([agreementName], schema) =>
    isPpnStateRequiredAgreementName(agreementName)
      ? requireTrimmedField(schema, "PPN State is required")
      : defaultEmptyString(schema),
  ),
  supportingDocumentFile: yup.mixed().test(
    "supporting-document-required",
    SUPPORTING_DOCUMENT_REQUIRED_MESSAGE,
    function validateSupportingDocumentFile(value) {
      return validateStandaloneSupportingDocumentFile(value);
    },
  ),
  agreementCopyAvailable: optionalStr(),
  documentFile: yup.mixed().test(
    "agreement-document-required",
    AGREEMENT_DOCUMENT_REQUIRED_MESSAGE,
    function validateDocumentFile(value) {
      const parent = this.parent as { agreementCopyAvailable?: string };
      return validateStandaloneDocumentFile(value, parent.agreementCopyAvailable);
    },
  ),
});

/** Hospital Agreement tab edit — same rules + optional fields so resolver keeps full shape. */
export const agreementFullFormSchema = yup.object({
  ...agreementCoreShape,
  agreementNumber: optionalStr(),
  agreementVersion: optionalStr(),
  agreementDurationDays: optionalDurationDaysStr(),
  effectiveTo: optionalStr(),
  status: optionalStr(),
  applicableIcsSummary: optionalStr(),
  selectedIcInvolvementJson: optionalStr(),
  creditPeriodDays: optionalStr(),
  interestPeriod: optionalStr(),
  signAgreementSentDate: optionalStr(),
  agreementCopyAvailable: optionalStr(),
  hardCopySubmitted: optionalStr(),
  infrastructureAuditDone: optionalStr(),
  providerSignatoryName: optionalSignatoryNameStr(),
  providerSignatoryDesignation: optionalSignatoryDesignationStr(),
  gipsaPpn: optionalStr(),
  ppnCity: yup.string().when("agreementName", ([agreementName], schema) =>
    isPpnCityRequiredAgreementName(agreementName)
      ? requireTrimmedField(schema, "PPN City is required")
      : defaultEmptyString(schema),
  ),
  ppnState: yup.string().when("agreementName", ([agreementName], schema) =>
    isPpnStateRequiredAgreementName(agreementName)
      ? requireTrimmedField(schema, "PPN State is required")
      : defaultEmptyString(schema),
  ),
  ppnStateName: optionalStr(),
  ppnCityName: optionalStr(),
  gic: optionalStr(),
  party3Type: optionalStr(),
  party3Name: optionalStr(),
  agreementDocumentName: agreementDocumentNameField,
  agreementDocumentUploadedOn: optionalStr(),
  supportingDocumentName: supportingDocumentNameField,
  supportingDocumentUploadedOn: optionalStr(),
  fileMetadataId: optionalStr(),
  supportingFileMetadataId: optionalStr(),
  inwardNo: optionalStr(),
  pendingAgreementDocumentFile: yup.mixed().nullable().default(null),
  pendingSupportingDocumentFile: yup.mixed().nullable().default(null),
}) as yup.ObjectSchema<AgreementFullFormValues>;
