/** English-only grid cell labels — API enum values are not locale-translated. */

export {
  formatUnderscoredLabel,
  removeUnderscores,
} from "./dashboard/formatUnderscoredLabel";

export function formatProviderNetworkTypeDisplay(
  value: string | null | undefined,
): string {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (normalized === "NETWORK") return "Network";
  if (normalized === "NON_NETWORK") return "Non-Network";
  return "";
}

export function isNetworkProviderType(value: string | null | undefined): boolean {
  return String(value ?? "").trim().toUpperCase() === "NETWORK";
}

export function formatNetworkSourceDisplay(
  value: string | null | undefined,
): string {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (normalized === "INSURER") return "Insurer";
  if (normalized === "TPA") return "TPA";
  if (normalized === "BOTH") return "Both";
  return String(value ?? "").trim() || "—";
}
