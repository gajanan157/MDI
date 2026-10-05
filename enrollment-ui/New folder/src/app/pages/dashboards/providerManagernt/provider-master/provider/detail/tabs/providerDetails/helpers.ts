import type { FormEvent } from "react";
import type { UseFormSetValue } from "react-hook-form";
import {
  parseProviderOldCodePayload,
  serializeProviderOldCodeForApi,
} from "../../utils/providerOldCodeUtils";
import type { ProviderDetailCertificate } from "../../../hospitalData";
import type { ProviderDetailsFromApi } from "../../utils/providerDetailSectionMerges";
import type { ContactFormValues } from "../../schemas";
import type { GeneralInfoFormValues } from "../../schemas";
import type { CertificatesEditFormValues } from "../../schemas";
import type { IdentifiersEditFormValues } from "../../schemas";
import { buildIdentifiersPatch } from "./identifierUtils";
import { DEFAULT_PROVIDER_TYPE } from "./options";
import type { ProviderAuditLogContext } from "../../shared/providerAuditLog";
import { formatToDDMMMYYYY } from "@/app/pages/dashboards/providerManagernt/shared/dateFormat";
import { EMPTY_CERTIFICATE_ROW } from "./config";

export function appendEmptyCertificateRow(
  append: (row: typeof EMPTY_CERTIFICATE_ROW) => void,
) {
  append({ ...EMPTY_CERTIFICATE_ROW });
}

export function buildTelephoneDisplay(
  stdCode: string,
  contactNumber: string,
): string {
  return stdCode ? `${stdCode}-${contactNumber}` : contactNumber;
}

export function createTelephoneChangeHandler(
  setValue: UseFormSetValue<ContactFormValues>,
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    const dashIdx = v.indexOf("-");
    if (dashIdx > 0) {
      setValue("stdCode", v.slice(0, dashIdx), {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("contactNumber", v.slice(dashIdx + 1), {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }
    setValue("stdCode", "", { shouldValidate: true, shouldDirty: true });
    setValue("contactNumber", v, { shouldValidate: true, shouldDirty: true });
  };
}

export function handleFaxInput(e: FormEvent<HTMLInputElement>) {
  const next = e.currentTarget.value.replace(/[^0-9,;\s-]/g, "");
  if (next !== e.currentTarget.value) {
    e.currentTarget.value = next;
  }
}

/** E.164 input: digits, optional +, and multi-value separators only (no spaces/hyphens). */
export function handleE164PhoneInput(e: FormEvent<HTMLInputElement>) {
  const next = e.currentTarget.value.replace(/[^0-9+,;]/g, "");
  if (next !== e.currentTarget.value) {
    e.currentTarget.value = next;
  }
}

export function mapGradeToForm(v: string | undefined): string {
  if (!v) return "";
  const m = v.match(/\b([A-D])\b/i);
  return m ? m[1].toUpperCase() : v;
}

export function mapOwnershipTypeToForm(v: string | undefined): string {
  const trimmed = String(v ?? "").trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (lower === "private") return "Private";
  if (lower === "public") return "Public";
  return trimmed;
}

function isAsciiWhitespace(ch: string): boolean {
  return (
    ch === " " ||
    ch === "\t" ||
    ch === "\n" ||
    ch === "\r" ||
    ch === "\f" ||
    ch === "\v"
  );
}

function replaceLineBreaks(text: string, replacement: string): string {
  let result = "";
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    if (ch === "\r") {
      if (text[i + 1] === "\n") i += 1;
      result += replacement;
      continue;
    }
    if (ch === "\n") {
      result += replacement;
      continue;
    }
    result += ch;
  }
  return result;
}

function collapseWhitespace(text: string): string {
  let result = "";
  let pendingSpace = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    if (isAsciiWhitespace(ch)) {
      if (result.length > 0) pendingSpace = true;
      continue;
    }
    if (pendingSpace) {
      result += " ";
      pendingSpace = false;
    }
    result += ch;
  }
  return result;
}

function normalizeCommaSpacing(text: string): string {
  if (!text.includes(",")) return text;
  return text.split(",").map((part) => part.trim()).join(", ");
}

export function normalizeContactEmailDisplay(raw: string): string {
  return collapseWhitespace(replaceLineBreaks(raw, " ")).trim();
}

export function normalizeContactValueDisplay(raw: string): string {
  return collapseWhitespace(
    normalizeCommaSpacing(replaceLineBreaks(raw, ", ")),
  ).trim();
}

export function formatCertificateDisplayValue(v: string | undefined): string {
  if (v == null || String(v).trim() === "") return "—";
  return String(v);
}

/** Certificate valid-from / valid-to display (`dd MMM yyyy`). */
export function formatCertificateDateDisplay(v: string | undefined): string {
  if (v == null || String(v).trim() === "") return "—";
  return formatToDDMMMYYYY(String(v));
}

export type CertificateStatusVariant =
  | "empty"
  | "positive"
  | "muted"
  | "neutral";

export function getCertificateStatusVariant(
  raw: string | undefined,
): { variant: CertificateStatusVariant; text: string } {
  const trimmed = raw == null ? "" : String(raw).trim();
  if (trimmed === "") return { variant: "empty", text: "" };

  const lower = trimmed.toLowerCase();
  const positive = lower.includes("register") && !/\bnot\b/i.test(trimmed);
  const muted =
    lower.includes("not") || lower.includes("no ") || lower.includes("n/a");

  if (positive) return { variant: "positive", text: trimmed };
  if (muted) return { variant: "muted", text: trimmed };
  return { variant: "neutral", text: trimmed };
}

export const CLINICAL_ESTABLISHMENT_CERTIFICATE_LABEL =
  "Clinical Establishment Certificate";

export function isClinicalEstablishmentCertificate(
  type: string | undefined | null,
): boolean {
  return (
    (type ?? "").trim().toLowerCase() ===
    CLINICAL_ESTABLISHMENT_CERTIFICATE_LABEL.toLowerCase()
  );
}

export function mergeCertificateTypeOptions(
  certificateTypeOptions: Array<{ label: string; value: string }>,
  certType: string | undefined | null,
): Array<{ label: string; value: string }> {
  const trimmed = String(certType ?? "").trim();
  if (!trimmed) return certificateTypeOptions;
  if (certificateTypeOptions.some((opt) => opt.value === trimmed)) {
    return certificateTypeOptions;
  }
  return [...certificateTypeOptions, { label: trimmed, value: trimmed }];
}

export function splitMultiValue(raw: string): string[] {
  return String(raw ?? "")
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function normalizeStringArray(raw: string | string[] | undefined): string[] {
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v ?? "").trim()).filter(Boolean);
  }
  return splitMultiValue(String(raw ?? ""));
}

