export const PROVIDER_TAXONOMY_TYPES = [
  "AMBULANCE",
  "BLOOD_BANK",
  "CLINIC",
  "DENTAL",
  "DIALYSIS",
  "EYE_CARE",
  "HOMECARE",
  "HOSPITAL",
  "IMAGING",
  "LAB",
  "ONCO_CENTER",
  "PHARMACY",
  "PRACTITIONER_ALLIED",
  "PRACTITIONER_DENTAL",
  "PRACTITIONER_MEDICAL",
  "PRACTITIONER_NURSING",
  "PRACTITIONER_PHARMACY",
  "REHAB",
  "SPECIALTY_GROUP",
] as const;

export type ProviderTaxonomyType = (typeof PROVIDER_TAXONOMY_TYPES)[number];

export function formatProviderTaxonomyLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export const PROVIDER_TAXONOMY_TYPE_OPTIONS = PROVIDER_TAXONOMY_TYPES.map(
  (value) => ({
    label: formatProviderTaxonomyLabel(value),
    value,
  }),
);
