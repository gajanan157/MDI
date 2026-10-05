import type { TFunction } from "i18next";
import type { SearchField } from "@/app/pages/dashboards/CommonSearch";
import type { MappingSubTab } from "../provider-master/provider/detail/utils/icMappingSubTabPaths";
import type {
  ProviderMasterConfig,
  ProviderMasterKey,
} from "../masters/utils/masterConfig";
import {
  HIDDEN_VIEW_HOSPITAL_MAIN_TAB_IDS,
  TAB_LABELS,
  VIEW_HOSPITAL_MAIN_TABS,
} from "../provider-master/provider/detail/utils/viewHospitalConfig";
import { PROVIDER_MASTER_CONFIGS } from "../masters/utils/masterConfig";
import { sanitizeApiErrorMessage } from "@/utils/sanitizeApiErrorMessage";

export function getProviderTabLabel(tabId: string, t: TFunction): string {
  const key = `providerMaster.tabs.${tabId}`;
  const translated = t(key);
  if (translated !== key) return translated;
  return TAB_LABELS[tabId] ?? tabId;
}

export function getViewHospitalMainTabs(t: TFunction) {
  return VIEW_HOSPITAL_MAIN_TABS.filter(
    (tab) => !HIDDEN_VIEW_HOSPITAL_MAIN_TAB_IDS.has(tab.id),
  ).map((tab) => ({
    ...tab,
    label: getProviderTabLabel(tab.id, t),
  }));
}

export function getMappingSubTabLabel(subTab: MappingSubTab, t: TFunction): string {
  return t(`providerMaster.mappingSubTab.${subTab}`);
}

export function translateProviderMasterConfig(
  config: ProviderMasterConfig,
  t: TFunction,
): ProviderMasterConfig {
  const prefix = `providerMaster.masters.${config.key}`;
  return {
    ...config,
    title: t(`${prefix}.title`, { defaultValue: config.title }),
    codeLabel: t(`${prefix}.codeLabel`, { defaultValue: config.codeLabel }),
    nameLabel: t(`${prefix}.nameLabel`, { defaultValue: config.nameLabel }),
    descriptionLabel: t(`${prefix}.descriptionLabel`, {
      defaultValue: config.descriptionLabel,
    }),
  };
}

export function getProviderMasterOptions(t: TFunction) {
  return PROVIDER_MASTER_CONFIGS.map((config) => ({
    label: translateProviderMasterConfig(config, t).title,
    value: config.key,
  }));
}

export function getProviderMasterConfig(
  key: ProviderMasterKey,
  t: TFunction,
): ProviderMasterConfig {
  const config =
    PROVIDER_MASTER_CONFIGS.find((item) => item.key === key) ??
    PROVIDER_MASTER_CONFIGS[0];
  return translateProviderMasterConfig(config, t);
}

export function createAgreementTypeFilter(t: TFunction) {
  return [
    { value: "", label: t("providerMaster.agreement.filterOptions.allTypes") },
    { value: "bipartite", label: t("providerMaster.agreement.filterOptions.bipartite") },
    { value: "tripartite", label: t("providerMaster.agreement.filterOptions.tripartite") },
  ];
}

export function createAgreementScopeFilter(t: TFunction) {
  return [
    { value: "", label: t("providerMaster.agreement.filterOptions.allScopes") },
    { value: "psu", label: t("providerMaster.agreement.filterOptions.psu") },
    { value: "selected", label: t("providerMaster.agreement.filterOptions.selectedIcs") },
  ];
}

export function createAgreementStatusFilter(t: TFunction) {
  return [
    { value: "", label: t("providerMaster.agreement.filterOptions.allStatus") },
    { value: "active", label: t("providerMaster.agreement.filterOptions.active") },
    { value: "terminated", label: t("providerMaster.agreement.filterOptions.terminated") },
    { value: "expired", label: t("providerMaster.agreement.filterOptions.expired") },
    { value: "draft", label: t("providerMaster.agreement.filterOptions.draft") },
  ];
}

