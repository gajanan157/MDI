import type { TFunction } from "i18next";
import type { SearchField } from "../../../../shared/providerShell";
import { AGREEMENT_NAME_OPTIONS } from "../../detail/tabs/agreement/utils/agreementFormConfig";
// import { PROVIDER_TAXONOMY_TYPE_OPTIONS } from "../../utils/providerTypeConstants";
import {
  validateOptionalDigitsOnly,
  validateOptionalPositiveDays,
} from "./providerListHelpers";

export { PROVIDER_GRID_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS } from "../../../../shared/providerGridPagination.constants";

export function createProviderNetworkTypeFilterOptions(t: TFunction) {
  return [
    { label: t("providerMaster.network.both"), value: "BOTH" },
    { label: t("providerMaster.network.network"), value: "NETWORK" },
    { label: t("providerMaster.network.nonNetwork"), value: "NON_NETWORK" },
  ] as const;
}

export function createProviderNetworkSourceFilterOptions(t: TFunction) {
  return [
    { label: t("providerMaster.network.both"), value: "BOTH" },
    { label: t("providerMaster.network.tpa"), value: "TPA" },
    { label: t("providerMaster.network.insurer"), value: "INSURER" },
  ] as const;
}

/** ROHINI expiry status: All (no filter), Active (not expired), Expired. */
export function createRohiniExpiryStatusFilterOptions(t: TFunction) {
  return [
    { label: t("providerMaster.search.rohiniExpiryStatusAll"), value: "ALL" },
    { label: t("providerMaster.search.rohiniExpiryStatusActive"), value: "ACTIVE" },
    { label: t("providerMaster.search.rohiniExpiryStatusExpired"), value: "EXPIRED" },
  ] as const;
}

export function createProviderAgreementTypeFilterOptions() {
  return AGREEMENT_NAME_OPTIONS.map((option) => ({
    label: option.label.trim(),
    value: option.value,
  }));
}

type CreateProviderSearchFieldsOptions = {
  stateOptions?: Array<{ label: string; value: string }>;
};

export function createProviderSearchFields(
  t: TFunction,
  options: CreateProviderSearchFieldsOptions = {},
): SearchField[] {
  const rohiniLabel = t("providerMaster.search.rohiniCode");
  const pincodeLabel = t("providerMaster.addForm.pincode");
  const stateOptions = options.stateOptions ?? [];
  return [
    { name: "hospitalName", label: t("providerMaster.search.hospitalName"), type: "text" },
    {
      name: "rohiniCode",
      label: rohiniLabel,
      type: "text",
      numericOnly: true,
      rules: {
        validate: (value: unknown) => validateOptionalDigitsOnly(value, rohiniLabel),
      },
    },
    { name: "providerCode", label: t("providerMaster.search.providerCode"), type: "text" },
    {
      name: "agreementTypes",
      label: t("providerMaster.search.agreementType"),
      type: "dropdown",
      isMulti: true,
      options: createProviderAgreementTypeFilterOptions(),
    },
    {
      name: "pincode",
      label: pincodeLabel,
      type: "text",
      numericOnly: true,
      rules: {
        validate: (value: unknown) => {
          const digitsOnly = validateOptionalDigitsOnly(value, pincodeLabel);
          if (digitsOnly !== true) return digitsOnly;
          const raw =
            typeof value === "string"
              ? value.trim()
              : typeof value === "number"
                ? String(value)
                : "";
          if (!raw) return true;
          return raw.length === 6 ? true : `${pincodeLabel} must be 6 digits`;
        },
      },
    },
    {
      name: "state",
      label: t("providerMaster.search.state"),
      type: "dropdown",
      options: stateOptions,
      allowCustomValue: true,
    },
    {
      name: "city",
      label: t("providerMaster.search.city"),
      type: "dropdown",
      options: [],
      allowCustomValue: true,
    },
    {
      name: "expiringInDays",
      label: t("providerMaster.search.expiringInDays"),
      type: "text",
      numericOnly: true,
      rules: {
        validate: validateOptionalPositiveDays,
      },
    },
    {
      name: "rohiniExpiryDate",
      label: t("providerMaster.search.rohiniExpiryDate"),
      type: "date",
    },
    {
      name: "rohiniExpiryStatus",
      label: t("providerMaster.search.rohiniExpiryStatus"),
      type: "dropdown",
      options: [...createRohiniExpiryStatusFilterOptions(t)],
      defaultValue: "ALL",
    },
    {
      name: "providerNetworkType",
      label: t("providerMaster.search.providerNetworkType"),
      type: "dropdown",
      options: [...createProviderNetworkTypeFilterOptions(t)],
    },
    {
      name: "networkSource",
      label: t("providerMaster.search.networkSource"),
      type: "dropdown",
      dependsOn: "providerNetworkType",
      dependsOnValues: ["NETWORK"],
      options: [...createProviderNetworkSourceFilterOptions(t)],
    },
    {
      name: "insurerIds",
      label: t("providerMaster.search.insurerCompany"),
      type: "dropdown",
      isMulti: true,
      dependsOn: "networkSource",
      dependsOnValues: ["INSURER"],
      options: [],
    },
  ];
}
