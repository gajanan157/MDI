/** Split stored IC / corporate display strings into individual names. */
export function splitDiscountScopeNames(raw: string | null | undefined): string[] {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed || trimmed === "—") return [];

  const lower = trimmed.toLowerCase();
  if (lower === "all ics" || lower === "all policyholders") {
    return [trimmed];
  }

  if (trimmed.includes(" | ")) {
    return trimmed
      .split(" | ")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}