export type AgreementColumnKey =
  | "agreementIdVersion"
  | "agreementName"
  | "type"
  | "scope"
  | "applicableIcs"
  | "effectiveFromDisplay"
  | "status"
  | "socDiscountStatus"
  | "discount";

export function createAgreementColumnOptions(t: TFunction) {
  return [
    { field: "agreementName" as AgreementColumnKey, label: t("providerMaster.agreement.agreementName") },
    { field: "type" as AgreementColumnKey, label: t("providerMaster.agreement.type") },
    { field: "scope" as AgreementColumnKey, label: t("providerMaster.agreement.scope") },
    { field: "applicableIcs" as AgreementColumnKey, label: t("providerMaster.agreement.applicableIcs") },
    {
      field: "effectiveFromDisplay" as AgreementColumnKey,
      label: t("providerMaster.agreement.effectiveFrom"),
    },
    { field: "status" as AgreementColumnKey, label: t("providerMaster.common.status") },
    {
      field: "socDiscountStatus" as AgreementColumnKey,
      label: t("providerMaster.agreement.soc"),
    },
    {
      field: "discount" as AgreementColumnKey,
      label: t("providerMaster.agreement.discount"),
    },
  ];
}

export function getAgreementColumnLabel(field: AgreementColumnKey, t: TFunction): string {
  return (
    createAgreementColumnOptions(t).find((column) => column.field === field)?.label ??
    field
  );
}

export function createRohiniSearchFields(t: TFunction) {
  return [
    { name: "providerName", label: t("providerMaster.search.hospitalName"), type: "text" as const },
    {
      name: "providerRohiniCode",
      label: t("providerMaster.search.rohiniCode"),
      type: "text" as const,
    },
    { name: "state", label: t("providerMaster.addForm.state"), type: "text" as const },
    { name: "district", label: t("providerMaster.addForm.district"), type: "text" as const },
    { name: "city", label: t("providerMaster.addForm.city"), type: "text" as const },
    {
      name: "pincode",
      label: t("providerMaster.addForm.pincode"),
      type: "text" as const,
      numericOnly: true,
    },
    {
      name: "filterStatus",
      label: t("providerMaster.rohiniMaster.recordStatus"),
      type: "dropdown" as const,
      options: [
        { label: t("providerMaster.rohiniMaster.filterAll"), value: "ALL" },
        { label: t("providerMaster.common.active"), value: "ACTIVE" },
        { label: t("providerMaster.common.inactive"), value: "INACTIVE" },
      ],
    },
  ];
}

export function createProviderInwardSearchFields(t: TFunction): SearchField[] {
  return [
    {
      name: "inwardNo",
      label: t("providerMaster.dashboard.inward.search.inwardNo"),
      type: "text",
    },
    {
      name: "sourceEntity",
      label: t("providerMaster.dashboard.inward.search.sourceEntity"),
      type: "text",
    },
    {
      name: "fromDate",
      label: t("providerMaster.dashboard.inward.search.fromDate"),
      type: "date",
    },
    {
      name: "toDate",
      label: t("providerMaster.dashboard.inward.search.toDate"),
      type: "date",
    },
  ];
}

export function getRohiniMasterBreadcrumbs(t: TFunction) {
  return [
    { title: t("providerMaster.moduleName") },
    { title: t("providerMaster.providerMasterLabel") },
    { title: t("providerMaster.rohiniMaster.title") },
  ];
}

export function getExcludedProviderBreadcrumbs(t: TFunction) {
  return [
    { title: t("providerMaster.moduleName") },
    { title: t("providerMaster.providerMasterLabel") },
    { title: t("nav.dashboards.provider-masters-excluded-hospitals") },
  ];
}

