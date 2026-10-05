// src/navigation/filterNavigationByDepartment.ts
import { NavigationTree } from "@/@types/navigation";

/**
 * Returns a new NavigationTree with nodes removed when:
 * - `hidden` is true, or
 * - the user's department isn't included in node.allowedDepartments (if provided).
 * Department `"all"` bypasses department checks but still strips hidden items.
 */
export function filterNavigationByDepartment(node: NavigationTree, dept?: string): NavigationTree {
  const normalizedDept = dept?.toLowerCase();
  const bypassDepartmentFilter = normalizedDept === "all";

  const filterChild = (child: any): any | null => {
    if (child?.hidden) {
      return null;
    }

    // if allowedDepartments is defined, user must be included
    if (
      !bypassDepartmentFilter &&
      Array.isArray(child.allowedDepartments) &&
      child.allowedDepartments.length > 0
    ) {
      const allowed = child.allowedDepartments.map((s: string) => s.toLowerCase());
      if (!normalizedDept || !allowed.includes(normalizedDept)) {
        return null; // excluded
      }
    }

    // recursively filter child childs
    if (child.childs && Array.isArray(child.childs)) {
      const newChilds = child.childs
        .map((c: any) => filterChild(c))
        .filter(Boolean);
      return { ...child, childs: newChilds };
    }

    return { ...child };
  };

  // root may have childs array
  if (!node.childs || !Array.isArray(node.childs)) {
    return node;
  }

  const filteredChilds = node.childs
    .map((c: any) => filterChild(c))
    .filter(Boolean);

  return { ...node, childs: filteredChilds };
}
