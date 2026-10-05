import type {
  ProviderInwardApiStatus,
  ProviderInwardCardKey,
} from "./providerInwardTypes";

/** Top summary cards including Today's Inward. */
export const PROVIDER_INWARD_CARD_ORDER: ProviderInwardCardKey[] = [
  "TOTAL",
  "TODAY",
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "REJECTED",
];

export const PROVIDER_INWARD_CARD_STATUS: Partial<
  Record<ProviderInwardCardKey, ProviderInwardApiStatus>
> = {
  PENDING: "PROCESSOR_PENDING",
  PROCESSING: "QC_PENDING",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED_INWARD",
};

export const PROVIDER_INWARD_STATUS_LABEL: Record<ProviderInwardApiStatus, string> = {
  PROCESSOR_PENDING: "Pending",
  QC_PENDING: "Processing",
  COMPLETED: "Completed",
  REJECTED_INWARD: "Rejected",
};

export const PROVIDER_INWARD_STATUS_CLASS: Record<ProviderInwardApiStatus, string> = {
  PROCESSOR_PENDING:
    "border border-warning/30 bg-warning/10 text-warning-darker dark:border-warning/40 dark:bg-warning/20 dark:text-warning-lighter",
  QC_PENDING:
    "border border-warning-darker/30 bg-warning/15 text-warning-darker dark:border-warning-darker/40 dark:bg-warning/25 dark:text-warning-lighter",
  COMPLETED:
    "border border-success/30 bg-success/10 text-success-darker dark:border-success/40 dark:bg-success/20 dark:text-success-lighter",
  REJECTED_INWARD:
    "border border-error/30 bg-error/10 text-error dark:border-error/40 dark:bg-error/20 dark:text-error-lighter",
};

export const PROVIDER_INWARD_STATUS_DOT_CLASS: Record<ProviderInwardApiStatus, string> = {
  PROCESSOR_PENDING: "bg-warning",
  QC_PENDING: "bg-warning-darker",
  COMPLETED: "bg-success",
  REJECTED_INWARD: "bg-error",
};

/** Provider-list style pills — inward grid status column only. */
export const PROVIDER_INWARD_GRID_STATUS_PILL_BASE_CLASS =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-tiny-plus font-medium leading-normal whitespace-nowrap shadow-2xs";

export const PROVIDER_INWARD_CARD_ACCENT: Record<
  ProviderInwardCardKey,
  { activeBorder: string; subtitle?: string }
> = {
  TOTAL: { activeBorder: "border-primary-600 dark:border-primary-500" },
  TODAY: { activeBorder: "border-info" },
  PENDING: { activeBorder: "border-warning" },
  PROCESSING: { activeBorder: "border-warning-darker" },
  COMPLETED: { activeBorder: "border-success" },
  REJECTED: { activeBorder: "border-error" },
};

export const PROVIDER_INWARD_CARD_THEME: Record<
  ProviderInwardCardKey,
  {
    accent: string;
    iconBg: string;
    iconColor: string;
    sparkline: string;
    topBar: string;
    cardBg: string;
    border: string;
    shadow: string;
    activeBorder: string;
    activeRing: string;
    activeShadow: string;
    activeBg: string;
    hoverGlow: string;
  }
