import { NavigationTree } from "@/@types/navigation";
import { BreadcrumbItem } from "@/components/shared/Breadcrumbs";
import { isRouteActive } from "@/utils/isRouteActive";

const FALLBACK_SKIP_SEGMENTS = [
  "insurer-management",
  "tpa-management",
  "mbm-management",
] as const;

function resolveNavFullPath(item: NavigationTree, parentPath: string): string {
  if (!item.path) return parentPath;
  return item.path.startsWith("/") ? item.path : `${parentPath}${item.path}`;
}

function findMatchingChild(item: NavigationTree,pathname: string,fullPath: string): NavigationTree | null {
  if (!item.childs?.length) {
    return null;
  }

  return findNavItemByPath(item.childs, pathname, fullPath);
}

export function findNavItemByPath(items: NavigationTree[],pathname: string,parentPath = ""): NavigationTree | null {
  for (const item of items) {
    const fullPath = resolveNavFullPath(item, parentPath);

    const childMatch = findMatchingChild(item, pathname, fullPath);
    if (childMatch) {
      return childMatch;
    }

    if (!item.path) {
      continue;
    }

    if (isRouteActive(fullPath, pathname)) {
      return item;
    }
  }

  return null;
}

export function buildBreadcrumbPath(
  items: NavigationTree[],
  targetItem: NavigationTree,
  pathname: string,
  parentPath = "",
  breadcrumbItems: NavigationTree[] = [],
): NavigationTree[] {
  for (const item of items) {
    const fullPath = resolveNavFullPath(item, parentPath);

    if (item.id === targetItem.id) {
      return [...breadcrumbItems, item];
    }

    if (item.childs?.length) {
      const childMatch = findNavItemByPath(item.childs, pathname, fullPath);
      if (childMatch) {
        const nextBreadcrumbs =
          item.type === "root" ? breadcrumbItems : [...breadcrumbItems, item];
        return buildBreadcrumbPath(
          item.childs,
          childMatch,
          pathname,
          fullPath,
          nextBreadcrumbs,
        );
      }
    }

    if (!item.path) continue;
  }

  return breadcrumbItems;
}

export function buildFallbackBreadcrumbsFromSegments(
  pathname: string,
): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  let fullPath = "";

  for (let index = 0; index < segments.length; index += 1) {
    fullPath += `/${segments[index]}`;

    if (
      FALLBACK_SKIP_SEGMENTS.includes(
        segments[index] as (typeof FALLBACK_SKIP_SEGMENTS)[number],
      )
    ) {
      continue;
    }

    const title = segments[index]
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    const isLast = index === segments.length - 1;

    breadcrumbs.push({
      title,
      path: isLast ? undefined : fullPath,
    });
  }

  return breadcrumbs;
}

export function mapNavItemsToBreadcrumbs(
  navItems: NavigationTree[],
  pathname: string,
  t?: (key: string) => string,
): BreadcrumbItem[] {
  const filteredItems = navItems.filter((item) => item.type !== "root");

  return filteredItems.map((item, index) => {
    const fullPath = item.path || "";
    const isLast = index === filteredItems.length - 1;
    const title = item.transKey && t ? t(item.transKey) : item.title || item.id;
    const notClickable =
      item.type === "collapse" || (isLast && pathname === fullPath);

    return {
      title,
      path: notClickable ? undefined : fullPath,
    };
  });
}
