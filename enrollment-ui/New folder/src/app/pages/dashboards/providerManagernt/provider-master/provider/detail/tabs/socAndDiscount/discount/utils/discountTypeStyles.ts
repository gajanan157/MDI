import { OPD_MASTER_DISCOUNT_TYPE_IDS } from "./discountBulkConfig";

/** Display order for discount type picker, chips, and configuration panels. */
export const DISCOUNT_TYPE_DISPLAY_ORDER = [
  "individual",
  "netBill",
  "approvedAmountDiscount",
  "package",
] as const;

export type DiscountTypeId = (typeof DISCOUNT_TYPE_DISPLAY_ORDER)[number];

export type DiscountTypeTone = {
  /** Pill in picker / view chips — matches agreement type chip pattern. */
  chip: string;
  /** Config panel border + background. */
  panel: string;
  panelTitle: string;
  /** Number / icon badge fill. */
  badge: string;
  /** Selected picker card highlight. */
  selectedCard: string;
};

/** Design-aligned tones: purple, green, yellow, blue. */
export const DISCOUNT_TYPE_TONES: Record<DiscountTypeId, DiscountTypeTone> = {
  netBill: {
    chip: "bg-purple-100 text-purple-700",
    panel: "border-purple-200 bg-purple-50/80",
    panelTitle: "text-purple-800",
    badge: "bg-purple-600",
    selectedCard: "border-purple-300 bg-purple-50 ring-1 ring-purple-200",
  },
  approvedAmountDiscount: {
    chip: "bg-emerald-100 text-emerald-700",
    panel: "border-emerald-200 bg-emerald-50/80",
    panelTitle: "text-emerald-800",
    badge: "bg-emerald-600",
    selectedCard: "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200",
  },
  package: {
    chip: "bg-amber-100 text-amber-800",
    panel: "border-amber-200 bg-amber-50/80",
    panelTitle: "text-amber-900",
    badge: "bg-amber-500",
    selectedCard: "border-amber-300 bg-amber-50 ring-1 ring-amber-200",
  },
  individual: {
    chip: "bg-blue-100 text-blue-700",
    panel: "border-blue-200 bg-blue-50/80",
    panelTitle: "text-blue-800",
    badge: "bg-blue-600",
    selectedCard: "border-blue-300 bg-blue-50 ring-1 ring-blue-200",
  },
};

const DEFAULT_DISCOUNT_TYPE_TONE: DiscountTypeTone = {
  chip: "bg-teal-100 text-teal-800",
  panel: "border-teal-200 bg-teal-50/80",
  panelTitle: "text-teal-800",
  badge: "bg-teal-600",
  selectedCard: "border-teal-300 bg-teal-50 ring-1 ring-teal-200",
};

export function resolveDiscountTypeTone(typeId: string): DiscountTypeTone {
  return DISCOUNT_TYPE_TONES[typeId as DiscountTypeId] ?? DEFAULT_DISCOUNT_TYPE_TONE;
}

/** @deprecated Use resolveDiscountTypeTone(typeId).chip */
export const DISCOUNT_TYPE_CHIP_CLASS: Record<string, string> = Object.fromEntries(
  DISCOUNT_TYPE_DISPLAY_ORDER.map((id) => [id, DISCOUNT_TYPE_TONES[id].chip]),
);

const DISCOUNT_TYPE_SORT_ORDER = new Map(
  [...DISCOUNT_TYPE_DISPLAY_ORDER, ...OPD_MASTER_DISCOUNT_TYPE_IDS].map((id, index) => [id, index]),
);

export function sortDiscountTypeOptions<T extends { value: string }>(options: T[]): T[] {
  return [...options].sort((a, b) => {
    const ai = DISCOUNT_TYPE_SORT_ORDER.get(a.value) ?? 999;
    const bi = DISCOUNT_TYPE_SORT_ORDER.get(b.value) ?? 999;
    return ai - bi;
  });
}

export function getOrderedSelectedDiscountTypes(typeIds: string[]): string[] {
  const selected = new Set((typeIds ?? []).filter(Boolean));
  const ipd = DISCOUNT_TYPE_DISPLAY_ORDER.filter((id) => selected.has(id));
  const opd = OPD_MASTER_DISCOUNT_TYPE_IDS.filter((id) => selected.has(id));
  const known = new Set([...ipd, ...opd]);
  const rest = (typeIds ?? []).filter((id) => id && !known.has(id));
  return [...ipd, ...opd, ...rest];
}

export function isBulkDiscountConfigComplete(
  config: {
    discountPercent?: string;
    applicableOn?: string;
    ppnVariant?: string;
  },
  type?: string,
  options?: { requirePpnVariant?: boolean },
): boolean {
  const percent = String(config.discountPercent ?? "").trim();
  if (!percent || percent === ".") return false;
  const numeric = Number(percent);
  if (Number.isNaN(numeric) || numeric <= 0 || numeric > 100) return false;
  if (type === "package") {
    if (!String(config.applicableOn ?? "").trim()) return false;
    if (options?.requirePpnVariant) {
      return config.ppnVariant === "ppn" || config.ppnVariant === "nonPpn";
    }
  }
  return true;
}