function nestTpaServicingBranchPatch(
  payload: Record<string, unknown>,
  base: ProviderDetailsFromApi,
) {
  if (!("tpaServicingBranchEmail" in payload)) return;

  const emails = payload.tpaServicingBranchEmail;
  delete payload.tpaServicingBranchEmail;

  const tpaServicingBranch: Record<string, unknown> = {
    tpaServicingBranchEmail: emails,
  };
  const mappingId = base.providerTpaServicingBranchCityMappingId?.trim();
  if (mappingId) {
    tpaServicingBranch.providerTpaServicingBranchCityMappingId = mappingId;
  }
  payload.tpaServicingBranch = tpaServicingBranch;
}

export function resolveClinicalSpecialtyIds(
  raw: string | string[] | undefined,
  clinicalSpecialtyOptions: Array<{ label: string; value: string }>,
): string[] {
  const items = normalizeStringArray(raw);
  if (items.length === 0) return [];
  const byLabel = new Map<string, string>(
    clinicalSpecialtyOptions.map((opt) => [
      String(opt.label).trim().toLowerCase(),
      String(opt.value),
    ]),
  );
  return items.map((item) => byLabel.get(item.toLowerCase()) ?? item);
}

function splitTelephoneForForm(telephoneList: string[] | undefined): {
  stdCode: string;
  contactNumber: string;
} {
  const first = telephoneList?.[0] ?? "";
  const dashIdx = first.indexOf("-");
  if (dashIdx > 0) {
    return {
      stdCode: first.slice(0, dashIdx),
      contactNumber: first.slice(dashIdx + 1),
    };
  }
  return { stdCode: "", contactNumber: first };
}

export type ProviderFormValues = {
  general: GeneralInfoFormValues;
  contact: ContactFormValues;
  certs: CertificatesEditFormValues;
};

