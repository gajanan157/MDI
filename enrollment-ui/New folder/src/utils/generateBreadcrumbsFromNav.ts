import { NavigationTree } from "@/@types/navigation";
import { BreadcrumbItem } from "@/components/shared/Breadcrumbs";
import { applyBreadcrumbRouteOverride } from "@/utils/generateBreadcrumbsRouteOverrides";
import {
  buildBreadcrumbPath,
  buildFallbackBreadcrumbsFromSegments,
  findNavItemByPath,
  mapNavItemsToBreadcrumbs,
} from "@/utils/generateBreadcrumbsNavHelpers";

export function generateBreadcrumbsFromNav(
  navigation: NavigationTree[],
  pathname: string,
  t?: (key: string) => string,
): BreadcrumbItem[] {
  const matchedItem = findNavItemByPath(navigation, pathname);

  if (!matchedItem) {
    return buildFallbackBreadcrumbsFromSegments(pathname);
  }

  const navItems = buildBreadcrumbPath(navigation, matchedItem, pathname);
  const mapped = mapNavItemsToBreadcrumbs(navItems, pathname, t);
  const override = applyBreadcrumbRouteOverride(pathname, mapped, t);

  return override ?? mapped;
}
