import type { IcWiseGridRow } from "../types";
import { GLOBAL_NETWORK_MAPPING_KEYS as KEYS } from "./keys";
import { normalizeBankMatchStatus } from "../../provider/detail/tabs/icCorporateMapping/mapping/network";

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) return "";
  return String(value).trim();
}

function readFirstString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = readString(record, key);
    if (value) return value;
  }
  return "";
}

const CATEGORY_LABELS: Record<string, string> = {
  ALREADY_MAPPED: "Already mapped",
  EXISTING_NETWORK: "Existing network",
  NON_NETWORK: "Non network",
  NEW_PROVIDER: "New provider",
  CREATED: "New provider",
  PROCESSED: "Existing network",
};

function formatCategoryLabel(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const normalizedKey = trimmed.toUpperCase().replace(/[\s-]+/g, "_");
  return CATEGORY_LABELS[normalizedKey] ?? trimmed;
}

function formatInsurerLabel(record: Record<string, unknown>): string {
  const insurerName = readString(record, KEYS.insurerName);
  const insurerCode = readString(record, KEYS.insurerCode);
  if (insurerName && insurerCode) return `${insurerName} (${insurerCode})`;
  return insurerName;
}

function parseBoolean(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  const text = String(value ?? "").trim().toLowerCase();
  return text === "true" || text === "yes" || text === "y" || text === "1";
}

function formatNetworkIsActive(raw: unknown): string {
  if (raw == null || raw === "") return "";
  return parseBoolean(raw) ? "Active" : "Inactive";
}

export function normalizeGlobalNetworkMappingRow(
  raw: unknown,
  index: number,
): IcWiseGridRow | null {
  if (!isApiRecord(raw)) return null;

  const providerNetworkMappingId = readString(raw, KEYS.providerNetworkMappingId);
  const providerId = readString(raw, KEYS.providerId);
  const insurerId = readString(raw, KEYS.insurerId);
  const providerName = readString(raw, KEYS.providerName);

  if (!providerNetworkMappingId && !providerId && !insurerId && !providerName) {
    return null;
  }

  const categoryRaw = readFirstString(raw, [
    KEYS.providerMappingCategory,
    KEYS.category,
    KEYS.providerStatus,
    KEYS.rowType,
  ]);

  return {
    id: providerNetworkMappingId || `${providerId}-${insurerId}-${index}`,
    providerId,
    icId: insurerId,
    icName: formatInsurerLabel(raw),
    providerName,
    providerCode: readFirstString(raw, [KEYS.insurerProviderCode, KEYS.providerCode]),
    rohiniRegistryCode: readString(raw, KEYS.rohiniRegistryCode),
    category: formatCategoryLabel(categoryRaw),
    providerNetworkSource: readString(raw, KEYS.providerNetworkSource),
    providerNetworkIsActive: formatNetworkIsActive(raw[KEYS.providerNetworkIsActive]),
    providerNetworkMode: readString(raw, KEYS.providerNetworkMode),
    bankMatch: normalizeBankMatchStatus(
      readString(raw, KEYS.providerBankMatchWithIC),
    ),
  };
}

export function normalizeGlobalNetworkMappingList(items: unknown[]): IcWiseGridRow[] {
  return items
    .map((item, index) => normalizeGlobalNetworkMappingRow(item, index))
    .filter((row): row is IcWiseGridRow => row != null);
}
