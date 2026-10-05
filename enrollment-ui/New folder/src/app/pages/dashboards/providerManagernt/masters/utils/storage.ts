import {
  API_BACKED_PROVIDER_MASTER_KEYS,
  PROVIDER_MASTER_SEED_ROWS,
  type ProviderMasterKey,
  type ProviderMasterRecord,
} from "./masterConfig";

const STORAGE_KEY = "provider-management-master-records";

export type ProviderMasterRowsByKey = Record<ProviderMasterKey, ProviderMasterRecord[]>;

function withoutApiBackedRows(
  rows: ProviderMasterRowsByKey,
): ProviderMasterRowsByKey {
  const next = { ...rows };
  for (const key of API_BACKED_PROVIDER_MASTER_KEYS) {
    next[key] = [];
  }
  return next;
}

export function readProviderMasterRows(): ProviderMasterRowsByKey {
  if (typeof window === "undefined") {
    return withoutApiBackedRows(PROVIDER_MASTER_SEED_ROWS);
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return withoutApiBackedRows(PROVIDER_MASTER_SEED_ROWS);
  try {
    const parsed = JSON.parse(raw) as Partial<ProviderMasterRowsByKey>;
    return withoutApiBackedRows({
      ...PROVIDER_MASTER_SEED_ROWS,
      ...parsed,
    });
  } catch {
    return withoutApiBackedRows(PROVIDER_MASTER_SEED_ROWS);
  }
}

export function writeProviderMasterRows(rows: ProviderMasterRowsByKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}