export function buildProviderFormValues(
  providerDetails: ProviderDetailsFromApi,
  clinicalSpecialtyOptions: Array<{ label: string; value: string }>,
  systemOfMedicineOptions: Array<{ label: string; value: string }> = [],
): ProviderFormValues {
  const contact = providerDetails.providerContactDetail;
  const telephone = splitTelephoneForForm(contact?.providerTelephoneNo);

  const medicineIdFromApi = providerDetails.providerSystemOfMedicineId?.trim() || "";
  const medicineNameFromApi = providerDetails.providerSystemOfMedicineName?.trim() || "";
  const medicineIdFromName = medicineNameFromApi
    ? systemOfMedicineOptions.find(
        (opt) => opt.label.trim().toLowerCase() === medicineNameFromApi.toLowerCase(),
      )?.value
    : undefined;

  return {
    general: {
      providerName: providerDetails.providerName,
      providerCode: providerDetails.providerCode,
      providerIibRohiniCode: providerDetails.providerIibRohiniCode,
      providerOldCodes:
        parseProviderOldCodePayload(providerDetails.providerOldCode)?.map((r) => ({
          ...r,
        })) ?? [],
      providerRegistrationNo: providerDetails.providerRegistrationNo ?? "",
      providerRegistrationAuthority: providerDetails.providerRegistrationAuthority ?? "",
      providerOwnershipType: mapOwnershipTypeToForm(
        providerDetails.providerOwnershipType,
      ),
      providerDayCareFlag: providerDetails.providerDayCareFlag === true,
      providerCareTier: providerDetails.providerCareTier ?? "",
      providerInternalGrade: mapGradeToForm(providerDetails.providerInternalGrade),
      category: "",
      providerOwnerName: providerDetails.providerOwnerName ?? "",
      providerOwnerDesignation: providerDetails.providerOwnerDesignation ?? "",
      providerSignatoryName: providerDetails.providerSignatoryName ?? "",
      providerSignatoryDesignation: providerDetails.providerSignatoryDesignation ?? "",
      providerType: providerDetails.providerType || DEFAULT_PROVIDER_TYPE,
      providerClass:
        providerDetails.providerTypeId?.trim() ||
        providerDetails.providerClass ||
        "",
      providerSubclass: providerDetails.providerSubclass ?? "",
      providerSystemOfMedicineId:
        medicineIdFromApi || medicineIdFromName || medicineNameFromApi || "",
      tpaServicingBranchName:
        providerDetails.tpaServicingBranchName ??
        providerDetails.providerTpaServicingBranchName ??
        "",
      tpaServicingBranchEmail: normalizeStringArray(
        providerDetails.tpaServicingBranchEmail?.length
          ? providerDetails.tpaServicingBranchEmail
          : providerDetails.providerServiceEmailId,
      ).join(", "),
      clinicalSpecialties: (() => {
        const fromIds = normalizeStringArray(providerDetails.clinicalSpecialtyIds);
        const fromNames = normalizeStringArray(providerDetails.clinicalSpecialties);
        const fromApi = fromIds.length > 0 ? fromIds : fromNames;
        if (fromApi.length > 0) {
          return clinicalSpecialtyOptions.length
            ? resolveClinicalSpecialtyIds(fromApi, clinicalSpecialtyOptions)
            : fromApi;
        }
        const subclass = providerDetails.providerSubclass?.trim();
        return subclass ? [subclass] : [];
      })(),
      providerAddress: providerDetails.providerAddress ?? "",
      providerCity: providerDetails.providerCity ?? "",
      providerDistrict: providerDetails.providerDistrict ?? "",
      providerStateName: providerDetails.providerStateName ?? "",
      providerZone: providerDetails.providerZone ?? "",
      providerPostalCode: providerDetails.providerPostalCode ?? "",
      providerLocationType: providerDetails.providerLocation ?? "",
    },
    contact: {
      contactEmail: (contact?.providerEmailId ?? []).join(", "),
      stdCode: telephone.stdCode,
      contactNumber: telephone.contactNumber,
      faxNo: (contact?.providerFaxNo ?? []).join(", "),
      mobNo: (contact?.providerMobileNo ?? []).join(", "),
      isWebsiteAvailable: contact?.providerWebsiteAvailableFlag ?? false,
      websiteUrl:
        typeof contact?.providerWebsiteUrl === "string"
          ? contact.providerWebsiteUrl
          : "",
    },
    certs: providerDetails.certificates.length
      ? {
          items: providerDetails.certificates.map((c) => ({
            certificateId: c.certificateId,
            type: c.type,
            status: c.status ?? "",
            validFrom: c.validFrom ?? "",
            validTo: c.validTo ?? "",
            registrationNo: c.registrationNo ?? "",
            providerActName: c.providerActName ?? "",
            fileMetadataId: c.fileMetadataId ?? "",
          })),
        }
      : { items: [] },
  };
}

export type ContactViewFields = {
  email?: string;
  telePhone?: string;
  mobNo?: string;
};

export function getContactViewFields(
  providerDetails: ProviderDetailsFromApi | null,
): ContactViewFields {
  if (!providerDetails) return {};

  const contact = providerDetails.providerContactDetail;
  const emailRaw = normalizeContactEmailDisplay(
    (contact?.providerEmailId ?? []).join(", "),
  );
  const teleRaw = (contact?.providerTelephoneNo ?? []).join(", ");
  const teleDisplay = normalizeContactValueDisplay(teleRaw);
  const mobDisplay = normalizeContactValueDisplay(
    (contact?.providerMobileNo ?? []).join(", "),
  );

  return {
    email: emailRaw.length > 0 ? emailRaw : undefined,
    telePhone: teleDisplay.length > 0 ? teleDisplay : undefined,
    mobNo: mobDisplay.length > 0 ? mobDisplay : undefined,
  };
}

