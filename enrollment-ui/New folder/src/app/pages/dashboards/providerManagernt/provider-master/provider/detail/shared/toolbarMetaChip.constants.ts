export type ToolbarMetaChipTone = {
  wrapper: string;
  iconWrap: string;
  label: string;
};

export const TOOLBAR_META_CHIP_TONES = {
  icStatus: {
    wrapper: "border-slate-200/90 bg-gradient-to-r from-slate-50 to-gray-100/80",
    iconWrap: "bg-sky-500 text-white shadow-sm shadow-sky-200/80",
    label: "text-slate-600",
  },
  network: {
    wrapper:
      "border-sky-400/90 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 shadow-md shadow-sky-200/70 ring-1 ring-sky-300/60",
    iconWrap: "bg-sky-600 text-white shadow-sm shadow-sky-400/50",
    label: "text-sky-800",
  },
  nonNetwork: {
    wrapper:
      "border-amber-400/90 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 shadow-md shadow-amber-200/70 ring-1 ring-amber-300/60",
    iconWrap: "bg-amber-500 text-white shadow-sm shadow-amber-400/50",
    label: "text-amber-900",
  },
  insurer: {
    wrapper:
      "border-emerald-400/90 bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 shadow-md shadow-emerald-200/70 ring-1 ring-emerald-300/60",
    iconWrap: "bg-emerald-600 text-white shadow-sm shadow-emerald-400/50",
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
