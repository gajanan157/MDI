import type { TFunction } from "i18next";
import {
  buildInwardDonutSlices,
  type ProviderInwardDonutSlice,
} from "./providerInwardDashboardDummyData";
import type {
  ProviderInwardCardKey,
  ProviderInwardStatusCounts,
  ProviderInwardTodayBreakup,
} from "./providerInwardTypes";

export type InwardStatusBreakup = {
  pending: number;
  processing: number;
  completed: number;
  rejected: number;
};

export function resolveInwardStatusBreakup(
  activeCard: ProviderInwardCardKey,
  counts: ProviderInwardStatusCounts,
  todayBreakup: ProviderInwardTodayBreakup,
): InwardStatusBreakup {
  if (activeCard === "TODAY") {
    return {
      pending: todayBreakup.pending,
      processing: todayBreakup.processing,
      completed: todayBreakup.completed,
      rejected: todayBreakup.rejected,
    };
  }

  return {
    pending: counts.PENDING,
    processing: counts.PROCESSING,
    completed: counts.COMPLETED,
    rejected: counts.REJECTED,
  };
}

export function shouldShowTodayInwardStatusPanel(
  activeCard: ProviderInwardCardKey,
): boolean {
  return activeCard === "TODAY";
}

export function resolveInwardDonutTitle(
  activeCard: ProviderInwardCardKey,
  t: TFunction,
): string {
  return activeCard === "TODAY"
    ? t("providerMaster.dashboard.inward.charts.todayStatusOverview")
    : t("providerMaster.dashboard.inward.charts.statusOverview");
}

export function resolveTodayInwardStatusPanelTitle(t: TFunction): string {
  return t("providerMaster.dashboard.inward.charts.todayStatus");
}

export function buildInwardDonutChartData(
  activeCard: ProviderInwardCardKey,
  counts: ProviderInwardStatusCounts,
  todayBreakup: ProviderInwardTodayBreakup,
): { slices: ProviderInwardDonutSlice[]; total: number } {
  const statusBreakup = resolveInwardStatusBreakup(activeCard, counts, todayBreakup);
  const slices = buildInwardDonutSlices(statusBreakup);
  const total =
    statusBreakup.pending +
    statusBreakup.processing +
    statusBreakup.completed +
    statusBreakup.rejected;

  return { slices, total };
}
