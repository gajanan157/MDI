export type ApiScalarFieldValue = string | number | boolean;

/**
 * Returns the first non-null value from known API key variants.
 * Use with field-key constants (`BANK_KEYS`, `CONTACT_KEYS`, etc.).
 */
export function readFieldValue(
  item: Record<string, unknown>,
  keys: readonly string[],
): unknown {
  for (const key of keys) {
    const value = item[key];
    if (value != null) return value;
  }
  return null;
}
