import type {
  InsurerMappingItem,
  MouExpiryBucket,
  ProviderDashboardAlert,
  ProviderDashboardMetric,
  RiskWatchItem,
} from "./analyticsTypes";

/**
 * Top Executive Vitals for TPA Provider Network Management.
 * Styled with variant="bordered" and height="h-12" matching Inward Dashboard cards.
 */
export const TPA_EXECUTIVE_VITALS: ProviderDashboardMetric[] = [
  {
    id: "active-cashless",
    label: "Active Cashless Network",
    value: "12,480",
    subLabel: "94.2% Cashless Ready",
    badge: "+4.2%",
    color: "emerald",
  },
  {
    id: "mou-risk",
    label: "MOU Renewals at Risk",
    value: "142",
    subLabel: "91 Expiring <30d",
    badge: "Urgent",
    color: "rose",
  },
  {
    id: "rohini-compliance",
    label: "ROHINI Compliance",
    value: "98.5%",
    subLabel: "186 Unmapped",
    badge: "IRDAI",
    color: "indigo",
  },
  {
    id: "nabh-accreditation",
    label: "NABH / Quality Mix",
    value: "4,320",
    subLabel: "34.6% Accredited",
    badge: "Tier-1",
    color: "purple",
  },
  {
    id: "vigilance-risk",
    label: "Vigilance & Excluded",
    value: "37",
    subLabel: "5 Active Audits",
    badge: "GIPSA",
    color: "amber",
  },
  {
    id: "pipeline-empanelment",
    label: "Empanelment Pipeline",
    value: "842",
    subLabel: "Avg TAT 8.4 Days",
    badge: "Pending",
    color: "blue",
  },
];

export interface MouGovernanceRow {
  id: string;
  horizon: string;
  hospitals: number;
  sharePercent: number;
  avgDiscount: string;
  socCompliance: string;
  statusText: string;
  statusVariant: "danger" | "warning" | "info" | "success";
}

export const MOU_GOVERNANCE_DATA: MouGovernanceRow[] = [
  {
    id: "mou-1",
    horizon: "< 30 Days (Critical)",
    hospitals: 91,
    sharePercent: 16.5,
    avgDiscount: "14.2%",
    socCompliance: "94.8%",
    statusText: "Urgent Renewal",
    statusVariant: "danger",
  },
  {
    id: "mou-2",
    horizon: "31 - 60 Days (Action)",
    hospitals: 51,
    sharePercent: 9.3,
    avgDiscount: "15.1%",
    socCompliance: "96.1%",
    statusText: "Notice Dispatched",
    statusVariant: "warning",
  },
  {
    id: "mou-3",
    horizon: "61 - 90 Days (Upcoming)",
    hospitals: 118,
    sharePercent: 21.4,
    avgDiscount: "14.8%",
    socCompliance: "97.2%",
    statusText: "Under Review",
    statusVariant: "info",
  },
  {
    id: "mou-4",
    horizon: "> 90 Days (Healthy)",
    hospitals: 291,
    sharePercent: 52.8,
    avgDiscount: "15.0%",
    socCompliance: "98.0%",
    statusText: "Compliant Active",
    statusVariant: "success",
  },
];

export interface InsurerPenetrationRow {
  id: string;
  insurerName: string;
  tag: string;
  tagVariant: "emerald" | "blue" | "slate";
  mappedCount: number;
  totalNetwork: number;
  penetrationPercent: number;
  preAuthTat: string;
  discountLeakage: string;
}

export const INSURER_PENETRATION_DATA: InsurerPenetrationRow[] = [
  {
    id: "gipsa",
    insurerName: "GIPSA PPN (PSU 4 Insurers)",
    tag: "PPN Network",
    tagVariant: "emerald",
    mappedCount: 9840,
    totalNetwork: 12480,
    penetrationPercent: 78.8,
    preAuthTat: "1.8 hrs",
    discountLeakage: "0.8%",
  },
  {
    id: "star",
    insurerName: "Star Health & Allied",
    tag: "Preferred",
    tagVariant: "blue",
    mappedCount: 10450,
    totalNetwork: 12480,
    penetrationPercent: 83.7,
    preAuthTat: "1.4 hrs",
    discountLeakage: "0.5%",
  },
  {
    id: "hdfc",
    insurerName: "HDFC ERGO General",
    tag: "Standard",
    tagVariant: "slate",
    mappedCount: 9920,
    totalNetwork: 12480,
    penetrationPercent: 79.5,
    preAuthTat: "1.9 hrs",
    discountLeakage: "1.1%",
  },
  {
    id: "icici",
    insurerName: "ICICI Lombard General",
    tag: "Preferred",
    tagVariant: "blue",
    mappedCount: 9650,
    totalNetwork: 12480,
    penetrationPercent: 77.3,
    preAuthTat: "1.5 hrs",
    discountLeakage: "0.6%",
  },
  {
    id: "care",
    insurerName: "Care Health Insurance",
    tag: "Standard",
    tagVariant: "slate",
    mappedCount: 8810,
    totalNetwork: 12480,
    penetrationPercent: 70.6,
    preAuthTat: "2.1 hrs",
    discountLeakage: "1.4%",
  },
];

