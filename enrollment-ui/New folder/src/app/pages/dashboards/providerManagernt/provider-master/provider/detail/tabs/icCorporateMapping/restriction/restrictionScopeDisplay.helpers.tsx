import type { RestrictionScopeDisplay, RestrictionScopeKind } from "./restrictionScopeTypes";
import type { NormalizedProviderRestriction } from "./utils";
import { RestrictionScopeCell, RestrictionScopeColumnHeader } from "./restrictionScopeDisplay";

export function restrictionScopeHeaderComponent() {
  return RestrictionScopeColumnHeader;
}

export function restrictionScopeCellRenderer(params: { data?: NormalizedProviderRestriction }) {
  if (!params.data) return null;
  return <RestrictionScopeCell row={params.data} />;
}

export function normalizeRestrictionLevel(level: string): string {
  return level
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/\+/g, "_")
    .replace(/_+/g, "_");
}

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

/** Picks the scope label + values shown in the restriction list grid. */
export function buildRestrictionScopeDisplay(
  row: NormalizedProviderRestriction,
): RestrictionScopeDisplay | null {
  const level = normalizeRestrictionLevel(row.providerRestrictionLevel);

  if (level === "INSURER_CORPORATE") {
    const values = uniqueNonEmpty([
      ...row.corporateNames,
      ...(row.corporateName ? [row.corporateName] : []),
    ]);
    return { kind: "corporate", typeLabel: "Corporate", values };
  }

  if (level === "INSURER_RO") {
    const values = uniqueNonEmpty([
      ...(row.insurerOfficeName ? [row.insurerOfficeName] : []),
      ...row.insurerOfficeIds,
    ]);
    return { kind: "ro", typeLabel: "RO", values };
  }

  if (level === "INSURER_POLICY") {
    const values = uniqueNonEmpty([
      ...row.policyNumbers,
      ...(row.policyNumber ? [row.policyNumber] : []),
    ]);
    const displayValues = values.length > 0 ? values : row.policyIds;
    return { kind: "policy", typeLabel: "Policy", values: uniqueNonEmpty(displayValues) };
  }

  if (level === "INSURER_CCN") {
    return { kind: "ccn", typeLabel: "CCN", values: uniqueNonEmpty(row.ccnNumbers) };
  }

  if (level === "INSURER") {
    return { kind: "insurer", typeLabel: "Insurer", values: [] };
  }

  return null;
}

export const SCOPE_TYPE_BADGE_CLASS: Record<RestrictionScopeKind, string> = {
  corporate: "inline-flex rounded px-2 py-0.5 text-[10px] font-bold leading-tight shadow-sm bg-purple-600 text-white ring-1 ring-purple-800",
  ro: "inline-flex rounded px-2 py-0.5 text-[10px] font-bold leading-tight shadow-sm bg-blue-600 text-white ring-1 ring-blue-800",
  policy: "inline-flex rounded px-2 py-0.5 text-[10px] font-bold leading-tight shadow-sm bg-green-600 text-white ring-1 ring-green-800",
  ccn: "inline-flex rounded px-2 py-0.5 text-[10px] font-bold leading-tight shadow-sm bg-orange-500 text-white ring-1 ring-orange-700",
  insurer: "inline-flex rounded px-2 py-0.5 text-[10px] font-bold leading-tight shadow-sm bg-slate-600 text-white ring-1 ring-slate-800",
};

export const SCOPE_VALUE_BADGE_CLASS: Record<RestrictionScopeKind, string> = {
  corporate: "inline-flex rounded px-2 py-0.5 text-[10px] font-semibold leading-tight shadow-sm bg-purple-50 text-purple-900 ring-2 ring-purple-500",
  ro: "inline-flex rounded px-2 py-0.5 text-[10px] font-semibold leading-tight shadow-sm bg-blue-50 text-blue-900 ring-2 ring-blue-500",
  policy: "inline-flex rounded px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums leading-tight shadow-sm bg-green-50 text-green-900 ring-2 ring-green-500",
  ccn: "inline-flex rounded px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums leading-tight shadow-sm bg-orange-50 text-orange-950 ring-2 ring-orange-500",
  insurer: "inline-flex rounded px-2 py-0.5 text-[10px] leading-tight shadow-sm bg-slate-100 text-slate-800 ring-1 ring-slate-400",
};