export type { ProviderDetailCertificate };

function normalizeNullable(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

function toComparableArray(v: unknown): string[] {
  return Array.isArray(v)
    ? v.map((x) => String(x ?? "").trim()).filter(Boolean)
    : normalizeStringArray(String(v ?? ""));
}

function isSame(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function resolveRawBaseClinicalSpecialties(base: ProviderDetailsFromApi): string[] {
  const ids = normalizeStringArray(base.clinicalSpecialtyIds);
  if (ids.length > 0) {
    return ids;
  }
  if (base.clinicalSpecialties.length > 0) {
    return base.clinicalSpecialties;
  }
  if (base.providerSubclass) {
    return [base.providerSubclass];
  }
  return [];
}

function buildGeneralPatch(
  general: GeneralInfoFormValues,
  base: ProviderDetailsFromApi,
  providerOldCodesDirty: boolean,
  clinicalSpecialtyOptions: Array<{ label: string; value: string }> = [],
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const putIfChanged = (
    key: string,
    next: unknown,
    prev: unknown,
    when = true,
  ) => {
    if (!when) return;
    if (!isSame(next, prev)) payload[key] = next;
  };

  putIfChanged("providerName", general.providerName || base.providerName, base.providerName);
  putIfChanged("providerCode", general.providerCode || base.providerCode, base.providerCode);
  putIfChanged(
    "providerIibRohiniCode",
    general.providerIibRohiniCode || base.providerIibRohiniCode,
    base.providerIibRohiniCode,
  );
  putIfChanged(
    "providerOldCode",
    serializeProviderOldCodeForApi(general.providerOldCodes ?? []),
    base.providerOldCode,
    providerOldCodesDirty,
  );
  putIfChanged(
    "providerOwnershipType",
    general.providerOwnershipType || base.providerOwnershipType,
    base.providerOwnershipType,
  );
  putIfChanged(
    "providerDayCareFlag",
    general.providerDayCareFlag === true,
    base.providerDayCareFlag === true,
  );
  putIfChanged(
    "providerCareTier",
    general.providerCareTier || base.providerCareTier,
    base.providerCareTier,
  );
  putIfChanged(
    "providerInternalGrade",
    general.providerInternalGrade || base.providerInternalGrade,
    mapGradeToForm(base.providerInternalGrade) || base.providerInternalGrade,
  );
  putIfChanged(
    "providerOwnerName",
    general.providerOwnerName || base.providerOwnerName,
    base.providerOwnerName,
  );
  putIfChanged(
    "providerOwnerDesignation",
    general.providerOwnerDesignation || base.providerOwnerDesignation,
    base.providerOwnerDesignation,
  );
  putIfChanged(
    "providerSignatoryName",
    general.providerSignatoryName || base.providerSignatoryName,
    base.providerSignatoryName,
  );
  putIfChanged(
    "providerSignatoryDesignation",
    general.providerSignatoryDesignation || base.providerSignatoryDesignation,
    base.providerSignatoryDesignation,
  );
  putIfChanged(
    "providerType",
    general.providerType || base.providerType,
    base.providerType,
  );
  const nextProviderTypeId = general.providerClass?.trim() || "";
  const baseProviderTypeId = base.providerTypeId?.trim() || "";
  if (nextProviderTypeId !== baseProviderTypeId) {
    // Category dropdown values are taxonomy `providerTypeId`.
    payload.providerTypeId = nextProviderTypeId || null;
  }
  const nextClinicalSpecialties = normalizeStringArray(general.clinicalSpecialties);
  const rawBaseClinicalSpecialties = resolveRawBaseClinicalSpecialties(base);
  const baseClinicalSpecialties =
    clinicalSpecialtyOptions.length > 0
      ? resolveClinicalSpecialtyIds(rawBaseClinicalSpecialties, clinicalSpecialtyOptions)
      : toComparableArray(rawBaseClinicalSpecialties);
  if (!isSame(nextClinicalSpecialties, baseClinicalSpecialties)) {
    payload.clinicalSpecialties = nextClinicalSpecialties;
  }
  putIfChanged(
    "providerSubclass",
    nextClinicalSpecialties[0] ?? "",
    baseClinicalSpecialties[0] ?? base.providerSubclass ?? "",
  );
  putIfChanged(
    "providerSystemOfMedicineName",
    general.providerSystemOfMedicineId || base.providerSystemOfMedicineId || base.providerSystemOfMedicineName,
    base.providerSystemOfMedicineId || base.providerSystemOfMedicineName,
  );
  putIfChanged(
    "tpaServicingBranchEmail",
    normalizeStringArray(general.tpaServicingBranchEmail),
    normalizeStringArray(
      base.tpaServicingBranchEmail?.length
        ? base.tpaServicingBranchEmail
        : base.providerServiceEmailId,
    ),
  );
  nestTpaServicingBranchPatch(payload, base);
  putIfChanged(
    "providerAddress",
    general.providerAddress || base.providerAddress,
    base.providerAddress,
  );
  putIfChanged("providerCity", general.providerCity || base.providerCity, base.providerCity);
  putIfChanged(
    "providerDistrict",
    general.providerDistrict || base.providerDistrict,
    base.providerDistrict,
  );
  putIfChanged(
    "providerStateName",
    general.providerStateName || base.providerStateName,
    base.providerStateName,
  );
  putIfChanged("providerZone", general.providerZone || base.providerZone, base.providerZone);
  putIfChanged(
    "providerPostalCode",
    general.providerPostalCode || base.providerPostalCode,
    base.providerPostalCode,
  );
  putIfChanged(
    "providerLocation",
    general.providerLocationType || base.providerLocation,
    base.providerLocation,
  );
  putIfChanged(
    "providerRegistrationNo",
    general.providerRegistrationNo || base.providerRegistrationNo,
    base.providerRegistrationNo,
  );
  putIfChanged(
    "providerRegistrationAuthority",
    general.providerRegistrationAuthority || base.providerRegistrationAuthority,
    base.providerRegistrationAuthority,
  );

  return payload;
}

function buildContactPatch(
  contact: ContactFormValues,
  base: ProviderDetailsFromApi,
): Record<string, unknown> | undefined {
  const telephoneRaw = String(contact.contactNumber ?? "").trim();
  const telephoneList = splitMultiValue(telephoneRaw).map((p) => {
    if (!contact.stdCode || p.includes("-")) return p;
    return `${contact.stdCode}-${p}`;
  });

  const baseContact = base.providerContactDetail ?? {};

  const nextContact = {
    providerWebsiteAvailableFlag: Boolean(contact.isWebsiteAvailable),
    providerWebsiteUrl: normalizeNullable(contact.websiteUrl),
    providerTelephoneNo: telephoneList,
    providerFaxNo: splitMultiValue(contact.faxNo),
    providerMobileNo: splitMultiValue(contact.mobNo),
    providerEmailId: splitMultiValue(contact.contactEmail),
  };

  const contactPatch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(nextContact)) {
    if (!isSame(value, baseContact[key as keyof typeof baseContact])) {
      contactPatch[key] = value;
    }
  }

  return Object.keys(contactPatch).length > 0 ? contactPatch : undefined;
}

function buildCertificatesPatch(
  certs: CertificatesEditFormValues,
  base: ProviderDetailsFromApi,
): unknown[] | undefined {
  const nextCertificates = certs.items.map((c, index) => {
    const baseCert = base.certificates[index] ?? {};
    return {
      certificateId: c.certificateId || baseCert.certificateId || null,
      type: c.type || baseCert.type || "",
      registrationNo: normalizeNullable(c.registrationNo),
      validFrom: normalizeNullable(c.validFrom),
      validTo: normalizeNullable(c.validTo),
      status: normalizeNullable(c.status),
      providerActName: normalizeNullable(c.providerActName),
    };
  });

  const baseCertificates = base.certificates.map((cert) => ({
    certificateId: cert.certificateId ?? null,
    type: cert.type ?? "",
    registrationNo: normalizeNullable(cert.registrationNo),
    validFrom: normalizeNullable(cert.validFrom),
    validTo: normalizeNullable(cert.validTo),
    status: normalizeNullable(cert.status),
    providerActName: normalizeNullable(cert.providerActName),
  }));

  return isSame(nextCertificates, baseCertificates) ? undefined : nextCertificates;
}

export type BuildProviderDetailsPatchInput = {
  providerDetails: ProviderDetailsFromApi;
  general: GeneralInfoFormValues;
  contact: ContactFormValues;
  certs: CertificatesEditFormValues;
  identifiers: IdentifiersEditFormValues;
  providerOldCodesDirty: boolean;
  clinicalSpecialtyOptions?: Array<{ label: string; value: string }>;
};

export function buildProviderDetailsPatch(
  input: BuildProviderDetailsPatchInput,
): Record<string, unknown> {
  const payload = buildGeneralPatch(
    input.general,
    input.providerDetails,
    input.providerOldCodesDirty,
    input.clinicalSpecialtyOptions,
  );

  const contactPatch = buildContactPatch(input.contact, input.providerDetails);
  if (contactPatch) payload.providerContactDetail = contactPatch;

  const certificatesPatch = buildCertificatesPatch(input.certs, input.providerDetails);
  if (certificatesPatch) payload.certificates = certificatesPatch;

  const identifiersPatch = buildIdentifiersPatch(input.identifiers, input.providerDetails);
  if (identifiersPatch) payload.identifiers = identifiersPatch;

  return payload;
}

function mapOwnershipTypeToApi(value: string | undefined): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (lower === "private") return "PRIVATE";
  if (lower === "public") return "PUBLIC";
  return trimmed.toUpperCase();
}

