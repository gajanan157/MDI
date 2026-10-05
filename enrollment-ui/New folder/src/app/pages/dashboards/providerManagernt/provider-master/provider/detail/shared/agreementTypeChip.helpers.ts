import { AGREEMENT_NAME_OPTIONS } from "../tabs/agreement/utils/agreementFormConfig";
import {
  formatUnderscoredLabel,
  removeUnderscores,
} from "@/app/pages/dashboards/providerManagernt/shared/dashboard";

export type AgreementTypeChipTone = {
  wrapper: string;
  dot: string;
};

const CHIP_TONES = {
  gipsa: {
    wrapper: "border-teal-200 bg-teal-50 text-teal-800",
    dot: "bg-teal-600",
  },
  government: {
    wrapper: "border-sky-200 bg-sky-50 text-sky-800",
    dot: "bg-sky-600",
  },
  tpa: {
    wrapper: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-600",
  },
  insurer: {
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-600",
  },
  corporate: {
    wrapper: "border-cyan-200 bg-cyan-50 text-cyan-800",
    dot: "bg-cyan-600",
  },
  cashless: {
    wrapper: "border-rose-200 bg-rose-50 text-rose-800",
    dot: "bg-rose-600",
  },
  default: {
    wrapper: "border-slate-200 bg-white text-slate-700",
    dot: "bg-slate-500",
  },
} as const satisfies Record<string, AgreementTypeChipTone>;

export { removeUnderscores, formatUnderscoredLabel };

/**
 * Display label for agreement name enum keys in view / grid.
 * Prefers `AGREEMENT_NAME_OPTIONS` label; otherwise removes underscores (title case).
 */
export function formatAgreementNameForDisplay(
  value: string | undefined | null,
): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";

  const fromOptions = AGREEMENT_NAME_OPTIONS.find(
    (option) =>
      option.value.toUpperCase() === trimmed.toUpperCase() ||
      option.label.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  if (fromOptions) return fromOptions.label.trim();

  return formatUnderscoredLabel(trimmed);
}

export function formatAgreementTypeLabel(value: string): string {
  return formatAgreementNameForDisplay(value);
}

export function resolveAgreementTypeChipTone(label: string): AgreementTypeChipTone {
  const key = label.trim().toLowerCase();

  if (key.includes("gipsa") || key.includes("ppn")) return CHIP_TONES.gipsa;
  if (key.includes("psu") || key.includes("government") || key.includes("gic")) {
    return CHIP_TONES.government;
  }
  if (key.includes("tpa")) return CHIP_TONES.tpa;
  if (key.includes("cashless")) return CHIP_TONES.cashless;
  if (key.includes("corporate")) return CHIP_TONES.corporate;
  if (key.includes("insurer") || key.includes("bipartite") || key.includes("tripartite")) {
    return CHIP_TONES.insurer;
  }

  return CHIP_TONES.default;
}

export const AGREEMENT_TYPE_CHIP_VISIBLE_LIMIT = 8;
