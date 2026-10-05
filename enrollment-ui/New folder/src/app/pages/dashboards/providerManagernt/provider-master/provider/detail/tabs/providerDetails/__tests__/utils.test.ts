import type { ChangeEvent, FormEvent } from "react";
import type { TFunction } from "i18next";
import { describe, expect, it, vi } from "vitest";
import en from "@/i18n/locales/en/translations.json";
import {
  getAddressViewFields,
  getIdentifierViewFields,
  getProviderInformationViewFields,
  getRenderableDetailFields,
  sliceDetailFieldsForSection,
} from "../config";
import {
  filterHospitalIdentifierTypeOptions,
  findIdentifierTypeOptionById,
  isSingleSpecialtyProviderCategory,
  normalizeIdentifierTypeOption,
  normalizeIdentifierTypeOptionList,
  normalizeProviderTaxonomyOption,
  normalizeProviderTaxonomyOptionList,
  normalizeProviderSystemOfMedicineOptionList,
  normalizeProviderTypeOption,
  normalizeProviderTypeOptionList,
  toProviderSystemOfMedicineDropdownOptions,
  toIdentifierTypeDropdownOptions,
  toProviderClassDropdownOptions,
  toProviderSubclassDropdownOptions,
  toProviderTypeMasterMultiSelectOptions,
  toProviderTypeDropdownOptions,
} from "../options";
import { normalizeProviderDetailIdentifiers } from "../../../utils/sectionMerges/provider/providerDetailIdentifierNormalizer";
import {
  buildProviderIdentifierDetailParts,
  buildProviderIdentifierOverviewRows,
  formatProviderIdentifierDetailLine,
  formItemsToNormalized,
  mapProviderIdentifierViewLayout,
} from "../identifierUtils";
import {
  buildTelephoneDisplay,
  buildProviderDetailsPatch,
  buildProviderOverviewPatch,
  buildProviderDetailsStatusBarConfig,
  buildProviderFormValues,
  createTelephoneChangeHandler,
  getCertificateStatusVariant,
  getContactViewFields,
  handleFaxInput,
  mapGradeToForm,
  mergeCertificateTypeOptions,
  normalizeContactEmailDisplay,
  PROVIDER_DETAILS_AUDIT_TAB_ID,
  PROVIDER_DETAILS_SAVE_DISABLED_TITLE,
  resolveBlacklistedByIcs,
} from "../helpers";
import {
  createProviderDetailsFormValues,
  createProviderDetailsFromApi,
} from "./fixtures";

const clinicalSpecialtyOptions = [{ label: "Cardiology", value: "spec-1" }];

function testT(key: string): string {
  const parts = key.split(".");
  let cur: unknown = en;
  for (const part of parts) {
    cur = (cur as Record<string, unknown> | undefined)?.[part];
  }
  return typeof cur === "string" ? cur : key;
}

describe("config — view fields", () => {
  it("maps provider information view fields from API state", () => {
    const providerDetails = createProviderDetailsFromApi({
      providerClass: "GEN_HOSP",
      providerSubclass: "GEN_HOSP_MULTI",
      clinicalSpecialties: [],
    });

    const fields = getProviderInformationViewFields(
      providerDetails,
      [{ value: "HOSPITAL", label: "Hospital" }],
      [{ value: "GEN_HOSP", label: "General Hospital" }],
      [{ value: "GEN_HOSP_MULTI", label: "General Hospital Multi" }],
      testT as TFunction,
    );
    const byLabel = Object.fromEntries(fields.map((f) => [f.label, f.value]));

    expect(byLabel["Provider Name"]).toBe("City General Hospital");
    expect(byLabel["Provider Type"]).toBe("Hospital");
    expect(byLabel["Provider Category"]).toBe("General Hospital");
    expect(byLabel["Clinical Speciality"]).toBe("General Hospital Multi");
  });

  it("prefers providerTypeName and clinical specialty names from details API", () => {
    const providerDetails = createProviderDetailsFromApi({
      providerTypeId: "019e0710-8b79-7501-8f3a-baaa7a3947fb",
      providerTypeName: "Superspecialty Hospital",
      providerClass: "GEN_HOSP_SUPER",
      clinicalSpecialties: ["Cardiology", "Gastroenterology", "Orthopedics"],
    });

    const fields = getProviderInformationViewFields(
      providerDetails,
      [],
      [],
      [],
      testT as TFunction,
    );
    const byLabel = Object.fromEntries(fields.map((f) => [f.label, f.value]));

    expect(byLabel["Provider Category"]).toBe("Superspecialty Hospital");
    expect(byLabel["Clinical Speciality"]).toBe(
      "Cardiology, Gastroenterology, Orthopedics",
    );
  });

  it("shows formatted codes when option labels are unavailable", () => {
    const providerDetails = createProviderDetailsFromApi({
      providerClass: "GEN_HOSP",
      providerSubclass: "GEN_HOSP_MULTI",
      clinicalSpecialties: [],
    });

    const fields = getProviderInformationViewFields(providerDetails, [], [], [], testT as TFunction);
    const providerClass = fields.find((field) => field.label === "Provider Category");
    const providerSubclass = fields.find((field) => field.label === "Clinical Speciality");

    expect(providerClass?.value).toBe("Gen Hosp");
    expect(providerSubclass?.value).toBe("Gen Hosp Multi");
  });

  it("returns address fields for view mode", () => {
    const providerDetails = createProviderDetailsFromApi({ providerCity: "Mumbai" });
    const cityField = getAddressViewFields(providerDetails, testT as TFunction).find((f) => f.label === "City");

    expect(cityField).toEqual({
      label: "City",
      value: "Mumbai",
    });
  });

  it("returns identifier view fields", () => {
    const providerDetails = createProviderDetailsFromApi({
      providerRegistrationNo: "REG-99",
    });

    const fields = getIdentifierViewFields(providerDetails, testT as TFunction);
    const byLabel = Object.fromEntries(fields.map((f) => [f.label, f.value]));

    expect(byLabel["Registration Number"]).toBe("REG-99");
    expect(byLabel["Provider Rohini ID"]).toBe("ROH001");
  });

  it("handles null provider details safely", () => {
    expect(getProviderInformationViewFields(null, [], [], [], testT as TFunction)[0]?.value).toBeUndefined();
    expect(getAddressViewFields(null, testT as TFunction)).toHaveLength(7);
    expect(getIdentifierViewFields(null, testT as TFunction)).toHaveLength(4);
  });
});

