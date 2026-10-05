import type { TFunction } from "i18next";
import { formatProviderDateTimeDisplay } from "../../shared/dateFormat";
import type {
  ProviderMasterConfig,
  ProviderMasterKey,
  ProviderMasterRecord,
} from "./masterConfig";
import {
  INSURER_PROVIDER_NETWORK_MODE_KEY,
  PROVIDER_DISCOUNT_TYPE_MASTER_KEY,
  PROVIDER_DISCOUNT_SUB_TYPE_MASTER_KEY,
  isDiscountInclusionExclusionMasterKey,
  PROVIDER_IDENTIFIER_TYPE_MASTER_KEY,
  PROVIDER_TAXONOMY_KEY,
} from "./providerMasterFunctions";
import { IDENTIFIER_EXTRA_FIELDS } from "./identifierTypeFormConfig";
import { DISCOUNT_TYPE_SERVICE_TYPE_FIELD } from "./discountTypeFormConfig";
import {
  DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD,
  DISCOUNT_SUBTYPE_TYPE_NAME_FIELD,
} from "./discountSubtypeFormConfig";
import { DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD } from "./discountInclusionExclusionFormConfig";
import { INSURER_PROVIDER_NETWORK_MODE_FIELDS } from "./insurerProviderNetworkModeFormConfig";

export type MasterTypeFlags = {
  isIdentifierTypeMaster: boolean;
  isTaxonomyMaster: boolean;
  isNetworkModeMaster: boolean;
  isDiscountTypeMaster: boolean;
  isDiscountSubtypeMaster: boolean;
  isDiscountInclusionExclusionMaster: boolean;
};

export function getMasterTypeFlags(selectedMasterKey: ProviderMasterKey): MasterTypeFlags {
  return {
    isIdentifierTypeMaster: selectedMasterKey === PROVIDER_IDENTIFIER_TYPE_MASTER_KEY,
    isTaxonomyMaster: selectedMasterKey === PROVIDER_TAXONOMY_KEY,
    isNetworkModeMaster: selectedMasterKey === INSURER_PROVIDER_NETWORK_MODE_KEY,
    isDiscountTypeMaster: selectedMasterKey === PROVIDER_DISCOUNT_TYPE_MASTER_KEY,
    isDiscountSubtypeMaster: selectedMasterKey === PROVIDER_DISCOUNT_SUB_TYPE_MASTER_KEY,
    isDiscountInclusionExclusionMaster: isDiscountInclusionExclusionMasterKey(selectedMasterKey),
  };
}

export function isDiscountFamilyMaster(flags: MasterTypeFlags): boolean {
  return (
    flags.isDiscountTypeMaster ||
    flags.isDiscountSubtypeMaster ||
    flags.isDiscountInclusionExclusionMaster
  );
}

