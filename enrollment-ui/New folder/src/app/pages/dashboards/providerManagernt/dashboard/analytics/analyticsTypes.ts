export type ProviderDashboardFilterValues = {
  networkType: string;
  providerStatus: string;
  state: string;
  city: string;
  insurer?: string;
  expiryHorizon?: string;
};

export type ProviderDashboardMetric = {
  id: string;
  label: string;
  value: string;
  subLabel: string;
  changePercent?: number;
  badge?: string;
  color?: "blue" | "emerald" | "amber" | "rose" | "indigo" | "purple" | "cyan";
};

export type ProviderDashboardCategorySummary = {
  id: string;
  title: string;
  metrics: ProviderDashboardMetric[];
};

export type ProviderDashboardAlertSeverity = "critical" | "warning" | "info";

export type ProviderDashboardAlert = {
  id: string;
  severity: ProviderDashboardAlertSeverity;
  message: string;
  tag?: string;
  timestamp: string;
};

export type ProviderDashboardDrillDownTab = "state" | "city" | "ic";

export type ProviderDashboardDrillDownDetail = {
  title: string;
  subtitle: string;
  metrics: ProviderDashboardMetric[];
};

export type ProviderDashboardSummaryItem = {
  id: string;
  label: string;
  value: string;
  hint: string;
};

export type ProviderDashboardBarItem = {
  id: string;
  label: string;
  value: number;
  color: string;
  secondaryText?: string;
};

export type MouExpiryBucket = {
  id: string;
  label: string;
  count: number;
  percentage: number;
  urgency: "critical" | "warning" | "pipeline" | "safe";
  color: string;
};

export type InsurerMappingItem = {
  id: string;
  insurerName: string;
  mappedCount: number;
  totalNetwork: number;
  percentage: number;
  ppnStatus: "PPN" | "Standard" | "Preferred";
};

export type RiskWatchItem = {
  id: string;
  providerName: string;
  city: string;
  category: "GIPSA Excluded" | "Cashless Suspended" | "High Rejection Trigger" | "Penny Drop Failed";
  severity: "critical" | "warning";
  claimsAtRisk?: string;
  date: string;
};
