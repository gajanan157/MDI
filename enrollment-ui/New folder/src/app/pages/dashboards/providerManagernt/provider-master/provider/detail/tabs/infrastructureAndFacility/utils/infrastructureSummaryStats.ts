import type { InfrastructureCategoryGroup } from "./infrastructureCategoryTypes";

export type InfrastructureSummaryStats = {
  totalBeds: number;
  icuBeds: number;
  verifiedInfraCount: number;
  pendingInfraCount: number;
  verifiedCategoryCount: number;
  activeCategoryCount: number;
  verificationProgressPercent: number;
};

function normalizeInfraTypeName(value: string): string {
  return value.trim().toLowerCase();
}

function sumBedCounts(items: InfrastructureCategoryGroup["items"]): number {
  return items.reduce((total, item) => total + (item.totalCount ?? 0), 0);
}

/** Summary metrics for infrastructure dashboard cards — derived from grid group data. */
export function buildInfrastructureSummaryStats(
  groups: InfrastructureCategoryGroup[],
): InfrastructureSummaryStats {
  const bedGroup = groups.find((group) => group.categoryId === "bed-infrastructure");
  const bedItems = bedGroup?.items ?? [];
  const allItems = groups.flatMap((group) => group.items);

  const icuBedItem = bedItems.find(
    (item) => normalizeInfraTypeName(item.infraType) === "icu bed",
  );

  const verifiedInfraCount = allItems.filter((item) => item.verifiedFlag).length;
  const pendingInfraCount = allItems.filter((item) => !item.verifiedFlag).length;

  const activeCategories = groups.filter((group) => group.items.length > 0);
  const verifiedCategoryCount = activeCategories.filter((group) =>
    group.items.every((item) => item.verifiedFlag),
  ).length;
  const activeCategoryCount = activeCategories.length;

  const verificationProgressPercent =
    activeCategoryCount === 0
      ? 0
      : Math.round((verifiedCategoryCount / activeCategoryCount) * 100);

  return {
    totalBeds: sumBedCounts(bedItems),
    icuBeds: icuBedItem?.totalCount ?? 0,
    verifiedInfraCount,
    pendingInfraCount,
    verifiedCategoryCount,
    activeCategoryCount,
    verificationProgressPercent,
  };
}
