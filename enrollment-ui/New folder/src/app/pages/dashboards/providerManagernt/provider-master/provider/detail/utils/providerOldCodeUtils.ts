import type { ProviderOldCodeRow } from "../../hospitalData";

function parseRawToProviderOldCodeArray(raw: unknown): unknown[] | undefined {
  if (raw == null || raw === "") return undefined;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  if (Array.isArray(raw)) return raw;
  return undefined;
}

function mapProviderOldCodeEntry(row: unknown): ProviderOldCodeRow | null {
  if (!row || typeof row !== "object") return null;
  const entry = row as Record<string, unknown>;
  const codeRaw = entry.provider_old_code ?? entry.providerOldCode;
  const code = codeRaw != null ? String(codeRaw).trim() : "";
  if (!code) return null;
  const flagRaw = entry.provider_old_code_active_flag ?? entry.providerOldCodeActiveFlag;
  const active = flagRaw === true || flagRaw === "true";
  return { code, active };
}

/** Parse API `providerOldCode` (JSON string or array) into UI rows. */
export function parseProviderOldCodePayload(raw: unknown): ProviderOldCodeRow[] | undefined {
  const arr = parseRawToProviderOldCodeArray(raw);
  if (!arr?.length) return undefined;
  const out = arr
    .map(mapProviderOldCodeEntry)
    .filter((row): row is ProviderOldCodeRow => row != null);
  return out.length ? out : undefined;
}

/** Serialize UI rows back to API JSON string for `providerOldCode`. */
export function serializeProviderOldCodeForApi(rows: ProviderOldCodeRow[]): string {
  return JSON.stringify(
    rows.map((r) => ({
      provider_old_code: r.code,
      provider_old_code_active_flag: r.active,
    })),
  );
}