function buildOverviewOfficialContactArrays(
  contact: ContactFormValues,
): {
  providerOfficialEmail: string[];
  providerOfficialTelephone: string[];
  providerOfficialFax: string[];
  providerOfficialMobile: string[];
  providerWebsiteUrl: string | null;
} {
  const telephoneRaw = String(contact.contactNumber ?? "").trim();
  const telephoneList = splitMultiValue(telephoneRaw).map((p) => {
    if (!contact.stdCode || p.includes("-")) return p;
    return `${contact.stdCode}-${p}`;
  });

  return {
    providerOfficialEmail: splitMultiValue(contact.contactEmail),
    providerOfficialTelephone: telephoneList,
    providerOfficialFax: splitMultiValue(contact.faxNo),
    providerOfficialMobile: splitMultiValue(contact.mobNo),
    providerWebsiteUrl: normalizeNullable(contact.websiteUrl),
  };
}

function buildOverviewAddressPatch(
  general: GeneralInfoFormValues,
  base: ProviderDetailsFromApi,
): Record<string, unknown> | undefined {
  const nextAddress: Record<string, unknown> = {
    providerAddressId: base.providerAddressId ?? null,
    providerPlotNo: base.providerPlotNo ?? null,
    providerLocation:
      general.providerLocationType?.trim() || base.providerLocation || null,
    providerAddress: general.providerAddress?.trim() || base.providerAddress || null,
    providerCity: general.providerCity?.trim() || base.providerCity || null,
    providerTaluka: base.providerTaluka ?? null,
    providerDistrict: general.providerDistrict?.trim() || base.providerDistrict || null,
    providerStateName: general.providerStateName?.trim() || base.providerStateName || null,
    providerStateCode: base.providerStateCode ?? null,
    providerZone: general.providerZone?.trim() || base.providerZone || null,
    providerPostalCode: general.providerPostalCode?.trim() || base.providerPostalCode || null,
    providerCountryCode: base.providerCountryCode ?? "IN",
    providerLatitude: base.providerLatitude ?? null,
    providerLongitude: base.providerLongitude ?? null,
    providerAddressStatus: base.providerAddressStatus ?? "ACTIVE",
  };

  const baseAddress: Record<string, unknown> = {
    providerAddressId: base.providerAddressId ?? null,
    providerPlotNo: base.providerPlotNo ?? null,
    providerLocation: base.providerLocation ?? null,
    providerAddress: base.providerAddress ?? null,
    providerCity: base.providerCity ?? null,
    providerTaluka: base.providerTaluka ?? null,
    providerDistrict: base.providerDistrict ?? null,
    providerStateName: base.providerStateName ?? null,
    providerStateCode: base.providerStateCode ?? null,
    providerZone: base.providerZone ?? null,
    providerPostalCode: base.providerPostalCode ?? null,
    providerCountryCode: base.providerCountryCode ?? "IN",
    providerLatitude: base.providerLatitude ?? null,
    providerLongitude: base.providerLongitude ?? null,
    providerAddressStatus: base.providerAddressStatus ?? "ACTIVE",
  };

  return isSame(nextAddress, baseAddress) ? undefined : nextAddress;
}