describe("config — section slice", () => {
  it("slices renderable fields when collapsed", () => {
    const fields = [
      { label: "A", value: "1" },
      { label: "B", value: "2" },
      { label: "C", value: "3" },
      { label: "D", value: "4" },
      { label: "E", value: "5" },
      { label: "F", value: "6" },
      { label: "G", value: "7" },
    ];

    const collapsed = sliceDetailFieldsForSection(fields, false, false);
    expect(collapsed.visibleFields).toHaveLength(6);
    expect(collapsed.hasMore).toBe(true);

    const expanded = sliceDetailFieldsForSection(fields, true, false);
    expect(expanded.visibleFields).toHaveLength(7);
    expect(expanded.hasMore).toBe(true);

    const sixFields = fields.slice(0, 6);
    const noMore = sliceDetailFieldsForSection(sixFields, false, false);
    expect(noMore.visibleFields).toHaveLength(6);
    expect(noMore.hasMore).toBe(false);
  });

  it("omits empty fields when hideWhenEmpty is true", () => {
    const fields = [
      { label: "City", value: "Pune", hideWhenEmpty: true },
      { label: "Zone", value: "", hideWhenEmpty: true },
    ];

    expect(getRenderableDetailFields(fields, true)).toHaveLength(1);
  });
});

describe("options — taxonomy", () => {
  it("normalizes one provider-type-master row for type dropdown", () => {
    expect(
      normalizeProviderTypeOption({
        typeCode: "HOSPITAL",
        classCode: "GEN_HOSP",
        subclassCode: "GEN_HOSP_MULTI",
      }),
    ).toEqual({
      providerTypeId: "",
      typeCode: "HOSPITAL",
    });
  });

  it("builds unique provider type dropdown options", () => {
    const rows = normalizeProviderTypeOptionList([
      { typeCode: "HOSPITAL", classCode: "GEN_HOSP", subclassCode: "GEN_HOSP_MULTI" },
      { typeCode: "HOSPITAL", classCode: "GEN_HOSP", subclassCode: "GEN_HOSP_GNRL" },
      { typeCode: "CLINIC", classCode: "GEN_CLINIC", subclassCode: "GEN_CLINIC_SINGLE" },
    ]);

    expect(toProviderTypeDropdownOptions(rows)).toEqual([
      { value: "", label: "Select" },
      { value: "HOSPITAL", label: "Hospital" },
      { value: "CLINIC", label: "Clinic" },
    ]);
  });

  it("normalizes one provider-type-master row for class dropdown", () => {
    expect(
      normalizeProviderTaxonomyOption({
        classCode: "GEN_HOSP",
        subclassCode: "GEN_HOSP_MULTI",
        displayName: "General Hospital Multi",
      }),
    ).toEqual({
      providerTypeId: "",
      classCode: "GEN_HOSP",
      subclassCode: "GEN_HOSP_MULTI",
      displayName: "General Hospital Multi",
      isActive: true,
    });
  });

  it("normalizes class-level rows when subclassCode is null", () => {
    expect(
      normalizeProviderTaxonomyOption({
        providerTypeId: "019e0710-8b79-74c3-a028-de14dcc562da",
        typeCode: "HOSPITAL",
        classCode: "GEN_HOSP_MULTI",
        subclassCode: null,
        displayName: "Multispecialty Hospital",
        isActive: true,
      }),
    ).toEqual({
      providerTypeId: "019e0710-8b79-74c3-a028-de14dcc562da",
      classCode: "GEN_HOSP_MULTI",
      subclassCode: "",
      displayName: "Multispecialty Hospital",
      isActive: true,
    });
  });

  it("builds unique class dropdown options", () => {
    const rows = normalizeProviderTaxonomyOptionList([
      {
        classCode: "GEN_HOSP",
        subclassCode: "GEN_HOSP_MULTI",
        displayName: "General Hospital Multi",
      },
      {
        classCode: "GEN_HOSP",
        subclassCode: "GEN_HOSP_GNRL",
        displayName: "General Hospital",
      },
      {
        classCode: "DAY_CARE",
        subclassCode: "DAY_CARE_CENTER",
        displayName: "Day Care Center",
      },
    ]);

    expect(toProviderClassDropdownOptions(rows)).toEqual([
      { value: "", label: "Select" },
      { value: "GEN_HOSP", label: "General Hospital Multi" },
      { value: "DAY_CARE", label: "Day Care Center" },
    ]);
  });

  it("prefers providerTypeId for class dropdown values when present", () => {
    const rows = normalizeProviderTaxonomyOptionList([
      {
        providerTypeId: "type-multi",
        classCode: "GEN_HOSP_MULTI",
        subclassCode: null,
        displayName: "Multispecialty Hospital",
      },
      {
        providerTypeId: "type-super",
        classCode: "GEN_HOSP_SUPER",
        subclassCode: null,
        displayName: "Superspecialty Hospital",
      },
    ]);

    expect(toProviderClassDropdownOptions(rows)).toEqual([
      { value: "", label: "Select" },
      { value: "type-multi", label: "Multispecialty Hospital" },
      { value: "type-super", label: "Superspecialty Hospital" },
    ]);
  });

  it("detects single specialty provider categories", () => {
    expect(
      isSingleSpecialtyProviderCategory("type-single", [
        { value: "type-single", label: "Singlespecialty Hospital" },
      ]),
    ).toBe(true);
    expect(
      isSingleSpecialtyProviderCategory("type-multi", [
        { value: "type-multi", label: "Multispecialty Hospital" },
      ]),
    ).toBe(false);
  });

  it("builds subclass dropdown options", () => {
    const rows = normalizeProviderTaxonomyOptionList([
      {
        classCode: "GEN_HOSP",
        subclassCode: "GEN_HOSP_MULTI",
        displayName: "General Hospital Multi",
      },
      {
        classCode: "GEN_HOSP",
        subclassCode: "GEN_HOSP_GNRL",
        displayName: "General Hospital",
      },
    ]);

    expect(toProviderSubclassDropdownOptions(rows)).toEqual([
      { value: "GEN_HOSP_MULTI", label: "General Hospital Multi" },
      { value: "GEN_HOSP_GNRL", label: "General Hospital" },
    ]);
  });

  it("maps type-master rows to multi-select without Select placeholder", () => {
    const rows = normalizeProviderTaxonomyOptionList([
      {
        providerTypeId: "id-1",
        classCode: "GEN_HOSP_MULTI",
        subclassCode: null,
        displayName: "Multispecialty Hospital",
        isActive: true,
      },
      {
        providerTypeId: "id-2",
        classCode: "GEN_HOSP_GNRL",
        subclassCode: null,
        displayName: "General Hospital",
        isActive: true,
      },
    ]);

    expect(toProviderTypeMasterMultiSelectOptions(rows)).toEqual([
      { value: "id-1", label: "Multispecialty Hospital" },
      { value: "id-2", label: "General Hospital" },
    ]);
    expect(toProviderSubclassDropdownOptions(rows)).toEqual([
      { value: "id-1", label: "Multispecialty Hospital" },
      { value: "id-2", label: "General Hospital" },
    ]);
  });
});

