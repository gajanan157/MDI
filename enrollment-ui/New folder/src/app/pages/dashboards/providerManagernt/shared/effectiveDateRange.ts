/**
 * Validates HTML date inputs (`YYYY-MM-DD`) used across Provider Management.
 * When both values are present and parseable, effective from must not be after effective to.
 */

export const EFFECTIVE_FROM_MUST_NOT_BE_AFTER_TO =
  "Effective from must be on or before effective to.";

export const EMPANELMENT_MUST_NOT_BE_AFTER_EFFECTIVE_FROM =
  "Date of empanelment must be on or before effective from.";

/** Parse leading `YYYY-MM-DD` as a local calendar date; invalid parts return null. */
export function parseIsoDateOnlyLocal(input: string | undefined | null): Date | null {
  const t = String(input ?? "").trim().slice(0, 10);
  if (!t) return null;
  const [ys, ms, ds] = t.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (![y, m, d].every((n) => Number.isFinite(n))) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

/** True if order is OK: empty `effectiveTo`, unparsable values, or from ≤ to (calendar). */
export function isEffectiveFromOnOrBeforeEffectiveTo(
  effectiveFrom: string | undefined | null,
  effectiveTo: string | undefined | null,
): boolean {
  const f = String(effectiveFrom ?? "").trim().slice(0, 10);
  const t = String(effectiveTo ?? "").trim().slice(0, 10);
  if (!t) return true;
  if (!f) return true;
  const df = parseIsoDateOnlyLocal(f);
  const dt = parseIsoDateOnlyLocal(t);
  if (!df || !dt) return true;
  return df.getTime() <= dt.getTime();
}
