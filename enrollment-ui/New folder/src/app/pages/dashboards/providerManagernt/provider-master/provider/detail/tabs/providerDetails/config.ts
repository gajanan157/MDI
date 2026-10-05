import type { TFunction } from "i18next";
import type { ContactFormValues } from "../../schemas";
import type { GeneralInfoFormValues } from "../../schemas";
import type { CertificatesEditFormValues } from "../../schemas";
import type { ProviderDetailsFromApi } from "../../utils/providerDetailSectionMerges";
import { createProviderDetailsFieldLabels } from "../../../../../shared/providerMasterI18n";
import {
  resolveClinicalSpecialtyLabels,
  resolveProviderClassLabel,
  resolveProviderTypeLabel,
} from "./options";

export const IDENTIFIER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const PROVIDER_LOCATION_TYPE_OPTIONS = [
  { value: "", label: "Select" },
  { value: "Rural", label: "Rural" },
  { value: "Urban", label: "Urban" },
  { value: "Metro", label: "Metro" },
  {
    value: "Notified / inaccessible areas",
    label: "Notified / inaccessible areas",
  },
];

function resolveOptionalYesNoLabel(
  flag: boolean | undefined,
  labels: { yes: string; no: string },
): string | undefined {
  if (flag === true) return labels.yes;
  if (flag === false) return labels.no;
  return undefined;
}

function resolveClinicalSpecialitySource(
  providerDetails?: ProviderDetailsFromApi,
): string[] {
  if (providerDetails?.clinicalSpecialties?.length) {
    return providerDetails.clinicalSpecialties;
  }
  if (providerDetails?.providerSubclass) {
    return [providerDetails.providerSubclass];
  }
  return [];
}

function resolveProviderLocationTypeLabel(value: string | undefined): string | undefined {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return undefined;
  const match = PROVIDER_LOCATION_TYPE_OPTIONS.find(
    (option) =>
      option.value &&
      String(option.value).toLowerCase() === trimmed.toLowerCase(),
  );
  return match?.label ?? trimmed;
}

export const GENERAL_INFO_DEFAULT_VALUES: GeneralInfoFormValues = {
  providerName: "",
  providerCode: "",
  providerIibRohiniCode: "",
  providerOldCodes: [],
  providerRegistrationNo: "",
  providerRegistrationAuthority: "",
  providerOwnershipType: "",
  providerDayCareFlag: false,
  providerCareTier: "",
  providerInternalGrade: "",
  category: "",
  providerOwnerName: "",
  providerOwnerDesignation: "",
  providerSignatoryName: "",
  providerSignatoryDesignation: "",
  providerType: "HOSPITAL",
  providerClass: "",
  providerSubclass: "",
  providerSystemOfMedicineId: "",
  tpaServicingBranchName: "",
  tpaServicingBranchEmail: "",
  clinicalSpecialties: [],
  providerAddress: "",
  providerCity: "",
  providerDistrict: "",
  providerStateName: "",
  providerZone: "",
  providerPostalCode: "",
  providerLocationType: "",
};

export const CONTACT_DEFAULT_VALUES: ContactFormValues = {
  contactEmail: "",
  stdCode: "",
  contactNumber: "",
  faxNo: "",
  mobNo: "",
  isWebsiteAvailable: false,
  websiteUrl: "",
};

export const CERTIFICATES_DEFAULT_VALUES: CertificatesEditFormValues = {
  items: [],
};

export const EMPTY_CERTIFICATE_ROW = {
  certificateId: "",
  type: "",
  status: "",
  validFrom: "",
  validTo: "",
  registrationNo: "",
  providerActName: "",
  fileMetadataId: "",
} as const;

export const CERTIFICATE_STATUS_OPTIONS = [
  { value: "Registered", label: "Registered" },
  { value: "Not Registered", label: "Not Registered" },
];

export const CARE_TIER_OPTIONS = [
  { value: "", label: "Select" },
  { value: "Primary", label: "Primary" },
  { value: "Secondary", label: "Secondary" },
  { value: "Tertiary", label: "Tertiary" },
  // { value: "Day care", label: "Day care" },
];

export const GRADE_OPTIONS = [
  { value: "", label: "Select" },
  { value: "A", label: "Grade A" },
  { value: "B", label: "Grade B" },
  { value: "C", label: "Grade C" },
  { value: "D", label: "Grade D" },
];

export const OWNERSHIP_TYPE_OPTIONS = [
  { value: "", label: "Select" },
  { value: "Private", label: "Private" },
  { value: "Public", label: "Public" },
];

function resolveOwnershipTypeLabel(value: string | undefined): string | undefined {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return undefined;
  const match = OWNERSHIP_TYPE_OPTIONS.find(
    (option) =>
      option.value &&
      String(option.value).toLowerCase() === trimmed.toLowerCase(),
  );
  return match?.label ?? trimmed;
}

export const CATEGORY_OPTIONS = [
  { value: "", label: "Select" },
  { value: "General", label: "General" },
  { value: "Single", label: "Single" },
  { value: "Multi Specialty", label: "Multi Specialty" },
];

export type DetailFieldConfig = {
  label: string;
  value?: string | number;
  hideWhenEmpty?: boolean;
};