function buildOverviewEmpanelmentPatch(
  general: GeneralInfoFormValues,
  base: ProviderDetailsFromApi,
): Record<string, unknown> | undefined {
  const next = {
    providerEmpanellmentId: base.providerEmpanellmentId ?? null,
    providerInternalGrade:
      general.providerInternalGrade || mapGradeToForm(base.providerInternalGrade) || null,
    providerCareTier: general.providerCareTier || base.providerCareTier || null,
  };
  const prev = {
    providerEmpanellmentId: base.providerEmpanellmentId ?? null,
    providerInternalGrade: mapGradeToForm(base.providerInternalGrade) || base.providerInternalGrade || null,
    providerCareTier: base.providerCareTier ?? null,
  };
  return isSame(next, prev) ? undefined : next;
}

function buildOverviewCertificatesPatch(
  certs: CertificatesEditFormValues,
  base: ProviderDetailsFromApi,
): unknown[] | undefined {
  const nextCertificates = certs.items.map((c, index) => {
    const baseCert = base.certificates[index] ?? {};
    return {
      providerCertificateId: c.certificateId || baseCert.certificateId || null,
      providerCertificateTypeName: c.type || baseCert.type || "",
      providerCertificateRegistrationNumber: normalizeNullable(c.registrationNo),
      providerCertificateStatus: normalizeNullable(c.status),
      providerCertificateValidFromDate: normalizeNullable(c.validFrom),
      providerCertificateValidToDate: normalizeNullable(c.validTo),
      fileMetadataId:
        normalizeNullable(c.fileMetadataId) ??
        normalizeNullable(baseCert.fileMetadataId),
    };
  });

  const baseCertificates = base.certificates.map((cert) => ({
    providerCertificateId: cert.certificateId ?? null,
    providerCertificateTypeName: cert.type ?? "",
    providerCertificateRegistrationNumber: normalizeNullable(cert.registrationNo),
    providerCertificateStatus: normalizeNullable(cert.status),
    providerCertificateValidFromDate: normalizeNullable(cert.validFrom),
    providerCertificateValidToDate: normalizeNullable(cert.validTo),
    fileMetadataId: normalizeNullable(cert.fileMetadataId),
  }));

  return isSame(nextCertificates, baseCertificates) ? undefined : nextCertificates;
}

