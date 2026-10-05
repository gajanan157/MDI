import type { ProviderInwardCardKey } from "./providerInwardTypes";

export const PROVIDER_INWARD_SPARKLINE_SERIES: Partial<Record<ProviderInwardCardKey, number[]>> = {
  TOTAL: [12, 18, 14, 22, 19, 24, 28],
  TODAY: [4, 6, 3, 8, 5, 7, 6],
  PENDING: [20, 18, 22, 19, 21, 20, 18],
  PROCESSING: [8, 12, 10, 15, 18, 22, 25],
  COMPLETED: [320, 340, 355, 370, 390, 405, 420],
  REJECTED: [8, 9, 10, 11, 10, 11, 12],
};

export const PROVIDER_INWARD_CARD_DELTAS: Partial<
  Record<ProviderInwardCardKey, { value: number; up?: boolean }>
> = {
  TOTAL: { value: 12, up: true },
  PENDING: { value: 0, up: true },
  PROCESSING: { value: 5, up: true },
  COMPLETED: { value: 18, up: true },
  REJECTED: { value: 2, up: true },
};

export type ProviderInwardWorkloadUser = {
  name: string;
  count: number;
};

export const PROVIDER_INWARD_WORKLOAD_BY_USER: ProviderInwardWorkloadUser[] = [
  { name: "Rahul Kumar", count: 28 },
  { name: "Anup Kalam", count: 22 },
  { name: "Tushar Kale", count: 18 },
  { name: "Megha Patil", count: 12 },
  { name: "Priya Singh", count: 8 },
  { name: "Vikram Shah", count: 7 },
  { name: "Neha Joshi", count: 6 },
  { name: "Amit Desai", count: 5 },
  { name: "Kavya Nair", count: 4 },
  { name: "Rohit Verma", count: 3 },
];

const WORKLOAD_BAR_COLORS = [
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#1e40af",
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
] as const;

export function getProviderInwardWorkloadBarColor(index: number): string {
  return WORKLOAD_BAR_COLORS[index] ?? WORKLOAD_BAR_COLORS[WORKLOAD_BAR_COLORS.length - 1];
}

export type ProviderInwardDonutSlice = {
  key: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
  name: string;
  value: number;
  color: string;
};

const DONUT_COLORS = {
  PENDING: "#f59e0b",
  PROCESSING: "#f97316",
  COMPLETED: "#10b981",
  REJECTED: "#f43f5e",
} as const;

const DONUT_LABELS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
} as const;

export function buildInwardDonutSlices(counts: {
  pending: number;
  processing: number;
  completed: number;
  rejected: number;
}): ProviderInwardDonutSlice[] {
  return (["PENDING", "PROCESSING", "COMPLETED", "REJECTED"] as const).map((key) => ({
    key,
    name: DONUT_LABELS[key],
    value: counts[key.toLowerCase() as keyof typeof counts],
    color: DONUT_COLORS[key],
  }));
}
