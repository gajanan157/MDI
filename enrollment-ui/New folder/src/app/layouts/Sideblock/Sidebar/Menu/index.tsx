// src/components/Sidebar/Menu.tsx
import { useLocation } from "react-router";
import { useLayoutEffect, useRef, useState, useMemo, useEffect } from "react";
import SimpleBar from "simplebar-react";

// Local Imports
import { useDidUpdate } from "@/hooks";
import { navigation as rawNavigation } from "@/app/navigation";
import { Accordion } from "@/components/ui";
import { isRouteActive } from "@/utils/isRouteActive";
import { Group } from "./Group";
import { useAuthContext } from "@/app/contexts/auth/context";
import { useSidebarContext } from "@/app/contexts/sidebar/context";
import { filterNavigationByDepartment } from "@/utils/filterNavigationByDepartment";
import type { NavigationTree } from "@/@types/navigation";

// ----------------------------------------------------------------------

function findActiveCollapsePath(
  nodes: NavigationTree[] | undefined,
  pathname: string,
): string | null {
  if (!nodes?.length) return null;
  for (const node of nodes) {
    if (node.type === "collapse" && node.path && isRouteActive(node.path, pathname)) {
      return node.path;
    }
    const nested = findActiveCollapsePath(node.childs, pathname);
    if (nested) return nested;
  }
  return null;
}

export function Menu() {
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement | null>(null);
  const { isExpanded: isSidebarExpanded } = useSidebarContext();

  const { user } = useAuthContext();
  const dept = user?.department?.toLowerCase?.() ?? undefined;

  /**
   * Build filtered navigation:
   * - rawNavigation may be an array of NavigationTree (top-level sections).
   * - We run filterNavigationByDepartment on each top-level node and then
   *   drop any nodes that end up with no childs.
   */
  const navigation: NavigationTree[] = useMemo(() => {
    if (!Array.isArray(rawNavigation)) return [];

    return rawNavigation
      .map((node) => {
        try {
          const filtered = filterNavigationByDepartment(
            node as NavigationTree,
            dept,
          );
          // If the root node has childs array, return it only if childs non-empty.
          if (
            Array.isArray((filtered as any).childs) &&
            (filtered as any).childs.length > 0
          ) {
            return filtered as NavigationTree;
          }
          // Keep nodes that are direct items (no childs) as well
          if (!Array.isArray((filtered as any).childs)) {
            return filtered as NavigationTree;
          }
          return null;
        } catch {
          // fallback to original node on error
          return node as NavigationTree;
        }
      })
      .filter(Boolean) as NavigationTree[];
  }, [rawNavigation, dept]);

  // Top-level module collapse that matches the current route (e.g. /provider-masters).
  const activeCollapsiblePath = useMemo(() => {
    for (const root of navigation) {
      const fromChildren = findActiveCollapsePath(root.childs, pathname);
      if (fromChildren) return fromChildren;
      if (root.type === "collapse" && root.path && isRouteActive(root.path, pathname)) {
        return root.path;
      }
    }
    // Fallback: first available top-level collapse so hierarchy is open by default.
    for (const root of navigation) {
      const firstCollapse = root.childs?.find(
        (item) => item.type === "collapse" && item.path,
      );
      if (firstCollapse?.path) return firstCollapse.path;
    }
    return null;
  }, [navigation, pathname]);

  const [expanded, setExpanded] = useState<string | null>(activeCollapsiblePath);

  useDidUpdate(() => {
    if (activeCollapsiblePath !== expanded) {
      setExpanded(activeCollapsiblePath);
    }
  }, [activeCollapsiblePath]);

  // When sidebar opens, expand the active module hierarchy.
  useEffect(() => {
    if (!isSidebarExpanded || !activeCollapsiblePath) return;
    setExpanded(activeCollapsiblePath);
  }, [isSidebarExpanded, activeCollapsiblePath]);

  useLayoutEffect(() => {
    const activeItem = ref.current?.querySelector("[data-menu-active=true]");
    activeItem?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <SimpleBar
      scrollableNodeProps={{ ref }}
      className="sidebar-menu-simplebar h-full overflow-x-hidden pb-6"
    >
      <Accordion value={expanded} onChange={setExpanded} className="space-y-1">
        {navigation.map((nav, index) => (
          <Group key={nav.id ?? index} data={nav} />
        ))}
      </Accordion>
    </SimpleBar>
  );
}