export function createExcludedProviderSearchFields(
  t: TFunction,
  options: {
    stateOptions?: Array<{ label: string; value: string }>;
  } = {},
) {
  const stateOptions = options.stateOptions ?? [];
  return [
    { name: "providerName", label: t("providerMaster.table.providerName"), type: "text" as const },
    {
      name: "blacklistedBy",
      label: t("providerMaster.excludedProvider.search.restrictedBy"),
      type: "dropdown" as const,
      options: [
        { value: "TPA", label: t("providerMaster.excludedProvider.restrictedBy.tpa") },
        { value: "INSURER", label: t("providerMaster.excludedProvider.restrictedBy.insurer") },
      ],
    },
    {
      name: "insurerId",
      label: t("providerMaster.excludedProvider.search.insurerName"),
      type: "dropdown" as const,
      dependsOn: "blacklistedBy",
      dependsOnValues: ["INSURER"],
      options: [],
    },
    {
      name: "providerMatchingStatus",
      label: "Provider Matching Status",
      type: "dropdown" as const,
      dependsOn: "insurerId",
      defaultValue: "ALL",
      options: [
        { value: "ALL", label: "All" },
        { value: "MATCHED_WITH_TPA", label: "Matched with TPA" },
        { value: "NOT_MATCHED_WITH_TPA", label: "Not Matched with TPA" },
      ],
    },
    {
      name: "pincode",
      label: t("providerMaster.addForm.pincode"),
      type: "text" as const,
      numericOnly: true,
    },
    {
      name: "state",
      label: t("providerMaster.addForm.state"),
      type: "dropdown" as const,
      options: stateOptions,
      allowCustomValue: true,
    },
    {
      name: "city",
      label: t("providerMaster.addForm.city"),
      type: "dropdown" as const,
      options: [],
      allowCustomValue: true,
    },
  ];
}

const PD = "providerMaster.detailTabs.providerDetails";
const PDF = `${PD}.fields`;

/** Translated labels for Provider Details tab view/edit fields. */
export function createProviderDetailsFieldLabels(t: TFunction) {
  return {
    providerName: t("providerMaster.addForm.providerName"),
    providerCode: t("providerMaster.table.providerCode"),
    providerType: t("providerMaster.addForm.providerType"),
    ownershipType: t("providerMaster.addForm.ownershipType"),
    providerCategory: t("providerMaster.addForm.providerCategory"),
    clinicalSpeciality: t("providerMaster.addForm.clinicalSpeciality"),
    grade: t(`${PDF}.grade`),
    careTier: t(`${PDF}.careTier`),
    dayCare: t(`${PDF}.dayCare`),
    signatoryName: t(`${PDF}.signatoryName`),
    signatoryDesignation: t(`${PDF}.signatoryDesignation`),
    systemOfMedicine: t(`${PDF}.systemOfMedicine`),
    tpaServicingBranch: t(`${PDF}.tpaServicingBranch`),
    serviceEmail: t(`${PDF}.serviceEmail`),
    category: t(`${PDF}.category`),
    city: t("providerMaster.addForm.city"),
    district: t("providerMaster.addForm.district"),
    state: t("providerMaster.addForm.state"),
    zone: t(`${PDF}.zone`),
    pinCode: t(`${PDF}.pinCode`),
    location: t(`${PDF}.location`),
    address: t("providerMaster.addForm.address"),
    email: t("providerMaster.addForm.email"),
    telePhoneNo: t(`${PDF}.telePhoneNo`),
    faxNo: t("providerMaster.addForm.faxNo"),
    mobNo: t(`${PDF}.mobNo`),
    websiteAvailable: t(`${PDF}.websiteAvailable`),
    websiteUrl: t("providerMaster.addForm.websiteUrl"),
    rohiniNumber: t("providerMaster.addForm.rohiniNumber"),
    providerRohiniId: t(`${PDF}.providerRohiniId`),
    registrationNo: t(`${PDF}.registrationNo`),
    registrationAct: t(`${PDF}.registrationAct`),
    identifierDetails: t(`${PD}.identifierDetails`),
    oldProviderCodes: t(`${PD}.oldProviderCodes`),
    noIdentifierData: t(`${PD}.noIdentifierData`),
    noCertificateAvailable: t(`${PD}.noCertificateAvailable`),
    notRegistered: t(`${PD}.notRegistered`),
    viewCertificate: t(`${PD}.viewCertificate`),
    removeRohiniNumber: t(`${PD}.removeRohiniNumber`),
    removeOldProviderCode: t(`${PD}.removeOldProviderCode`),
    certName: t(`${PDF}.certName`),
    certStatus: t("providerMaster.common.status"),
    certValidFrom: t(`${PDF}.certValidFrom`),
    certValidTo: t(`${PDF}.certValidTo`),
    yes: t("providerMaster.common.yes"),
    no: t("providerMaster.common.no"),
    active: t("providerMaster.common.active"),
    inactive: t("providerMaster.common.inactive"),
  };
}

