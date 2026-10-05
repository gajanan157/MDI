/** Replaces underscores with spaces for read-only display (view / grid). */
export function removeUnderscores(value: string | undefined | null): string {
  return String(value ?? "")
    .trim()
    .replaceAll("_", " ");
}

/**
 * Display label for API enum-style keys (e.g. `SELECTED_INSURER` → `Selected Insurer`).
 */
export function formatUnderscoredLabel(value: string | undefined | null): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  if (!trimmed.includes("_")) return trimmed;

  return trimmed
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
