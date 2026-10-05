/**
 * Provider discount configuration lifecycle status.
 *
 * The list grid shows the real API status (`providerDiscountStatus`) rather than
 * a derived Complete/Pending flag, so a terminated or expired configuration is
 * not mislabelled as "Pending".
 */

/** Canonical API status value: trimmed + upper-cased. Used as the row value and filter value. */
export function normalizeDiscountStatus(raw: string | null | undefined): string {
  return String(raw ?? "").trim().toUpperCase();
}

/** Human-readable label for a discount status (mirrors the agreement status display). */
export function formatDiscountStatusLabel(raw: string | null | undefined): string {
  const status = normalizeDiscountStatus(raw);
  switch (status) {
    case "":
      return "—";
    case "ACTIVE":
      return "Active";
    case "TERMINATED":
      return "Terminated";
    case "EXPIRED":
      return "Expired";
    case "INACTIVE":
      return "Inactive";
    case "DRAFT":
      return "Draft";
    case "PENDING":
      return "Pending";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

/** Badge tone classes for a discount status. */
export function discountStatusTone(raw: string | null | undefined): string {
  switch (normalizeDiscountStatus(raw)) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "TERMINATED":
    case "EXPIRED":
      return "bg-red-100 text-red-700";
    case "PENDING":
    case "DRAFT":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

/** Status values offered in the discount list search dropdown. */
export const DISCOUNT_STATUS_FILTER_VALUES = [
  "ACTIVE",
  "TERMINATED",
  "EXPIRED",
  "INACTIVE",
  "DRAFT",
] as const;