export interface VigilanceWatchlistRow {
  id: string;
  providerName: string;
  city: string;
  category: string;
  severity: "critical" | "warning";
  claimsAtRisk: string;
  status: string;
  date: string;
}

export const VIGILANCE_WATCHLIST_DATA: VigilanceWatchlistRow[] = [
  {
    id: "rw-1",
    providerName: "Apex Multi-Speciality Hospital",
    city: "Pune, MH",
    category: "GIPSA Excluded",
    severity: "critical",
    claimsAtRisk: "₹18.4L Blocked",
    status: "De-paneled All PSUs",
    date: "18 Jun 2026",
  },
  {
    id: "rw-2",
    providerName: "Metro Trauma & Care Center",
    city: "Mumbai, MH",
    category: "Cashless Suspended",
    severity: "critical",
    claimsAtRisk: "Abnormal ALOS Spike",
    status: "Under Audit",
    date: "19 Jun 2026",
  },
  {
    id: "rw-3",
    providerName: "Sunrise Heart Institute",
    city: "New Delhi",
    category: "High Rejection Trigger",
    severity: "warning",
    claimsAtRisk: "24.2% Rejection Rate",
    status: "Show-cause Notice",
    date: "17 Jun 2026",
  },
  {
    id: "rw-4",
    providerName: "Sanjeevani Orthopedic Care",
    city: "Bengaluru, KA",
    category: "Penny Drop Mismatch",
    severity: "warning",
    claimsAtRisk: "NEFT Name Mismatch",
    status: "Bank KYC Resubmission",
    date: "16 Jun 2026",
  },
];

export interface QualitySlabItem {
  id: string;
  tier: string;
  count: number;
  percentage: string;
  pricingImpact: string;
  color: string;
}

export const QUALITY_SLABS_DATA: QualitySlabItem[] = [
  {
    id: "nabh-full",
    tier: "NABH Full Accredited",
    count: 2140,
    percentage: "17.1%",
    pricingImpact: "Tier-1 Highest Tariff Allowed",
    color: "bg-purple-600",
  },
  {
    id: "nabh-entry",
    tier: "NABH Entry-Level",
    count: 2180,
    percentage: "17.5%",
    pricingImpact: "Tier-2 Standard Agreed Tariff",
    color: "bg-indigo-600",
  },
  {
    id: "nabl-lab",
    tier: "NABL Certified Diagnostic",
    count: 1650,
    percentage: "13.2%",
    pricingImpact: "Standard Investigation Schedule",
    color: "bg-cyan-600",
  },
  {
    id: "registered",
    tier: "Registered / Non-Accredited",
    count: 6510,
    percentage: "52.2%",
    pricingImpact: "Base Tariff / 15% Rack Discount",
    color: "bg-slate-600",
  },
];

export const TPA_SUMMARY_PILLS = {
  avgDiscount: "14.8%",
  socCompliance: "96.2%",
  savingsYTD: "₹42.8 Cr",
  disputedBills: "18",
};

export const PROVIDER_DASHBOARD_ALERTS: ProviderDashboardAlert[] = [
  {
    id: "1",
    severity: "critical",
    message: "91 hospital MOUs expiring within 30 days - Renegotiate to prevent cashless stoppage",
    tag: "MOU Risk",
    timestamp: "2026-06-19T08:30:00",
  },
  {
    id: "2",
    severity: "warning",
    message: "186 network providers missing valid ROHINI registry code (IRDAI compliance risk)",
    tag: "ROHINI Registry",
    timestamp: "2026-06-18T14:15:00",
  },
  {
    id: "3",
    severity: "info",
    message: "GIPSA PPN schedule revision active for Cataract and Orthopedic procedures",
    tag: "PPN Schedule",
    timestamp: "2026-06-17T11:00:00",
  },
];
