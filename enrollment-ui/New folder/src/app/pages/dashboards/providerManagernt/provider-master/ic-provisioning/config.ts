export const CONFIG_TYPE_OPTIONS = [
  { value: "CODE_MAPPING", label: "Provider Code Mapping" },
  { value: "BANK_DETAILS", label: "Bank Details" },
];

export const DOCUMENT_TYPE_OPTIONS = [
  { value: "CSV", label: "CSV" },
  { value: "EXCEL", label: "EXCEL" },
];

export const FREQUENCY_OPTIONS = [{ value: "DAILY", label: "Daily" }];

export const COMM_MODE_OPTIONS = [{ value: "EMAIL", label: "Email" }];

export type NewConfigurationFormValues = {
  configType: string[];
  documentType: string[];
  frequency: string;
  passwordProtected: boolean;
  insuranceCompany: string[];
  matchingPan: boolean;
  matchingRohini: boolean;
  commMode: string;
  newIcFromMaster: string[];
};

export const NEW_CONFIGURATION_DEFAULTS: NewConfigurationFormValues = {
  configType: ["CODE_MAPPING"],
  documentType: ["CSV"],
  frequency: "DAILY",
  passwordProtected: false,
  insuranceCompany: [],
  matchingPan: true,
  matchingRohini: false,
  commMode: "EMAIL",
  newIcFromMaster: [],
};

function asArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value) return [value];
  return [];
}

export function getConfigTypeLabel(value: string | string[]) {
  return asArray(value)
    .map(
      (item) =>
        CONFIG_TYPE_OPTIONS.find((option) => option.value === item)?.label ?? item,
    )
    .join(", ");
}

export function getDocumentTypeLabel(value: string | string[]) {
  return asArray(value).join(", ");
}

export function getMatchingFieldsLabel(pan: boolean, rohini: boolean) {
  const fields: string[] = [];
  if (pan) fields.push("PAN");
  if (rohini) fields.push("ROHINI");
  return fields.join(", ");
}

export function getIcCodeFromName(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "IC";
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words.map((word) => word[0]).join("").toUpperCase();
}

export function getIcCodesFromInsurerIds(
  insurerIds: string[],
  options: { value: string | number; label: string | number }[],
) {
  const codes = insurerIds
    .map((id) => {
      const label = options.find((option) => String(option.value) === String(id))?.label;
      return label ? getIcCodeFromName(String(label)) : "";
    })
    .filter(Boolean);

  return codes.join(", ") || "IC";
}

export function normalizeFormValues(
  values?: Partial<NewConfigurationFormValues>,
): NewConfigurationFormValues {
  return {
    ...NEW_CONFIGURATION_DEFAULTS,
    ...values,
    configType: asArray(values?.configType ?? NEW_CONFIGURATION_DEFAULTS.configType),
    documentType: asArray(values?.documentType ?? NEW_CONFIGURATION_DEFAULTS.documentType),
    insuranceCompany: asArray(values?.insuranceCompany),
    newIcFromMaster: asArray(values?.newIcFromMaster),
  };
}