export function normalizeSearchValue(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function filterClientSideRows(
  rows: ProviderMasterRecord[],
  filters: Record<string, unknown>,
): ProviderMasterRecord[] {
  const codeFilter = normalizeSearchValue(filters.code);
  const nameFilter = normalizeSearchValue(filters.name);
  const statusFilter = String(filters.status ?? "").trim();

  return rows.filter((row) => {
    if (codeFilter && !row.code.toLowerCase().includes(codeFilter)) return false;
    if (nameFilter && !row.name.toLowerCase().includes(nameFilter)) return false;
    if (statusFilter && row.recordStatus !== statusFilter) return false;
    return true;
  });
}

type TotalItemsParams = {
  isServerPaginatedMaster: boolean;
  flags: MasterTypeFlags;
  providerIdentifierTypeTotal: number;
  providerTaxonomyTotal: number;
  insurerProviderNetworkModeTotal: number;
  providerDiscountTypeTotal: number;
  providerDiscountSubtypeTotal: number;
  providerDiscountInclusionExclusionTotal: number;
  filteredCount: number;
};

function resolveServerTotal(
  flags: MasterTypeFlags,
  providerIdentifierTypeTotal: number,
  providerTaxonomyTotal: number,
  insurerProviderNetworkModeTotal: number,
  providerDiscountTypeTotal: number,
  providerDiscountSubtypeTotal: number,
  providerDiscountInclusionExclusionTotal: number,
): number {
  if (flags.isIdentifierTypeMaster) return providerIdentifierTypeTotal;
  if (flags.isTaxonomyMaster) return providerTaxonomyTotal;
  if (flags.isNetworkModeMaster) return insurerProviderNetworkModeTotal;
  if (flags.isDiscountTypeMaster) return providerDiscountTypeTotal;
  if (flags.isDiscountSubtypeMaster) return providerDiscountSubtypeTotal;
  if (flags.isDiscountInclusionExclusionMaster) return providerDiscountInclusionExclusionTotal;
  return 0;
}

export function resolveTotalItems({
  isServerPaginatedMaster,
  flags,
  providerIdentifierTypeTotal,
  providerTaxonomyTotal,
  insurerProviderNetworkModeTotal,
  providerDiscountTypeTotal,
  providerDiscountSubtypeTotal,
  providerDiscountInclusionExclusionTotal,
  filteredCount,
}: TotalItemsParams): number {
  if (!isServerPaginatedMaster) return filteredCount;

  const serverTotal = resolveServerTotal(
    flags,
    providerIdentifierTypeTotal,
    providerTaxonomyTotal,
    insurerProviderNetworkModeTotal,
    providerDiscountTypeTotal,
    providerDiscountSubtypeTotal,
    providerDiscountInclusionExclusionTotal,
  );

  if (serverTotal <= 0) return filteredCount;

  return serverTotal;
}

function formatExtraFieldDisplayValue(value: unknown, t: TFunction): string {
  if (typeof value === "boolean") {
    return value ? t("providerMaster.common.yes") : t("providerMaster.common.no");
  }
  return String(value ?? "");
}

function formatNetworkModeFieldValue(
  field: { type?: string; name: string },
  viewRecord: ProviderMasterRecord,
): string {
  if (field.type === "checkbox") {
    return viewRecord.extra?.[field.name] ? "Yes" : "No";
  }
  const raw = String(viewRecord.extra?.[field.name] ?? "");
  if (field.type === "date") {
    return formatProviderDateTimeDisplay(raw);
  }
  return raw;
}

export function buildViewFields(
  viewRecord: ProviderMasterRecord,
  flags: MasterTypeFlags,
  selectedConfig: ProviderMasterConfig,
  t: TFunction,
): Array<{ label: string; value: string }> {
  const baseFields = [
    { label: selectedConfig.codeLabel, value: viewRecord.code },
    { label: selectedConfig.nameLabel, value: viewRecord.name },
    { label: selectedConfig.descriptionLabel, value: viewRecord.description },
  ];

  if (flags.isIdentifierTypeMaster) {
    return [
      ...baseFields,
      ...IDENTIFIER_EXTRA_FIELDS.map((field) => ({
        label: field.label,
        value: formatExtraFieldDisplayValue(viewRecord.extra?.[field.name], t),
      })),
      { label: t("providerMaster.common.status"), value: viewRecord.recordStatus },
    ];
  }

  if (flags.isTaxonomyMaster) {
    return [
      ...baseFields,
      {
        label: t("providerMaster.mastersPage.classCode"),
        value: String(viewRecord.extra?.class_code ?? ""),
      },
      {
        label: t("providerMaster.mastersPage.subclassCode"),
        value: String(viewRecord.extra?.subclass_code ?? ""),
      },
      { label: t("providerMaster.mastersPage.isActive"), value: viewRecord.recordStatus },
    ];
  }

  if (flags.isNetworkModeMaster) {
    return [
      ...baseFields,
      ...INSURER_PROVIDER_NETWORK_MODE_FIELDS.map((field) => ({
        label: field.label,
        value: formatNetworkModeFieldValue(field, viewRecord),
      })),
    ];
  }

  if (flags.isDiscountTypeMaster) {
    return [
      { label: selectedConfig.codeLabel, value: viewRecord.code },
      {
        label: t("providerMaster.mastersPage.serviceType"),
        value: String(viewRecord.extra?.[DISCOUNT_TYPE_SERVICE_TYPE_FIELD] ?? ""),
      },
      { label: selectedConfig.nameLabel, value: viewRecord.name },
      { label: selectedConfig.descriptionLabel, value: viewRecord.description },
      { label: t("providerMaster.mastersPage.isActive"), value: viewRecord.recordStatus },
    ];
  }

  if (flags.isDiscountSubtypeMaster) {
    return [
      {
        label: t("providerMaster.mastersPage.discountType"),
        value:
          String(viewRecord.extra?.[DISCOUNT_SUBTYPE_TYPE_NAME_FIELD] ?? "").trim() ||
          String(viewRecord.extra?.[DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD] ?? ""),
      },
      { label: selectedConfig.codeLabel, value: viewRecord.code },
      { label: selectedConfig.nameLabel, value: viewRecord.name },
      { label: selectedConfig.descriptionLabel, value: viewRecord.description },
      { label: t("providerMaster.mastersPage.isActive"), value: viewRecord.recordStatus },
    ];
  }

  if (flags.isDiscountInclusionExclusionMaster) {
    return [
      { label: selectedConfig.codeLabel, value: viewRecord.code },
      {
        label: t("providerMaster.mastersPage.inclusionExclusionType"),
        value: formatInclusionExclusionTypeDisplay(
          String(viewRecord.extra?.[DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD] ?? ""),
          t,
        ),
      },
      { label: selectedConfig.nameLabel, value: viewRecord.name },
      { label: selectedConfig.descriptionLabel, value: viewRecord.description },
      { label: t("providerMaster.mastersPage.isActive"), value: viewRecord.recordStatus },
    ];
  }

  return [
    ...baseFields,
    { label: t("providerMaster.common.status"), value: viewRecord.recordStatus },
  ];
}

export function buildIdentifierTypeColumns(t: TFunction) {
  return [
    {
      field: "identifierLevel",
      headerName: t("providerMaster.mastersPage.identifierLevel"),
      minWidth: 150,
      flex: 1,
      valueGetter: (params: { data?: ProviderMasterRecord }) =>
        String(params.data?.extra?.identifierLevel ?? ""),
    },
    {
      field: "issuingAuthorityName",
      headerName: t("providerMaster.mastersPage.issuingAuthorityName"),
      minWidth: 180,
      flex: 1.2,
      valueGetter: (params: { data?: ProviderMasterRecord }) =>
        String(params.data?.extra?.issuingAuthorityName ?? ""),
    },
    {
      field: "applicableProviderType",
      headerName: t("providerMaster.mastersPage.applicableProviderType"),
      minWidth: 180,
      flex: 1.2,
      valueGetter: (params: { data?: ProviderMasterRecord }) =>
        String(params.data?.extra?.applicableProviderType ?? ""),
    },
  ];
}

export function buildNetworkModeColumns(t: TFunction) {
  return [
    {
      field: "effectiveFrom",
      headerName: t("providerMaster.mastersPage.effectiveFrom"),
      minWidth: 160,
      flex: 1,
      valueGetter: (params: { data?: ProviderMasterRecord }) =>
        String(params.data?.extra?.insurerProviderNetworkModeEffectiveFrom ?? ""),
      valueFormatter: (params: { value?: string }) =>
        formatProviderDateTimeDisplay(String(params.value ?? "")),
    },
    {
      field: "effectiveTo",
      headerName: t("providerMaster.mastersPage.effectiveTo"),
      minWidth: 160,
      flex: 1,
      valueGetter: (params: { data?: ProviderMasterRecord }) =>
        String(params.data?.extra?.insurerProviderNetworkModeEffectiveTo ?? ""),
      valueFormatter: (params: { value?: string }) =>
        formatProviderDateTimeDisplay(String(params.value ?? "")),
    },
    {
      field: "activeFlag",
      headerName: t("providerMaster.mastersPage.activeFlag"),
      minWidth: 110,
      flex: 0.8,
      valueGetter: (params: { data?: ProviderMasterRecord }) =>
        params.data?.extra?.insurerProviderNetworkActiveFlag
          ? t("providerMaster.common.yes")
          : t("providerMaster.common.no"),
    },
  ];
}

export function buildDiscountTypeColumns(t: TFunction) {
  return [
    {
      field: DISCOUNT_TYPE_SERVICE_TYPE_FIELD,
      headerName: t("providerMaster.mastersPage.serviceType"),
      minWidth: 130,
      flex: 0.9,
      valueGetter: (params: { data?: ProviderMasterRecord }) =>
        String(params.data?.extra?.[DISCOUNT_TYPE_SERVICE_TYPE_FIELD] ?? ""),
    },
  ];
}

export function buildDiscountSubtypeColumns(t: TFunction) {
  return [
    {
      field: DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD,
      headerName: t("providerMaster.mastersPage.discountType"),
      minWidth: 180,
      flex: 1.2,
      valueGetter: (params: { data?: ProviderMasterRecord }) =>
        String(params.data?.extra?.[DISCOUNT_SUBTYPE_TYPE_NAME_FIELD] ?? "").trim() ||
        String(params.data?.extra?.[DISCOUNT_SUBTYPE_TYPE_MASTER_ID_FIELD] ?? ""),
    },
  ];
}

function formatInclusionExclusionTypeDisplay(value: string, t: TFunction): string {
  if (value === "INCLUSION") return t("providerMaster.mastersPage.inclusion");
  if (value === "EXCLUSION") return t("providerMaster.mastersPage.exclusion");
  return value;
}

export function buildDiscountInclusionExclusionColumns(t: TFunction) {
  return [
    {
      field: DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD,
      headerName: t("providerMaster.mastersPage.inclusionExclusionType"),
      minWidth: 140,
      flex: 0.9,
      valueGetter: (params: { data?: ProviderMasterRecord }) =>
        formatInclusionExclusionTypeDisplay(
          String(params.data?.extra?.[DISCOUNT_INCLUSION_EXCLUSION_TYPE_FIELD] ?? ""),
          t,
        ),
    },
  ];
}

export function buildMasterSpecificColumns(flags: MasterTypeFlags, t: TFunction) {
  if (flags.isIdentifierTypeMaster) return buildIdentifierTypeColumns(t);
  if (flags.isNetworkModeMaster) return buildNetworkModeColumns(t);
  if (flags.isDiscountTypeMaster) return buildDiscountTypeColumns(t);
  if (flags.isDiscountSubtypeMaster) return buildDiscountSubtypeColumns(t);
  if (flags.isDiscountInclusionExclusionMaster) return buildDiscountInclusionExclusionColumns(t);
  return [];
}