describe("options — system of medicine", () => {
  it("normalizes name and id from string or object rows", () => {
    const rows = normalizeProviderSystemOfMedicineOptionList([
      "Allopathy",
      { providerSystemOfMedicineId: "med-ayur", providerSystemOfMedicineName: "Ayurveda" },
      "Allopathy",
    ]);

    expect(toProviderSystemOfMedicineDropdownOptions(rows)).toEqual([
      { value: "", label: "Select" },
      { value: "Allopathy", label: "Allopathy" },
      { value: "med-ayur", label: "Ayurveda" },
    ]);
  });
});

const sampleIdentifierTypeRow = {
  identifierTypeId: "019e404d-be2c-7e81-b6d3-a4bd5607c587",
  identifierTypeCode: "PAN",
  identifierTypeName: "PAN NO",
  issuingAuthorityName: "Income Tax Department",
  sourceSystem: "PAN Service",
  appliesToProvider: true,
  appliesToFacility: false,
  appliesToPractitioner: false,
  allowsMultiple: true,
  supportsValidityPeriod: false,
  recordStatus: "Active",
};

describe("options — identifier types", () => {
  it("normalizes active identifier type rows", () => {
    expect(normalizeIdentifierTypeOption(sampleIdentifierTypeRow)).toEqual({
      identifierTypeId: "019e404d-be2c-7e81-b6d3-a4bd5607c587",
      identifierTypeCode: "PAN",
      identifierTypeName: "PAN NO",
      issuingAuthorityName: "Income Tax Department",
      sourceSystem: "PAN Service",
      appliesToProvider: true,
      appliesToFacility: false,
      allowsMultiple: true,
      supportsValidityPeriod: false,
    });
  });

  it("skips inactive identifier type rows", () => {
    expect(
      normalizeIdentifierTypeOption({ ...sampleIdentifierTypeRow, recordStatus: "Inactive" }),
    ).toBeNull();
  });

  it("filters hospital provider and facility identifier types", () => {
    const rows = normalizeIdentifierTypeOptionList([
      sampleIdentifierTypeRow,
      {
        ...sampleIdentifierTypeRow,
        identifierTypeId: "hpr",
        identifierTypeName: "HPR ID",
        appliesToProvider: false,
        appliesToFacility: false,
        appliesToPractitioner: true,
      },
      {
        ...sampleIdentifierTypeRow,
        identifierTypeId: "rohini",
        identifierTypeName: "ROHINI Registry Code",
        appliesToProvider: false,
        appliesToFacility: true,
      },
    ]);

    expect(filterHospitalIdentifierTypeOptions(rows).map((row) => row.identifierTypeId)).toEqual([
      "019e404d-be2c-7e81-b6d3-a4bd5607c587",
      "rohini",
    ]);
  });

  it("builds dropdown options and finds row by id", () => {
    const rows = normalizeIdentifierTypeOptionList([sampleIdentifierTypeRow]);
    expect(toIdentifierTypeDropdownOptions(rows)).toEqual([
      { value: "", label: "Select identifier type" },
      { value: sampleIdentifierTypeRow.identifierTypeId, label: "PAN NO" },
    ]);
    expect(findIdentifierTypeOptionById(rows, sampleIdentifierTypeRow.identifierTypeId)?.identifierTypeName).toBe(
      "PAN NO",
    );
  });
});

