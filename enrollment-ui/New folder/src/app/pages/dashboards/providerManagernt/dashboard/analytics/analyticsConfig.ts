import type { ProviderDashboardFilterValues } from "./analyticsTypes";

export const PROVIDER_DASHBOARD_NETWORK_COLOR = "#10B981"; // Emerald
export const PROVIDER_DASHBOARD_NON_NETWORK_COLOR = "#F59E0B"; // Amber

export const PROVIDER_DASHBOARD_FILTER_DEFAULTS: ProviderDashboardFilterValues = {
  networkType: "all",
  providerStatus: "all",
  state: "all",
  city: "all",
  insurer: "all",
  expiryHorizon: "all",
};

export const PROVIDER_DASHBOARD_NETWORK_TYPE_OPTIONS = [
  { value: "all", label: "All Network Types" },
  { value: "network", label: "Network (Cashless)" },
  { value: "non-network", label: "Non-Network (Reimbursement)" },
] as const;

export const PROVIDER_DASHBOARD_STATUS_OPTIONS = [
  { value: "all", label: "All Empanelment Status" },
  { value: "active", label: "Active Cashless" },
  { value: "pending", label: "Pending Verification" },
  { value: "suspended", label: "Cashless Suspended" },
  { value: "excluded", label: "De-paneled / Excluded" },
] as const;

export const PROVIDER_DASHBOARD_STATE_OPTIONS = [
  { value: "all", label: "All States" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "delhi", label: "Delhi-NCR" },
  { value: "karnataka", label: "Karnataka" },
  { value: "gujarat", label: "Gujarat" },
  { value: "tamil_nadu", label: "Tamil Nadu" },
  { value: "telangana", label: "Telangana" },
] as const;

export const PROVIDER_DASHBOARD_CITY_OPTIONS = [
  { value: "all", label: "All Cities" },
  { value: "mumbai", label: "Mumbai" },
  { value: "pune", label: "Pune" },
  { value: "delhi", label: "Delhi" },
  { value: "bengaluru", label: "Bengaluru" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "ahmedabad", label: "Ahmedabad" },
  { value: "chennai", label: "Chennai" },
] as const;

export const PROVIDER_DASHBOARD_INSURER_OPTIONS = [
  { value: "all", label: "All Insurers (All ICs)" },
  { value: "gipsa", label: "GIPSA PPN (Public Sector 4)" },
  { value: "star", label: "Star Health & Allied" },
  { value: "hdfc", label: "HDFC ERGO General" },
  { value: "icici", label: "ICICI Lombard General" },
  { value: "care", label: "Care Health Insurance" },
  { value: "niva", label: "Niva Bupa Health" },
] as const;

export const PROVIDER_DASHBOARD_HORIZON_OPTIONS = [
  { value: "all", label: "All Expiry Horizons" },
  { value: "critical", label: "Expiring <30 Days (Critical)" },
  { value: "warning", label: "Expiring 31-60 Days" },
  { value: "pipeline", label: "Expiring 61-90 Days" },
  { value: "safe", label: "Valid >90 Days" },
] as const;
