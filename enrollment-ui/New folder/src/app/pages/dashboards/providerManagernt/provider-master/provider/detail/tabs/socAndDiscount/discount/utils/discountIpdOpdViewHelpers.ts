import type { DiscountTypeViewGroup } from "../types/discountTypes";
import { humanDiscountLabel } from "./discountDisplayLabel";
import { resolveDiscountFormTypeValue } from "./mapProviderDiscountConfigurationToListRow";

export function isPackageDiscountGroup(group: DiscountTypeViewGroup): boolean {
  if (group.typeKey === "package") return true;
  return resolveDiscountFormTypeValue(group.typeName, group.typeKey) === "package";
}

export function resolvePackageSocName(
  group: DiscountTypeViewGroup,
  socOptions: { value: string; label: string }[] = [],
): string {
  const fromGroup = humanDiscountLabel(group.socName, group.socId);
  if (fromGroup) return fromGroup;
  const socId = String(group.socId ?? "").trim();
  if (!socId) return "";
  const fromOptions = socOptions.find((option) => option.value === socId)?.label;
  return humanDiscountLabel(fromOptions, socId);
}

export function enrichDiscountTypeGroupsWithSocNames(
  groups: DiscountTypeViewGroup[],
  socOptions: { value: string; label: string }[] = [],
): DiscountTypeViewGroup[] {
  return groups.map((group) => {
    if (!isPackageDiscountGroup(group)) return group;
    const socName = resolvePackageSocName(group, socOptions);
    if (!socName || group.socName === socName) return group;
    return { ...group, socName };
  });
}

export function rowsForTypeGroup(group: DiscountTypeViewGroup) {
  const subtypes = group.subtypes.filter((row) => row.name);
  if (subtypes.length > 0) return subtypes;
  if (group.percent) {
    return [{ id: group.typeKey, name: group.typeName, percent: group.percent }];
  }
  return [];
}

/** True when IPD has only the Individual discount type (OPD is evaluated separately). */
export function isIndividualOnlyIpdDiscount(ipdGroups: DiscountTypeViewGroup[]): boolean {
  const visible = ipdGroups.filter((group) => rowsForTypeGroup(group).length > 0);
  return visible.length > 0 && visible.every((group) => group.typeKey === "individual");
}