export function getProviderInformationViewFields(
  providerDetails: ProviderDetailsFromApi | null,
  providerTypeOptions: Array<{ label: string; value: string }> = [],
  providerClassOptions: Array<{ label: string; value: string }> = [],
  providerSubclassOptions: Array<{ label: string; value: string }> = [],
  t: TFunction,
): DetailFieldConfig[] {
  const labels = createProviderDetailsFieldLabels(t);
  const tpaBranchLabel =
    providerDetails?.tpaServicingBranchName?.trim() ||
    providerDetails?.providerTpaServicingBranchName?.trim() ||
    providerDetails?.providerTpaServicingBranchId;

  return [
    { label: labels.providerName, value: providerDetails?.providerName },
    {
      label: labels.ownershipType,
      value: resolveOwnershipTypeLabel(providerDetails?.providerOwnershipType),
    },
    { label: labels.providerCode, value: providerDetails?.providerCode },
    { label: labels.grade, value: providerDetails?.providerInternalGrade },
    {
      label: labels.dayCare,
      value: resolveOptionalYesNoLabel(providerDetails?.providerDayCareFlag, labels),
    },
    { label: labels.careTier, value: providerDetails?.providerCareTier },
    {
      label: labels.providerType,
      value: resolveProviderTypeLabel(providerDetails?.providerType, providerTypeOptions),
    },
    { label: labels.signatoryName, value: providerDetails?.providerSignatoryName },
    {
      label: labels.providerCategory,
      value:
        providerDetails?.providerTypeName?.trim() ||
        resolveProviderClassLabel(
          providerDetails?.providerTypeId ?? providerDetails?.providerClass,
          providerClassOptions,
        ),
    },
    {
      label: labels.clinicalSpeciality,
      value: resolveClinicalSpecialtyLabels(
        resolveClinicalSpecialitySource(providerDetails),
        providerSubclassOptions,
      ),
    },
    {
      label: labels.signatoryDesignation,
      value: providerDetails?.providerSignatoryDesignation,
    },
    {
      label: labels.systemOfMedicine,
      value:
        providerDetails?.providerSystemOfMedicineName ||
        providerDetails?.providerSystemOfMedicineId,
    },
    {
      label: labels.tpaServicingBranch,
      value: tpaBranchLabel,
    },
    {
      label: labels.serviceEmail,
      value: (() => {
        const emails = providerDetails?.tpaServicingBranchEmail;
        if (Array.isArray(emails) && emails.length > 0) return emails.join(", ");
        return providerDetails?.providerServiceEmailId;
      })(),
    },
  ];
}

export function getAddressViewFields(
  providerDetails: ProviderDetailsFromApi | null,
  t: TFunction,
): DetailFieldConfig[] {
  const labels = createProviderDetailsFieldLabels(t);
  return [
    { label: labels.city, value: providerDetails?.providerCity },
    { label: labels.district, value: providerDetails?.providerDistrict },
    { label: labels.state, value: providerDetails?.providerStateName },
    { label: labels.zone, value: providerDetails?.providerZone },
    { label: labels.pinCode, value: providerDetails?.providerPostalCode },
    {
      label: labels.location,
      value: resolveProviderLocationTypeLabel(providerDetails?.providerLocation),
    },
    { label: labels.address, value: providerDetails?.providerAddress },
  ];
}

export function getIdentifierViewFields(
  providerDetails: ProviderDetailsFromApi | null,
  t: TFunction,
): DetailFieldConfig[] {
  const labels = createProviderDetailsFieldLabels(t);
  return [
    { label: labels.providerCode, value: providerDetails?.providerCode },
    { label: labels.providerRohiniId, value: providerDetails?.providerIibRohiniCode },
    { label: labels.registrationNo, value: providerDetails?.providerRegistrationNo },
    {
      label: labels.registrationAct,
      value: providerDetails?.providerRegistrationAuthority,
    },
  ];
}

/** Collapsed: height follows visible content only (no fixed min-height). */
export const PROVIDER_SECTION_COLLAPSED_BODY_CLASS = "h-auto";

/** Expanded: grow with full content. */
export const PROVIDER_SECTION_EXPANDED_BODY_CLASS = "h-auto max-h-none";

/** Default detail-field preview before "See more". */
export const PROVIDER_SECTION_INITIAL_FIELD_COUNT = 10;

/** Certificates section: cards shown before "See more". */
export const PROVIDER_SECTION_INITIAL_CERTIFICATE_COUNT = 3;

function fieldHasValue(field: DetailFieldConfig, hideWhenEmpty: boolean): boolean {
  if (!(field.hideWhenEmpty ?? hideWhenEmpty)) return true;
  const value = field.value;
  if (value == null) return false;
  return String(value).trim() !== "";
}

export function getRenderableDetailFields(
  fields: DetailFieldConfig[],
  defaultHideWhenEmpty = false,
): DetailFieldConfig[] {
  return fields.filter((field) => fieldHasValue(field, defaultHideWhenEmpty));
}

export function sliceDetailFieldsForSection(
  fields: DetailFieldConfig[],
  expanded: boolean,
  defaultHideWhenEmpty = false,
  limit = PROVIDER_SECTION_INITIAL_FIELD_COUNT,
): { visibleFields: DetailFieldConfig[]; hasMore: boolean } {
  const renderable = getRenderableDetailFields(fields, defaultHideWhenEmpty);
  const hasMore = renderable.length > limit;
  const visibleFields =
    expanded || !hasMore ? renderable : renderable.slice(0, limit);

  return { visibleFields, hasMore };
}