> = {
  TOTAL: {
    accent: "text-primary-700 dark:text-primary-400",
    iconBg: "bg-primary-50 text-primary-600 ring-1 ring-primary-500/20 dark:bg-primary-950/40 dark:text-primary-400",
    iconColor: "text-primary-600 dark:text-primary-400",
    sparkline: "#2563eb",
    topBar: "bg-primary-600",
    cardBg: "bg-white dark:bg-dark-700",
    border: "border-gray-200 dark:border-dark-600",
    shadow: "shadow-xs",
    activeBorder: "border-primary-600 dark:border-primary-500",
    activeRing: "ring-2 ring-primary-400/40 dark:ring-primary-400/30",
    activeShadow: "shadow-soft dark:shadow-none",
    activeBg: "bg-gradient-to-b from-primary-50/70 via-white to-white dark:from-primary-950/30 dark:via-dark-700 dark:to-dark-700",
    hoverGlow: "",
  },
  TODAY: {
    accent: "text-info-darker dark:text-info-lighter",
    iconBg: "bg-info/10 text-info ring-1 ring-info/20 dark:bg-info/20 dark:text-info-lighter",
    iconColor: "text-info dark:text-info-lighter",
    sparkline: "#0284c7",
    topBar: "bg-info",
    cardBg: "bg-white dark:bg-dark-700",
    border: "border-gray-200 dark:border-dark-600",
    shadow: "shadow-xs",
    activeBorder: "border-info",
    activeRing: "ring-2 ring-info/40",
    activeShadow: "shadow-soft dark:shadow-none",
    activeBg: "bg-gradient-to-b from-info/10 via-white to-white dark:from-info/15 dark:via-dark-700 dark:to-dark-700",
    hoverGlow: "",
  },
  PENDING: {
    accent: "text-warning-darker dark:text-warning-lighter",
    iconBg: "bg-warning/10 text-warning-darker ring-1 ring-warning/20 dark:bg-warning/20 dark:text-warning-lighter",
    iconColor: "text-warning dark:text-warning-light",
    sparkline: "#f59200",
    topBar: "bg-warning",
    cardBg: "bg-white dark:bg-dark-700",
    border: "border-gray-200 dark:border-dark-600",
    shadow: "shadow-xs",
    activeBorder: "border-warning",
    activeRing: "ring-2 ring-warning/40",
    activeShadow: "shadow-soft dark:shadow-none",
    activeBg: "bg-gradient-to-b from-warning/10 via-white to-white dark:from-warning/15 dark:via-dark-700 dark:to-dark-700",
    hoverGlow: "",
  },
  PROCESSING: {
    accent: "text-warning-darker dark:text-warning-lighter",
    iconBg: "bg-warning/15 text-warning-darker ring-1 ring-warning/30 dark:bg-warning/25 dark:text-warning-lighter",
    iconColor: "text-warning-darker dark:text-warning-light",
    sparkline: "#db7c00",
    topBar: "bg-warning-darker",
    cardBg: "bg-white dark:bg-dark-700",
    border: "border-gray-200 dark:border-dark-600",
    shadow: "shadow-xs",
    activeBorder: "border-warning-darker",
    activeRing: "ring-2 ring-warning-darker/40",
    activeShadow: "shadow-soft dark:shadow-none",
    activeBg: "bg-gradient-to-b from-warning/15 via-white to-white dark:from-warning/20 dark:via-dark-700 dark:to-dark-700",
    hoverGlow: "",
  },
  COMPLETED: {
    accent: "text-success-darker dark:text-success-lighter",
    iconBg: "bg-success/10 text-success-darker ring-1 ring-success/20 dark:bg-success/20 dark:text-success-lighter",
    iconColor: "text-success dark:text-success-light",
    sparkline: "#059669",
    topBar: "bg-success",
    cardBg: "bg-white dark:bg-dark-700",
    border: "border-gray-200 dark:border-dark-600",
    shadow: "shadow-xs",
    activeBorder: "border-success",
    activeRing: "ring-2 ring-success/40",
    activeShadow: "shadow-soft dark:shadow-none",
    activeBg: "bg-gradient-to-b from-success/10 via-white to-white dark:from-success/15 dark:via-dark-700 dark:to-dark-700",
    hoverGlow: "",
  },
  REJECTED: {
    accent: "text-error dark:text-error-light",
    iconBg: "bg-error/10 text-error-darker ring-1 ring-error/20 dark:bg-error/20 dark:text-error-lighter",
    iconColor: "text-error dark:text-error-light",
    sparkline: "#ff4f1a",
    topBar: "bg-error",
    cardBg: "bg-white dark:bg-dark-700",
    border: "border-gray-200 dark:border-dark-600",
    shadow: "shadow-xs",
    activeBorder: "border-error",
    activeRing: "ring-2 ring-error/40",
    activeShadow: "shadow-soft dark:shadow-none",
    activeBg: "bg-gradient-to-b from-error/10 via-white to-white dark:from-error/15 dark:via-dark-700 dark:to-dark-700",
    hoverGlow: "",
  },
};
