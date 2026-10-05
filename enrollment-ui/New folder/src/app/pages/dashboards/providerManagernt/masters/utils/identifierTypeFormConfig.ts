import type { ProviderMasterExtraValue } from "./masterConfig";

export const VALUE_DATA_TYPE_OPTIONS = [
  { label: "Numeric", value: "NUMERIC" },
  { label: "Alphanumeric", value: "ALPHANUMERIC" },
] as const;

export const DEFAULT_VALUE_DATA_TYPE = "ALPHANUMERIC";

export const IDENTIFIER_LEVEL_OPTIONS = [
  { label: "Provider", value: "PROVIDER" },
  { label: "Facility", value: "FACILITY" },
  { label: "Practitioner", value: "PRACTITIONER" },
  { label: "Multi-Level", value: "MULTI_LEVEL" },
] as const;

export type IdentifierExtraFieldType = "text" | "checkbox" | "dropdown";

export type IdentifierExtraField = {
  name: string;
  label: string;
  type: IdentifierExtraFieldType;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
};

export const IDENTIFIER_EXTRA_FIELDS: IdentifierExtraField[] = [
  {
    name: "identifierLevel",
    label: "Identifier Level",
    type: "dropdown",
    required: true,
    options: [...IDENTIFIER_LEVEL_OPTIONS],
  },
  { name: "identifierCategory", label: "Identifier Category", type: "text" },
  { name: "identifierSubcategory", label: "Identifier Subcategory", type: "text" },
  {
    name: "issuingAuthorityName",
    label: "Issuing Authority Name",
    type: "text",
    required: true,
  },
  { name: "applicableProviderType", label: "Applicable Provider Type", type: "text" },
  { name: "applicableProviderClass", label: "Applicable Provider Category", type: "text" },
  { name: "applicableProviderSubclass", label: "Applicable Provider Sub Category", type: "text" },
  {
    name: "valueDataType",
    label: "Value Data Type",
    type: "dropdown",
    required: true,
    options: [...VALUE_DATA_TYPE_OPTIONS],
  },
  { name: "appliesToProvider", label: "Applies To Provider", type: "checkbox" },
  { name: "appliesToFacility", label: "Applies To Facility", type: "checkbox" },
  { name: "appliesToPractitioner", label: "Applies To Practitioner", type: "checkbox" },
  { name: "isMandatory", label: "Is Mandatory", type: "checkbox" },
  { name: "allowsMultiple", label: "Allows Multiple", type: "checkbox" },
  { name: "supportsValidityPeriod", label: "Supports Validity Period", type: "checkbox" },
  { name: "verificationRequired", label: "Verification Required", type: "checkbox" },
  { name: "isPrimaryAllowed", label: "Is Primary Allowed", type: "checkbox" },
  { name: "isUniquePerProvider", label: "Is Unique Per Provider", type: "checkbox" },
  { name: "isUniquePerFacility", label: "Is Unique Per Facility", type: "checkbox" },
  {
    name: "isUniquePerPractitioner",
    label: "Is Unique Per Practitioner",
    type: "checkbox",
  },
  { name: "isGloballyUnique", label: "Is Globally Unique", type: "checkbox" },
  { name: "sourceOfTruth", label: "Source Of Truth", type: "text" },
  { name: "sourceSystem", label: "Source System", type: "text" },
];

export function createIdentifierExtraDefaults(): Record<string, ProviderMasterExtraValue> {
  return IDENTIFIER_EXTRA_FIELDS.reduce<Record<string, ProviderMasterExtraValue>>(
    (acc, field) => {
      if (field.type === "checkbox") {
        acc[field.name] = false;
        return acc;
      }
      if (field.name === "valueDataType") {
        acc[field.name] = DEFAULT_VALUE_DATA_TYPE;
        return acc;
      }
      acc[field.name] = "";
      return acc;
    },
    {},
  );
}

export type IdentifierFormValues = {
  code: string;
  name: string;
  description: string;
  extra: Record<string, ProviderMasterExtraValue>;
};

export type IdentifierFormLabels = {
  code: string;
  name: string;
  description: string;
};

export function getIdentifierFormValidationError(
  form: IdentifierFormValues,
  labels: IdentifierFormLabels,
): string | null {
  if (!form.code.trim()) return `${labels.code} is required.`;
  if (!form.name.trim()) return `${labels.name} is required.`;
  if (!form.description.trim()) return `${labels.description} is required.`;

  for (const field of IDENTIFIER_EXTRA_FIELDS) {
    if (!field.required || field.type === "checkbox") continue;
    if (!String(form.extra[field.name] ?? "").trim()) {
      return `${field.label} is required.`;
    }
  }

  return null;
}

export function isIdentifierFormValid(
  form: IdentifierFormValues,
  labels: IdentifierFormLabels,
): boolean {
  return getIdentifierFormValidationError(form, labels) === null;
}