export type ProviderDetailsFieldLabels = ReturnType<typeof createProviderDetailsFieldLabels>;

export type ProviderSummaryFieldKey =
  | "providerName"
  | "address"
  | "providerCode"
  | "rohiniId";

const SUMMARY_BAR_LABEL_KEYS: Record<ProviderSummaryFieldKey, string> = {
  providerName: "providerMaster.summaryBar.providerName",
  address: "providerMaster.summaryBar.address",
  providerCode: "providerMaster.summaryBar.providerCode",
  rohiniId: "providerMaster.summaryBar.rohiniId",
};

export function getProviderSummaryBarLabel(
  key: ProviderSummaryFieldKey,
  t: TFunction,
): string {
  return t(SUMMARY_BAR_LABEL_KEYS[key]);
}

export function resolveProviderNetworkTypeLabel(
  value: string | null | undefined,
  t: TFunction,
): string {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (normalized === "NETWORK") return t("providerMaster.network.network");
  if (normalized === "NON_NETWORK") return t("providerMaster.network.nonNetwork");
  return "-";
}

function isProviderNotFoundMessage(message?: string | null): boolean {
  return /not found/i.test(String(message ?? "").trim());
}

export function resolveAgreementEmptyTitle(
  t: TFunction,
  options: {
    error?: string;
    listMessage?: string;
    emptyStateTitle?: string;
  },
): string {
  const error = sanitizeApiErrorMessage(options.error ?? "", "").trim();
  if (error) {
    return isProviderNotFoundMessage(error)
      ? t("providerMaster.agreement.detailsNotFound")
      : error;
  }

  const listMessage = sanitizeApiErrorMessage(options.listMessage ?? "", "").trim();
  if (listMessage) {
    return isProviderNotFoundMessage(listMessage)
      ? t("providerMaster.agreement.detailsNotFound")
      : listMessage;
  }

  return options.emptyStateTitle ?? t("providerMaster.agreement.noAgreements");
}

const PO = "providerMaster.detailTabs.owner";
const AF = "providerMaster.addForm";

export function createProviderOwnerFieldLabels(t: TFunction) {
  return {
    ownerDetails: t(`${PO}.sections.ownerDetails`),
    contactDetails: t(`${AF}.contactDetails`),
    addressSection: t(`${PO}.sections.address`),
    details: t(`${PO}.sections.details`),
    contact: t(`${PO}.sections.contact`),
    ownerName: t(`${PO}.fields.ownerName`),
    designation: t(`${PO}.fields.designation`),
    qualification: t(`${PO}.fields.qualification`),
    gender: t(`${PO}.fields.gender`),
    telePhoneNo: t(`${AF}.telephoneNo`),
    mobNo: t(`${AF}.mobileNo`),
    email: t(`${AF}.email`),
    address: t(`${AF}.address`),
    pincode: t(`${AF}.pincode`),
    city: t(`${AF}.city`),
    state: t(`${AF}.state`),
    pinCode: t(`${PO}.fields.pinCode`),
  };
}

export type ProviderOwnerFieldLabels = ReturnType<typeof createProviderOwnerFieldLabels>;

const CP = "providerMaster.detailTabs.contactPersons";

