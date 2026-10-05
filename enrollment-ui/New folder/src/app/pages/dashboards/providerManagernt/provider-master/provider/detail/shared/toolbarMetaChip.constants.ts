export type ToolbarMetaChipTone = {
  wrapper: string;
  iconWrap: string;
  label: string;
};

export const TOOLBAR_META_CHIP_TONES = {
  icStatus: {
    wrapper: "border-slate-200 bg-slate-50",
    iconWrap: "bg-slate-600 text-white",
    label: "text-slate-600",
  },
  network: {
    wrapper: "border-teal-200 bg-teal-50",
    iconWrap: "bg-teal-600 text-white",
    label: "text-teal-800",
  },
  nonNetwork: {
    wrapper: "border-amber-200 bg-amber-50",
    iconWrap: "bg-amber-600 text-white",
    label: "text-amber-800",
  },
  insurer: {
    wrapper: "border-emerald-200 bg-emerald-50",
    iconWrap: "bg-emerald-600 text-white",
    label: "text-emerald-800",
  },
} as const satisfies Record<string, ToolbarMetaChipTone>;

export function normalizeChipValues(value: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => entry.trim()).filter(Boolean);
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") return [];
  return [trimmed];
}