function buildOverviewIdentifiersPatch(
  identifiers: IdentifiersEditFormValues,
  base: ProviderDetailsFromApi,
): Record<string, unknown>[] | undefined {
  const nextRows = identifiers.items.map((row) => {
    const baseRow = base.identifiers.find(
      (item) =>
        item.providerIdentifierId === row.providerIdentifierId ||
        (item.identifierTypeName === row.identifierTypeName &&
          item.identifierValue === row.identifierValue),
    );
    return {
      providerIdentifierId: row.providerIdentifierId || baseRow?.providerIdentifierId || "",
      identifierTypeName: row.identifierTypeName,
      identifierValue: row.identifierValue,
      identifierStatus: row.identifierStatus,
      isPrimary: baseRow?.isPrimary === true,
      validFrom: normalizeNullable(row.validFrom),
      validTo: normalizeNullable(row.validTo),
    };
  });

  const baseRows = base.identifiers.map((row) => ({
    providerIdentifierId: row.providerIdentifierId,
    identifierTypeName: row.identifierTypeName,
    identifierValue: row.identifierValue,
    identifierStatus: row.identifierStatus,
    isPrimary: row.isPrimary === true,
    validFrom: normalizeNullable(row.validFrom),
    validTo: normalizeNullable(row.validTo),
  }));

  return isSame(nextRows, baseRows) ? undefined : nextRows;
}

