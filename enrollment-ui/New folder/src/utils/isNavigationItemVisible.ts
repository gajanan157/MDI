import type { NavigationTree } from "@/@types/navigation";
import { canRead } from "@/app/auth/permission-check";

/**
 * A collapse is visible only when at least one descendant leaf is readable.
 * Parent nodes with empty/missing permission must not keep empty menus open.
 */
// export function isNavigationItemVisible(
//   item: NavigationTree,
//   permissions: ReadonlySet<string>,
// ): boolean {
//   if (item.hidden) return false;

//   if (item.type === "collapse") {
//     return Boolean(
//       item.childs?.some((child) => isNavigationItemVisible(child, permissions)),
//     );
//   }

//   // Match MenuItem: missing permission → hide; empty string → show
//   if (item.permission === undefined) return false;
//   if (!item.permission) return true;

//   return canRead(permissions, item.permission);
// }
export function hasNavigationPermission(
  permission: string | undefined,
  permissions: ReadonlySet<string>,
): boolean {
  // No permission configured
  if (permission === undefined) {
    return false;
  }

  // Empty permission = public menu
  if (!permission.trim()) {
    return true;
  }

  // Multiple permissions = OR
  return permission
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .some((p) => {
      return permissions.has(p) || canRead(permissions, p);
    });
}

export function isNavigationItemVisible(
  item: NavigationTree,
  permissions: ReadonlySet<string>,
): boolean {
  if (item.hidden) {
    return false;
  }

  // Normal item
  if (item.type === "item") {
    return hasNavigationPermission(
      item.permission,
      permissions,
    );
  }

  // Collapse
  if (item.type === "collapse") {
    // Check collapse permission
    const ownPermission = hasNavigationPermission(
      item.permission,
      permissions,
    );

    // Check children recursively
    const hasVisibleChild =
      item.childs?.some((child) =>
        isNavigationItemVisible(
          child,
          permissions,
        ),
      ) ?? false;

    return ownPermission || hasVisibleChild;
  }

  return false;
}