/** Insurer ids that have at least one corporate configured in Step 2. */
export function getInsurersWithConfiguredCorporates(
  corporateIdsByInsurer: Record<string, string[]> | undefined,
): string[] {
  return Object.entries(corporateIdsByInsurer ?? {})
    .filter(([, corporateIds]) =>
      (corporateIds ?? []).some((corporateId) => String(corporateId ?? "").trim()),
    )
    .map(([insurerId]) => insurerId.trim())
    .filter(Boolean);
}

/**
 * Step 1 IC selection + insurers that already have Step 2 corporates.
 * Used for the Step 2 “Insurance company (for corporates)” dropdown.
 */
export function mergeInsurerScopeIds(
  insurerIds: string[],
  corporateIdsByInsurer: Record<string, string[]> | undefined,
): string[] {
  const withCorporates = getInsurersWithConfiguredCorporates(corporateIdsByInsurer);
  return Array.from(
    new Set([
      ...(insurerIds ?? []).map((id) => String(id).trim()).filter(Boolean),
      ...withCorporates,
    ]),
  );
}

/**
 * Step 1 Selected IC/PSU must not include insurers that already have
 * specific corporates configured in Step 2.
 */
export function excludeInsurersWithConfiguredCorporates(
  insurerIds: string[],
  corporateIdsByInsurer: Record<string, string[]> | undefined,
): string[] {
  const withCorporates = new Set(getInsurersWithConfiguredCorporates(corporateIdsByInsurer));
  return (insurerIds ?? [])
    .map((id) => String(id).trim())
    .filter((id) => id && !withCorporates.has(id));
}

export function insurerScopeSetsEqual(left: string[], right: string[]): boolean {
  const byId = (values: string[]): string[] =>
    Array.from(new Set(values.map((id) => id.trim()).filter(Boolean))).sort(
      (first, second) => first.localeCompare(second),
    );
  const a = byId(left);
  const b = byId(right);
  return a.length === b.length && a.every((id, index) => id === b[index]);
}
