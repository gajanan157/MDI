import { readFieldValue } from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/readFieldValue";
import {
  extractNestedApiRows,
  isApiRecord,
} from "@/app/pages/dashboards/providerManagernt/provider-master/provider/detail/utils/sectionMerges/apiPayloadHelpers";

export const PROVIDER_GIPSA_PPN_STATE_KEYS = {
  providerGipsaPpnStateName: "providerGipsaPpnStateName",
} as const;

export const PROVIDER_GIPSA_PPN_CITY_KEYS = {
  providerGipsaPpnCityName: "providerGipsaPpnCityName",
} as const;

export type GipsaPpnDropdownOption = { value: string; label: string };

/** Display place names in title case (API often returns UPPERCASE). */
export function formatPpnPlaceName(value: string): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  return trimmed
    .toLowerCase()
    .split(/([\s\-_/]+)/)
    .map((part) => {
      if (!part || /^[\s\-_/]+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}

export function mergePpnDropdownOption(
  options: GipsaPpnDropdownOption[],
  value: string,
  label: string,
): GipsaPpnDropdownOption[] {
  const valueTrim = value.trim();
  const labelTrim = formatPpnPlaceName(label || value);
  const withFormattedLabels = options.map((option) => ({
    ...option,
    label: formatPpnPlaceName(option.label || option.value),
  }));
  if (!valueTrim && !labelTrim) return withFormattedLabels;

  const optionValue = valueTrim || labelTrim;
  if (withFormattedLabels.some((option) => option.value === optionValue)) {
    return withFormattedLabels;
  }

  return [
    { value: optionValue, label: labelTrim || formatPpnPlaceName(optionValue) },
    ...withFormattedLabels,
  ];
}

function getName(item: Record<string, unknown>, key: string): string {
  const value = readFieldValue(item, [key]);
  if (value == null) return "";
  return String(value).trim();
}

function mapNameRowToOption(
  raw: unknown,
  nameKey: string,
): GipsaPpnDropdownOption | null {
  if (!isApiRecord(raw)) return null;
  const name = getName(raw, nameKey);
  if (!name) return null;
  return { value: name, label: formatPpnPlaceName(name) };
}

export function normalizeProviderGipsaPpnStateOptions(raw: unknown): GipsaPpnDropdownOption[] {
  const rows = extractNestedApiRows(raw);
  return rows
    .map((row) =>
      mapNameRowToOption(row, PROVIDER_GIPSA_PPN_STATE_KEYS.providerGipsaPpnStateName),
    )
    .filter((option): option is GipsaPpnDropdownOption => option != null);
}

export function normalizeProviderGipsaPpnCityOptions(raw: unknown): GipsaPpnDropdownOption[] {
  const rows = extractNestedApiRows(raw);
  return rows
    .map((row) =>
      mapNameRowToOption(row, PROVIDER_GIPSA_PPN_CITY_KEYS.providerGipsaPpnCityName),
    )
    .filter((option): option is GipsaPpnDropdownOption => option != null);
}