const CONTACT_ROLE_KEY_MAP: Record<string, string> = {
  keycontactperson: "keyContactPerson",
  billingdepartment: "billingDepartment",
  issuehandler: "issueHandler",
  tpacoordinator: "tpaCoordinator",
  contactperson: "contactPerson",
  ceo: "chiefExecutive",
  chiefofficer: "chiefExecutive",
  chiefexecutive: "chiefExecutive",
  chiefexecutiveofficer: "chiefExecutive",
};

function normalizeContactRoleKey(role: string): string {
  return role.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function resolveContactRoleTranslationKey(role: string): string | undefined {
  const normalized = normalizeContactRoleKey(role);
  const direct = CONTACT_ROLE_KEY_MAP[normalized];
  if (direct) return direct;

  if (normalized.includes("keycontact")) return "keyContactPerson";
  if (normalized.includes("billing")) return "billingDepartment";
  if (normalized.includes("issuehandler")) return "issueHandler";
  if (normalized.includes("tpacoord")) return "tpaCoordinator";
  if (normalized.includes("chiefexecutive") || normalized === "ceo") {
    return "chiefExecutive";
  }
  if (normalized.includes("contactperson")) return "contactPerson";

  return undefined;
}

export function translateContactPersonRole(t: TFunction, role?: string | null): string {
  const raw = String(role ?? "").trim();
  if (!raw) return t(`${CP}.defaultRole`);

  const mappedKey = resolveContactRoleTranslationKey(raw);
  if (mappedKey) {
    return t(`${CP}.roles.${mappedKey}`);
  }

  return raw;
}

export function createContactPersonFieldLabels(t: TFunction) {
  return {
    addContactPerson: t(`${CP}.addContactPerson`),
    noContactDetails: t(`${CP}.noContactDetails`),
    noContactPersonsOnFile: t(`${CP}.noContactPersonsOnFile`),
    noNameOnFile: t(`${CP}.noNameOnFile`),
    noDesignation: t(`${CP}.noDesignation`),
    role: t(`${CP}.fields.role`),
    name: t(`${CP}.fields.name`),
    designation: t(`${PO}.fields.designation`),
    mobileNo: t(`${AF}.mobileNo`),
    telephoneNo: t(`${AF}.telephoneNo`),
    email: t(`${AF}.email`),
    mobile: t(`${CP}.fields.mobile`),
    telephone: t(`${CP}.fields.telephone`),
  };
}

export type ContactPersonFieldLabels = ReturnType<typeof createContactPersonFieldLabels>;

const IC = "providerMaster.icMapping";

export type IcMappingGridLabels = {
  actions: string;
  view: string;
  unmap: string;
  insuranceCompany: string;
  corporateName: string;
  icProviderCode: string;
  networkSource: string;
  networkMode: string;
  tariffType: string;
  cashlessStatus: string;
  reimbursement: string;
  status: string;
  statusActive: string;
  statusInactive: string;
  statusDepanelled: string;
  statusEmpanelled: string;
  statusWatchlist: string;
  statusBlacklist: string;
  agreementStatus: string;
  agreementPending: string;
  agreementCompleted: string;
  bankMatch: string;
  bankMatchMatched: string;
  bankMatchMismatch: string;
  bankMatchPending: string;
  bankMatchCompare: string;
  bankMatchCompareTooltipHint: string;
  yes: string;
  no: string;
};

export function createIcMappingGridLabels(t: TFunction): IcMappingGridLabels {
  const C = `${IC}.columns`;
  const B = `${IC}.bankMatch`;
  const A = `${IC}.agreementStatus`;
  return {
    actions: t("providerMaster.common.actions"),
    view: t("providerMaster.common.view"),
    unmap: t(`${IC}.actions.unmap`),
    insuranceCompany: t(`${C}.insuranceCompany`),
    corporateName: t(`${C}.corporateName`),
    icProviderCode: t(`${C}.icProviderCode`),
    networkSource: t(`${C}.networkSource`),
    networkMode: t(`${C}.networkMode`),
    tariffType: t(`${C}.tariffType`),
    cashlessStatus: t(`${C}.cashlessStatus`),
    reimbursement: t(`${C}.reimbursement`),
    status: t(`${C}.status`),
    statusActive: t(`${C}.statusActive`),
    statusInactive: t(`${C}.statusInactive`),
    statusDepanelled: t(`${C}.statusDepanelled`),
    statusEmpanelled: t(`${C}.statusEmpanelled`),
    statusWatchlist: t(`${C}.statusWatchlist`),
    statusBlacklist: t(`${C}.statusBlacklist`),
    agreementStatus: t(`${C}.agreementStatus`),
    agreementPending: t(`${A}.pending`),
    agreementCompleted: t(`${A}.completed`),
    bankMatch: t(`${C}.bankMatch`),
    bankMatchMatched: t(`${B}.matched`),
    bankMatchMismatch: t(`${B}.mismatch`),
    bankMatchPending: t(`${B}.pending`),
    bankMatchCompare: t(`${IC}.bankMatchCompare.compare`),
    bankMatchCompareTooltipHint: t(`${IC}.bankMatchCompare.clickCompareHint`),
    yes: t("providerMaster.common.yes"),
    no: t("providerMaster.common.no"),
  };
}

export function resolveMappingEmptyState(
  mappingSubTab: "ic" | "corporate",
  t: TFunction,
): { title: string; description: string } {
  if (mappingSubTab === "ic") {
    return {
      title: t(`${IC}.empty.noIcMapping`),
      description: "",
    };
  }

  return {
    title: t(`${IC}.empty.noCorporateMapping`),
    description: t(`${IC}.empty.noCorporateMappingHint`),
  };
}

const SOC = "providerMaster.soc";

export type SocGridColumnLabels = {
  actions: string;
  viewSoc: string;
  version: string;
  socName: string;
  applicableIcs: string;
  lastUpdated: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: string;
};

export function createSocGridColumnLabels(t: TFunction): SocGridColumnLabels {
  const C = `${SOC}.columns`;
  return {
    actions: t("providerMaster.common.actions"),
    viewSoc: t(`${C}.viewSoc`),
    version: t(`${C}.version`),
    socName: t(`${C}.socName`),
    applicableIcs: t(`${C}.applicableIcs`),
    lastUpdated: t(`${C}.lastUpdated`),
    startDate: t(`${C}.startDate`),
    endDate: t(`${C}.endDate`),
    duration: t(`${C}.duration`),
    status: t("providerMaster.common.status"),
  };
}

export function createSocListSearchFields(t: TFunction): SearchField[] {
  const C = `${SOC}.columns`;
  return [
    { name: "socIdVersion", label: t(`${C}.version`), type: "text" },
    { name: "socName", label: t(`${C}.socName`), type: "text" },
    { name: "applicableIcs", label: t(`${C}.applicableIcs`), type: "text" },
    {
      name: "status",
      label: t("providerMaster.common.status"),
      type: "dropdown",
      options: createSocStatusFilterOptions(t),
    },
  ];
}

export function createSocStatusFilterOptions(t: TFunction) {
  return [
    { value: "", label: t(`${SOC}.searchFields.allStatus`) },
    { value: "Active", label: t("providerMaster.common.active") },
    { value: "Inactive", label: t("providerMaster.common.inactive") },
  ];
}

export function resolveSocEmptyState(t: TFunction): { title: string; description: string } {
  return {
    title: t(`${SOC}.empty.notFound`),
    description: t(`${SOC}.empty.hint`),
  };
}

export type DiscountGridColumnLabels = {
  actions: string;
  viewDiscount: string;
  version: string;
  agreementName: string;
  agreementType: string;
  insuranceCo: string;
  corporate: string;
  discountType: string;
  categories: string;
  ppnDiscount: string;
  applicableIcs: string;
  effectiveFrom: string;
  status: string;
  discountTypeLabels: Record<string, string>;
};

export function createDiscountGridColumnLabels(t: TFunction): DiscountGridColumnLabels {
  const C = `${SOC}.discount.columns`;
  const typeOptions = createSocDiscountTypeOptions(t);
  const discountTypeLabels = Object.fromEntries(
    typeOptions.filter((o) => o.value).map((o) => [o.value, o.label]),
  );

  return {
    actions: t("providerMaster.common.actions"),
    viewDiscount: t(`${C}.viewDiscount`),
    version: t(`${C}.version`),
    agreementName: t(`${C}.agreementName`),
    agreementType: t(`${C}.agreementType`),
    insuranceCo: t(`${C}.insuranceCo`),
    corporate: t(`${C}.corporate`),
    discountType: t(`${C}.discountType`),
    categories: t(`${C}.categories`),
    ppnDiscount: t(`${C}.ppnDiscount`),
    applicableIcs: t(`${C}.applicableIcs`),
    effectiveFrom: t(`${C}.effectiveFrom`),
    status: t("providerMaster.common.status"),
    discountTypeLabels,
  };
}

export function createDiscountListSearchFields(t: TFunction): SearchField[] {
  const C = `${SOC}.discount.columns`;
  return [
    { name: "agreementName", label: t(`${C}.agreementName`), type: "text" },
    { name: "insuranceCo", label: t(`${C}.insuranceCo`), type: "text" },
    { name: "corporate", label: t(`${C}.corporate`), type: "text" },
    { name: "discountTypes", label: t(`${C}.discountType`), type: "text" },
    {
      name: "status",
      label: t("providerMaster.common.status"),
      type: "dropdown",
      options: createDiscountStatusFilterOptions(t),
    },
  ];
}

export function createDiscountStatusFilterOptions(t: TFunction) {
  const S = `${SOC}.discount.statusValues`;
  return [
    { value: "", label: t(`${SOC}.searchFields.allStatus`) },
    { value: "ACTIVE", label: t(`${S}.active`, { defaultValue: "Active" }) },
    { value: "TERMINATED", label: t(`${S}.terminated`, { defaultValue: "Terminated" }) },
    { value: "EXPIRED", label: t(`${S}.expired`, { defaultValue: "Expired" }) },
    { value: "INACTIVE", label: t(`${S}.inactive`, { defaultValue: "Inactive" }) },
    { value: "DRAFT", label: t(`${S}.draft`, { defaultValue: "Draft" }) },
  ];
}

export function resolveDiscountEmptyState(t: TFunction): { title: string; description: string } {
  return {
    title: t(`${SOC}.discount.empty.notFound`),
    description: t(`${SOC}.discount.empty.hint`),
  };
}

export function createSocApplicableIcScopeOptions(t: TFunction) {
  const S = `${SOC}.applicableIc.scopes`;
  return [
    { value: "selectIc" as const, label: t(`${S}.selectIc`) },
    { value: "allIcs" as const, label: t(`${S}.allIcs`) },
    { value: "gipsa" as const, label: t(`${S}.gipsa`) },
    { value: "gic" as const, label: t(`${S}.gic`) },
    { value: "psu" as const, label: t(`${S}.psu`) },
  ];
}

export function createSocDiscountTypeOptions(t: TFunction) {
  const D = `${SOC}.discount.types`;
  return [
    { label: t(`${D}.select`), value: "" },
    { label: t(`${D}.individual`), value: "individual" },
    { label: t(`${D}.netBill`), value: "netBill" },
    { label: t(`${D}.approvedAmount`), value: "approvedAmountDiscount" },
    { label: t(`${D}.package`), value: "package" },
  ];
}

export function createSocDiscountApplicableOnOptions(t: TFunction) {
  const D = `${SOC}.discount.applicableOnOptions`;
  return [
    { label: t(`${D}.select`), value: "" },
    { label: t(`${D}.ppnSoc`), value: "ppnSoc" },
    { label: t(`${D}.privateIcSoc`), value: "billAmount" },
    { label: t(`${D}.nonPpnPackage`), value: "roomRent" },
    { label: t(`${D}.noPackage`), value: "roomRent" },
  ];
}

export function translateSocDiscountOptionLabel(
  t: TFunction,
  options: Array<{ label: string; value: string }>,
  value: string,
): string | undefined {
  const match = options.find((option) => option.value === value);
  return match?.label;
}