describe("identifierUtils — view layout", () => {
  const dishaIdentifiers = [
    {
      identifierTypeName: "ROHINI Registry Code",
      identifierValue: "8900080020177",
      identifierStatus: "ACTIVE",
      sourceSystem: "OLD_SYSTEM",
      providerIdentifierId: "rohini-1",
    },
    {
      identifierTypeName: "Old Provider Code",
      identifierValue: "100490001",
      identifierStatus: "ACTIVE",
      sourceSystem: "CORE.EMPANELL",
      providerIdentifierId: "old-1",
    },
    {
      identifierTypeName: "Old Provider Code",
      identifierValue: "000041197",
      identifierStatus: "ACTIVE",
      sourceSystem: "CORE.EMPANELL",
      providerIdentifierId: "old-2",
    },
    {
      identifierTypeName: "PAN NO",
      identifierValue: "AACCD8938P",
      identifierStatus: "ACTIVE",
      identifierHolderName: "DISHA MEDICAL SERVICES PRIVATE LIMITED",
      issuingAuthorityName: "INCOME TAX DEPARTMENT",
      sourceSystem: "OLD_SYSTEM",
      verificationReferenceNo: "100490001",
      providerIdentifierId: "pan-1",
    },
    {
      identifierTypeName: "Clinical Establishment Certificate",
      identifierValue: "RMG00185AADC",
      identifierStatus: "ACTIVE",
      issuingAuthorityName: "STATE CLINICAL ESTABLISHMENT AUTHORITY",
      sourceSystem: "OLD_SYSTEM",
      verificationReferenceNo: "100490001",
      providerIdentifierId: "cert-1",
    },
  ];

  const bapayeIdentifiers = [
    {
      identifierTypeName: "ROHINI Registry Code",
      identifierValue: "8900080135819",
      identifierStatus: "ACTIVE",
      sourceSystem: "OLD_SYSTEM",
      providerIdentifierId: "rohini-1",
    },
    {
      identifierTypeName: "Old Provider Code",
      identifierValue: "150063899",
      identifierStatus: "ACTIVE",
      sourceSystem: "CORE.EMPANELL",
      providerIdentifierId: "old-1",
    },
    {
      identifierTypeName: "PAN NO",
      identifierValue: "AACFB9132C",
      identifierStatus: "ACTIVE",
      identifierHolderName: "BAPAYE HOSPITAL",
      issuingAuthorityName: "INCOME TAX DEPARTMENT",
      verificationReferenceNo: "150063899",
      providerIdentifierId: "pan-1",
    },
    {
      identifierTypeName: "Clinical Establishment Certificate",
      identifierValue: "150",
      identifierStatus: "ACTIVE",
      issuingAuthorityName: "STATE CLINICAL ESTABLISHMENT AUTHORITY",
      verificationReferenceNo: null,
      providerIdentifierId: "cert-1",
    },
  ];

  it("shows unreferenced identifiers at top and referenced ones under old provider codes", () => {
    const rows = normalizeProviderDetailIdentifiers(dishaIdentifiers);
    const layout = mapProviderIdentifierViewLayout(rows);

    expect(layout.topIdentifiers).toHaveLength(1);
    expect(layout.topIdentifiers[0]?.identifierValue).toBe("8900080020177");
    expect(layout.providerCodeGroups).toHaveLength(2);
    expect(layout.providerCodeGroups[0]?.providerCode).toBe("100490001");
    expect(layout.providerCodeGroups[0]?.relatedIdentifiers).toHaveLength(2);
    expect(layout.referencedOrphanIdentifiers).toHaveLength(0);
  });

  it("shows unreferenced clinical certificate at top and referenced pan in accordion", () => {
    const rows = normalizeProviderDetailIdentifiers(bapayeIdentifiers);
    const layout = mapProviderIdentifierViewLayout(rows);

    expect(layout.topIdentifiers).toHaveLength(2);
    expect(layout.topIdentifiers.map((row) => row.identifierTypeName)).toEqual([
      "ROHINI Registry Code",
      "Clinical Establishment Certificate",
    ]);
    expect(layout.providerCodeGroups).toHaveLength(1);
    expect(layout.providerCodeGroups[0]?.relatedIdentifiers).toHaveLength(1);
    expect(layout.providerCodeGroups[0]?.relatedIdentifiers[0]?.identifierTypeName).toBe("PAN NO");
  });

  it("does not group identifiers under an old provider code with empty value", () => {
    const rows = formItemsToNormalized([
      {
        providerIdentifierId: "",
        identifierTypeName: "Old Provider Code",
        identifierValue: "",
        identifierStatus: "ACTIVE",
        validFrom: "",
        validTo: "",
        identifierHolderName: "",
        issuingAuthorityName: "",
        issueDate: "",
        verificationReferenceNo: "",
        sourceSystem: "",
      },
      {
        providerIdentifierId: "",
        identifierTypeName: "ROHINI Registry Code",
        identifierValue: "8900080020177",
        identifierStatus: "ACTIVE",
        validFrom: "",
        validTo: "",
        identifierHolderName: "",
        issuingAuthorityName: "",
        issueDate: "",
        verificationReferenceNo: "",
        sourceSystem: "",
      },
    ]);
    const layout = mapProviderIdentifierViewLayout(rows);

    expect(layout.topIdentifiers).toHaveLength(1);
    expect(layout.topIdentifiers[0]?.identifierTypeName).toBe("ROHINI Registry Code");
    expect(layout.providerCodeGroups).toHaveLength(1);
    expect(layout.providerCodeGroups[0]?.relatedIdentifiers).toHaveLength(0);
  });

  it("does not include primary identifiers in old provider code children", () => {
    const rows = normalizeProviderDetailIdentifiers([
      {
        identifierTypeName: "Old Provider Code",
        identifierValue: "100490001",
        identifierStatus: "ACTIVE",
        providerIdentifierId: "old-1",
      },
      {
        identifierTypeName: "ROHINI Registry Code",
        identifierValue: "8900080020177",
        identifierStatus: "ACTIVE",
        verificationReferenceNo: "100490001",
        providerIdentifierId: "rohini-1",
      },
    ]);
    const layout = mapProviderIdentifierViewLayout(rows);

    expect(layout.providerCodeGroups[0]?.relatedIdentifiers).toHaveLength(0);
    expect(layout.topIdentifiers).toHaveLength(1);
    expect(layout.topIdentifiers[0]?.identifierTypeName).toBe("ROHINI Registry Code");
    expect(layout.referencedOrphanIdentifiers).toHaveLength(0);
  });

  it("puts referenced identifiers without a matching old code at the bottom", () => {
    const rows = normalizeProviderDetailIdentifiers([
      ...dishaIdentifiers,
      {
        identifierTypeName: "PAN NO",
        identifierValue: "NA",
        identifierStatus: "ACTIVE",
        verificationReferenceNo: "000022632",
        providerIdentifierId: "pan-orphan",
      },
    ]);
    const layout = mapProviderIdentifierViewLayout(rows);

    expect(layout.topIdentifiers).toHaveLength(1);
    expect(layout.referencedOrphanIdentifiers).toHaveLength(1);
    expect(layout.referencedOrphanIdentifiers[0]?.providerIdentifierId).toBe("pan-orphan");
  });

  it("keeps Rohini at top when Old Provider Code header has empty value", () => {
    const rows = formItemsToNormalized([
      {
        providerIdentifierId: "",
        identifierTypeName: "ROHINI Registry Code",
        identifierValue: "8900080020177",
        identifierStatus: "ACTIVE",
        validFrom: "",
        validTo: "",
        identifierHolderName: "",
        issuingAuthorityName: "",
        issueDate: "",
        verificationReferenceNo: "",
        sourceSystem: "",
      },
      {
        providerIdentifierId: "",
        identifierTypeName: "Old Provider Code",
        identifierValue: "",
        identifierStatus: "ACTIVE",
        validFrom: "",
        validTo: "",
        identifierHolderName: "",
        issuingAuthorityName: "",
        issueDate: "",
        verificationReferenceNo: "",
        sourceSystem: "",
      },
    ]);
    const layout = mapProviderIdentifierViewLayout(rows);

    expect(layout.topIdentifiers).toHaveLength(1);
    expect(layout.topIdentifiers[0]?.identifierTypeName).toBe("ROHINI Registry Code");
    expect(layout.providerCodeGroups).toHaveLength(1);
    expect(layout.providerCodeGroups[0]?.relatedIdentifiers).toHaveLength(0);
  });

  it("does not group identifiers with empty verification reference under empty old code", () => {
    const rows = formItemsToNormalized([
      {
        providerIdentifierId: "",
        identifierTypeName: "Old Provider Code",
        identifierValue: "",
        identifierStatus: "ACTIVE",
        validFrom: "",
        validTo: "",
        identifierHolderName: "",
        issuingAuthorityName: "",
        issueDate: "",
        verificationReferenceNo: "",
        sourceSystem: "",
      },
      {
        providerIdentifierId: "",
        identifierTypeName: "PAN NO",
        identifierValue: "AACCD8938P",
        identifierStatus: "ACTIVE",
        validFrom: "",
        validTo: "",
        identifierHolderName: "",
        issuingAuthorityName: "",
        issueDate: "",
        verificationReferenceNo: "",
        sourceSystem: "",
      },
    ]);
    const layout = mapProviderIdentifierViewLayout(rows);

    expect(layout.providerCodeGroups).toHaveLength(1);
    expect(layout.providerCodeGroups[0]?.relatedIdentifiers).toHaveLength(0);
    expect(layout.topIdentifiers).toHaveLength(1);
    expect(layout.topIdentifiers[0]?.identifierTypeName).toBe("PAN NO");
  });
});

