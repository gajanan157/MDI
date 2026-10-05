export const IC_CORPORATE_TAB_LABELS = {
  ic: " Insurance Company",
  corporate: "Corporate",
  rowise: "RO Wise",
} as const;

export const MAP_ALL_MODE_OPTIONS = [
  { value: "ic", label: "IC" },
  { value: "mdindiaTpa", label: "MDIndia TPA" },
  { value: "combine", label: "Both ( IC + MDIndia TPA )" },
] as const;

/** SOC remark category (IC tab) — required selection */
export const SOC_REMARK_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Select remark category" },
  { value: "rate_revision", label: "Rate revision" },
  { value: "policy_update", label: "Policy update" },
  { value: "contract_amendment", label: "Contract amendment" },
  { value: "other", label: "Other" },
];

