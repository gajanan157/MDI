import { unwrapProviderEntity } from "@/store/features/provider/providerAPI";

export function isApiRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function toApiRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isApiRecord);
}

/**
 * Some provider APIs wrap payloads in `data`, `result`, or `payload`.
 * Peel one envelope level when the inner value is an object or array.
 */
export function unwrapNestedApiPayload(raw: unknown): unknown {
  const current: unknown = unwrapProviderEntity(raw);
  if (current == null) return null;

  if (isApiRecord(current)) {
    const inner = current.data ?? current.result ?? current.payload;
    if (Array.isArray(inner) || isApiRecord(inner)) {
      return inner;
    }
  }

  return current;
}

const NESTED_ROW_KEYS = [
  "data",
  "content",
  "result",
  "payload",
  "records",
  "items",
  "list",
] as const;

/** Walk nested list envelopes until a row array is found. */
export function extractNestedApiRows(raw: unknown, maxDepth = 6): Record<string, unknown>[] {
  const fromValue = (value: unknown, depth: number): Record<string, unknown>[] => {
    if (depth > maxDepth || value == null) return [];
    const direct = toApiRecordArray(value);
    if (direct.length > 0) return direct;
    if (!isApiRecord(value)) return [];
    for (const key of NESTED_ROW_KEYS) {
      const rows = fromValue(value[key], depth + 1);
      if (rows.length > 0) return rows;
    }
    return [];
  };

  const unwrapped = unwrapProviderEntity(raw);
  if (unwrapped == null) return [];
  if (Array.isArray(unwrapped)) return toApiRecordArray(unwrapped);
  return fromValue(unwrapped, 0);
}