describe("identifierUtils — overview rows", () => {
  it("shows only Rohini and Old Provider Code identifiers", () => {
    const rows = buildProviderIdentifierOverviewRows([
      {
        identifierTypeName: "ROHINI_CODE",
        identifierValue: "8900080629417",
        identifierStatus: "ACTIVE",
        sourceSystem: "BULK_IC_MAPPING",
        providerIdentifierId: "rohini-code",
        identifierHolderName: "",
        issuingAuthorityName: "",
        verificationReferenceNo: "",
        validFrom: null,
        validTo: null,
        isPrimary: true,
        issueDate: null,
      },
      {
        identifierTypeName: "ROHINI Registry Code",
        identifierValue: "8900080629417",
        identifierStatus: "ACTIVE",
        sourceSystem: "OLD_SYSTEM",
        providerIdentifierId: "rohini-registry",
        identifierHolderName: "",
        issuingAuthorityName: "",
        verificationReferenceNo: "",
        validFrom: null,
        validTo: null,
        isPrimary: true,
        issueDate: null,
      },
      {
        identifierTypeName: "Old Provider Code",
        identifierValue: "NW111587",
        identifierStatus: "ACTIVE",
        sourceSystem: "OLD_SYSTEM",
        providerIdentifierId: "old-1",
        identifierHolderName: "",
        issuingAuthorityName: "",
        verificationReferenceNo: "",
        validFrom: null,
        validTo: null,
        isPrimary: false,
        issueDate: null,
      },
      {
        identifierTypeName: "Clinical Establishment Certificate",
        identifierValue: "KLRIALL20240035606",
        identifierStatus: "ACTIVE",
        sourceSystem: "OLD_SYSTEM",
        providerIdentifierId: "cert-1",
        identifierHolderName: "",
        issuingAuthorityName: "STATE CLINICAL ESTABLISHMENT AUTHORITY",
        verificationReferenceNo: "",
        validFrom: null,
        validTo: null,
        isPrimary: false,
        issueDate: null,
      },
      {
        identifierTypeName: "Insurer Provider Code",
        identifierValue: "15/07/2024",
        identifierStatus: "ACTIVE",
        sourceSystem: "TPA",
        providerIdentifierId: "insurer-1",
        identifierHolderName: "",
        issuingAuthorityName: "Internal Master Data",
        verificationReferenceNo: "",
        validFrom: null,
        validTo: null,
        isPrimary: true,
        issueDate: null,
      },
    ]);

    expect(rows.map((row) => row.identifierTypeName)).toEqual([
      "ROHINI_CODE",
      "Old Provider Code",
    ]);
    expect(rows.map((row) => row.identifierValue)).toEqual(["8900080629417", "NW111587"]);
  });
});

describe("identifierUtils — detail line", () => {
  it("always includes valid from and valid to without source or reference", () => {
    const rows = normalizeProviderDetailIdentifiers([
      {
        identifierTypeName: "PAN NO",
        identifierValue: "AACFB9132C",
        identifierStatus: "ACTIVE",
        identifierHolderName: "BAPAYE HOSPITAL",
        issuingAuthorityName: "INCOME TAX DEPARTMENT",
        validFrom: "2024-01-01",
        verificationReferenceNo: "150063899",
        sourceSystem: "OLD_SYSTEM",
        providerIdentifierId: "pan-1",
      },
    ]);

    const parts = buildProviderIdentifierDetailParts(rows[0]);
    expect(parts.some((part) => part.label === "Valid From" && part.value === "2024-01-01")).toBe(
      true,
    );
    expect(parts.some((part) => part.label === "Valid To" && part.value === "-")).toBe(true);

    const line = formatProviderIdentifierDetailLine(rows[0]);
    expect(line).toContain("Holder: BAPAYE HOSPITAL");
    expect(line).toContain("Authority: INCOME TAX DEPARTMENT");
    expect(line).toContain("Valid From: 2024-01-01");
    expect(line).toContain("Valid To: -");
    expect(line).not.toContain("Source:");
    expect(line).not.toContain("Ref:");
  });

  it("shows holder only for PAN and TAN identifier types", () => {
    const panRows = normalizeProviderDetailIdentifiers([
      {
        identifierTypeName: "PAN NO",
        identifierValue: "AACFB9132C",
        identifierStatus: "ACTIVE",
        identifierHolderName: "BAPAYE HOSPITAL",
        providerIdentifierId: "pan-1",
      },
    ]);
    const rohiniRows = normalizeProviderDetailIdentifiers([
      {
        identifierTypeName: "ROHINI Registry Code",
        identifierValue: "8900080078314",
        identifierStatus: "ACTIVE",
        identifierHolderName: "SHOULD NOT SHOW",
        providerIdentifierId: "rohini-1",
      },
    ]);

    expect(buildProviderIdentifierDetailParts(panRows[0]).some((part) => part.label === "Holder")).toBe(
      true,
    );
    expect(
      buildProviderIdentifierDetailParts(rohiniRows[0]).some((part) => part.label === "Holder"),
    ).toBe(false);
  });
});

