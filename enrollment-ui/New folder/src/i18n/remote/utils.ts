/**
 * Flattens nested JSON (e.g. en translations) to dot keys for tables and APIs.
 */
export function nestedTranslationsToFlat(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      out[path] = v;
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(
        out,
        nestedTranslationsToFlat(v as Record<string, unknown>, path),
      );
    }
  }
  return out;
}

/**
 * Normalizes API body to flat Record<string, string>.
 * Supports `{ "a.b": "x" }` or `{ data: { ... } }`.
 */
export function parseFlatTranslationPayload(
  data: unknown,
): Record<string, string> | null {
  if (data == null || typeof data !== "object") return null;
  const raw = data as Record<string, unknown>;
  const payload = (raw.data ?? raw) as Record<string, unknown>;
  if (typeof payload !== "object" || payload === null) return null;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === "string") out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Converts flat dot-notation keys from DB/API into nested objects for i18next.
 * @example { "tpaForm.tpaCode": "TPA Code" } → { tpaForm: { tpaCode: "TPA Code" } }
 */
export function flatTranslationsToNested(
  flat: Record<string, string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".").filter(Boolean);
    if (parts.length === 0) continue;
    let current: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!current[p] || typeof current[p] !== "object") {
        current[p] = {};
      }
      current = current[p] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

/**
 * Deep-merge nested translation objects. Remote values override static for the same path.
 */
export function deepMergeTranslations(
  staticBundle: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const keys = new Set([
    ...Object.keys(staticBundle),
    ...Object.keys(override),
  ]);
  for (const k of keys) {
    const a = staticBundle[k];
    const b = override[k];
    if (
      b !== undefined &&
      typeof b === "object" &&
      b !== null &&
      !Array.isArray(b) &&
      typeof a === "object" &&
      a !== null &&
      !Array.isArray(a)
    ) {
      out[k] = deepMergeTranslations(
        a as Record<string, unknown>,
        b as Record<string, unknown>,
      );
    } else if (b !== undefined) {
      out[k] = b;
    } else if (a !== undefined) {
      out[k] = a;
    }
  }
  return out;
}