/** Overview Save → PATCH `/v1/provider/{id}` body shape. */
export function buildProviderOverviewPatch(
  input: BuildProviderDetailsPatchInput,
): Record<string, unknown> {
  const { general, contact, certs, identifiers, providerDetails: base } = input;
  const clinicalSpecialtyOptions = input.clinicalSpecialtyOptions ?? [];
  const payload: Record<string, unknown> = {};

  const putIfChanged = (key: string, next: unknown, prev: unknown) => {
    if (!isSame(next, prev)) payload[key] = next;
  };

  putIfChanged("providerName", general.providerName || base.providerName, base.providerName);

  const nextProviderTypeId = general.providerClass?.trim() || "";
  const baseProviderTypeId = base.providerTypeId?.trim() || "";
  putIfChanged("providerTypeId", nextProviderTypeId || null, baseProviderTypeId || null);

  putIfChanged(
    "providerOwnershipType",
    mapOwnershipTypeToApi(general.providerOwnershipType || base.providerOwnershipType),
    mapOwnershipTypeToApi(base.providerOwnershipType),
  );

  const nextMedicineId =
    general.providerSystemOfMedicineId?.trim() ||
    base.providerSystemOfMedicineId?.trim() ||
    "";
  const baseMedicineId = base.providerSystemOfMedicineId?.trim() || "";
  putIfChanged("providerSystemOfMedicineId", nextMedicineId || null, baseMedicineId || null);

  putIfChanged(
    "providerDaycareHospitalFlag",
    general.providerDayCareFlag === true,
    base.providerDayCareFlag === true,
  );

  putIfChanged(
    "providerCode",
    general.providerCode?.trim() || base.providerCode || null,
    base.providerCode || null,
  );
  putIfChanged(
    "providerIibRohiniCode",
    general.providerIibRohiniCode?.trim() || base.providerIibRohiniCode || null,
    base.providerIibRohiniCode || null,
  );
  putIfChanged(
    "providerRegistrationNo",
    general.providerRegistrationNo?.trim() || base.providerRegistrationNo || null,
    base.providerRegistrationNo || null,
  );
  putIfChanged(
    "providerRegistrationAuthority",
    general.providerRegistrationAuthority?.trim() ||
      base.providerRegistrationAuthority ||
      null,
    base.providerRegistrationAuthority || null,
  );
  putIfChanged(
    "tpaServicingBranchEmail",
    normalizeStringArray(general.tpaServicingBranchEmail),
    normalizeStringArray(
      base.tpaServicingBranchEmail?.length
        ? base.tpaServicingBranchEmail
        : base.providerServiceEmailId,
    ),
  );
  nestTpaServicingBranchPatch(payload, base);
  putIfChanged(
    "providerType",
    general.providerType?.trim() || base.providerType || null,
    base.providerType || null,
  );

  const nextClinicalSpecialtyIds = resolveClinicalSpecialtyIds(
    general.clinicalSpecialties,
    clinicalSpecialtyOptions,
  );
  const baseClinicalSpecialtyIds =
    clinicalSpecialtyOptions.length > 0
      ? resolveClinicalSpecialtyIds(
          resolveRawBaseClinicalSpecialties(base),
          clinicalSpecialtyOptions,
        )
      : normalizeStringArray(base.clinicalSpecialtyIds);
  putIfChanged(
    "providerClinicalSpecialtyIds",
    nextClinicalSpecialtyIds,
    baseClinicalSpecialtyIds,
  );

  const nextContacts = buildOverviewOfficialContactArrays(contact);
  const baseContact = base.providerContactDetail ?? {};
  putIfChanged(
    "providerWebsiteUrl",
    nextContacts.providerWebsiteUrl,
    baseContact.providerWebsiteUrl ?? null,
  );
  putIfChanged(
    "providerOfficialEmail",
    nextContacts.providerOfficialEmail,
    baseContact.providerEmailId ?? [],
  );
  putIfChanged(
    "providerOfficialTelephone",
    nextContacts.providerOfficialTelephone,
    baseContact.providerTelephoneNo ?? [],
  );
  putIfChanged(
    "providerOfficialFax",
    nextContacts.providerOfficialFax,
    baseContact.providerFaxNo ?? [],
  );
  putIfChanged(
    "providerOfficialMobile",
    nextContacts.providerOfficialMobile,
    baseContact.providerMobileNo ?? [],
  );

  const empanelmentPatch = buildOverviewEmpanelmentPatch(general, base);
  if (empanelmentPatch) payload.empanelment = empanelmentPatch;

  const addressPatch = buildOverviewAddressPatch(general, base);
  if (addressPatch) payload.address = addressPatch;

  const certificatesPatch = buildOverviewCertificatesPatch(certs, base);
  if (certificatesPatch) payload.certificates = certificatesPatch;

  const identifiersPatch = buildOverviewIdentifiersPatch(identifiers, base);
  if (identifiersPatch) payload.identifiers = identifiersPatch;

  if (Object.keys(payload).length === 0) return payload;

  return {
    providerId: base.providerId,
    ...payload,
  };
}

export const PROVIDER_DETAILS_SAVE_DISABLED_TITLE =
  "Change at least one field before saving.";

export const PROVIDER_DETAILS_AUDIT_TAB_ID = "hospital-details" as const;

export type ProviderDetailsStatusBarConfig = {
  providerStatus: string;
  blacklistedByIcs: string[];
  canWrite: boolean;
  canVerify?: boolean;
  saveDisabled: boolean;
  saveDisabledTitle: string;
  verifyDisabled: boolean;
  verifyDisabledTitle?: string;
  auditLog: ProviderAuditLogContext;
};

export type BuildProviderDetailsStatusBarConfigInput = {
  providerDetails: ProviderDetailsFromApi | null;
  canWrite: boolean;
  canVerify?: boolean;
  hasProviderDetailsChanges: boolean;
  verifyDisabled?: boolean;
  verifyDisabledTitle?: string;
};

export function resolveBlacklistedByIcs(
  icNames: string[] | undefined,
): string[] {
  return icNames?.length ? icNames : ["No IC information available"];
}

export function buildProviderDetailsStatusBarConfig(
  input: BuildProviderDetailsStatusBarConfigInput,
): ProviderDetailsStatusBarConfig {
  const providerStatus = (input.providerDetails?.recordStatus ?? "").trim();

  return {
    providerStatus,
    blacklistedByIcs: resolveBlacklistedByIcs(input.providerDetails?.blacklistedByIcNames),
    canWrite: input.canWrite,
    canVerify: input.canVerify,
    saveDisabled: !input.hasProviderDetailsChanges,
    saveDisabledTitle: PROVIDER_DETAILS_SAVE_DISABLED_TITLE,
    verifyDisabled: input.verifyDisabled ?? false,
    verifyDisabledTitle: input.verifyDisabledTitle,
    auditLog: {
      providerId: input.providerDetails?.providerId,
      tabId: PROVIDER_DETAILS_AUDIT_TAB_ID,
    },
  };
}
