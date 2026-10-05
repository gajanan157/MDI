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
    wrapper: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
  },
  government: {
    wrapper: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  tpa: {
    wrapper: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
  },
  insurer: {
    wrapper: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  corporate: {
    wrapper: "bg-teal-100 text-teal-700",
    dot: "bg-teal-500",
  },
  cashless: {
    wrapper: "bg-fuchsia-100 text-fuchsia-700",
    dot: "bg-fuchsia-500",
  },
  default: {
    wrapper: "bg-slate-100 text-slate-700",
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