describe("helpers — contact", () => {
  describe("buildTelephoneDisplay", () => {
    it("joins std code and number with dash", () => {
      expect(buildTelephoneDisplay("022", "12345678")).toBe("022-12345678");
    });

    it("returns number only when std code is empty", () => {
      expect(buildTelephoneDisplay("", "12345678")).toBe("12345678");
    });
  });

  describe("createTelephoneChangeHandler", () => {
    it("splits value into stdCode and contactNumber", () => {
      const setValue = vi.fn();
      const handler = createTelephoneChangeHandler(setValue);

      handler({
        target: { value: "022-12345678" },
      } as ChangeEvent<HTMLInputElement>);

      expect(setValue).toHaveBeenCalledWith("stdCode", "022", {
        shouldValidate: true,
        shouldDirty: true,
      });
      expect(setValue).toHaveBeenCalledWith("contactNumber", "12345678", {
        shouldValidate: true,
        shouldDirty: true,
      });
    });

    it("clears std code when no dash present", () => {
      const setValue = vi.fn();
      const handler = createTelephoneChangeHandler(setValue);

      handler({
        target: { value: "12345678" },
      } as ChangeEvent<HTMLInputElement>);

      expect(setValue).toHaveBeenCalledWith("stdCode", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      expect(setValue).toHaveBeenCalledWith("contactNumber", "12345678", {
        shouldValidate: true,
        shouldDirty: true,
      });
    });
  });

  describe("handleFaxInput", () => {
    it("strips invalid characters from fax input", () => {
      const input = { value: "12ab34" };
      handleFaxInput({ currentTarget: input } as FormEvent<HTMLInputElement>);
      expect(input.value).toBe("1234");
    });
  });
});

describe("helpers — status bar", () => {
  describe("resolveBlacklistedByIcs", () => {
    it("returns IC names when hospital has blacklist data", () => {
      expect(resolveBlacklistedByIcs(["ICICI", "NIA"])).toEqual(["ICICI", "NIA"]);
    });

    it("returns placeholder when IC list is empty", () => {
      expect(resolveBlacklistedByIcs([])).toEqual(["No IC information available"]);
      expect(resolveBlacklistedByIcs(undefined)).toEqual([
        "No IC information available",
      ]);
    });
  });

  describe("buildProviderDetailsStatusBarConfig", () => {
    it("maps recordStatus and audit log for Provider Details tab", () => {
      const providerDetails = createProviderDetailsFromApi({
        providerId: "provider-99",
        recordStatus: "Active",
        blacklistedByIcNames: ["New India Assurance"],
      });

      const config = buildProviderDetailsStatusBarConfig({
        providerDetails,
        canWrite: true,
        canVerify: false,
        hasProviderDetailsChanges: false,
      });

      expect(config).toEqual({
        providerStatus: "Active",
        blacklistedByIcs: ["New India Assurance"],
        canWrite: true,
        canVerify: false,
        saveDisabled: true,
        saveDisabledTitle: PROVIDER_DETAILS_SAVE_DISABLED_TITLE,
        verifyDisabled: false,
        verifyDisabledTitle: undefined,
        auditLog: {
          providerId: "provider-99",
          tabId: PROVIDER_DETAILS_AUDIT_TAB_ID,
        },
      });
    });

    it("enables save only when form has changes", () => {
      const withChanges = buildProviderDetailsStatusBarConfig({
        providerDetails: createProviderDetailsFromApi(),
        canWrite: true,
        hasProviderDetailsChanges: true,
      });
      const withoutChanges = buildProviderDetailsStatusBarConfig({
        providerDetails: createProviderDetailsFromApi(),
        canWrite: true,
        hasProviderDetailsChanges: false,
      });

      expect(withChanges.saveDisabled).toBe(false);
      expect(withoutChanges.saveDisabled).toBe(true);
    });

    it("forwards verify disabled state and tooltip", () => {
      const config = buildProviderDetailsStatusBarConfig({
        providerDetails: createProviderDetailsFromApi(),
        canWrite: true,
        hasProviderDetailsChanges: false,
        verifyDisabled: true,
        verifyDisabledTitle: "Network details unavailable",
      });

      expect(config.verifyDisabled).toBe(true);
      expect(config.verifyDisabledTitle).toBe("Network details unavailable");
    });

    it("handles null provider details with safe defaults", () => {
      const config = buildProviderDetailsStatusBarConfig({
        providerDetails: null,
        canWrite: false,
        hasProviderDetailsChanges: false,
      });

      expect(config.providerStatus).toBe("");
      expect(config.blacklistedByIcs).toEqual(["No IC information available"]);
      expect(config.auditLog).toEqual({
        providerId: undefined,
        tabId: PROVIDER_DETAILS_AUDIT_TAB_ID,
      });
    });
  });
});

describe("helpers — form utils", () => {
  describe("getContactViewFields", () => {
    it("returns empty object when provider details is null", () => {
      expect(getContactViewFields(null)).toEqual({});
    });

    it("maps email, telephone, and mobile for view mode", () => {
      const providerDetails = createProviderDetailsFromApi({
        providerContactDetail: {
          providerWebsiteAvailableFlag: false,
          providerWebsiteUrl: null,
          providerTelephoneNo: ["022-12345678"],
          providerFaxNo: [],
          providerMobileNo: ["9876543210"],
          providerEmailId: ["a@test.com"],
        },
      });

      expect(getContactViewFields(providerDetails)).toEqual({
        email: "a@test.com",
        telePhone: "022-12345678",
        mobNo: "9876543210",
      });
    });

    it("normalizes multiline email to a single line", () => {
      const providerDetails = createProviderDetailsFromApi({
        providerContactDetail: {
          providerWebsiteAvailableFlag: false,
          providerWebsiteUrl: null,
          providerTelephoneNo: [],
          providerFaxNo: [],
          providerMobileNo: [],
          providerEmailId: ["a@test.com\nb@test.com"],
        },
      });

      expect(getContactViewFields(providerDetails).email).toBe("a@test.com b@test.com");
    });

    it("omits empty contact values", () => {
      const providerDetails = createProviderDetailsFromApi({
        providerContactDetail: {
          providerWebsiteAvailableFlag: false,
          providerWebsiteUrl: null,
          providerTelephoneNo: [],
          providerFaxNo: [],
          providerMobileNo: [],
          providerEmailId: [],
        },
      });

      expect(getContactViewFields(providerDetails)).toEqual({});
    });
  });

  describe("buildProviderFormValues", () => {
    it("maps API fields into form defaults", () => {
      const providerDetails = createProviderDetailsFromApi();
      const clinicalSpecialtyOptions = [
        { label: "Cardiology", value: "spec-1" },
      ];

      const values = buildProviderFormValues(providerDetails, clinicalSpecialtyOptions);

      expect(values.general.providerName).toBe("City General Hospital");
      expect(values.general.providerCode).toBe("HSP001");
      expect(values.general.providerInternalGrade).toBe("A");
      expect(values.contact.stdCode).toBe("022");
      expect(values.contact.contactNumber).toBe("12345678");
      expect(values.certs.items).toHaveLength(1);
      expect(values.certs.items[0]?.type).toBe("NABH");
    });
  });

  describe("mapGradeToForm", () => {
    it("extracts letter grade from API text", () => {
      expect(mapGradeToForm("Grade A")).toBe("A");
      expect(mapGradeToForm("")).toBe("");
    });
  });

  describe("mergeCertificateTypeOptions", () => {
    const baseOptions = [{ label: "NABH", value: "NABH" }];

    it("returns base options when cert type is empty", () => {
      expect(mergeCertificateTypeOptions(baseOptions, "")).toEqual(baseOptions);
    });

    it("appends unknown cert type for edit dropdown", () => {
      expect(mergeCertificateTypeOptions(baseOptions, "Custom Cert")).toEqual([
        { label: "NABH", value: "NABH" },
        { label: "Custom Cert", value: "Custom Cert" },
      ]);
    });
  });

  describe("getCertificateStatusVariant", () => {
    it("treats empty status as not registered", () => {
      expect(getCertificateStatusVariant("")).toEqual({
        variant: "empty",
        text: "",
      });
    });

    it("detects positive registration status", () => {
      expect(getCertificateStatusVariant("Registered")).toEqual({
        variant: "positive",
        text: "Registered",
      });
    });
  });

  describe("normalizeContactEmailDisplay", () => {
    it("collapses whitespace and newlines", () => {
      expect(normalizeContactEmailDisplay("  a@test.com \n b@test.com  ")).toBe(
        "a@test.com b@test.com",
      );
    });
  });
});

describe("helpers — save patch", () => {
  describe("buildProviderDetailsPatch", () => {
    it("returns empty payload when nothing changed", () => {
      const providerDetails = createProviderDetailsFromApi();
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails);

      const payload = buildProviderDetailsPatch({
        providerDetails,
        general,
        contact,
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      expect(payload).toEqual({});
    });

    it("includes only changed contact fields", () => {
      const providerDetails = createProviderDetailsFromApi();
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails);

      const payload = buildProviderDetailsPatch({
        providerDetails,
        general,
        contact: { ...contact, mobNo: "9999888877" },
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      expect(payload.providerContactDetail).toEqual({
        providerMobileNo: ["9999888877"],
      });
      expect(payload.providerName).toBeUndefined();
    });

    it("includes changed owner name in general patch", () => {
      const providerDetails = createProviderDetailsFromApi();
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails);

      const payload = buildProviderDetailsPatch({
        providerDetails,
        general: { ...general, providerOwnerName: "New Owner" },
        contact,
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      expect(payload.providerOwnerName).toBe("New Owner");
    });

    it("does not include grade when form grade matches API grade", () => {
      const providerDetails = createProviderDetailsFromApi({
        providerInternalGrade: "Grade A",
      });
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails);

      const payload = buildProviderDetailsPatch({
        providerDetails,
        general,
        contact,
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      expect(payload.providerInternalGrade).toBeUndefined();
    });

    it("includes providerOldCode only when dirty flag is true", () => {
      const providerDetails = createProviderDetailsFromApi();
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails);
      const changedOldCodes = [{ code: "OLD-001", active: false }];

      const withoutDirty = buildProviderDetailsPatch({
        providerDetails,
        general: { ...general, providerOldCodes: changedOldCodes },
        contact,
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      const withDirty = buildProviderDetailsPatch({
        providerDetails,
        general: { ...general, providerOldCodes: changedOldCodes },
        contact,
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: true,
        clinicalSpecialtyOptions,
      });

      expect(withoutDirty.providerOldCode).toBeUndefined();
      expect(withDirty.providerOldCode).toBeDefined();
    });

    it("includes clinical specialties only when changed", () => {
      const providerDetails = createProviderDetailsFromApi({
        clinicalSpecialties: ["Cardiology"],
      });
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails);

      const unchanged = buildProviderDetailsPatch({
        providerDetails,
        general,
        contact,
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      const changed = buildProviderDetailsPatch({
        providerDetails,
        general: { ...general, clinicalSpecialties: ["spec-2"] },
        contact,
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      expect(unchanged.clinicalSpecialties).toBeUndefined();
      expect(changed.clinicalSpecialties).toEqual(["spec-2"]);
    });

    it("includes certificates patch only when a certificate field changes", () => {
      const providerDetails = createProviderDetailsFromApi();
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails);

      const unchanged = buildProviderDetailsPatch({
        providerDetails,
        general,
        contact,
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      const changed = buildProviderDetailsPatch({
        providerDetails,
        general,
        contact,
        certs: {
          items: [
            {
              ...certs.items[0]!,
              status: "Not Registered",
            },
          ],
        },
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      expect(unchanged.certificates).toBeUndefined();
      expect(changed.certificates).toEqual([
        expect.objectContaining({
          certificateId: "cert-1",
          status: "Not Registered",
          type: "NABH",
        }),
      ]);
    });

    it("prefixes std code on telephone when saving contact", () => {
      const providerDetails = createProviderDetailsFromApi({
        providerContactDetail: {
          providerWebsiteAvailableFlag: false,
          providerWebsiteUrl: null,
          providerTelephoneNo: [],
          providerFaxNo: ["022-87654321"],
          providerMobileNo: ["9876543210"],
          providerEmailId: ["admin@cityhospital.com"],
        },
      });
      const { general, certs } = createProviderDetailsFormValues(providerDetails);

      const payload = buildProviderDetailsPatch({
        providerDetails,
        general,
        contact: {
          contactEmail: "admin@cityhospital.com",
          stdCode: "022",
          contactNumber: "12345678",
          faxNo: "022-87654321",
          mobNo: "9876543210",
          isWebsiteAvailable: false,
          websiteUrl: "",
        },
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      expect(payload.providerContactDetail).toEqual({
        providerTelephoneNo: ["022-12345678"],
      });
    });

    it("normalizes empty website URL to null in contact patch", () => {
      const providerDetails = createProviderDetailsFromApi({
        providerContactDetail: {
          providerWebsiteAvailableFlag: true,
          providerWebsiteUrl: "www.test.com",
          providerTelephoneNo: ["022-12345678"],
          providerFaxNo: ["022-87654321"],
          providerMobileNo: ["9876543210"],
          providerEmailId: ["admin@cityhospital.com"],
        },
      });
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails);

      const payload = buildProviderDetailsPatch({
        providerDetails,
        general,
        contact: { ...contact, websiteUrl: "   " },
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      expect(payload.providerContactDetail).toEqual({
        providerWebsiteUrl: null,
      });
    });
  });

  describe("buildProviderOverviewPatch", () => {
    it("returns empty payload when nothing changed", () => {
      const providerDetails = createProviderDetailsFromApi();
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails);

      const payload = buildProviderOverviewPatch({
        providerDetails,
        general,
        contact,
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      expect(payload).toEqual({});
    });

    it("maps official contacts and daycare flag to root keys", () => {
      const providerDetails = createProviderDetailsFromApi();
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails);

      const payload = buildProviderOverviewPatch({
        providerDetails,
        general: { ...general, providerDayCareFlag: true },
        contact: { ...contact, mobNo: "9999888877", websiteUrl: "https://www.updated.com" },
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      expect(payload.providerId).toBe("provider-1");
      expect(payload.providerDaycareHospitalFlag).toBe(true);
      expect(payload.providerOfficialMobile).toEqual(["9999888877"]);
      expect(payload.providerWebsiteUrl).toBe("https://www.updated.com");
      expect(payload.providerContactDetail).toBeUndefined();
    });

    it("nests tpaServicingBranch email and mapping id when email changes", () => {
      const providerDetails = createProviderDetailsFromApi();
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails);

      const payload = buildProviderOverviewPatch({
        providerDetails,
        general: {
          ...general,
          tpaServicingBranchEmail: "hyderabad@mdindia.com,test@gmail.com",
        },
        contact,
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      expect(payload.tpaServicingBranchEmail).toBeUndefined();
      expect(payload.providerTpaServicingBranchCityMappingId).toBeUndefined();
      expect(payload.tpaServicingBranch).toEqual({
        providerTpaServicingBranchCityMappingId: "city-mapping-1",
        tpaServicingBranchEmail: [
          "hyderabad@mdindia.com",
          "test@gmail.com",
        ],
      });
    });

    it("maps clinical specialty ids and ownership for root PATCH", () => {
      const providerDetails = createProviderDetailsFromApi({
        clinicalSpecialties: ["Cardiology"],
        clinicalSpecialtyIds: ["spec-1"],
      });
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails, [
        { label: "Cardiology", value: "spec-1" },
        { label: "Ortho", value: "spec-2" },
      ]);

      const payload = buildProviderOverviewPatch({
        providerDetails,
        general: {
          ...general,
          clinicalSpecialties: ["spec-2"],
          providerOwnershipType: "Public",
        },
        contact,
        certs,
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions: [
          { label: "Cardiology", value: "spec-1" },
          { label: "Ortho", value: "spec-2" },
        ],
      });

      expect(payload.providerClinicalSpecialtyIds).toEqual(["spec-2"]);
      expect(payload.providerOwnershipType).toBe("PUBLIC");
    });

    it("nests address, empanelment, and certificate keys", () => {
      const providerDetails = createProviderDetailsFromApi({
        providerAddressId: "addr-1",
        providerPlotNo: "Plot 1",
        providerLocation: "Urban",
        providerZone: "West",
      });
      const { general, contact, certs } = createProviderDetailsFormValues(providerDetails);

      const payload = buildProviderOverviewPatch({
        providerDetails,
        general: {
          ...general,
          providerCity: "Pune",
          providerInternalGrade: "B",
          providerZone: "WEST",
          providerLocationType: "Metro",
          providerDayCareFlag: true,
        },
        contact,
        certs: {
          items: [
            {
              ...certs.items[0],
              status: "Registered",
              registrationNo: "NABH999",
            },
          ],
        },
        identifiers: { items: [] },
        providerOldCodesDirty: false,
        clinicalSpecialtyOptions,
      });

      expect(payload.providerDaycareHospitalFlag).toBe(true);
      expect(payload.address).toMatchObject({
        providerAddressId: "addr-1",
        providerCity: "Pune",
        providerPlotNo: "Plot 1",
        providerZone: "WEST",
        providerLocation: "Metro",
      });
      expect(payload.empanelment).toMatchObject({
        providerEmpanellmentId: "empanel-1",
        providerInternalGrade: "B",
      });
      expect(payload.certificates).toEqual([
        expect.objectContaining({
          providerCertificateId: "cert-1",
          providerCertificateTypeName: "NABH",
          providerCertificateRegistrationNumber: "NABH999",
          providerCertificateStatus: "Registered",
        }),
      ]);
    });
  });
});

